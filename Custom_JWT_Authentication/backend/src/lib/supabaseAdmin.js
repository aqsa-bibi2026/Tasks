import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

export const supabaseAdmin = createClient(
  env.supabaseUrl,
  env.supabaseSecretKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'X-Client-Info': 'task12-custom-jwt-backend'
      }
    }
  }
);

export async function verifySupabaseConnection() {
  const { error } = await supabaseAdmin
    .from('jwt_users')
    .select('id')
    .limit(1);

  if (error) {
    const details = [
      `Supabase connection/table check failed: ${error.message}`,
      error.details ? `Details: ${error.details}` : '',
      error.hint ? `Hint: ${error.hint}` : '',
      error.code ? `Code: ${error.code}` : ''
    ].filter(Boolean).join(' | ');

    throw new Error(details);
  }

  return true;
}
