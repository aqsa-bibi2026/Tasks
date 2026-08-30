import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config.js';
import { checkDatabase } from './db.js';
import authRoutes from './authRoutes.js';
import dashboardRoutes from './dashboard.js';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true
  })
);

app.use(
  express.json({
    limit: '100kb'
  })
);

app.use(cookieParser());

app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message:
      'Task 27 role-dashboard API is running.'
  });
});

app.get('/api/v1/health/db', async (req, res) => {
  try {
    await checkDatabase();

    res.json({
      success: true,
      message:
        'Supabase database and Task 27 tables are ready.'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: error.message
    });
  }
});

app.use(
  '/api/v1/auth',
  authRoutes
);

app.use(
  '/api/v1/dashboard',
  dashboardRoutes
);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message:
      `Route not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((error, req, res, next) => {
  console.error('BACKEND ERROR:', error);

  res.status(500).json({
    success: false,
    message:
      error.message ||
      'Internal server error.'
  });
});

export default app;
