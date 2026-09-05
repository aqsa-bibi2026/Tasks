
const express=require("express");
const cors=require("cors");

const app=express();

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
res.json({
success:true,
project:"FleetFlow Enterprise API"
});
});

app.post("/api/vehicles",(req,res)=>{
res.json({
success:true,
message:"Vehicle created successfully",
data:req.body
});
});

app.get("/api/vehicles",(req,res)=>{
res.json({
success:true,
vehicles:[]
});
});

app.listen(5000,()=>{
console.log("FleetFlow API running on port 5000");
});
