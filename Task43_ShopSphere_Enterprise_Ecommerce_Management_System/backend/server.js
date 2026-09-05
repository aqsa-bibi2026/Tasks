
const express=require("express");
const cors=require("cors");

const app=express();
app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
res.json({success:true,project:"ShopSphere Enterprise API"});
});

app.post("/api/products",(req,res)=>{
res.json({
success:true,
message:"Product created successfully",
data:req.body
});
});

app.get("/api/orders",(req,res)=>{
res.json({
success:true,
orders:[]
});
});

app.listen(5000,()=>{
console.log("ShopSphere API running on port 5000");
});
