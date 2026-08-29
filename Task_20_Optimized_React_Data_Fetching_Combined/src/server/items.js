import crypto from 'crypto';
import { Router } from 'express';
import { supabase } from './db.js';

const router = Router();

const categories = new Set([
  'analytics',
  'operations',
  'finance'
]);

function normalizeCategory(value) {
  const category = String(value || '').toLowerCase();

  return categories.has(category)
    ? category
    : 'all';
}

router.get('/', async (req, res, next) => {
  try {
    const category = normalizeCategory(req.query.category);

    let query = supabase
      .from('task20_items')
      .select(
        'id, title, category, status, value, trend, updated_at, created_at'
      )
      .order('updated_at', { ascending: false });

    if (category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.setHeader(
      'Cache-Control',
      'private, max-age=0, must-revalidate'
    );

    res.json({
      success: true,
      category,
      fetchedAt: new Date().toISOString(),
      items: data || []
    });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('task20_items')
      .select('category, status, value');

    if (error) throw error;

    const rows = data || [];

    res.json({
      success: true,
      stats: {
        total: rows.length,
        healthy: rows.filter(
          (row) => row.status === 'healthy'
        ).length,
        attention: rows.filter(
          (row) => row.status === 'attention'
        ).length,
        critical: rows.filter(
          (row) => row.status === 'critical'
        ).length
      },
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

router.post('/demo', async (req, res, next) => {
  try {
    const requested =
      String(req.body?.category || 'analytics')
        .toLowerCase();

    const category = categories.has(requested)
      ? requested
      : 'analytics';

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('task20_items')
      .insert({
        title:
          `Live Metric ${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
        category,
        status: 'healthy',
        value: Number(
          (Math.random() * 5000 + 100).toFixed(2)
        ),
        trend: Number(
          (Math.random() * 8 - 2).toFixed(2)
        ),
        updated_at: now
      })
      .select(
        'id, title, category, status, value, trend, updated_at, created_at'
      )
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message:
        'Demo record created. Related query cache should now invalidate.',
      item: data
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('task20_items')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({
      success: true,
      message:
        'Record deleted. Cached item queries should refresh.'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
