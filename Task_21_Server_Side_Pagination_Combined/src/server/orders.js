import crypto from 'crypto';
import { Router } from 'express';
import { supabase } from './db.js';
import { buildPaginationMeta, parsePagination } from './pagination.js';

const router = Router();
const sortMap = {
  newest: { column:'created_at', ascending:false },
  oldest: { column:'created_at', ascending:true },
  amount_high: { column:'amount', ascending:false },
  amount_low: { column:'amount', ascending:true },
  company_az: { column:'company', ascending:true }
};

router.get('/', async (req,res,next) => {
  try {
    const {page,limit,from,to} = parsePagination(req.query);
    const sortKey = sortMap[req.query.sort] ? req.query.sort : 'newest';
    const sort = sortMap[sortKey];
    const {data,error,count} = await supabase
      .from('task21_orders')
      .select('id,order_code,company,contact_name,plan,status,amount,created_at',{count:'exact'})
      .order(sort.column,{ascending:sort.ascending})
      .range(from,to);
    if (error) throw error;
    const total = count || 0;
    const pagination = buildPaginationMeta({page,limit,total});
    if (page > pagination.totalPages && total > 0) {
      return res.status(400).json({success:false,message:`Page ${page} does not exist.`,pagination});
    }
    res.json({success:true,sort:sortKey,rows:data || [],pagination,fetchedAt:new Date().toISOString()});
  } catch (e) { next(e); }
});

router.get('/stats', async (req,res,next) => {
  try {
    const {data,error} = await supabase.from('task21_orders').select('status,amount');
    if (error) throw error;
    const rows = data || [];
    res.json({success:true,stats:{
      totalRecords: rows.length,
      active: rows.filter(r=>r.status==='active').length,
      pending: rows.filter(r=>r.status==='pending').length,
      totalValue: rows.reduce((s,r)=>s+Number(r.amount||0),0)
    }});
  } catch(e) { next(e); }
});

router.post('/demo', async (req,res,next) => {
  try {
    const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const {data,error} = await supabase.from('task21_orders').insert({
      order_code:`LIVE-${suffix}`, company:'PageFlow Demo Co.', contact_name:'Demo Client',
      plan:'Growth', status:'active', amount:Number((800+Math.random()*4200).toFixed(2))
    }).select('id,order_code,company,contact_name,plan,status,amount,created_at').single();
    if (error) throw error;
    res.status(201).json({success:true,message:'Demo order created. Pagination data refreshed.',row:data});
  } catch(e) { next(e); }
});

router.delete('/:id', async (req,res,next) => {
  try {
    const {error} = await supabase.from('task21_orders').delete().eq('id',req.params.id);
    if (error) throw error;
    res.json({success:true,message:'Order deleted. Pagination metadata refreshed.'});
  } catch(e) { next(e); }
});

export default router;
