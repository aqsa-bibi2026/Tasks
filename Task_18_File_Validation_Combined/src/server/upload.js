import multer from 'multer';
import { maxFileSizeBytes } from './config.js';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 1,
    fileSize: maxFileSizeBytes
  }
});
