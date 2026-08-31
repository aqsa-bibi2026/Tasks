import {supabase} from '../config/db.js';
export const userRepository={
 async findByEmail(email){const {data,error}=await supabase.from('task31_users').select('id,full_name,email,password_hash,role').eq('email',email).maybeSingle();if(error)throw error;return data},
 async create(payload){const {data,error}=await supabase.from('task31_users').insert(payload).select('*').single();if(error)throw error;return data}
};
