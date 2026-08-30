import app from './app.js';
import { env } from './config.js';
import { checkDatabase } from './db.js';
import { ensureDemoData } from './seed.js';

app.listen(env.port, async () => {
  console.log(`Task 28 backend: http://localhost:${env.port}`);

  try {
    await checkDatabase();
    console.log('SUPABASE CHECK: OK');

    await ensureDemoData();
    console.log('DEMO USER: READY');
    console.log('DEMO NOTIFICATIONS: READY');
  } catch (error) {
    console.error('STARTUP CHECK FAILED:', error.message);
  }
});
