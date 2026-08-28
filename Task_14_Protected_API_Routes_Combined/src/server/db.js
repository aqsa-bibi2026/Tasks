import { createClient } from '@supabase/supabase-js';
import { env } from './config.js';

export const db = createClient(env.supabaseUrl, env.supabaseSecret, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

export async function checkDatabase() {
  for (const table of ['task14_users', 'task14_private_notes']) {
    const { error } = await db.from(table).select('id').limit(1);
    if (error) throw new Error(`${table}: ${error.message}`);
  }
}
