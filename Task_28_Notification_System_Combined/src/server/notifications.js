import { Router } from 'express';

import { requireAuth } from './auth.js';
import { supabase } from './db.js';

const router = Router();

const demoPool = [
  {
    title: 'New comment on project',
    message: 'A teammate mentioned you in the Q3 launch workspace.',
    type: 'info',
    priority: 'normal',
    source: 'Collaboration',
    action_label: 'Open discussion',
    action_url: '#discussion'
  },
  {
    title: 'Backup completed',
    message: 'Nightly backup completed successfully.',
    type: 'success',
    priority: 'low',
    source: 'Infrastructure',
    action_label: 'View backup',
    action_url: '#backup'
  },
  {
    title: 'Budget threshold reached',
    message: 'Cloud spend has reached 85% of the monthly budget.',
    type: 'warning',
    priority: 'high',
    source: 'Finance',
    action_label: 'Review spend',
    action_url: '#spend'
  },
  {
    title: 'Action required',
    message: 'A critical integration requires reconnection.',
    type: 'error',
    priority: 'urgent',
    source: 'Integrations',
    action_label: 'Reconnect',
    action_url: '#integrations'
  }
];

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const status = String(req.query.status || 'all');
    const type = String(req.query.type || 'all');
    const priority = String(req.query.priority || 'all');
    const q = String(req.query.q || '').trim();

    let query = supabase
      .from('task28_notifications')
      .select('*')
      .eq('recipient_email', req.user.email)
      .order('created_at', { ascending: false });

    if (status === 'unread') {
      query = query.is('read_at', null);
    } else if (status === 'read') {
      query = query.not('read_at', 'is', null);
    }

    if (type !== 'all') {
      query = query.eq('type', type);
    }

    if (priority !== 'all') {
      query = query.eq('priority', priority);
    }

    if (q) {
      const safe = q.replace(/[%_,]/g, ' ');
      query = query.or(
        `title.ilike.%${safe}%,message.ilike.%${safe}%,source.ilike.%${safe}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      notifications: data || []
    });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('task28_notifications')
      .select('id, type, priority, read_at')
      .eq('recipient_email', req.user.email);

    if (error) throw error;

    const rows = data || [];
    const unread = rows.filter((item) => !item.read_at).length;
    const urgent = rows.filter((item) => item.priority === 'urgent').length;
    const warnings = rows.filter((item) => item.type === 'warning').length;

    res.json({
      success: true,
      stats: {
        total: rows.length,
        unread,
        read: rows.length - unread,
        urgent,
        warnings
      }
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/read-all', async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('task28_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('recipient_email', req.user.email)
      .is('read_at', null);

    if (error) throw error;

    res.json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('task28_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('recipient_email', req.user.email)
      .select('*')
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.'
      });
    }

    res.json({
      success: true,
      notification: data
    });
  } catch (error) {
    next(error);
  }
});

router.post('/demo', async (req, res, next) => {
  try {
    const sample = demoPool[Math.floor(Math.random() * demoPool.length)];

    const { data, error } = await supabase
      .from('task28_notifications')
      .insert({
        ...sample,
        recipient_email: req.user.email
      })
      .select('*')
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      notification: data,
      message: 'Demo notification created.'
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('task28_notifications')
      .delete()
      .eq('id', req.params.id)
      .eq('recipient_email', req.user.email)
      .select('id')
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted.'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
