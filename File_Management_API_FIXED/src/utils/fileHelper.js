exports.getFileInfo = (file)=>{
  return {
    name:file.originalname,
    size:file.size,
    type:file.mimetype
  };
};
