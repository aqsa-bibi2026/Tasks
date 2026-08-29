import bcrypt from 'bcryptjs';
import { Router } from 'express';

import { clearAuthCookie, setAuthCookie } from './cookies.js';
import { db } from './db.js';
import { env } from './config.js';
import {
  normalizeEmail,
  signAccessToken,
  verifyAccessToken
} from './security.js';
import { requireAuth } from './middleware/requireAuth.js';

const router = Router();

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordChangedAt: user.password_changed_at,
    createdAt: user.created_at
  };
}

// Expected logged-out state returns HTTP 200, avoiding console 401 noise.
router.get('/session', async (req, res, next) => {
  try {
    const token = req.cookies?.[env.cookieName];

    if (!token) {
      return res.json({
        success: true,
        authenticated: false,
        user: null
      });
    }

    let payload;

    try {
      payload = verifyAccessToken(token);
    } catch {
      clearAuthCookie(res);

      return res.json({
        success: true,
        authenticated: false,
        user: null
      });
    }

    const { data: user, error } = await db
      .from('task16_users')
      .select('id, name, email, password_changed_at, created_at')
      .eq('id', payload.sub)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      clearAuthCookie(res);

      return res.json({
        success: true,
        authenticated: false,
        user: null
      });
    }

    const currentPasswordVersion =
      new Date(user.password_changed_at).getTime();

    if (Number(payload.pwd) !== currentPasswordVersion) {
      clearAuthCookie(res);

      return res.json({
        success: true,
        authenticated: false,
        user: null
      });
    }

    return res.json({
      success: true,
      authenticated: true,
      user: publicUser(user)
    });
  } catch (error) {
    next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');

    if (name.length < 2) {
      return res.json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Name must be at least 2 characters.'
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Enter a valid email address.'
      });
    }

    if (
      password.length < 8 ||
      !/[A-Za-z]/.test(password) ||
      !/\d/.test(password)
    ) {
      return res.json({
        success: false,
        code: 'VALIDATION_ERROR',
        message:
          'Password needs 8+ characters, at least one letter and one number.'
      });
    }

    const existing = await db
      .from('task16_users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing.error) throw existing.error;

    if (existing.data) {
      return res.json({
        success: false,
        code: 'ACCOUNT_EXISTS',
        message:
          'This email is already registered. Use Login or Forgot Password.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date().toISOString();

    const inserted = await db
      .from('task16_users')
      .insert({
        name,
        email,
        password_hash: passwordHash,
        password_changed_at: now,
        updated_at: now
      })
      .select('id, name, email, password_changed_at, created_at')
      .single();

    if (inserted.error) throw inserted.error;

    const token = signAccessToken(inserted.data);
    setAuthCookie(res, token);

    return res.json({
      success: true,
      message: 'Account created successfully.',
      user: publicUser(inserted.data)
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');

    const result = await db
      .from('task16_users')
      .select(
        'id, name, email, password_hash, password_changed_at, created_at'
      )
      .eq('email', email)
      .maybeSingle();

    if (result.error) throw result.error;

    if (!result.data) {
      return res.json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.'
      });
    }

    const valid = await bcrypt.compare(
      password,
      result.data.password_hash
    );

    if (!valid) {
      return res.json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.'
      });
    }

    const token = signAccessToken(result.data);
    setAuthCookie(res, token);

    return res.json({
      success: true,
      message: 'Login successful.',
      user: publicUser(result.data)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    user: publicUser(req.user)
  });
});

router.post('/logout', (req, res) => {
  clearAuthCookie(res);

  res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

export default router;
