import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {env} from './config.js';
import {supabase,checkDatabase} from './db.js';

const app=express();
app.use(helmet());
app.use(cors({origin:env.frontendUrl,credentials:true}));
app.use(express.json({limit:'200kb'}));
app.use(cookieParser());

const token=(u)=>jwt.sign(
  {sub:u.id,email:u.email,name:u.full_name,role:u.role},
  env.jwtSecret,{expiresIn:'2h',issuer:'relatedesk'}
);

function auth(req,res,next){
  const t=req.cookies?.task30_session;
  if(!t) return res.status(401).json({success:false,message:'Authentication required.'});
  try{req.user=jwt.verify(t,env.jwtSecret,{issuer:'relatedesk'});next()}
  catch{res.status(401).json({success:false,message:'Session expired or invalid.'})}
}

const txt=(v,name)=>{
  const s=String(v||'').trim();
  if(!s) throw new Error(`${name} is required.`);
  return s;
};

async function seed(){
  const email='admin@relatedesk.dev';
  const {data:user,error:uerr}=await supabase.from('task30_users').select('id').eq('email',email).maybeSingle();
  if(uerr) throw uerr;
  if(!user){
    const password_hash=await bcrypt.hash('Admin@12345',12);
    const {error}=await supabase.from('task30_users').insert({
      full_name:'Aqsa Khan',email,password_hash,role:'admin'
    });
    if(error) throw error;
  }

  const {count:tmc,error:tmce}=await supabase.from('task30_team_members').select('id',{count:'exact',head:true});
  if(tmce) throw tmce;
  if(!tmc){
    const {error}=await supabase.from('task30_team_members').insert([
      {full_name:'Sarah Malik',email:'sarah@relatedesk.dev',role:'Project Manager',initials:'SM'},
      {full_name:'Hamza Ali',email:'hamza@relatedesk.dev',role:'Frontend Developer',initials:'HA'},
      {full_name:'Noor Fatima',email:'noor@relatedesk.dev',role:'UI/UX Designer',initials:'NF'},
      {full_name:'Bilal Ahmed',email:'bilal@relatedesk.dev',role:'Backend Developer',initials:'BA'}
    ]);
    if(error) throw error;
  }

  const {count:cc,error:cce}=await supabase.from('task30_clients').select('id',{count:'exact',head:true});
  if(cce) throw cce;
  if(cc) return;

  const {data:clients,error:ce}=await supabase.from('task30_clients').insert([
    {name:'Northstar Labs',industry:'Technology',contact_name:'Daniel Cooper',contact_email:'daniel@northstar.example',status:'active',annual_value:85000},
    {name:'Aurelia Retail',industry:'E-commerce',contact_name:'Emily Rose',contact_email:'emily@aurelia.example',status:'active',annual_value:62000},
    {name:'Vertex Capital',industry:'Finance',contact_name:'Michael Chen',contact_email:'michael@vertex.example',status:'prospect',annual_value:120000}
  ]).select('*');
  if(ce) throw ce;

  const {data:members,error:me}=await supabase.from('task30_team_members').select('*').order('created_at');
  if(me) throw me;

  const {data:projects,error:pe}=await supabase.from('task30_projects').insert([
    {client_id:clients[0].id,name:'Enterprise Analytics Portal',description:'Unified analytics and executive reporting experience.',status:'active',priority:'high',budget:48000,due_date:'2026-10-15'},
    {client_id:clients[1].id,name:'Commerce Experience Refresh',description:'Conversion-focused storefront redesign.',status:'review',priority:'medium',budget:36000,due_date:'2026-09-30'},
    {client_id:clients[0].id,name:'Mobile Insights App',description:'Mobile companion experience for field leadership.',status:'planning',priority:'medium',budget:27500,due_date:'2026-11-20'}
  ]).select('*');
  if(pe) throw pe;

  const {error:pme}=await supabase.from('task30_project_members').insert([
    {project_id:projects[0].id,member_id:members[0].id},
    {project_id:projects[0].id,member_id:members[1].id},
    {project_id:projects[0].id,member_id:members[3].id},
    {project_id:projects[1].id,member_id:members[0].id},
    {project_id:projects[1].id,member_id:members[2].id},
    {project_id:projects[2].id,member_id:members[1].id}
  ]);
  if(pme) throw pme;

  const {error:te}=await supabase.from('task30_tasks').insert([
    {project_id:projects[0].id,assignee_id:members[1].id,title:'Build executive KPI cards',description:'Create responsive KPI summary cards.',status:'in_progress',priority:'high',due_date:'2026-09-08'},
    {project_id:projects[0].id,assignee_id:members[3].id,title:'Optimize analytics API',description:'Reduce dashboard response latency.',status:'review',priority:'critical',due_date:'2026-09-05'},
    {project_id:projects[1].id,assignee_id:members[2].id,title:'Finalize checkout prototype',description:'Prepare checkout design handoff.',status:'done',priority:'medium',due_date:'2026-09-02'},
    {project_id:projects[2].id,assignee_id:members[1].id,title:'Create mobile shell',description:'Prepare React mobile layout foundation.',status:'todo',priority:'medium',due_date:'2026-09-18'}
  ]);
  if(te) throw te;
}

/* HEALTH */
app.get('/api/v1/health',(req,res)=>res.json({success:true,message:'Task 30 relational CRUD API is running.'}));
app.get('/api/v1/health/db',async(req,res)=>{
  try{await checkDatabase();res.json({success:true,message:'Supabase and Task 30 tables are ready.'})}
  catch(e){res.status(503).json({success:false,message:e.message})}
});

/* AUTH */
app.post('/api/v1/auth/login',async(req,res,next)=>{
  try{
    const email=String(req.body?.email||'').trim().toLowerCase();
    const password=String(req.body?.password||'');
    const {data:u,error}=await supabase.from('task30_users').select('id,full_name,email,password_hash,role').eq('email',email).maybeSingle();
    if(error) throw error;
    if(!u||!(await bcrypt.compare(password,u.password_hash))) return res.status(401).json({success:false,message:'Invalid email or password.'});
    res.cookie('task30_session',token(u),{httpOnly:true,sameSite:'lax',secure:env.prod,maxAge:7200000,path:'/'});
    res.json({success:true,user:{id:u.id,fullName:u.full_name,email:u.email,role:u.role}});
  }catch(e){next(e)}
});
app.get('/api/v1/auth/me',auth,(req,res)=>res.json({success:true,user:{id:req.user.sub,fullName:req.user.name,email:req.user.email,role:req.user.role}}));
app.post('/api/v1/auth/logout',(req,res)=>{
  res.clearCookie('task30_session',{httpOnly:true,sameSite:'lax',secure:env.prod,path:'/'});
  res.json({success:true,message:'Logged out.'});
});

/* DASHBOARD */
app.get('/api/v1/dashboard',auth,async(req,res,next)=>{
  try{
    const [c,p,t,m]=await Promise.all([
      supabase.from('task30_clients').select('*'),
      supabase.from('task30_projects').select('*'),
      supabase.from('task30_tasks').select('*'),
      supabase.from('task30_team_members').select('*').order('full_name')
    ]);
    for(const r of [c,p,t,m]) if(r.error) throw r.error;
    res.json({success:true,stats:{
      clients:c.data.length,
      projects:p.data.length,
      activeProjects:p.data.filter(x=>x.status==='active').length,
      openTasks:t.data.filter(x=>x.status!=='done').length,
      portfolioValue:c.data.reduce((s,x)=>s+Number(x.annual_value||0),0),
      projectBudget:p.data.reduce((s,x)=>s+Number(x.budget||0),0)
    },members:m.data});
  }catch(e){next(e)}
});

/* CLIENT CRUD */
app.get('/api/v1/clients',auth,async(req,res,next)=>{
  try{
    const {data,error}=await supabase.from('task30_clients')
      .select('*,projects:task30_projects(id,status,budget)')
      .order('created_at',{ascending:false});
    if(error) throw error;
    res.json({success:true,clients:(data||[]).map(c=>({
      ...c,
      project_count:c.projects?.length||0,
      active_project_count:c.projects?.filter(p=>p.status==='active').length||0,
      project_budget:c.projects?.reduce((s,p)=>s+Number(p.budget||0),0)||0
    }))});
  }catch(e){next(e)}
});
app.post('/api/v1/clients',auth,async(req,res,next)=>{
  try{
    const body={
      name:txt(req.body?.name,'Client name'),
      industry:txt(req.body?.industry,'Industry'),
      contact_name:txt(req.body?.contact_name,'Contact name'),
      contact_email:txt(req.body?.contact_email,'Contact email'),
      status:req.body?.status||'active',
      annual_value:Number(req.body?.annual_value||0)
    };
    const {data,error}=await supabase.from('task30_clients').insert(body).select('*').single();
    if(error) throw error;
    res.status(201).json({success:true,client:data});
  }catch(e){next(e)}
});
app.patch('/api/v1/clients/:id',auth,async(req,res,next)=>{
  try{
    const allowed=['name','industry','contact_name','contact_email','status','annual_value'];
    const body=Object.fromEntries(Object.entries(req.body||{}).filter(([k])=>allowed.includes(k)));
    if('annual_value' in body) body.annual_value=Number(body.annual_value||0);
    const {data,error}=await supabase.from('task30_clients').update(body).eq('id',req.params.id).select('*').maybeSingle();
    if(error) throw error;
    if(!data) return res.status(404).json({success:false,message:'Client not found.'});
    res.json({success:true,client:data});
  }catch(e){next(e)}
});
app.delete('/api/v1/clients/:id',auth,async(req,res,next)=>{
  try{
    const {count,error:e}=await supabase.from('task30_projects').select('id',{count:'exact',head:true}).eq('client_id',req.params.id);
    if(e) throw e;
    if(count) return res.status(409).json({success:false,message:'Delete or move this client’s projects before deleting the client.'});
    const {error}=await supabase.from('task30_clients').delete().eq('id',req.params.id);
    if(error) throw error;
    res.json({success:true,message:'Client deleted.'});
  }catch(e){next(e)}
});

/* PROJECT CRUD */
app.get('/api/v1/projects',auth,async(req,res,next)=>{
  try{
    const {data,error}=await supabase.from('task30_projects').select(`
      *,
      client:task30_clients(id,name,industry),
      tasks:task30_tasks(id,status),
      project_members:task30_project_members(
        member:task30_team_members(id,full_name,email,role,initials)
      )
    `).order('created_at',{ascending:false});
    if(error) throw error;
    res.json({success:true,projects:(data||[]).map(p=>({
      ...p,
      task_count:p.tasks?.length||0,
      done_task_count:p.tasks?.filter(t=>t.status==='done').length||0,
      members:p.project_members?.map(x=>x.member).filter(Boolean)||[]
    }))});
  }catch(e){next(e)}
});
app.post('/api/v1/projects',auth,async(req,res,next)=>{
  try{
    const body={
      client_id:txt(req.body?.client_id,'Client'),
      name:txt(req.body?.name,'Project name'),
      description:String(req.body?.description||'').trim(),
      status:req.body?.status||'planning',
      priority:req.body?.priority||'medium',
      budget:Number(req.body?.budget||0),
      due_date:req.body?.due_date||null
    };
    const {data,error}=await supabase.from('task30_projects').insert(body).select('*').single();
    if(error) throw error;
    res.status(201).json({success:true,project:data});
  }catch(e){next(e)}
});
app.patch('/api/v1/projects/:id',auth,async(req,res,next)=>{
  try{
    const allowed=['client_id','name','description','status','priority','budget','due_date'];
    const body=Object.fromEntries(Object.entries(req.body||{}).filter(([k])=>allowed.includes(k)));
    if('budget' in body) body.budget=Number(body.budget||0);
    if('due_date' in body&&!body.due_date) body.due_date=null;
    const {data,error}=await supabase.from('task30_projects').update(body).eq('id',req.params.id).select('*').maybeSingle();
    if(error) throw error;
    if(!data) return res.status(404).json({success:false,message:'Project not found.'});
    res.json({success:true,project:data});
  }catch(e){next(e)}
});
app.delete('/api/v1/projects/:id',auth,async(req,res,next)=>{
  try{
    const {count,error:e}=await supabase.from('task30_tasks').select('id',{count:'exact',head:true}).eq('project_id',req.params.id);
    if(e) throw e;
    if(count) return res.status(409).json({success:false,message:'Delete or move this project’s tasks before deleting the project.'});
    const {error}=await supabase.from('task30_projects').delete().eq('id',req.params.id);
    if(error) throw error;
    res.json({success:true,message:'Project deleted.'});
  }catch(e){next(e)}
});
app.post('/api/v1/projects/:id/members',auth,async(req,res,next)=>{
  try{
    const member_id=txt(req.body?.member_id,'Team member');
    const {error}=await supabase.from('task30_project_members').upsert(
      {project_id:req.params.id,member_id},{onConflict:'project_id,member_id'}
    );
    if(error) throw error;
    res.status(201).json({success:true,message:'Member added.'});
  }catch(e){next(e)}
});
app.delete('/api/v1/projects/:projectId/members/:memberId',auth,async(req,res,next)=>{
  try{
    const {error}=await supabase.from('task30_project_members').delete()
      .eq('project_id',req.params.projectId).eq('member_id',req.params.memberId);
    if(error) throw error;
    res.json({success:true,message:'Member removed.'});
  }catch(e){next(e)}
});

/* TASK CRUD */
app.get('/api/v1/tasks',auth,async(req,res,next)=>{
  try{
    const {data,error}=await supabase.from('task30_tasks').select(`
      *,
      project:task30_projects(id,name,client:task30_clients(id,name)),
      assignee:task30_team_members(id,full_name,email,role,initials)
    `).order('created_at',{ascending:false});
    if(error) throw error;
    res.json({success:true,tasks:data||[]});
  }catch(e){next(e)}
});
app.post('/api/v1/tasks',auth,async(req,res,next)=>{
  try{
    const body={
      project_id:txt(req.body?.project_id,'Project'),
      assignee_id:req.body?.assignee_id||null,
      title:txt(req.body?.title,'Task title'),
      description:String(req.body?.description||'').trim(),
      status:req.body?.status||'todo',
      priority:req.body?.priority||'medium',
      due_date:req.body?.due_date||null
    };
    const {data,error}=await supabase.from('task30_tasks').insert(body).select('*').single();
    if(error) throw error;
    res.status(201).json({success:true,task:data});
  }catch(e){next(e)}
});
app.patch('/api/v1/tasks/:id',auth,async(req,res,next)=>{
  try{
    const allowed=['project_id','assignee_id','title','description','status','priority','due_date'];
    const body=Object.fromEntries(Object.entries(req.body||{}).filter(([k])=>allowed.includes(k)));
    if('assignee_id' in body&&!body.assignee_id) body.assignee_id=null;
    if('due_date' in body&&!body.due_date) body.due_date=null;
    const {data,error}=await supabase.from('task30_tasks').update(body).eq('id',req.params.id).select('*').maybeSingle();
    if(error) throw error;
    if(!data) return res.status(404).json({success:false,message:'Task not found.'});
    res.json({success:true,task:data});
  }catch(e){next(e)}
});
app.delete('/api/v1/tasks/:id',auth,async(req,res,next)=>{
  try{
    const {error}=await supabase.from('task30_tasks').delete().eq('id',req.params.id);
    if(error) throw error;
    res.json({success:true,message:'Task deleted.'});
  }catch(e){next(e)}
});

app.use((req,res)=>res.status(404).json({success:false,message:`Route not found: ${req.method} ${req.originalUrl}`}));
app.use((err,req,res,next)=>{
  console.error('BACKEND ERROR:',err);
  res.status(500).json({success:false,message:err.message||'Internal server error.'});
});

app.listen(env.port,async()=>{
  console.log(`Task 30 backend: http://localhost:${env.port}`);
  try{
    await checkDatabase();
    console.log('SUPABASE CHECK: OK');
    await seed();
    console.log('DEMO ADMIN: READY');
    console.log('RELATIONAL SEED: READY');
  }catch(e){
    console.error('STARTUP CHECK FAILED:',e.message);
  }
});
