import { env } from '../config/env.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';

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
        message: 'Authentication required.'
      });
    }

    const payload = verifyAccessToken(token);

    const { data: user, error } = await supabaseAdmin
      .from('jwt_users')
      .select('id, name, email, created_at')
      .eq('id', payload.sub)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists.'
      });
    }

    req.user = user;
    req.auth = payload;
    next();
  } catch (error) {
    if (error?.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.'
      });
    }

    if (error?.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.'
      });
    }

    next(error);
  }
}
