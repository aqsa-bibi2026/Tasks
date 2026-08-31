import crypto from 'crypto';
import {supabase} from './db.js';

export const digest=(value)=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

export async function appendAudit({
  actorEmail,actorName,action,category,severity,entityType,
  entityId=null,message,ipAddress=null,userAgent=null,
  beforeData=null,afterData=null,metadata={}
}){
  const {data:prev,error:prevError}=await supabase
    .from('task29_audit_logs')
    .select('event_hash')
    .order('sequence_no',{ascending:false})
    .limit(1)
    .maybeSingle();
  if(prevError) throw prevError;

  const previousHash=prev?.event_hash||'GENESIS';
  const canonical={
    previousHash,actorEmail,actorName,action,category,severity,
    entityType,entityId,message,beforeData,afterData,metadata
  };
  const eventHash=digest(canonical);

  const {data,error}=await supabase.from('task29_audit_logs').insert({
    actor_email:actorEmail,
    actor_name:actorName,
    action,category,severity,
    entity_type:entityType,
    entity_id:entityId,
    message,
    ip_address:ipAddress,
    user_agent:userAgent,
    before_data:beforeData,
    after_data:afterData,
    metadata,
    previous_hash:previousHash,
    event_hash:eventHash
  }).select('*').single();

  if(error) throw error;
  return data;
}

export async function verifyChain(){
  const {data,error}=await supabase.from('task29_audit_logs')
    .select('*').order('sequence_no',{ascending:true});
  if(error) throw error;

  let previousHash='GENESIS';
  for(const row of data||[]){
    if(row.previous_hash!==previousHash){
      return {valid:false,checked:(data||[]).length,brokenAt:row.sequence_no,reason:'Previous hash mismatch'};
    }
    const canonical={
      previousHash:row.previous_hash,
      actorEmail:row.actor_email,
      actorName:row.actor_name,
      action:row.action,
      category:row.category,
      severity:row.severity,
      entityType:row.entity_type,
      entityId:row.entity_id,
      message:row.message,
      beforeData:row.before_data??null,
      afterData:row.after_data??null,
      metadata:row.metadata??{}
    };
    if(digest(canonical)!==row.event_hash){
      return {valid:false,checked:(data||[]).length,brokenAt:row.sequence_no,reason:'Event hash mismatch'};
    }
    previousHash=row.event_hash;
  }
  return {valid:true,checked:(data||[]).length,brokenAt:null,reason:'Audit chain verified'};
}
