import { createClient } from '@supabase/supabase-js';
import { env } from './config.js';
export const supabase=createClient(env.supabaseUrl,env.supabaseSecret,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
export async function checkDatabase(){const {error}=await supabase.from('task24_project_intakes').select('id').limit(1);if(error) throw new Error(`task24_project_intakes: ${error.message}`);return true;}
