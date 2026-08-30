import bcrypt from 'bcryptjs';
import { Router } from 'express';

import { env } from './config.js';
import { supabase } from './db.js';
import { requireAuth, signToken } from './auth.js';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(422).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const { data: user, error } = await supabase
      .from('task28_users')
      .select('id, full_name, email, password_hash')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    res.cookie(
      'task28_session',
      signToken(user),
      {
        httpOnly: true,
        sameSite: 'lax',
        secure: env.isProduction,
        maxAge: 2 * 60 * 60 * 1000,
        path: '/'
      }
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.sub,
      fullName: req.user.name,
      email: req.user.email
    }
  });
});

router.post('/logout', (req, res) => {
  res.clearCookie(
    'task28_session',
    {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.isProduction,
      path: '/'
    }
  );

  res.json({
    success: true,
    message: 'Logged out successfully.'
  });
});

export default router;
