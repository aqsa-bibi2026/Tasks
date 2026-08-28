import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const envPath = fileURLToPath(new URL('../../.env', import.meta.url));
dotenv.config({ path: envPath });

const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const missing = [];

if (!process.env.SUPABASE_URL) missing.push('SUPABASE_URL');
if (!supabaseKey) missing.push('SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)');
if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');

if (missing.length) {
  throw new Error(
    `Missing required backend environment variable(s): ${missing.join(', ')}. ` +
    `Make sure the file is exactly backend/.env (not .env.txt).`
  );
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long.');
}

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  supabaseUrl: process.env.SUPABASE_URL.trim(),
  supabaseSecretKey: supabaseKey.trim(),

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',

  cookieName: process.env.COOKIE_NAME || 'task12_auth',
  cookieSecure: process.env.COOKIE_SECURE === 'true'
};
