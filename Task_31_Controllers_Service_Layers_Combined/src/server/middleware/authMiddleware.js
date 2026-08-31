import jwt from 'jsonwebtoken';
import {env} from '../config/env.js';
export function requireAuth(req,res,next){const token=req.cookies?.task31_session;if(!token)return res.status(401).json({success:false,code:'AUTH_REQUIRED',message:'Authentication required.'});try{req.user=jwt.verify(token,env.jwtSecret,{issuer:'layerdesk'});next()}catch{return res.status(401).json({success:false,code:'INVALID_SESSION',message:'Session expired or invalid.'})}}
