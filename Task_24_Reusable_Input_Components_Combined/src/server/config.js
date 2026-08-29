import dotenv from 'dotenv';
dotenv.config();
const secret=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!process.env.SUPABASE_URL||!secret) throw new Error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY in root .env');
export const env={port:Number(process.env.PORT||5000),frontendUrl:process.env.FRONTEND_URL||'http://localhost:5173',supabaseUrl:process.env.SUPABASE_URL.trim(),supabaseSecret:secret.trim()};
