import { createClient } from '@supabase/supabase-js';
import { env } from './config.js';

export const supabase = createClient(env.supabaseUrl, env.supabaseSecret, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

export async function checkSupabase() {
  const table = await supabase.from('task19_files').select('id').limit(1);
  if (table.error) throw new Error(`task19_files: ${table.error.message}`);

  const pub = await supabase.storage.getBucket(env.publicBucket);
  if (pub.error) throw new Error(`Public bucket: ${pub.error.message}`);

  const priv = await supabase.storage.getBucket(env.privateBucket);
  if (priv.error) throw new Error(`Private bucket: ${priv.error.message}`);

  return { publicBucket: pub.data, privateBucket: priv.data };
}
