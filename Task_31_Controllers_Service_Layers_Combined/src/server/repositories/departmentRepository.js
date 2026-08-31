import {supabase} from '../config/db.js';
export const departmentRepository={
 async list(){const {data,error}=await supabase.from('task31_departments').select('*').order('name');if(error)throw error;return data||[]},
 async findById(id){const {data,error}=await supabase.from('task31_departments').select('*').eq('id',id).maybeSingle();if(error)throw error;return data},
 async insertMany(rows){const {data,error}=await supabase.from('task31_departments').insert(rows).select('*');if(error)throw error;return data||[]}
};
