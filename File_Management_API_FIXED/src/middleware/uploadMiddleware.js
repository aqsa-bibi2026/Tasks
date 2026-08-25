const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const allowed = [".jpg",".png",".pdf",".docx",".txt"];

const fileFilter = (req,file,cb)=>{
  const ext = path.extname(file.originalname).toLowerCase();

  if(allowed.includes(ext)){
    cb(null,true);
  } else {
    cb(new Error("InvalidFileError"));
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits:{
    fileSize: 5 * 1024 * 1024
  }
});
