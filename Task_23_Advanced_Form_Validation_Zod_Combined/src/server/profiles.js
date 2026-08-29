import crypto from 'crypto';
import { Router } from 'express';

import { supabase } from './db.js';
import { serverProfileSchema } from '../shared/profileSchema.js';

const router = Router();

function normalizeZodIssues(issues) {
  return issues.reduce((acc, issue) => {
    const key =
      issue.path?.[0] || 'form';

    if (!acc[key]) {
      acc[key] = issue.message;
    }

    return acc;
  }, {});
}

router.post('/', async (req, res, next) => {
  try {
    const parsed =
      serverProfileSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(422).json({
        success: false,
        message: 'Please correct the highlighted fields.',
        errors: normalizeZodIssues(
          parsed.error.issues
        )
      });
    }

    const data = parsed.data;

    const { data: existing, error: lookupError } =
      await supabase
        .from('task23_profiles')
        .select('id')
        .eq('email', data.email)
        .maybeSingle();

    if (lookupError) throw lookupError;

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          'A profile with this email already exists.',
        errors: {
          email:
            'This email is already registered.'
        }
      });
    }

    const passwordFingerprint =
      crypto
        .createHash('sha256')
        .update(data.password)
        .digest('hex');

    const { password, ...safeData } = data;

    const { data: created, error } =
      await supabase
        .from('task23_profiles')
        .insert({
          full_name: safeData.fullName,
          email: safeData.email,
          phone: safeData.phone,
          company: safeData.company,
          role: safeData.role,
          website: safeData.website || null,
          password_fingerprint:
            passwordFingerprint
        })
        .select(
          'id, full_name, email, phone, company, role, website, created_at'
        )
        .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message:
            'A profile with this email already exists.',
          errors: {
            email:
              'This email is already registered.'
          }
        });
      }

      throw error;
    }

    res.status(201).json({
      success: true,
      message:
        'Profile validated and created successfully.',
      profile: created
    });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', async (req, res, next) => {
  try {
    const { count, error } = await supabase
      .from('task23_profiles')
      .select('id', {
        count: 'exact',
        head: true
      });

    if (error) throw error;

    res.json({
      success: true,
      totalProfiles: count || 0
    });
  } catch (error) {
    next(error);
  }
});

export default router;
