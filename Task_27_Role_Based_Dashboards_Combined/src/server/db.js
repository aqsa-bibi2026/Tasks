import { createClient } from '@supabase/supabase-js';
import { env } from './config.js';

export const supabase = createClient(
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
  const { error } = await supabase
    .from('task27_users')
    .select('id')
    .limit(1);

  if (error) {
    throw new Error(
      `task27_users: ${error.message}`
    );
  }

  return true;
}
