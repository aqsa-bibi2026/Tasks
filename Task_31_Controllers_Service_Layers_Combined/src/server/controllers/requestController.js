import {departmentRepository} from '../repositories/departmentRepository.js';
import {requestService} from '../services/requestService.js';
export const requestController={
 async list(req,res){res.json({success:true,requests:await requestService.list({q:req.query.q,status:req.query.status,priority:req.query.priority,departmentId:req.query.departmentId})})},
 async get(req,res){res.json({success:true,request:await requestService.get(req.params.id)})},
 async create(req,res){res.status(201).json({success:true,request:await requestService.create(req.body,req.user.sub)})},
 async update(req,res){res.json({success:true,request:await requestService.update(req.params.id,req.body)})},
 async remove(req,res){await requestService.remove(req.params.id);res.json({success:true,message:'Service request deleted.'})},
 async dashboard(req,res){const [stats,departments]=await Promise.all([requestService.stats(),departmentRepository.list()]);res.json({success:true,stats,departments,architecture:[{layer:'Routes',responsibility:'Endpoint definitions + middleware'},{layer:'Controllers',responsibility:'HTTP input and output'},{layer:'Services',responsibility:'Business rules and orchestration'},{layer:'Repositories',responsibility:'Supabase data access'}]})}
};
