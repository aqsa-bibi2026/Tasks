import { env } from './config.js';
import { db } from './db.js';
import {
  generateVerificationCode,
  hashVerificationCode
} from './security.js';
import { sendVerificationEmail } from './email.js';

export async function issueVerificationCode(user) {
  const now = Date.now();

  const { data: latest, error: latestError } = await db
    .from('task15_email_verifications')
    .select('id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError) throw latestError;

  if (latest) {
    const createdAt = new Date(latest.created_at).getTime();
    const secondsSince = Math.floor((now - createdAt) / 1000);

    if (secondsSince < env.resendCooldownSeconds) {
      const retryAfter =
        env.resendCooldownSeconds - secondsSince;

      const error = new Error(
        `Please wait ${retryAfter} seconds before requesting another code.`
      );

      error.statusCode = 429;
      error.code = 'RESEND_COOLDOWN';
      error.retryAfter = retryAfter;
      throw error;
    }
  }

  const code = generateVerificationCode();
  const codeHash = hashVerificationCode(code);

  const expiresAt = new Date(
    now + env.verificationMinutes * 60 * 1000
  ).toISOString();

  const { error: invalidateError } = await db
    .from('task15_email_verifications')
    .update({ used_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('used_at', null);

  if (invalidateError) throw invalidateError;

  const { data: record, error: insertError } = await db
    .from('task15_email_verifications')
    .insert({
      user_id: user.id,
      code_hash: codeHash,
      expires_at: expiresAt,
      attempts: 0
    })
    .select('id, expires_at, created_at')
    .single();

  if (insertError) throw insertError;

  const delivery = await sendVerificationEmail({
    to: user.email,
    name: user.name,
    code
  });

  return {
    record,
    delivery,
    devCode:
      env.nodeEnv !== 'production' &&
      env.emailMode === 'console'
        ? code
        : undefined
  };
}
