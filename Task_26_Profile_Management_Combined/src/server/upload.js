import multer from 'multer';
const allowed=new Set(['image/jpeg','image/png','image/webp']);
export const avatarUpload=multer({storage:multer.memoryStorage(),limits:{fileSize:3*1024*1024},fileFilter:(req,file,cb)=>allowed.has(file.mimetype)?cb(null,true):cb(new Error('Only JPG, PNG and WebP avatars are allowed.'))});
