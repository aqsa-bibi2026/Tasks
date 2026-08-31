import dotenv from 'dotenv';
dotenv.config();

const secret=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!process.env.SUPABASE_URL||!secret) throw new Error('Missing Supabase env values.');
if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32) throw new Error('JWT_SECRET must be at least 32 characters.');

export const env={
  port:Number(process.env.PORT||5000),
  frontendUrl:process.env.FRONTEND_URL||'http://localhost:5173',
  supabaseUrl:process.env.SUPABASE_URL.trim(),
  supabaseSecret:secret.trim(),
  jwtSecret:process.env.JWT_SECRET.trim(),
  prod:process.env.NODE_ENV==='production'
};
