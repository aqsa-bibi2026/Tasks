import jwt from 'jsonwebtoken';
import { env } from './config.js';

const jwtBase = {
  issuer: 'task-14-api',
  audience: 'task-14-web'
};

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access'
    },
    env.jwtSecret,
    {
      ...jwtBase,
      expiresIn: env.jwtExpiresIn
    }
  );
}

export function verifyAccessToken(token) {
  const payload = jwt.verify(token, env.jwtSecret, jwtBase);

  if (payload.type !== 'access') {
    throw new jwt.JsonWebTokenError('Invalid token type.');
  }

  return payload;
}
