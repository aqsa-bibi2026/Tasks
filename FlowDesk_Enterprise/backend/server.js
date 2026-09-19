const express=require('express');
const cors=require('cors');
const app=express();
app.use(cors());
app.get('/health',(req,res)=>res.json({status:'ok',service:'FlowDesk API'}));
app.get('/api/dashboard',(req,res)=>res.json({revenue:248500,projects:24}));
app.listen(5000,()=>console.log('FlowDesk API running'));
