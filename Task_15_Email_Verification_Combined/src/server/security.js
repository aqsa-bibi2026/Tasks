import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from './config.js';

const jwtOptions = {
  issuer: 'task-15-api',
  audience: 'task-15-web'
};

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function generateVerificationCode() {
  return String(crypto.randomInt(100000, 1000000));
}

export function hashVerificationCode(code) {
  return crypto
    .createHash('sha256')
    .update(String(code))
    .digest('hex');
}

export function safeEqualHex(a, b) {
  const left = Buffer.from(String(a), 'hex');
  const right = Buffer.from(String(b), 'hex');

  if (left.length !== right.length) return false;

  return crypto.timingSafeEqual(left, right);
}

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      verified: Boolean(user.email_verified_at),
      type: 'access'
    },
    env.jwtSecret,
    {
      ...jwtOptions,
      expiresIn: env.jwtExpiresIn
    }
  );
}

export function verifyAccessToken(token) {
  const payload = jwt.verify(
    token,
    env.jwtSecret,
    jwtOptions
  );

  if (payload.type !== 'access') {
    throw new jwt.JsonWebTokenError('Invalid token type.');
  }

  return payload;
}
