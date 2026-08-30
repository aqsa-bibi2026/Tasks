import { Router } from 'express';

import { requireAuth, requireRole } from './auth.js';
import { supabase } from './db.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  async (req, res, next) => {
    try {
      const role = req.user.role;

      if (role === 'admin') {
        const [
          usersResult,
          tasksResult
        ] = await Promise.all([
          supabase
            .from('task27_users')
            .select('id', {
              count: 'exact',
              head: true
            }),
          supabase
            .from('task27_tasks')
            .select('id', {
              count: 'exact',
              head: true
            })
        ]);

        if (usersResult.error) {
          throw usersResult.error;
        }
        if (tasksResult.error) {
          throw tasksResult.error;
        }

        return res.json({
          success: true,
          role,
          metrics: [
            {
              label: 'Total Users',
              value:
                usersResult.count || 0,
              helper:
                'Across all roles'
            },
            {
              label: 'Active Roles',
              value: 3,
              helper:
                'Admin · Manager · Member'
            },
            {
              label: 'Work Items',
              value:
                tasksResult.count || 0,
              helper:
                'Organization-wide'
            },
            {
              label: 'System Health',
              value: '100%',
              helper:
                'Protected APIs online'
            }
          ]
        });
      }

      if (role === 'manager') {
        const { data: tasks, error } =
          await supabase
            .from('task27_tasks')
            .select('*')
            .eq(
              'department',
              req.user.department
            )
            .order('created_at', {
              ascending: false
            });

        if (error) throw error;

        return res.json({
          success: true,
          role,
          metrics: [
            {
              label: 'Team Tasks',
              value:
                tasks?.length || 0,
              helper:
                req.user.department
            },
            {
              label: 'In Progress',
              value:
                (tasks || []).filter(
                  (task) =>
                    task.status ===
                      'in_progress'
                ).length,
              helper:
                'Currently active'
            },
            {
              label: 'Completed',
              value:
                (tasks || []).filter(
                  (task) =>
                    task.status === 'done'
                ).length,
              helper:
                'Delivered work'
            },
            {
              label: 'High Priority',
              value:
                (tasks || []).filter(
                  (task) =>
                    task.priority === 'high'
                ).length,
              helper:
                'Needs attention'
            }
          ],
          tasks
        });
      }

      const { data: tasks, error } =
        await supabase
          .from('task27_tasks')
          .select('*')
          .eq(
            'assigned_email',
            req.user.email
          )
          .order('created_at', {
            ascending: false
          });

      if (error) throw error;

      return res.json({
        success: true,
        role,
        metrics: [
          {
            label: 'My Tasks',
            value:
              tasks?.length || 0,
            helper:
              'Personal workload'
          },
          {
            label: 'In Progress',
            value:
              (tasks || []).filter(
                (task) =>
                  task.status ===
                    'in_progress'
              ).length,
            helper:
              'Active now'
          },
          {
            label: 'Completed',
            value:
              (tasks || []).filter(
                (task) =>
                  task.status === 'done'
              ).length,
            helper:
              'Finished'
          },
          {
            label: 'High Priority',
            value:
              (tasks || []).filter(
                (task) =>
                  task.priority === 'high'
              ).length,
            helper:
              'Focus items'
          }
        ],
        tasks
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/admin/users',
  requireAuth,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const { data, error } =
        await supabase
          .from('task27_users')
          .select(
            'id, full_name, email, role, department, created_at'
          )
          .order('created_at', {
            ascending: true
          });

      if (error) throw error;

      res.json({
        success: true,
        users: data || []
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/manager/team',
  requireAuth,
  requireRole('admin', 'manager'),
  async (req, res, next) => {
    try {
      const department =
        req.user.role === 'admin'
          ? 'Product'
          : req.user.department;

      const { data, error } =
        await supabase
          .from('task27_tasks')
          .select('*')
          .eq(
            'department',
            department
          )
          .order('created_at', {
            ascending: false
          });

      if (error) throw error;

      res.json({
        success: true,
        department,
        tasks: data || []
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
