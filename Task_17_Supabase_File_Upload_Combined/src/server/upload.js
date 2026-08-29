import multer from 'multer';
import { maxFileSizeBytes } from './config.js';

const blocked = new Set([
  'application/x-msdownload',
  'application/x-sh',
  'application/x-bat',
  'application/x-executable',
  'application/vnd.microsoft.portable-executable'
]);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 1,
    fileSize: maxFileSizeBytes
  },
  fileFilter(req, file, callback) {
    const mime = String(file.mimetype || '').toLowerCase();

    if (blocked.has(mime)) {
      const error = new Error(
        'Executable or script files are not accepted in this Task 17 demo.'
      );
      error.statusCode = 400;
      error.code = 'FILE_TYPE_BLOCKED';
      return callback(error);
    }

    callback(null, true);
  }
});

export function sanitizeFilename(filename) {
  const cleaned = String(filename || 'file')
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');

  return cleaned.slice(0, 120) || 'file';
}
