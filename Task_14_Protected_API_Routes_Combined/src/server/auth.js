import bcrypt from 'bcryptjs';
import { Router } from 'express';

import { clearAuthCookie, setAuthCookie } from './cookies.js';
import { db } from './db.js';
import { signAccessToken } from './jwt.js';
import { requireAuth } from './middleware/requireAuth.js';

const router = Router();

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at
  };
}

router.post('/register', async (req, res, next) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters.'
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid email address.'
      });
    }

    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password needs 8+ characters, at least one letter and one number.'
      });
    }

    const existing = await db
      .from('task14_users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing.error) throw existing.error;

    if (existing.data) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const inserted = await db
      .from('task14_users')
      .insert({
        name,
        email,
        password_hash: passwordHash,
        role: 'user'
      })
      .select('id, name, email, role, created_at')
      .single();

    if (inserted.error) throw inserted.error;

    const token = signAccessToken(inserted.data);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Account created.',
      user: publicUser(inserted.data)
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    const result = await db
      .from('task14_users')
      .select('id, name, email, role, password_hash, created_at')
      .eq('email', email)
      .maybeSingle();

    if (result.error) throw result.error;

    if (!result.data) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const valid = await bcrypt.compare(password, result.data.password_hash);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = signAccessToken(result.data);
    setAuthCookie(res, token);

    res.json({
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

router.post('/logout', requireAuth, (req, res) => {
  clearAuthCookie(res);

  res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

export default router;
