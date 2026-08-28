import dotenv from 'dotenv';

dotenv.config();

const supabaseSecret =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const required = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SECRET_KEY: supabaseSecret,
  JWT_SECRET: process.env.JWT_SECRET
};

const missing = Object.entries(required)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length) {
  throw new Error(
    `Missing .env values: ${missing.join(', ')}. ` +
    'Create the root .env file first.'
  );
}

if (String(process.env.JWT_SECRET).length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters.');
}

const emailMode = (process.env.EMAIL_MODE || 'console').toLowerCase();

if (!['console', 'smtp'].includes(emailMode)) {
  throw new Error('EMAIL_MODE must be either console or smtp.');
}

if (emailMode === 'smtp') {
  const smtpRequired = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'EMAIL_FROM'
  ];

  const smtpMissing = smtpRequired.filter((key) => !process.env[key]);

  if (smtpMissing.length) {
    throw new Error(
      `EMAIL_MODE=smtp but these values are missing: ${smtpMissing.join(', ')}`
    );
  }
}

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  supabaseUrl: process.env.SUPABASE_URL.trim(),
  supabaseSecret: supabaseSecret.trim(),

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  cookieName: process.env.COOKIE_NAME || 'task15_access',
  cookieSecure: process.env.COOKIE_SECURE === 'true',

  emailMode,
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  emailFrom: process.env.EMAIL_FROM || 'VerifyFlow <no-reply@example.com>',

  verificationMinutes: Number(process.env.VERIFICATION_CODE_MINUTES || 15),
  resendCooldownSeconds: Number(process.env.RESEND_COOLDOWN_SECONDS || 60),
  maxVerifyAttempts: Number(process.env.MAX_VERIFY_ATTEMPTS || 5)
};
