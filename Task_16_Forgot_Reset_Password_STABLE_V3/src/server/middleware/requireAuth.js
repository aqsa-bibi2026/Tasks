import { env } from '../config.js';
import { db } from '../db.js';
import { verifyAccessToken } from '../security.js';

export async function requireAuth(req, res, next) {
  try {
    const cookieToken = req.cookies?.[env.cookieName];
    const authHeader = req.headers.authorization || '';
    const bearer =
      authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;

    const token = cookieToken || bearer;

    if (!token) {
      return res.status(401).json({
        success: false,
        code: 'AUTH_REQUIRED',
        message: 'Authentication required.'
      });
    }

    const payload = verifyAccessToken(token);

    const { data: user, error } = await db
      .from('task16_users')
      .select(
        'id, name, email, password_changed_at, created_at'
      )
      .eq('id', payload.sub)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      return res.status(401).json({
        success: false,
        code: 'ACCOUNT_NOT_FOUND',
        message: 'Account not found.'
      });
    }

    const currentPasswordVersion =
      new Date(user.password_changed_at).getTime();

    if (Number(payload.pwd) !== currentPasswordVersion) {
      return res.status(401).json({
        success: false,
        code: 'PASSWORD_CHANGED',
        message:
          'Password changed after this session was created. Login again.'
      });
    }

    req.user = user;
    req.auth = payload;

    next();
  } catch (error) {
    if (error?.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Session expired. Login again.'
      });
    }

    if (error?.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_INVALID',
        message: 'Invalid authentication token.'
      });
    }

    next(error);
  }
}
