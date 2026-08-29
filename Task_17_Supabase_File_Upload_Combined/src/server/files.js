import crypto from 'crypto';
import { Router } from 'express';

import { env } from './config.js';
import { supabase } from './db.js';
import { sanitizeFilename, upload } from './upload.js';

const router = Router();

function mapFile(row) {
  return {
    id: row.id,
    originalName: row.original_name,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes),
    bucketName: row.bucket_name,
    createdAt: row.created_at
  };
}

router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('task17_files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const files = (data || []).map(mapFile);
    const totalBytes = files.reduce(
      (sum, item) => sum + item.sizeBytes,
      0
    );

    res.json({
      success: true,
      files,
      stats: {
        totalFiles: files.length,
        totalBytes,
        imageFiles: files.filter((x) =>
          x.mimeType.startsWith('image/')
        ).length,
        documentFiles: files.filter((x) =>
          x.mimeType === 'application/pdf' ||
          x.mimeType.startsWith('text/')
        ).length
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/upload',
  upload.single('file'),
  async (req, res, next) => {
    let storagePath = null;

    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'Select a file to upload.'
        });
      }

      const safeName = sanitizeFilename(file.originalname);
      const day = new Date().toISOString().slice(0, 10);
      storagePath =
        `${day}/${crypto.randomUUID()}-${safeName}`;

      const storageResult = await supabase.storage
        .from(env.storageBucket)
        .upload(storagePath, file.buffer, {
          contentType:
            file.mimetype || 'application/octet-stream',
          upsert: false,
          cacheControl: '3600'
        });

      if (storageResult.error) {
        throw new Error(
          `Storage upload failed: ${storageResult.error.message}`
        );
      }

      const metadataResult = await supabase
        .from('task17_files')
        .insert({
          original_name: file.originalname,
          storage_path: storagePath,
          mime_type:
            file.mimetype || 'application/octet-stream',
          size_bytes: file.size,
          bucket_name: env.storageBucket
        })
        .select('*')
        .single();

      if (metadataResult.error) {
        await supabase.storage
          .from(env.storageBucket)
          .remove([storagePath]);

        throw new Error(
          `Metadata save failed: ${metadataResult.error.message}`
        );
      }

      res.status(201).json({
        success: true,
        message:
          'File uploaded to Supabase Storage successfully.',
        file: mapFile(metadataResult.data)
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id/download', async (req, res, next) => {
  try {
    const { data: file, error } = await supabase
      .from('task17_files')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found.'
      });
    }

    const signed = await supabase.storage
      .from(file.bucket_name)
      .createSignedUrl(
        file.storage_path,
        env.signedUrlSeconds,
        { download: file.original_name }
      );

    if (signed.error) {
      throw new Error(
        `Signed URL failed: ${signed.error.message}`
      );
    }

    res.json({
      success: true,
      url: signed.data.signedUrl,
      expiresIn: env.signedUrlSeconds
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { data: file, error } = await supabase
      .from('task17_files')
      .select('id, storage_path, bucket_name')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found.'
      });
    }

    const storageDelete = await supabase.storage
      .from(file.bucket_name)
      .remove([file.storage_path]);

    if (storageDelete.error) {
      throw new Error(
        `Storage delete failed: ${storageDelete.error.message}`
      );
    }

    const metadataDelete = await supabase
      .from('task17_files')
      .delete()
      .eq('id', req.params.id);

    if (metadataDelete.error) {
      throw metadataDelete.error;
    }

    res.json({
      success: true,
      message: 'File deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
