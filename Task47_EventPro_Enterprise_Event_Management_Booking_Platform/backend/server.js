
const express=require("express");
const cors=require("cors");

const app=express();

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
res.json({
success:true,
project:"EventPro Enterprise API"
});
});

app.post("/api/events",(req,res)=>{
res.json({
success:true,
message:"Event created successfully",
data:req.body
});
});

app.get("/api/bookings",(req,res)=>{
res.json({
success:true,
bookings:[]
});
});

app.listen(5000,()=>{
console.log("EventPro API running on port 5000");
});
