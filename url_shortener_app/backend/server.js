const express=require("express");
const cors=require("cors");
const app=express();

app.use(cors());
app.use(express.json());

let urls={};

app.post("/api/shorten",(req,res)=>{
 const code=Math.random().toString(36).substring(2,8);
 urls[code]=req.body.url;
 res.json({shortUrl:"http://localhost:5000/"+code});
});

app.get("/:code",(req,res)=>{
 const url=urls[req.params.code];
 if(url) res.redirect(url);
 else res.send("URL not found");
});

app.listen(5000,()=>console.log("Backend running"));