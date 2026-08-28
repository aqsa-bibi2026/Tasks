import { createClient } from '@supabase/supabase-js';
import { env } from './config.js';

export const db = createClient(env.supabaseUrl, env.supabaseSecret, {
  auth: { persistSession: false, autoRefreshToken: false }
});

export async function checkDb() {
  for (const table of ['jwt_users', 'jwt_refresh_tokens']) {
    const { error } = await db.from(table).select('id').limit(1);
    if (error) throw new Error(`${table}: ${error.message}`);
  }
  return true;
}
