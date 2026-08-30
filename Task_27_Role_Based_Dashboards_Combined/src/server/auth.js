import jwt from 'jsonwebtoken';
import { env } from './config.js';

export function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.full_name,
      department: user.department
    },
    env.jwtSecret,
    {
      expiresIn: '2h',
      issuer: 'rolesphere'
    }
  );
}

export function requireAuth(req, res, next) {
  const token =
    req.cookies?.task27_session;

  if (!token) {
    return res.status(401).json({
      success: false,
      message:
        'Authentication required.'
    });
  }

  try {
    req.user = jwt.verify(
      token,
      env.jwtSecret,
      {
        issuer: 'rolesphere'
      }
    );

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message:
        'Session expired or invalid.'
    });
  }
}

export function requireRole(...allowed) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          'Authentication required.'
      });
    }

    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message:
          'You do not have permission to access this resource.'
      });
    }

    next();
  };
}
