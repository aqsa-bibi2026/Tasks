const model=require("../models/productModel");

exports.getProducts=async(req,res,next)=>{
 try{
  const data=await model.getProducts();
  res.json(data);
 }catch(err){
  next(err);
 }
};


exports.createProduct=async(req,res,next)=>{
 try{
  const product=await model.createProduct(req.body);

  res.json({
   message:"Product created successfully",
   product
  });

 }catch(err){
  next(err);
 }
};
