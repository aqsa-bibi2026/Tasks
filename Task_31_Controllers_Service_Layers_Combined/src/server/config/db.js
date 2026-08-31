import {createClient} from '@supabase/supabase-js';
import {env} from './env.js';
export const supabase=createClient(env.supabaseUrl,env.supabaseSecret,{auth:{persistSession:false,autoRefreshToken:false}});
export async function checkDatabase(){const {error}=await supabase.from('task31_requests').select('id').limit(1);if(error)throw new Error(`task31_requests: ${error.message}`)}
