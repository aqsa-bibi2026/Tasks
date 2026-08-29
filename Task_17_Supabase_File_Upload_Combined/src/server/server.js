import app from './app.js';
import { env } from './config.js';
import { checkSupabase } from './db.js';

app.listen(env.port, async () => {
  console.log(
    `Task 17 backend: http://localhost:${env.port}`
  );
  console.log(
    `STORAGE BUCKET: ${env.storageBucket}`
  );

  try {
    await checkSupabase();
    console.log('SUPABASE STORAGE CHECK: OK');
  } catch (error) {
    console.error(
      'SUPABASE STORAGE CHECK: FAILED -',
      error.message
    );
  }
});
