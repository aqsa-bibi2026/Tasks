import bcrypt from 'bcryptjs';
import {supabase} from './db.js';
import {appendAudit} from './audit.js';

const email='auditor@auditvault.dev';

export async function ensureDemoData(){
  const {data:user,error}=await supabase.from('task29_users').select('id').eq('email',email).maybeSingle();
  if(error) throw error;

  if(!user){
    const password_hash=await bcrypt.hash('Auditor@12345',12);
    const {error:e}=await supabase.from('task29_users').insert({
      full_name:'Aqsa Khan',email,password_hash,role:'auditor'
    });
    if(e) throw e;
  }

  const {count,error:countError}=await supabase
    .from('task29_audit_logs').select('id',{count:'exact',head:true});
  if(countError) throw countError;

  if((count||0)===0){
    const seed=[
      ['USER_CREATED','data','info','user','USR-1042','New team member account created.',null,{role:'member'}],
      ['ROLE_CHANGED','access','warning','user','USR-1042','User role changed from member to manager.',{role:'member'},{role:'manager'}],
      ['EXPORT_REQUESTED','data','info','report','RPT-2026-08','Finance audit report export requested.',null,{format:'csv'}],
      ['LOGIN_FAILED','auth','critical','session','SES-8841','Multiple invalid login attempts detected.',null,null],
      ['API_KEY_ROTATED','system','warning','integration','INT-01','Integration credential rotation completed.',{version:3},{version:4}]
    ];

    for(const [action,category,severity,entityType,entityId,message,beforeData,afterData] of seed){
      await appendAudit({
        actorEmail:email,actorName:'Aqsa Khan',action,category,severity,
        entityType,entityId,message,beforeData,afterData,
        ipAddress:'127.0.0.1',userAgent:'AuditVault Seed',
        metadata:{source:'Demo seed'}
      });
    }
  }
}
