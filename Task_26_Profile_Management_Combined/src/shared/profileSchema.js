import { z } from 'zod';
export const profileSchema=z.object({
 fullName:z.string().trim().min(3,'Full name must be at least 3 characters.').max(70),
 email:z.string().trim().toLowerCase().email('Enter a valid email address.'),
 role:z.string().trim().min(2,'Role is required.').max(80),
 company:z.string().trim().min(2,'Company is required.').max(100),
 phone:z.string().trim().max(30).optional().or(z.literal('')),
 location:z.string().trim().max(100).optional().or(z.literal('')),
 website:z.string().trim().optional().or(z.literal('')).refine(v=>{if(!v)return true;try{const u=new URL(v);return ['http:','https:'].includes(u.protocol)}catch{return false}},'Website must be a valid http/https URL.'),
 bio:z.string().trim().max(400,'Bio must be 400 characters or less.').optional().or(z.literal(''))
});
