import bcrypt from 'bcryptjs';
import { Router } from 'express';

import { clearAuthCookie } from './cookies.js';
import { db } from './db.js';
import { env } from './config.js';
import { sendPasswordResetEmail } from './email.js';
import {
  generateResetCode,
  hashResetCode,
  normalizeEmail,
  safeEqualHex,
  signResetTicket,
  verifyResetTicket
} from './security.js';

const router = Router();

async function issueResetCode(user, { ignoreCooldown = false } = {}) {
  const now = Date.now();

  if (!ignoreCooldown) {
    const latestResult = await db
      .from('task16_password_resets')
      .select('id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestResult.error) throw latestResult.error;

    if (latestResult.data) {
      const elapsed = Math.floor(
        (now - new Date(latestResult.data.created_at).getTime()) / 1000
      );

      if (elapsed < env.resetCooldownSeconds) {
        return {
          ok: false,
          code: 'RESET_COOLDOWN',
          retryAfter: env.resetCooldownSeconds - elapsed,
          message:
            `Please wait ${env.resetCooldownSeconds - elapsed} seconds before requesting another reset code.`
        };
      }
    }
  }

  const invalidate = await db
    .from('task16_password_resets')
    .update({ used_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('used_at', null);

  if (invalidate.error) throw invalidate.error;

  const code = generateResetCode();
  const codeHash = hashResetCode(code);
  const expiresAt = new Date(
    now + env.resetCodeMinutes * 60 * 1000
  ).toISOString();

  const inserted = await db
    .from('task16_password_resets')
    .insert({
      user_id: user.id,
      code_hash: codeHash,
      expires_at: expiresAt,
      attempts: 0
    })
    .select('id, expires_at, created_at')
    .single();

  if (inserted.error) throw inserted.error;

  await sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    code
  });

  return {
    ok: true,
    resetId: inserted.data.id,
    expiresAt: inserted.data.expires_at,
    devCode:
      env.emailMode === 'console' && env.nodeEnv !== 'production'
        ? code
        : undefined
  };
}

router.post('/forgot', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Enter a valid email address.'
      });
    }

    const userResult = await db
      .from('task16_users')
      .select('id, name, email')
      .eq('email', email)
      .maybeSingle();

    if (userResult.error) throw userResult.error;

    if (!userResult.data) {
      return res.json({
        success: true,
        accountFound:
          env.emailMode === 'console' && env.nodeEnv !== 'production'
            ? false
            : undefined,
        message:
          env.emailMode === 'console' && env.nodeEnv !== 'production'
            ? 'Local testing: no Task 16 account exists for this email. Create the account first.'
            : 'If an account exists for this email, password reset instructions have been sent.'
      });
    }

    // A fresh Forgot Password starts one exact new recovery request.
    // Cooldown applies to Resend, not to starting a clean flow.
    const issued = await issueResetCode(
      userResult.data,
      { ignoreCooldown: true }
    );

    return res.json({
      success: true,
      accountFound: true,
      message:
        env.emailMode === 'console'
          ? 'Local testing: exact reset code loaded automatically.'
          : 'If an account exists for this email, password reset instructions have been sent.',
      resetId: issued.resetId,
      devCode: issued.devCode,
      expiresAt: issued.expiresAt
    });
  } catch (error) {
    next(error);
  }
});

router.post('/resend', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);

    const userResult = await db
      .from('task16_users')
      .select('id, name, email')
      .eq('email', email)
      .maybeSingle();

    if (userResult.error) throw userResult.error;

    if (!userResult.data) {
      return res.json({
        success: true,
        message:
          'If an account exists for this email, a new reset code has been requested.'
      });
    }

    const issued = await issueResetCode(userResult.data);

    if (!issued.ok) {
      return res.json({
        success: false,
        code: issued.code,
        message: issued.message,
        retryAfter: issued.retryAfter
      });
    }

    return res.json({
      success: true,
      message:
        env.emailMode === 'console'
          ? 'Local testing: new exact reset code loaded automatically.'
          : 'A new reset code was sent.',
      resetId: issued.resetId,
      devCode: issued.devCode,
      expiresAt: issued.expiresAt
    });
  } catch (error) {
    next(error);
  }
});

router.post('/verify-code', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const resetId = String(req.body?.resetId || '').trim();
    const code = String(req.body?.code || '').trim();

    if (!resetId) {
      return res.json({
        success: false,
        code: 'RESET_REQUEST_MISSING',
        message: 'Reset request is missing. Start Forgot Password again.'
      });
    }

    if (!/^\d{6}$/.test(code)) {
      return res.json({
        success: false,
        code: 'RESET_CODE_FORMAT',
        message: 'Enter the 6-digit reset code.'
      });
    }

    const userResult = await db
      .from('task16_users')
      .select('id, name, email')
      .eq('email', email)
      .maybeSingle();

    if (userResult.error) throw userResult.error;

    if (!userResult.data) {
      return res.json({
        success: false,
        code: 'RESET_INVALID',
        message: 'Invalid or expired reset request.'
      });
    }

    // Verify the EXACT request ID created by the current browser flow.
    const resetResult = await db
      .from('task16_password_resets')
      .select(
        'id, user_id, code_hash, expires_at, attempts, verified_at, used_at'
      )
      .eq('id', resetId)
      .eq('user_id', userResult.data.id)
      .maybeSingle();

    if (resetResult.error) throw resetResult.error;

    const reset = resetResult.data;

    if (!reset || reset.used_at) {
      return res.json({
        success: false,
        code: 'RESET_NOT_ACTIVE',
        message: 'This reset request is no longer active. Start again.'
      });
    }

    if (new Date(reset.expires_at).getTime() < Date.now()) {
      await db
        .from('task16_password_resets')
        .update({ used_at: new Date().toISOString() })
        .eq('id', reset.id);

      return res.json({
        success: false,
        code: 'RESET_CODE_EXPIRED',
        message: 'Reset code expired. Start Forgot Password again.'
      });
    }

    if (reset.attempts >= env.maxResetAttempts) {
      await db
        .from('task16_password_resets')
        .update({ used_at: new Date().toISOString() })
        .eq('id', reset.id);

      return res.json({
        success: false,
        code: 'TOO_MANY_ATTEMPTS',
        message: 'Too many incorrect attempts. Start Forgot Password again.'
      });
    }

    const incomingHash = hashResetCode(code);
    const correct = safeEqualHex(incomingHash, reset.code_hash);

    if (!correct) {
      await db
        .from('task16_password_resets')
        .update({ attempts: reset.attempts + 1 })
        .eq('id', reset.id);

      return res.json({
        success: false,
        code: 'RESET_CODE_INVALID',
        message:
          'Incorrect reset code. In local console mode, keep the automatically filled code.'
      });
    }

    const verifiedAt = new Date().toISOString();

    const verifiedUpdate = await db
      .from('task16_password_resets')
      .update({ verified_at: verifiedAt })
      .eq('id', reset.id);

    if (verifiedUpdate.error) throw verifiedUpdate.error;

    const resetTicket = signResetTicket({
      userId: userResult.data.id,
      resetId: reset.id
    });

    return res.json({
      success: true,
      message: 'Reset code verified. Create your new password.',
      resetTicket
    });
  } catch (error) {
    next(error);
  }
});

router.post('/reset', async (req, res, next) => {
  try {
    const resetTicket = String(req.body?.resetTicket || '');
    const newPassword = String(req.body?.newPassword || '');

    if (
      newPassword.length < 8 ||
      !/[A-Za-z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      return res.json({
        success: false,
        code: 'VALIDATION_ERROR',
        message:
          'New password needs 8+ characters, at least one letter and one number.'
      });
    }

    let ticketPayload;

    try {
      ticketPayload = verifyResetTicket(resetTicket);
    } catch {
      return res.json({
        success: false,
        code: 'RESET_TICKET_INVALID',
        message:
          'Reset session is invalid or expired. Start Forgot Password again.'
      });
    }

    const resetResult = await db
      .from('task16_password_resets')
      .select('id, user_id, expires_at, verified_at, used_at')
      .eq('id', ticketPayload.resetId)
      .eq('user_id', ticketPayload.sub)
      .maybeSingle();

    if (resetResult.error) throw resetResult.error;

    const reset = resetResult.data;

    if (
      !reset ||
      reset.used_at ||
      !reset.verified_at ||
      new Date(reset.expires_at).getTime() < Date.now()
    ) {
      return res.json({
        success: false,
        code: 'RESET_NOT_ACTIVE',
        message: 'This password reset session is no longer active.'
      });
    }

    const userResult = await db
      .from('task16_users')
      .select('id, password_hash')
      .eq('id', ticketPayload.sub)
      .maybeSingle();

    if (userResult.error) throw userResult.error;

    if (!userResult.data) {
      return res.json({
        success: false,
        message: 'Password reset could not be completed.'
      });
    }

    const sameAsOld = await bcrypt.compare(
      newPassword,
      userResult.data.password_hash
    );

    if (sameAsOld) {
      return res.json({
        success: false,
        code: 'PASSWORD_REUSE',
        message: 'New password must be different from your current password.'
      });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    const changedAt = new Date().toISOString();

    const userUpdate = await db
      .from('task16_users')
      .update({
        password_hash: newHash,
        password_changed_at: changedAt,
        updated_at: changedAt
      })
      .eq('id', ticketPayload.sub);

    if (userUpdate.error) throw userUpdate.error;

    const resetUpdate = await db
      .from('task16_password_resets')
      .update({ used_at: changedAt })
      .eq('id', reset.id);

    if (resetUpdate.error) throw resetUpdate.error;

    clearAuthCookie(res);

    return res.json({
      success: true,
      message: 'Password reset successfully. Login with your new password.'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
