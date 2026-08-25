const supabase=require("../config/supabase");

exports.getProducts=async()=>{
 const {data,error}=await supabase
 .from("products")
 .select("*");

 if(error) throw error;

 return data;
};


exports.createProduct=async(product)=>{
 const {data,error}=await supabase
 .from("products")
 .insert([product])
 .select();

 if(error) throw error;

 return data[0];
};
