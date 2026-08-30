import app from './app.js'; import { env } from './config.js'; import { checkDatabase } from './db.js';
app.listen(env.port,async()=>{console.log(`Task 26 backend: http://localhost:${env.port}`);try{await checkDatabase();console.log('SUPABASE CHECK: OK')}catch(e){console.error('SUPABASE CHECK: FAILED -',e.message)}});
