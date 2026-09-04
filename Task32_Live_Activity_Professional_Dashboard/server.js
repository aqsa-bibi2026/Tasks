
require('dotenv').config();
const express=require('express');
const cors=require('cors');
const path=require('path');

const app=express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));

app.get('/api/config',(req,res)=>res.json({appName:"Pulseboard",version:"1.0",realtime:true}));

app.get('/api/stats',(req,res)=>res.json({
 totalUsers:1250,
 activeUsers:86,
 eventsToday:340
}));

app.get('/api/activity',(req,res)=>res.json({data:[
{username:"Ali",action:"Logged in",details:"Web session started",created_at:new Date(Date.now()-120000).toISOString()},
{username:"Ahmed",action:"Uploaded file",details:"Q3-report.pdf",created_at:new Date(Date.now()-300000).toISOString()},
{username:"Sara",action:"Updated profile",details:"Notification preferences",created_at:new Date(Date.now()-600000).toISOString()}
]}));

app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(Number(process.env.PORT)||3000,()=>console.log(`Dashboard running http://localhost:${Number(process.env.PORT)||3000}`));
