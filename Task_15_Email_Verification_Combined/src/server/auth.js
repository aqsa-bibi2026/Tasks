import bcrypt from 'bcryptjs';
import { Router } from 'express';

import { clearAuthCookie, setAuthCookie } from './cookies.js';
import { db } from './db.js';
import { env } from './config.js';
import {
  hashVerificationCode,
  normalizeEmail,
  safeEqualHex,
  signAccessToken
} from './security.js';
import { issueVerificationCode } from './verification.js';
import { requireAuth } from './middleware/requireAuth.js';

const router = Router();

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: Boolean(user.email_verified_at),
    emailVerifiedAt: user.email_verified_at,
    createdAt: user.created_at
  };
}

router.post('/register', async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters.'
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid email address.'
      });
    }

    if (
      password.length < 8 ||
      !/[A-Za-z]/.test(password) ||
      !/\d/.test(password)
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Password needs 8+ characters, at least one letter and one number.'
      });
    }

    const existing = await db
      .from('task15_users')
      .select('id, email_verified_at')
      .eq('email', email)
      .maybeSingle();

    if (existing.error) throw existing.error;

    if (existing.data) {
      return res.status(409).json({
        success: false,
        code: existing.data.email_verified_at
          ? 'EMAIL_EXISTS'
          : 'EMAIL_PENDING_VERIFICATION',
        message: existing.data.email_verified_at
          ? 'This email is already registered.'
          : 'This account already exists but still needs email verification.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const inserted = await db
      .from('task15_users')
      .insert({
        name,
        email,
        password_hash: passwordHash
      })
      .select(
        'id, name, email, email_verified_at, created_at'
      )
      .single();

    if (inserted.error) throw inserted.error;

    let verification;

    try {
      verification = await issueVerificationCode(inserted.data);
    } catch (emailError) {
      console.error(
        'Verification delivery failed:',
        emailError.message
      );

      return res.status(201).json({
        success: true,
        code: 'ACCOUNT_CREATED_DELIVERY_FAILED',
        message:
          'Account created, but the verification message could not be delivered. Use Resend verification.',
        email: inserted.data.email
      });
    }

    res.status(201).json({
      success: true,
      message:
        env.emailMode === 'console'
          ? 'Account created. Use the verification code shown in the backend terminal.'
          : 'Account created. Check your email for the verification code.',
      email: inserted.data.email,
      expiresInMinutes: env.verificationMinutes,
      devCode: verification.devCode
    });
  } catch (error) {
    next(error);
  }
});

router.post('/verify-email', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const code = String(req.body?.code || '').trim();

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: 'Enter the 6-digit verification code.'
      });
    }

    const userResult = await db
      .from('task15_users')
      .select(
        'id, name, email, email_verified_at, created_at'
      )
      .eq('email', email)
      .maybeSingle();

    if (userResult.error) throw userResult.error;

    const user = userResult.data;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Account not found.'
      });
    }

    if (user.email_verified_at) {
      return res.json({
        success: true,
        message: 'Email is already verified.',
        user: publicUser(user)
      });
    }

    const verificationResult = await db
      .from('task15_email_verifications')
      .select(
        'id, code_hash, expires_at, attempts, used_at'
      )
      .eq('user_id', user.id)
      .is('used_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (verificationResult.error) {
      throw verificationResult.error;
    }

    const verification = verificationResult.data;

    if (!verification) {
      return res.status(400).json({
        success: false,
        code: 'NO_ACTIVE_CODE',
        message:
          'No active verification code. Request a new code.'
      });
    }

    if (new Date(verification.expires_at).getTime() < Date.now()) {
      await db
        .from('task15_email_verifications')
        .update({ used_at: new Date().toISOString() })
        .eq('id', verification.id);

      return res.status(400).json({
        success: false,
        code: 'CODE_EXPIRED',
        message:
          'Verification code expired. Request a new one.'
      });
    }

    if (verification.attempts >= env.maxVerifyAttempts) {
      await db
        .from('task15_email_verifications')
        .update({ used_at: new Date().toISOString() })
        .eq('id', verification.id);

      return res.status(429).json({
        success: false,
        code: 'TOO_MANY_ATTEMPTS',
        message:
          'Too many incorrect attempts. Request a new code.'
      });
    }

    const incomingHash = hashVerificationCode(code);
    const correct = safeEqualHex(
      incomingHash,
      verification.code_hash
    );

    if (!correct) {
      await db
        .from('task15_email_verifications')
        .update({
          attempts: verification.attempts + 1
        })
        .eq('id', verification.id);

      return res.status(400).json({
        success: false,
        code: 'CODE_INVALID',
        message: 'Incorrect verification code.'
      });
    }

    const verifiedAt = new Date().toISOString();

    const userUpdate = await db
      .from('task15_users')
      .update({
        email_verified_at: verifiedAt,
        updated_at: verifiedAt
      })
      .eq('id', user.id)
      .select(
        'id, name, email, email_verified_at, created_at'
      )
      .single();

    if (userUpdate.error) throw userUpdate.error;

    const verificationUpdate = await db
      .from('task15_email_verifications')
      .update({ used_at: verifiedAt })
      .eq('id', verification.id);

    if (verificationUpdate.error) {
      throw verificationUpdate.error;
    }

    res.json({
      success: true,
      message:
        'Email verified successfully. You can now login.',
      user: publicUser(userUpdate.data)
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/resend-verification',
  async (req, res, next) => {
    try {
      const email = normalizeEmail(req.body?.email);

      const result = await db
        .from('task15_users')
        .select(
          'id, name, email, email_verified_at, created_at'
        )
        .eq('email', email)
        .maybeSingle();

      if (result.error) throw result.error;

      if (!result.data) {
        return res.status(404).json({
          success: false,
          message: 'Account not found.'
        });
      }

      if (result.data.email_verified_at) {
        return res.status(400).json({
          success: false,
          code: 'ALREADY_VERIFIED',
          message: 'This email is already verified.'
        });
      }

      const verification =
        await issueVerificationCode(result.data);

      res.json({
        success: true,
        message:
          env.emailMode === 'console'
            ? 'New code generated. Check the backend terminal.'
            : 'New verification code sent to your email.',
        expiresInMinutes: env.verificationMinutes,
        devCode: verification.devCode
      });
    } catch (error) {
      if (error.code === 'RESEND_COOLDOWN') {
        return res.status(429).json({
          success: false,
          code: error.code,
          message: error.message,
          retryAfter: error.retryAfter
        });
      }

      next(error);
    }
  }
);

router.post('/login', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');

    const result = await db
      .from('task15_users')
      .select(
        'id, name, email, password_hash, email_verified_at, created_at'
      )
      .eq('email', email)
      .maybeSingle();

    if (result.error) throw result.error;

    if (!result.data) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const passwordValid = await bcrypt.compare(
      password,
      result.data.password_hash
    );

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!result.data.email_verified_at) {
      return res.status(403).json({
        success: false,
        code: 'EMAIL_NOT_VERIFIED',
        message:
          'Verify your email before logging in.',
        email: result.data.email
      });
    }

    const token = signAccessToken(result.data);
    setAuthCookie(res, token);

    res.json({
      success: true,
      message: 'Login successful.',
      user: publicUser(result.data)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    user: publicUser(req.user)
  });
});

router.post('/logout', requireAuth, (req, res) => {
  clearAuthCookie(res);

  res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

export default router;
