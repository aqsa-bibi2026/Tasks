import app from './app.js';
import { env } from './config.js';
import { checkDatabase } from './db.js';

app.listen(env.port, async () => {
  console.log(
    `Task 16 backend: http://localhost:${env.port}`
  );
  console.log(`EMAIL MODE: ${env.emailMode}`);

  try {
    await checkDatabase();
    console.log('SUPABASE CHECK: OK');
  } catch (error) {
    console.error(
      'SUPABASE CHECK: FAILED -',
      error.message
    );
  }
});
