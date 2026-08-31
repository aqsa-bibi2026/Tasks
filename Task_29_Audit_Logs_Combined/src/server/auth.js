import jwt from 'jsonwebtoken';
import {env} from './config.js';

export const signToken=(user)=>jwt.sign(
  {sub:user.id,email:user.email,name:user.full_name,role:user.role},
  env.jwtSecret,{expiresIn:'2h',issuer:'auditvault'}
);

export function requireAuth(req,res,next){
  const token=req.cookies?.task29_session;
  if(!token) return res.status(401).json({success:false,message:'Authentication required.'});
  try{
    req.user=jwt.verify(token,env.jwtSecret,{issuer:'auditvault'});
    next();
  }catch{
    res.status(401).json({success:false,message:'Session expired or invalid.'});
  }
}
