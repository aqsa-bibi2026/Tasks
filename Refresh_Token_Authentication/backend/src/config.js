import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const supabaseSecret =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const required = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SECRET_KEY: supabaseSecret,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET
};

const missing = Object.entries(required)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length) {
  throw new Error(
    `Missing backend env: ${missing.join(', ')}. File must be backend/.env`
  );
}

if (process.env.ACCESS_TOKEN_SECRET.length < 32 ||
    process.env.REFRESH_TOKEN_SECRET.length < 32) {
  throw new Error('Both JWT secrets must be at least 32 characters.');
}

if (process.env.ACCESS_TOKEN_SECRET === process.env.REFRESH_TOKEN_SECRET) {
  throw new Error('Access and refresh token secrets must be different.');
}

export const env = {
  port: Number(process.env.PORT || 5000),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  supabaseUrl: process.env.SUPABASE_URL.trim(),
  supabaseSecret: supabaseSecret.trim(),
  accessSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshSecret: process.env.REFRESH_TOKEN_SECRET,
  accessExpires: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  refreshExpires: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  refreshDays: Number(process.env.REFRESH_TOKEN_DAYS || 7),
  accessCookie: process.env.ACCESS_COOKIE_NAME || 'task13_access',
  refreshCookie: process.env.REFRESH_COOKIE_NAME || 'task13_refresh',
  secureCookie: process.env.COOKIE_SECURE === 'true'
};
