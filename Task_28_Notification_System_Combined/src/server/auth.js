import jwt from 'jsonwebtoken';
import { env } from './config.js';

export function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.full_name
    },
    env.jwtSecret,
    {
      expiresIn: '2h',
      issuer: 'pulsenotify'
    }
  );
}

export function requireAuth(req, res, next) {
  const token = req.cookies?.task28_session;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  try {
    req.user = jwt.verify(
      token,
      env.jwtSecret,
      { issuer: 'pulsenotify' }
    );
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid.'
    });
  }
}
