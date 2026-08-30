import { Router } from 'express';
import { supabase } from './db.js';

const router = Router();

const validStatuses = [
  'Backlog',
  'In Progress',
  'Review',
  'Done'
];

const validPriorities = [
  'Low',
  'Medium',
  'High',
  'Critical'
];

router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('task25_work_items')
      .select('*')
      .order('created_at', {
        ascending: false
      });

    if (error) throw error;

    res.json({
      success: true,
      items: data || []
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const {
      title,
      description = '',
      ownerName,
      priority,
      status = 'Backlog',
      dueDate = null
    } = req.body || {};

    if (!title?.trim() || !ownerName?.trim()) {
      return res.status(422).json({
        success: false,
        message:
          'Title and owner are required.'
      });
    }

    if (!validPriorities.includes(priority)) {
      return res.status(422).json({
        success: false,
        message:
          'Invalid priority.'
      });
    }

    if (!validStatuses.includes(status)) {
      return res.status(422).json({
        success: false,
        message:
          'Invalid status.'
      });
    }

    const { data, error } = await supabase
      .from('task25_work_items')
      .insert({
        title: title.trim(),
        description: description.trim(),
        owner_name: ownerName.trim(),
        priority,
        status,
        due_date: dueDate || null
      })
      .select('*')
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      item: data
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body || {};

    if (!validStatuses.includes(status)) {
      return res.status(422).json({
        success: false,
        message:
          'Invalid status.'
      });
    }

    const { data, error } = await supabase
      .from('task25_work_items')
      .update({
        status,
        updated_at:
          new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) throw error;

    res.json({
      success: true,
      item: data
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('task25_work_items')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({
      success: true,
      message:
        'Work item deleted.'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
