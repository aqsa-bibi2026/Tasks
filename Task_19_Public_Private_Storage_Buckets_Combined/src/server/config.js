import dotenv from 'dotenv';
dotenv.config();

const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!process.env.SUPABASE_URL || !secret) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY in root .env');
}

export const env = {
  port: Number(process.env.PORT || 5000),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  supabaseUrl: process.env.SUPABASE_URL.trim(),
  supabaseSecret: secret.trim(),
  publicBucket: process.env.PUBLIC_BUCKET || 'task19-public',
  privateBucket: process.env.PRIVATE_BUCKET || 'task19-private',
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 10),
  signedUrlSeconds: Number(process.env.SIGNED_URL_SECONDS || 900)
};

export const maxFileSizeBytes = Math.max(1, env.maxFileSizeMb) * 1024 * 1024;
