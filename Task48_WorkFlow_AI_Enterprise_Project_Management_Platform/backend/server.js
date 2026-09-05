
const express=require("express");
const cors=require("cors");

const app=express();

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
res.json({
success:true,
project:"WorkFlow AI Enterprise API"
});
});

app.post("/api/tasks",(req,res)=>{
res.json({
success:true,
message:"Task created successfully",
data:req.body
});
});

app.get("/api/projects",(req,res)=>{
res.json({
success:true,
projects:[]
});
});

app.listen(5000,()=>{
console.log("WorkFlow AI API running on port 5000");
});
