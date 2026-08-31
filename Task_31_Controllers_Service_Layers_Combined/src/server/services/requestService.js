import {z} from 'zod';
import {departmentRepository} from '../repositories/departmentRepository.js';
import {requestRepository} from '../repositories/requestRepository.js';
import {AppError} from '../utils/AppError.js';
const schema=z.object({client_name:z.string().trim().min(2).max(100),client_email:z.string().trim().email().max(160),subject:z.string().trim().min(4).max(160),description:z.string().trim().max(2000).optional().default(''),department_id:z.string().uuid(),priority:z.enum(['low','medium','high','critical']).default('medium'),status:z.enum(['new','assigned','in_progress','waiting','resolved','completed']).default('new')});
const slaHours={low:120,medium:72,high:24,critical:4};
const transitions={new:['assigned','in_progress','waiting','resolved'],assigned:['in_progress','waiting','resolved'],in_progress:['waiting','resolved'],waiting:['in_progress','resolved'],resolved:['completed','in_progress'],completed:[]};
const sla=p=>new Date(Date.now()+(slaHours[p]||72)*3600000).toISOString();
const number=()=>`SR-${Date.now().toString().slice(-7)}-${Math.floor(100+Math.random()*900)}`;
async function department(id){const d=await departmentRepository.findById(id);if(!d)throw new AppError('Selected department does not exist.',422,'INVALID_DEPARTMENT')}
async function duplicate(email,subject,excludeId=null){const d=await requestRepository.findActiveDuplicate(email,subject,excludeId);if(d)throw new AppError(`An active matching request already exists: ${d.request_number}.`,409,'ACTIVE_DUPLICATE_REQUEST',d)}
export const requestService={
 async list(filters){return requestRepository.list({q:String(filters.q||'').trim(),status:filters.status||'all',priority:filters.priority||'all',departmentId:filters.departmentId||'all'})},
 async get(id){const r=await requestRepository.findById(id);if(!r)throw new AppError('Service request not found.',404,'REQUEST_NOT_FOUND');return r},
 async create(input,actorId){const p=schema.parse(input);await department(p.department_id);await duplicate(p.client_email.toLowerCase(),p.subject);return requestRepository.create({...p,client_email:p.client_email.toLowerCase(),request_number:number(),sla_due_at:sla(p.priority),created_by:actorId})},
 async update(id,input){const current=await this.get(id);const c=schema.partial().parse(input);if(c.department_id)await department(c.department_id);if(c.status&&c.status!==current.status&&!transitions[current.status].includes(c.status))throw new AppError(`Status cannot move from ${current.status} to ${c.status}.`,409,'INVALID_STATUS_TRANSITION',{current:current.status,allowed:transitions[current.status]});const email=(c.client_email||current.client_email).toLowerCase();const subject=c.subject||current.subject;await duplicate(email,subject,id);const payload={...c};if(c.client_email)payload.client_email=email;if(c.priority&&c.priority!==current.priority)payload.sla_due_at=sla(c.priority);const r=await requestRepository.update(id,payload);if(!r)throw new AppError('Service request not found.',404,'REQUEST_NOT_FOUND');return r},
 async remove(id){const r=await this.get(id);if(r.status==='in_progress')throw new AppError('Move an in-progress request to another status before deleting it.',409,'DELETE_BLOCKED_IN_PROGRESS');const d=await requestRepository.remove(id);if(!d)throw new AppError('Service request not found.',404,'REQUEST_NOT_FOUND');return d},
 async stats(){const rows=await requestRepository.statsRows();const now=Date.now();return{total:rows.length,open:rows.filter(r=>!['resolved','completed'].includes(r.status)).length,critical:rows.filter(r=>r.priority==='critical').length,overdue:rows.filter(r=>!['resolved','completed'].includes(r.status)&&new Date(r.sla_due_at).getTime()<now).length,completed:rows.filter(r=>r.status==='completed').length}}
};
