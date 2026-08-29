import app from './app.js';
import { env } from './config.js';
import { checkSupabase } from './db.js';

app.listen(env.port, async () => {
  console.log(`Task 19 backend: http://localhost:${env.port}`);

  try {
    const result = await checkSupabase();
    console.log(`PUBLIC BUCKET: ${result.publicBucket.name} (public=${result.publicBucket.public})`);
    console.log(`PRIVATE BUCKET: ${result.privateBucket.name} (public=${result.privateBucket.public})`);
    console.log('SUPABASE STORAGE CHECK: OK');
  } catch (error) {
    console.error('SUPABASE STORAGE CHECK: FAILED -', error.message);
  }
});
