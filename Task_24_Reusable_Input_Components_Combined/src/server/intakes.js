import { Router } from 'express';
import { supabase } from './db.js';
import { intakeSchema } from '../shared/intakeSchema.js';
const router=Router();
const issuesToObject=(issues)=>issues.reduce((a,i)=>{const k=i.path?.[0]||'form'; if(!a[k])a[k]=i.message; return a;},{});
router.post('/',async(req,res,next)=>{try{
 const parsed=intakeSchema.safeParse(req.body);
 if(!parsed.success)return res.status(422).json({success:false,message:'Please correct the highlighted fields.',errors:issuesToObject(parsed.error.issues)});
 const {clientName,email,company,projectType,budget,description,updates}=parsed.data;
 const {data,error}=await supabase.from('task24_project_intakes').insert({client_name:clientName,email,company,project_type:projectType,budget,description,updates}).select('id,client_name,email,company,project_type,budget,description,updates,created_at').single();
 if(error) throw error;
 res.status(201).json({success:true,message:'Project intake saved successfully.',intake:data});
}catch(e){next(e)}});
router.get('/stats',async(req,res,next)=>{try{const {count,error}=await supabase.from('task24_project_intakes').select('id',{count:'exact',head:true});if(error)throw error;res.json({success:true,totalIntakes:count||0});}catch(e){next(e)}});
export default router;
