import { env } from '../../server/config.js';
import { db } from '../../server/db.js';
import { verifyAccessToken } from '../../server/jwt.js';

export async function requireAuth(req, res, next) {
  try {
    const cookieToken = req.cookies?.[env.cookieName];
    const authHeader = req.headers.authorization || '';
    const bearerToken = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    const token = cookieToken || bearerToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        code: 'AUTH_REQUIRED',
        message: 'Authentication required to access this route.'
      });
    }

    const payload = verifyAccessToken(token);

    const { data: user, error } = await db
      .from('task14_users')
      .select('id, name, email, role, created_at')
      .eq('id', payload.sub)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      return res.status(401).json({
        success: false,
        code: 'ACCOUNT_NOT_FOUND',
        message: 'Authenticated account no longer exists.'
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
        message: 'Authentication token has expired.'
      });
    }

    if (error?.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_INVALID',
        message: 'Authentication token is invalid.'
      });
    }

    next(error);
  }
}
