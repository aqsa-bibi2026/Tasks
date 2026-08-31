import {createClient} from '@supabase/supabase-js';
import {env} from './config.js';

export const supabase=createClient(env.supabaseUrl,env.supabaseSecret,{
  auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}
});

export async function checkDatabase(){
  const {error}=await supabase.from('task29_users').select('id').limit(1);
  if(error) throw new Error(`task29_users: ${error.message}`);
}
