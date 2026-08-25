const fs = require("fs");
const path = require("path");

const folder = "src/uploads/";

exports.uploadFile = (req,res)=>{
  res.json({
    message:"File uploaded successfully",
    file:req.file
  });
};

exports.getFiles = (req,res)=>{
  if(!fs.existsSync(folder)){
    fs.mkdirSync(folder,{recursive:true});
  }

  res.json(fs.readdirSync(folder));
};

exports.getFile = (req,res)=>{
  const file = path.join(folder, req.params.filename);

  if(!fs.existsSync(file)){
    return res.status(404).json({
      error:"FileNotFoundError"
    });
  }

  res.download(file);
};

exports.deleteFile = (req,res)=>{
  const file = path.join(folder, req.params.filename);

  if(!fs.existsSync(file)){
    return res.status(404).json({
      error:"FileNotFoundError"
    });
  }

  fs.unlinkSync(file);

  res.json({
    message:"File deleted successfully"
  });
};
