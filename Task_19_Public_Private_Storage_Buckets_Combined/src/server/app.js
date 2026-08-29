import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import multer from 'multer';
import { env } from './config.js';
import { checkSupabase } from './db.js';
import filesRouter from './files.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message: 'Task 19 BucketVault API is running.',
    buckets: { public: env.publicBucket, private: env.privateBucket }
  });
});

app.get('/api/v1/health/storage', async (req, res) => {
  try {
    const result = await checkSupabase();
    res.json({
      success: true,
      message: 'Public and private Supabase buckets are ready.',
      buckets: {
        public: {
          id: result.publicBucket.id,
          name: result.publicBucket.name,
          public: result.publicBucket.public
        },
        private: {
          id: result.privateBucket.id,
          name: result.privateBucket.name,
          public: result.privateBucket.public
        }
      }
    });
  } catch (error) {
    res.status(503).json({ success: false, message: error.message });
  }
});

app.use('/api/v1/files', filesRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((error, req, res, next) => {
  console.error('BACKEND ERROR:', error);

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: `Maximum file size is ${env.maxFileSizeMb} MB.`
      });
    }
    return res.status(400).json({ success: false, message: error.message });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error.'
  });
});

export default app;
