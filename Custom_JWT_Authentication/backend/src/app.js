import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { verifySupabaseConnection } from './lib/supabaseAdmin.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.frontendUrl,
  credentials: true
}));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message: 'Task 12 JWT API is running.',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/v1/health/db', async (req, res) => {
  try {
    await verifySupabaseConnection();

    res.json({
      success: true,
      message: 'Supabase connection is working and jwt_users table is accessible.'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: error.message
    });
  }
});

app.use('/api/v1/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
