import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config.js';
import { checkDatabase } from './db.js';
import itemsRouter from './items.js';
import {
  countApiRequest,
  getRequestCount
} from './requestMetrics.js';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true
  })
);

app.use(express.json({ limit: '100kb' }));
app.use('/api/v1', countApiRequest);

app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message:
      'Task 20 optimized data-fetching API is running.'
  });
});

app.get('/api/v1/health/db', async (req, res) => {
  try {
    await checkDatabase();

    res.json({
      success: true,
      message:
        'Supabase database and task20_items are ready.'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: error.message
    });
  }
});

app.get('/api/v1/metrics', (req, res) => {
  res.json({
    success: true,
    apiRequests: getRequestCount()
  });
});

app.use('/api/v1/items', itemsRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message:
      `Route not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((error, req, res, next) => {
  console.error('BACKEND ERROR:', error);

  res.status(error.statusCode || 500).json({
    success: false,
    message:
      error.message || 'Internal server error.'
  });
});

export default app;
