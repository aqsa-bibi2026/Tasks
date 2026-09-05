
const express=require("express");
const cors=require("cors");

const app=express();

app.use(cors());
app.use(express.json());


app.get("/",(req,res)=>{
res.json({
success:true,
project:"HelpDesk Pro Enterprise API"
});
});


app.post("/api/tickets",(req,res)=>{

res.json({
success:true,
message:"Ticket created successfully",
ticket:req.body
});

});


app.get("/api/tickets",(req,res)=>{

res.json({
success:true,
tickets:[]
});

});


app.listen(5000,()=>{
console.log("HelpDesk Pro API running on 5000");
});
