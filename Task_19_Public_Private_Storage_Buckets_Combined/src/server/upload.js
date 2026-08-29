import multer from 'multer';
import { maxFileSizeBytes } from './config.js';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 1, fileSize: maxFileSizeBytes }
});

export function sanitizeFilename(filename) {
  return String(filename || 'file')
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 120) || 'file';
}
