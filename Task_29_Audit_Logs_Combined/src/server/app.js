import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import {env} from './config.js';
import {checkDatabase} from './db.js';
import {authRouter,auditRouter} from './routes.js';

const app=express();
app.use(helmet());
app.use(cors({origin:env.frontendUrl,credentials:true}));
app.use(express.json({limit:'150kb'}));
app.use(cookieParser());

app.get('/api/v1/health',(req,res)=>res.json({success:true,message:'Task 29 audit API is running.'}));
app.get('/api/v1/health/db',async(req,res)=>{
  try{await checkDatabase();res.json({success:true,message:'Supabase and Task 29 tables are ready.'})}
  catch(e){res.status(503).json({success:false,message:e.message})}
});

app.use('/api/v1/auth',authRouter);
app.use('/api/v1/audit',auditRouter);

app.use((req,res)=>res.status(404).json({success:false,message:`Route not found: ${req.method} ${req.originalUrl}`}));
app.use((err,req,res,next)=>{
  console.error('BACKEND ERROR:',err);
  res.status(500).json({success:false,message:err.message||'Internal server error.'});
});
export default app;
