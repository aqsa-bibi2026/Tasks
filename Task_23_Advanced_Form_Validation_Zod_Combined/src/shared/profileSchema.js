import { z } from 'zod';

const phoneRegex = /^\+?[0-9][0-9\s()-]{8,18}$/;

export const profileSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, 'Full name must be at least 3 characters.')
      .max(70, 'Full name is too long.')
      .regex(
        /^[A-Za-zÀ-ÿ' -]+$/,
        'Full name contains invalid characters.'
      ),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Enter a valid email address.')
      .max(120, 'Email is too long.'),

    phone: z
      .string()
      .trim()
      .regex(
        phoneRegex,
        'Enter a valid phone number with country/area code.'
      ),

    company: z
      .string()
      .trim()
      .min(2, 'Company name is required.')
      .max(100, 'Company name is too long.'),

    role: z.enum(
      [
        'Frontend Developer',
        'Backend Developer',
        'Full Stack Developer',
        'UI/UX Designer',
        'Product Manager',
        'Other'
      ],
      {
        error: 'Select a valid professional role.'
      }
    ),

    website: z
      .string()
      .trim()
      .optional()
      .refine(
        (value) => {
          if (!value) return true;
          try {
            const url = new URL(value);
            return ['http:', 'https:'].includes(url.protocol);
          } catch {
            return false;
          }
        },
        'Website must be a valid http/https URL.'
      ),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(72, 'Password is too long.')
      .regex(/[A-Z]/, 'Add at least one uppercase letter.')
      .regex(/[a-z]/, 'Add at least one lowercase letter.')
      .regex(/[0-9]/, 'Add at least one number.')
      .regex(
        /[^A-Za-z0-9]/,
        'Add at least one special character.'
      ),

    confirmPassword: z
      .string(),

    terms: z
      .boolean()
      .refine(
        (value) => value === true,
        'You must accept the terms.'
      )
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match.'
      });
    }
  });

export const serverProfileSchema = profileSchema.transform(
  ({ confirmPassword, terms, ...data }) => data
);
