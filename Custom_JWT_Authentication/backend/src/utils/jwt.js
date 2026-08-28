import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      type: 'access'
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
      issuer: 'task-12-api',
      audience: 'task-12-web'
    }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret, {
    issuer: 'task-12-api',
    audience: 'task-12-web'
  });
}
