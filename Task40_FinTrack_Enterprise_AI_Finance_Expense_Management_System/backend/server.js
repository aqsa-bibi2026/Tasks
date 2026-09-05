
const express=require("express");
const cors=require("cors");

const app=express();

app.use(cors());
app.use(express.json());


app.get("/",(req,res)=>{
res.json({
success:true,
project:"FinTrack Enterprise Finance API"
});
});


app.post("/api/expenses",(req,res)=>{

res.json({
success:true,
message:"Expense created successfully",
data:req.body
});

});


app.get("/api/reports",(req,res)=>{

res.json({
success:true,
report:{
revenue:125000,
expenses:42500
}
});

});


app.listen(5000,()=>{
console.log("FinTrack API running on port 5000");
});
