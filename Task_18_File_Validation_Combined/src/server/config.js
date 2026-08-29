import dotenv from 'dotenv';

dotenv.config();

const secret =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const required = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SECRET_KEY: secret
};

const missing = Object.entries(required)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length) {
  throw new Error(
    `Missing .env values: ${missing.join(', ')}`
  );
}

export const env = {
  port: Number(process.env.PORT || 5000),
  frontendUrl:
    process.env.FRONTEND_URL || 'http://localhost:5173',
  supabaseUrl: process.env.SUPABASE_URL.trim(),
  supabaseSecret: secret.trim(),
  storageBucket:
    process.env.STORAGE_BUCKET || 'task18-validated-files',
  maxFileSizeMb:
    Number(process.env.MAX_FILE_SIZE_MB || 8),
  signedUrlSeconds:
    Number(process.env.SIGNED_URL_SECONDS || 3600)
};

export const maxFileSizeBytes =
  Math.max(1, env.maxFileSizeMb) * 1024 * 1024;
