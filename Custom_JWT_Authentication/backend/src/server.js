import app from './app.js';
import { env } from './config/env.js';
import { verifySupabaseConnection } from './lib/supabaseAdmin.js';

app.listen(env.port, async () => {
  console.log(`Task 12 backend running on http://localhost:${env.port}`);

  try {
    await verifySupabaseConnection();
    console.log('SUPABASE CHECK: OK - jwt_users table is accessible.');
  } catch (error) {
    console.error('');
    console.error('SUPABASE CHECK: FAILED');
    console.error(error.message);
    console.error('');
    console.error('Open http://localhost:5000/api/v1/health/db for the same diagnostic.');
  }
});
