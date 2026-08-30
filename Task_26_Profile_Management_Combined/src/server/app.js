import cors from 'cors'; import express from 'express'; import helmet from 'helmet'; import { env } from './config.js'; import { checkDatabase } from './db.js'; import profileRouter from './profile.js';
const app=express(); app.use(helmet()); app.use(cors({origin:env.frontendUrl,credentials:true})); app.use(express.json({limit:'150kb'}));
app.get('/api/v1/health',(req,res)=>res.json({success:true,message:'Task 26 profile-management API is running.'}));
app.get('/api/v1/health/db',async(req,res)=>{try{await checkDatabase();res.json({success:true,message:'Supabase database and task26_profiles are ready.'})}catch(e){res.status(503).json({success:false,message:e.message})}});
app.use('/api/v1/profile',profileRouter);
app.use((req,res)=>res.status(404).json({success:false,message:`Route not found: ${req.method} ${req.originalUrl}`}));
app.use((error,req,res,next)=>{console.error('BACKEND ERROR:',error);if(error?.code==='LIMIT_FILE_SIZE')return res.status(413).json({success:false,message:'Avatar must be 3 MB or smaller.'});res.status(500).json({success:false,message:error.message||'Internal server error.'})});
export default app;
