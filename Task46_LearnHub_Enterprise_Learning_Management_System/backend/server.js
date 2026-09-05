
const express=require("express");
const cors=require("cors");

const app=express();

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
res.json({success:true,project:"LearnHub Enterprise API"});
});

app.post("/api/courses",(req,res)=>{
res.json({
success:true,
message:"Course created successfully",
data:req.body
});
});

app.get("/api/students",(req,res)=>{
res.json({success:true,students:[]});
});

app.listen(5000,()=>{
console.log("LearnHub API running on port 5000");
});
