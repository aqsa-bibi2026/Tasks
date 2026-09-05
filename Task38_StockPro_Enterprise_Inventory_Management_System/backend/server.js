const express=require('express');const cors=require('cors');const app=express();app.use(cors());app.use(express.json());
app.get('/',(req,res)=>res.json({success:true,project:'StockPro Enterprise API'}));
app.get('/api/products',(req,res)=>res.json({success:true,data:[]}));
app.post('/api/products',(req,res)=>res.json({success:true,message:'Product created',data:req.body}));
app.listen(5000,()=>console.log('StockPro API running on 5000'));