import {Router} from 'express';
import bcrypt from 'bcryptjs';
import {env} from './config.js';
import {supabase} from './db.js';
import {requireAuth,signToken} from './auth.js';
import {appendAudit,verifyChain} from './audit.js';

export const authRouter=Router();
export const auditRouter=Router();

const getIp=(req)=>req.headers['x-forwarded-for']?.split(',')[0]?.trim()||req.socket?.remoteAddress||null;

authRouter.post('/login',async(req,res,next)=>{
  try{
    const email=String(req.body?.email||'').trim().toLowerCase();
    const password=String(req.body?.password||'');
    if(!email||!password) return res.status(422).json({success:false,message:'Email and password are required.'});

    const {data:user,error}=await supabase.from('task29_users')
      .select('id,full_name,email,password_hash,role').eq('email',email).maybeSingle();
    if(error) throw error;
    if(!user) return res.status(401).json({success:false,message:'Invalid email or password.'});

    const valid=await bcrypt.compare(password,user.password_hash);
    if(!valid){
      await appendAudit({
        actorEmail:email,actorName:'Unknown',action:'LOGIN_FAILED',
        category:'auth',severity:'warning',entityType:'session',
        message:'Invalid password submitted.',ipAddress:getIp(req),
        userAgent:req.headers['user-agent']||null,metadata:{success:false}
      });
      return res.status(401).json({success:false,message:'Invalid email or password.'});
    }

    res.cookie('task29_session',signToken(user),{
      httpOnly:true,sameSite:'lax',secure:env.prod,maxAge:7200000,path:'/'
    });

    await appendAudit({
      actorEmail:user.email,actorName:user.full_name,action:'LOGIN_SUCCESS',
      category:'auth',severity:'info',entityType:'session',entityId:user.id,
      message:'Auditor signed in successfully.',ipAddress:getIp(req),
      userAgent:req.headers['user-agent']||null,metadata:{success:true,role:user.role}
    });

    res.json({success:true,user:{
      id:user.id,fullName:user.full_name,email:user.email,role:user.role
    }});
  }catch(e){next(e)}
});

authRouter.get('/me',requireAuth,(req,res)=>res.json({
  success:true,user:{
    id:req.user.sub,fullName:req.user.name,email:req.user.email,role:req.user.role
  }
}));

authRouter.post('/logout',requireAuth,async(req,res,next)=>{
  try{
    await appendAudit({
      actorEmail:req.user.email,actorName:req.user.name,action:'LOGOUT',
      category:'auth',severity:'info',entityType:'session',entityId:req.user.sub,
      message:'Auditor signed out.',ipAddress:getIp(req),
      userAgent:req.headers['user-agent']||null
    });
    res.clearCookie('task29_session',{httpOnly:true,sameSite:'lax',secure:env.prod,path:'/'});
    res.json({success:true,message:'Logged out.'});
  }catch(e){next(e)}
});

auditRouter.use(requireAuth);

auditRouter.get('/',async(req,res,next)=>{
  try{
    const page=Math.max(1,Number(req.query.page||1));
    const pageSize=Math.min(50,Math.max(5,Number(req.query.pageSize||10)));
    const q=String(req.query.q||'').trim();
    const category=String(req.query.category||'all');
    const severity=String(req.query.severity||'all');
    const from=String(req.query.from||'');
    const to=String(req.query.to||'');

    let query=supabase.from('task29_audit_logs')
      .select('*',{count:'exact'}).order('sequence_no',{ascending:false});

    if(category!=='all') query=query.eq('category',category);
    if(severity!=='all') query=query.eq('severity',severity);
    if(from) query=query.gte('created_at',`${from}T00:00:00.000Z`);
    if(to) query=query.lte('created_at',`${to}T23:59:59.999Z`);
    if(q){
      const safe=q.replace(/[%_,]/g,' ');
      query=query.or(`actor_email.ilike.%${safe}%,actor_name.ilike.%${safe}%,action.ilike.%${safe}%,entity_type.ilike.%${safe}%,entity_id.ilike.%${safe}%,message.ilike.%${safe}%`);
    }

    const start=(page-1)*pageSize;
    const {data,count,error}=await query.range(start,start+pageSize-1);
    if(error) throw error;

    res.json({
      success:true,logs:data||[],
      pagination:{
        page,pageSize,total:count||0,
        totalPages:Math.max(1,Math.ceil((count||0)/pageSize))
      }
    });
  }catch(e){next(e)}
});

auditRouter.get('/stats',async(req,res,next)=>{
  try{
    const {data,error}=await supabase.from('task29_audit_logs').select('severity,category,created_at');
    if(error) throw error;
    const rows=data||[];
    const today=new Date().toISOString().slice(0,10);
    res.json({success:true,stats:{
      total:rows.length,
      critical:rows.filter(x=>x.severity==='critical').length,
      auth:rows.filter(x=>x.category==='auth').length,
      today:rows.filter(x=>x.created_at.slice(0,10)===today).length
    }});
  }catch(e){next(e)}
});

auditRouter.get('/integrity',async(req,res,next)=>{
  try{res.json({success:true,integrity:await verifyChain()})}
  catch(e){next(e)}
});

auditRouter.post('/demo',async(req,res,next)=>{
  try{
    const samples=[
      {action:'PROFILE_UPDATED',category:'data',severity:'info',entityType:'profile',entityId:'USR-DEMO',message:'User profile details changed.',beforeData:{location:'Lahore'},afterData:{location:'Islamabad'}},
      {action:'PERMISSION_DENIED',category:'access',severity:'warning',entityType:'report',entityId:'FIN-RPT',message:'Restricted finance report access denied.',beforeData:null,afterData:null},
      {action:'SECURITY_POLICY_TRIGGERED',category:'system',severity:'critical',entityType:'policy',entityId:'POL-7',message:'High-risk security policy triggered.',beforeData:null,afterData:{state:'blocked'}}
    ];
    const s=samples[Math.floor(Math.random()*samples.length)];
    const event=await appendAudit({
      actorEmail:req.user.email,actorName:req.user.name,...s,
      ipAddress:getIp(req),userAgent:req.headers['user-agent']||null,
      metadata:{generatedBy:'Task 29 demo action'}
    });
    res.status(201).json({success:true,event,message:'Demo audit event appended.'});
  }catch(e){next(e)}
});
