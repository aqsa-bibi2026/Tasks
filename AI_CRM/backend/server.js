const express=require('express');
const cors=require('cors');

const app=express();
app.use(cors());
app.use(express.json());

let customers=[];

app.get('/api/customers',(req,res)=>{
res.json(customers);
});

app.post('/api/customers',(req,res)=>{
const customer={id:Date.now(),...req.body};
customers.push(customer);
res.json(customer);
});

app.put('/api/customers/:id',(req,res)=>{
let c=customers.find(x=>x.id==req.params.id);
if(!c)return res.status(404).json({message:'Not found'});
Object.assign(c,req.body);
res.json(c);
});

app.delete('/api/customers/:id',(req,res)=>{
customers=customers.filter(x=>x.id!=req.params.id);
res.json({message:'Deleted'});
});

app.listen(5000,()=>console.log('CRM API running'));
