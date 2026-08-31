import {env} from '../config/env.js';
import {authService} from '../services/authService.js';
export const authController={
 async login(req,res){const result=await authService.login(req.body?.email,req.body?.password);res.cookie('task31_session',result.token,{httpOnly:true,sameSite:'lax',secure:env.prod,maxAge:7200000,path:'/'});res.json({success:true,user:result.user})},
 me(req,res){res.json({success:true,user:{id:req.user.sub,fullName:req.user.name,email:req.user.email,role:req.user.role}})},
 logout(req,res){res.clearCookie('task31_session',{httpOnly:true,sameSite:'lax',secure:env.prod,path:'/'});res.json({success:true,message:'Logged out successfully.'})}
};
