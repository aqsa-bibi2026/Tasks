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

export async function checkSupabase() {
  const table = await supabase
    .from('task18_files')
    .select('id')
    .limit(1);

  if (table.error) {
    throw new Error(
      `task18_files: ${table.error.message}`
    );
  }

  const bucket = await supabase.storage
    .getBucket(env.storageBucket);

  if (bucket.error) {
    throw new Error(
      `Storage bucket "${env.storageBucket}": ${bucket.error.message}`
    );
  }

  return bucket.data;
}
