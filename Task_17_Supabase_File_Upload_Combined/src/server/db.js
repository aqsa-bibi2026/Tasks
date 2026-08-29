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
  const tableCheck = await supabase
    .from('task17_files')
    .select('id')
    .limit(1);

  if (tableCheck.error) {
    throw new Error(
      `task17_files: ${tableCheck.error.message}`
    );
  }

  const bucketCheck = await supabase.storage
    .getBucket(env.storageBucket);

  if (bucketCheck.error) {
    throw new Error(
      `Storage bucket "${env.storageBucket}": ${bucketCheck.error.message}`
    );
  }

  return bucketCheck.data;
}
