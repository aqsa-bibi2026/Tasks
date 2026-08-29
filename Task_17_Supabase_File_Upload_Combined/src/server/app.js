import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import multer from 'multer';

import { env } from './config.js';
import { checkSupabase } from './db.js';
import filesRouter from './files.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.frontendUrl,
  credentials: true
}));
app.use(express.json({ limit: '100kb' }));

app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message: 'Task 17 file-upload API is running.',
    bucket: env.storageBucket,
    maxFileSizeMb: env.maxFileSizeMb
  });
});

app.get('/api/v1/health/storage', async (req, res) => {
  try {
    const bucket = await checkSupabase();

    res.json({
      success: true,
      message:
        'Supabase database and Storage bucket are ready.',
      bucket: {
        id: bucket.id,
        name: bucket.name,
        public: bucket.public
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: error.message
    });
  }
});

app.use('/api/v1/files', filesRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message:
      `Route not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((error, req, res, next) => {
  console.error('BACKEND ERROR:', error);

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        code: error.code,
        message:
          `File is too large. Maximum allowed size is ${env.maxFileSizeMb} MB.`
      });
    }

    return res.status(400).json({
      success: false,
      code: error.code,
      message: error.message
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    code: error.code || 'SERVER_ERROR',
    message: error.message || 'Internal server error.'
  });
});

export default app;
