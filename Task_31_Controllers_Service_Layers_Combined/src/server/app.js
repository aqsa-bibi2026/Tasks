import express from 'express';import cors from 'cors';import helmet from 'helmet';import cookieParser from 'cookie-parser';
import {env} from './config/env.js';import {checkDatabase} from './config/db.js';import authRoutes from './routes/authRoutes.js';import requestRoutes from './routes/requestRoutes.js';import {notFound,errorHandler} from './middleware/errorMiddleware.js';
const app=express();app.use(helmet());app.use(cors({origin:env.frontendUrl,credentials:true}));app.use(express.json({limit:'200kb'}));app.use(cookieParser());
app.get('/api/v1/health',(req,res)=>res.json({success:true,message:'Task 31 layered API is running.'}));
app.get('/api/v1/health/db',async(req,res)=>{try{await checkDatabase();res.json({success:true,message:'Supabase and Task 31 tables are ready.'})}catch(e){res.status(503).json({success:false,message:e.message})}});
app.use('/api/v1/auth',authRoutes);app.use('/api/v1',requestRoutes);app.use(notFound);app.use(errorHandler);export default app;
