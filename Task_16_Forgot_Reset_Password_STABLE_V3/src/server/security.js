import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from './config.js';

const accessOptions = {
  issuer: 'task-16-api',
  audience: 'task-16-web'
};

const resetOptions = {
  issuer: 'task-16-api',
  audience: 'task-16-password-reset'
};

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function generateResetCode() {
  return String(crypto.randomInt(100000, 1000000));
}

export function hashResetCode(code) {
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
      pwd: new Date(user.password_changed_at).getTime(),
      type: 'access'
    },
    env.jwtSecret,
    {
      ...accessOptions,
      expiresIn: env.jwtExpiresIn
    }
  );
}

export function verifyAccessToken(token) {
  const payload = jwt.verify(
    token,
    env.jwtSecret,
    accessOptions
  );

  if (payload.type !== 'access') {
    throw new jwt.JsonWebTokenError('Invalid token type.');
  }

  return payload;
}

export function signResetTicket({ userId, resetId }) {
  return jwt.sign(
    {
      sub: userId,
      resetId,
      purpose: 'password_reset'
    },
    env.resetTicketSecret,
    {
      ...resetOptions,
      expiresIn: env.resetTicketExpiresIn
    }
  );
}

export function verifyResetTicket(ticket) {
  const payload = jwt.verify(
    ticket,
    env.resetTicketSecret,
    resetOptions
  );

  if (payload.purpose !== 'password_reset' || !payload.resetId) {
    throw new jwt.JsonWebTokenError('Invalid reset ticket.');
  }

  return payload;
}
