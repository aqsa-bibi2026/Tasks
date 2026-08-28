import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import authRouter from './auth.js';
import { env } from './config.js';
import { checkDb } from './db.js';

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.get('/api/v1/health', (req, res) =>
  res.json({ success:true, message:'Task 13 API running.' })
);

app.get('/api/v1/health/db', async (req, res) => {
  try {
    await checkDb();
    res.json({ success:true, message:'Supabase and Task 13 tables are ready.' });
  } catch (e) {
    res.status(503).json({ success:false, message:e.message });
  }
});

app.use('/api/v1/auth', authRouter);

app.use((req, res) =>
  res.status(404).json({ success:false, message:'Route not found.' })
);

app.use((err, req, res, next) => {
  console.error('BACKEND ERROR:', err);
  res.status(err.statusCode || 500).json({
    success:false,
    message:err.message || 'Internal server error.'
  });
});

app.listen(env.port, async () => {
  console.log(`Task 13 backend: http://localhost:${env.port}`);
  try {
    await checkDb();
    console.log('SUPABASE CHECK: OK');
  } catch (e) {
    console.error('SUPABASE CHECK: FAILED -', e.message);
  }
});
