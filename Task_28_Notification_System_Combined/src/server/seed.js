import bcrypt from 'bcryptjs';
import { supabase } from './db.js';

const demoEmail = 'user@pulsenotify.dev';

const seeds = [
  {
    title: 'Payment received',
    message: 'Your invoice #INV-1084 was paid successfully.',
    type: 'success',
    priority: 'normal',
    source: 'Billing',
    action_label: 'View invoice',
    action_url: '#invoice'
  },
  {
    title: 'Security review required',
    message: 'A new device signed in to your business account.',
    type: 'warning',
    priority: 'high',
    source: 'Security',
    action_label: 'Review activity',
    action_url: '#security'
  },
  {
    title: 'Workspace export is ready',
    message: 'Your requested workspace export has finished processing.',
    type: 'info',
    priority: 'normal',
    source: 'Workspace',
    action_label: 'Open export',
    action_url: '#export'
  },
  {
    title: 'Deployment completed',
    message: 'Production deployment completed with zero failed checks.',
    type: 'success',
    priority: 'low',
    source: 'DevOps',
    action_label: 'View release',
    action_url: '#release'
  },
  {
    title: 'Subscription payment failed',
    message: 'We could not process the card ending in 4821.',
    type: 'error',
    priority: 'urgent',
    source: 'Billing',
    action_label: 'Update payment',
    action_url: '#payment'
  },
  {
    title: 'Team access updated',
    message: 'Manager permissions were updated for the Product workspace.',
    type: 'info',
    priority: 'normal',
    source: 'Access Control',
    action_label: 'Review access',
    action_url: '#access'
  }
];

export async function ensureDemoData() {
  const { data: user, error: userError } = await supabase
    .from('task28_users')
    .select('id')
    .eq('email', demoEmail)
    .maybeSingle();

  if (userError) throw userError;

  if (!user) {
    const password_hash = await bcrypt.hash('User@12345', 12);

    const { error } = await supabase
      .from('task28_users')
      .insert({
        full_name: 'Aqsa Khan',
        email: demoEmail,
        password_hash
      });

    if (error) throw error;
  }

  const { count, error: countError } = await supabase
    .from('task28_notifications')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_email', demoEmail);

  if (countError) throw countError;

  if ((count || 0) === 0) {
    const now = Date.now();

    const rows = seeds.map((seed, index) => ({
      ...seed,
      recipient_email: demoEmail,
      read_at: index >= 4 ? new Date(now - 1000 * 60 * 22).toISOString() : null,
      created_at: new Date(now - index * 1000 * 60 * 18).toISOString()
    }));

    const { error } = await supabase
      .from('task28_notifications')
      .insert(rows);

    if (error) throw error;
  }
}
