import { createClient } from '@supabase/supabase-js';
import { env } from './config.js';

export const db = createClient(
  env.supabaseUrl,
  env.supabaseSecret,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);

export async function checkDatabase() {
  for (const table of [
    'task16_users',
    'task16_password_resets'
  ]) {
    const { error } = await db.from(table).select('id').limit(1);

    if (error) {
      throw new Error(`${table}: ${error.message}`);
    }
  }
}
