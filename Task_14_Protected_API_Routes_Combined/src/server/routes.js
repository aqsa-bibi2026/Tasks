import { Router } from 'express';

import { db } from './db.js';
import { requireAuth } from './middleware/requireAuth.js';
import { requireRole } from './middleware/requireRole.js';

const router = Router();

router.get('/public/status', (req, res) => {
  res.json({
    success: true,
    access: 'public',
    message: 'This endpoint does not require authentication.',
    route: '/api/v1/public/status'
  });
});

router.get('/protected/profile', requireAuth, (req, res) => {
  res.json({
    success: true,
    route: '/api/v1/protected/profile',
    middleware: 'requireAuth',
    user: req.user
  });
});

router.get('/protected/dashboard', requireAuth, async (req, res, next) => {
  try {
    const { data: notes, error } = await db
      .from('task14_private_notes')
      .select('id, title, body, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    res.json({
      success: true,
      route: '/api/v1/protected/dashboard',
      middleware: 'requireAuth',
      stats: {
        securityLayer: 'JWT middleware',
        role: req.user.role
      },
      notes: notes || []
    });
  } catch (error) {
    next(error);
  }
});

router.get(
  '/protected/admin',
  requireAuth,
  requireRole('admin'),
  (req, res) => {
    res.json({
      success: true,
      route: '/api/v1/protected/admin',
      middleware: ['requireAuth', "requireRole('admin')"],
      message: 'Admin-only protected route accessed successfully.',
      user: req.user
    });
  }
);

export default router;
