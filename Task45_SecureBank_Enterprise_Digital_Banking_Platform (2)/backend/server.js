
const express=require("express");
const cors=require("cors");

const app=express();

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
res.json({
success:true,
project:"SecureBank Enterprise API"
});
});

app.post("/api/accounts",(req,res)=>{
res.json({
success:true,
message:"Account created successfully",
data:req.body
});
});

app.get("/api/transactions",(req,res)=>{
res.json({
success:true,
transactions:[]
});
});

app.listen(5000,()=>{
console.log("SecureBank API running on port 5000");
});
