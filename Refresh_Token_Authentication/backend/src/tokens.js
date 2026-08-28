import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from './config.js';

const common = { issuer: 'task-13-api', audience: 'task-13-web' };

export const hashToken = token =>
  crypto.createHash('sha256').update(token).digest('hex');

export function signAccess(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, type: 'access' },
    env.accessSecret,
    { ...common, expiresIn: env.accessExpires }
  );
}

export function signRefresh(user) {
  return jwt.sign(
    { sub: user.id, type: 'refresh', jti: crypto.randomUUID() },
    env.refreshSecret,
    { ...common, expiresIn: env.refreshExpires }
  );
}

export function verifyAccess(token) {
  const p = jwt.verify(token, env.accessSecret, common);
  if (p.type !== 'access') throw new jwt.JsonWebTokenError('Wrong token type');
  return p;
}

export function verifyRefresh(token) {
  const p = jwt.verify(token, env.refreshSecret, common);
  if (p.type !== 'refresh') throw new jwt.JsonWebTokenError('Wrong token type');
  return p;
}

export function refreshExpiry() {
  const d = new Date();
  d.setDate(d.getDate() + env.refreshDays);
  return d.toISOString();
}
