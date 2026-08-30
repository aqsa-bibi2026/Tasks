import bcrypt from 'bcryptjs';
import { supabase } from './db.js';

const demoUsers = [
  {
    full_name: 'Aisha Khan',
    email: 'admin@rolesphere.dev',
    password: 'Admin@12345',
    role: 'admin',
    department: 'Executive'
  },
  {
    full_name: 'Hamza Ali',
    email: 'manager@rolesphere.dev',
    password: 'Manager@12345',
    role: 'manager',
    department: 'Product'
  },
  {
    full_name: 'Sara Ahmed',
    email: 'member@rolesphere.dev',
    password: 'Member@12345',
    role: 'member',
    department: 'Product'
  }
];

const taskSeeds = [
  {
    title: 'Prepare release brief',
    description: 'Finalize release notes and stakeholder summary.',
    status: 'in_progress',
    priority: 'high',
    assigned_email: 'member@rolesphere.dev',
    department: 'Product',
    due_date: '2026-09-03'
  },
  {
    title: 'Review onboarding flow',
    description: 'Audit new customer onboarding and friction points.',
    status: 'todo',
    priority: 'medium',
    assigned_email: 'member@rolesphere.dev',
    department: 'Product',
    due_date: '2026-09-05'
  },
  {
    title: 'Close QA checklist',
    description: 'Confirm final QA items before release.',
    status: 'done',
    priority: 'medium',
    assigned_email: 'member@rolesphere.dev',
    department: 'Product',
    due_date: '2026-08-29'
  },
  {
    title: 'Team roadmap review',
    description: 'Review September product roadmap with stakeholders.',
    status: 'in_progress',
    priority: 'high',
    assigned_email: 'manager@rolesphere.dev',
    department: 'Product',
    due_date: '2026-09-02'
  }
];

export async function ensureDemoData() {
  for (const user of demoUsers) {
    const { data: existing, error: lookupError } =
      await supabase
        .from('task27_users')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();

    if (lookupError) throw lookupError;

    if (!existing) {
      const password_hash =
        await bcrypt.hash(user.password, 12);

      const { error } = await supabase
        .from('task27_users')
        .insert({
          full_name: user.full_name,
          email: user.email,
          password_hash,
          role: user.role,
          department: user.department
        });

      if (error) throw error;
    }
  }

  const { count, error: countError } =
    await supabase
      .from('task27_tasks')
      .select('id', {
        count: 'exact',
        head: true
      });

  if (countError) throw countError;

  if ((count || 0) === 0) {
    const { error } = await supabase
      .from('task27_tasks')
      .insert(taskSeeds);

    if (error) throw error;
  }
}
