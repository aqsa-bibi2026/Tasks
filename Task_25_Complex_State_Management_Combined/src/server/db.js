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
    .from('task25_work_items')
    .select('id')
    .limit(1);

  if (error) {
    throw new Error(
      `task25_work_items: ${error.message}`
    );
  }

  return true;
}
