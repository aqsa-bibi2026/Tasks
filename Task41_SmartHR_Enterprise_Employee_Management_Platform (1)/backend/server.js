
const express=require("express");
const cors=require("cors");

const app=express();

app.use(cors());
app.use(express.json());


app.get("/",(req,res)=>{
res.json({
success:true,
project:"SmartHR Enterprise API"
});
});


app.post("/api/employees",(req,res)=>{
res.json({
success:true,
message:"Employee created successfully",
data:req.body
});
});


app.get("/api/employees",(req,res)=>{
res.json({
success:true,
employees:[]
});
});


app.listen(5000,()=>{
console.log("SmartHR API running on port 5000");
});
