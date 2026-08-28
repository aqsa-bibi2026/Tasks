import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { db } from './db.js';
import { env } from './config.js';
import { verifyAccess } from './tokens.js';
import {
  clearCookies, getUser, issueSession, publicUser,
  revokeAll, revokeOne, rotate, setSessionCookies
} from './session.js';

const router = Router();

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[env.accessCookie];
    if (!token) {
      return res.status(401).json({
        success: false, code: 'ACCESS_TOKEN_MISSING',
        message: 'Access token required.'
      });
    }
    const payload = verifyAccess(token);
    const user = await getUser(payload.sub);
    if (!user) {
      return res.status(401).json({
        success: false, code: 'USER_NOT_FOUND',
        message: 'User not found.'
      });
    }
    req.user = user;
    next();
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false, code: 'ACCESS_TOKEN_EXPIRED',
        message: 'Access token expired.'
      });
    }
    if (e.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false, code: 'ACCESS_TOKEN_INVALID',
        message: 'Invalid access token.'
      });
    }
    next(e);
  }
}

router.post('/register', async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (name.length < 2)
      return res.status(400).json({ success:false, message:'Name must be at least 2 characters.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ success:false, message:'Enter a valid email.' });
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password))
      return res.status(400).json({ success:false, message:'Password needs 8+ characters, a letter and a number.' });

    const existing = await db.from('jwt_users').select('id').eq('email', email).maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data)
      return res.status(409).json({ success:false, message:'Email already registered.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const inserted = await db
      .from('jwt_users')
      .insert({ name, email, password_hash: passwordHash })
      .select('id,name,email,created_at')
      .single();

    if (inserted.error) throw inserted.error;

    const session = await issueSession(inserted.data, req);
    setSessionCookies(res, session.accessToken, session.refreshToken);

    res.status(201).json({
      success:true, message:'Account created.', user:publicUser(inserted.data)
    });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    const result = await db
      .from('jwt_users')
      .select('id,name,email,password_hash,created_at')
      .eq('email', email)
      .maybeSingle();
    if (result.error) throw result.error;

    if (!result.data || !(await bcrypt.compare(password, result.data.password_hash))) {
      return res.status(401).json({ success:false, message:'Invalid email or password.' });
    }

    const session = await issueSession(result.data, req);
    setSessionCookies(res, session.accessToken, session.refreshToken);

    res.json({ success:true, message:'Login successful.', user:publicUser(result.data) });
  } catch (e) { next(e); }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const raw = req.cookies?.[env.refreshCookie];
    if (!raw)
      return res.status(401).json({
        success:false, code:'REFRESH_TOKEN_MISSING',
        message:'Refresh token required.'
      });

    const result = await rotate(raw, req);
    setSessionCookies(res, result.accessToken, result.refreshToken);

    res.json({
      success:true,
      message:'Refresh token rotated successfully.',
      user:publicUser(result.user)
    });
  } catch (e) {
    clearCookies(res);
    if (e.name === 'TokenExpiredError' || e.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success:false, code:'REFRESH_TOKEN_INVALID',
        message:'Refresh token invalid or expired.'
      });
    }
    next(e);
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ success:true, user:publicUser(req.user) });
});

router.post('/logout', async (req, res, next) => {
  try {
    await revokeOne(req.cookies?.[env.refreshCookie]);
    clearCookies(res);
    res.json({ success:true, message:'Logged out.' });
  } catch (e) { next(e); }
});

router.post('/logout-all', requireAuth, async (req, res, next) => {
  try {
    await revokeAll(req.user.id);
    clearCookies(res);
    res.json({ success:true, message:'All sessions revoked.' });
  } catch (e) { next(e); }
});

export default router;
