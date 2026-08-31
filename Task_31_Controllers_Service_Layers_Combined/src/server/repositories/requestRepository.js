import {supabase} from '../config/db.js';
const select='*,department:task31_departments(id,name,code,manager_name)';
export const requestRepository={
 async list(f={}){let q=supabase.from('task31_requests').select(select).order('created_at',{ascending:false});if(f.status&&f.status!=='all')q=q.eq('status',f.status);if(f.priority&&f.priority!=='all')q=q.eq('priority',f.priority);if(f.departmentId&&f.departmentId!=='all')q=q.eq('department_id',f.departmentId);if(f.q){const s=f.q.replace(/[%_,]/g,' ');q=q.or(`request_number.ilike.%${s}%,client_name.ilike.%${s}%,client_email.ilike.%${s}%,subject.ilike.%${s}%`)}const {data,error}=await q;if(error)throw error;return data||[]},
 async findById(id){const {data,error}=await supabase.from('task31_requests').select(select).eq('id',id).maybeSingle();if(error)throw error;return data},
 async findActiveDuplicate(email,subject,excludeId=null){let q=supabase.from('task31_requests').select('id,request_number,status').eq('client_email',email).ilike('subject',subject).not('status','in','("resolved","completed")');if(excludeId)q=q.neq('id',excludeId);const {data,error}=await q.limit(1);if(error)throw error;return data?.[0]||null},
 async create(payload){const {data,error}=await supabase.from('task31_requests').insert(payload).select(select).single();if(error)throw error;return data},
 async update(id,payload){const {data,error}=await supabase.from('task31_requests').update(payload).eq('id',id).select(select).maybeSingle();if(error)throw error;return data},
 async remove(id){const {data,error}=await supabase.from('task31_requests').delete().eq('id',id).select('id').maybeSingle();if(error)throw error;return data},
 async statsRows(){const {data,error}=await supabase.from('task31_requests').select('id,status,priority,sla_due_at');if(error)throw error;return data||[]},
 async count(){const {count,error}=await supabase.from('task31_requests').select('id',{count:'exact',head:true});if(error)throw error;return count||0},
 async insertMany(rows){const {data,error}=await supabase.from('task31_requests').insert(rows).select('*');if(error)throw error;return data||[]}
};
