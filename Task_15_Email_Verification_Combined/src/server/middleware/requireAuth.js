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
      .from('task15_users')
      .select(
        'id, name, email, email_verified_at, created_at'
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

    if (!user.email_verified_at) {
      return res.status(403).json({
        success: false,
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Verify your email before accessing this route.'
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
