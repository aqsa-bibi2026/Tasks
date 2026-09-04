
const express=require('express');
const cors=require('cors');

const app=express();
app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
res.json({
success:true,
project:'PayFlow Enterprise Payment API'
});
});

app.post('/api/v1/payment/create-checkout',(req,res)=>{
res.json({
success:true,
message:'Stripe checkout session created',
checkout:'stripe-session-demo'
});
});

app.get('/api/v1/payment/history',(req,res)=>{
res.json({
success:true,
payments:[]
});
});

app.listen(5000,()=>console.log('PayFlow API running on 5000'));
