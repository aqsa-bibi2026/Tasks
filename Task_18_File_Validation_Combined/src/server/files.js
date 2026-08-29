import crypto from 'crypto';
import { Router } from 'express';

import { env } from './config.js';
import { supabase } from './db.js';
import { validateUploadedFile } from './fileValidation.js';
import { upload } from './upload.js';

const router = Router();

function mapFile(row) {
  return {
    id: row.id,
    originalName: row.original_name,
    safeName: row.safe_name,
    storagePath: row.storage_path,
    extension: row.extension,
    claimedMime: row.claimed_mime,
    detectedMime: row.detected_mime,
    sizeBytes: Number(row.size_bytes),
    validationStatus: row.validation_status,
    validationReport: row.validation_report,
    createdAt: row.created_at
  };
}

router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('task18_files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const files = (data || []).map(mapFile);

    res.json({
      success: true,
      files,
      stats: {
        totalFiles: files.length,
        totalBytes: files.reduce(
          (sum, file) => sum + file.sizeBytes,
          0
        ),
        verifiedFiles: files.filter(
          (file) => file.validationStatus === 'accepted'
        ).length
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/validate',
  upload.single('file'),
  async (req, res, next) => {
    try {
      const report = await validateUploadedFile(req.file);

      res.status(report.valid ? 200 : 422).json({
        success: report.valid,
        message: report.valid
          ? 'File passed all validation checks.'
          : 'File failed validation.',
        report
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/upload',
  upload.single('file'),
  async (req, res, next) => {
    let storagePath = null;

    try {
      const file = req.file;
      const report = await validateUploadedFile(file);

      if (!report.valid) {
        return res.status(422).json({
          success: false,
          code: 'FILE_VALIDATION_FAILED',
          message:
            'Upload blocked because the file failed validation.',
          report
        });
      }

      const day = new Date().toISOString().slice(0, 10);
      storagePath =
        `${day}/${crypto.randomUUID()}-${report.safeName}`;

      const uploadResult = await supabase.storage
        .from(env.storageBucket)
        .upload(storagePath, file.buffer, {
          contentType: report.detectedMime,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadResult.error) {
        throw new Error(
          `Storage upload failed: ${uploadResult.error.message}`
        );
      }

      const dbResult = await supabase
        .from('task18_files')
        .insert({
          original_name: report.originalName,
          safe_name: report.safeName,
          storage_path: storagePath,
          extension: report.extension,
          claimed_mime: report.claimedMime,
          detected_mime: report.detectedMime,
          size_bytes: report.sizeBytes,
          bucket_name: env.storageBucket,
          validation_status: 'accepted',
          validation_report: {
            checks: report.checks,
            detectedExt: report.detectedExt
          }
        })
        .select('*')
        .single();

      if (dbResult.error) {
        await supabase.storage
          .from(env.storageBucket)
          .remove([storagePath]);

        throw new Error(
          `Metadata save failed: ${dbResult.error.message}`
        );
      }

      res.status(201).json({
        success: true,
        message:
          'Validated file uploaded securely to Supabase Storage.',
        report,
        file: mapFile(dbResult.data)
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id/download', async (req, res, next) => {
  try {
    const { data: file, error } = await supabase
      .from('task18_files')
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
      url: signed.data.signedUrl
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { data: file, error } = await supabase
      .from('task18_files')
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
      .from('task18_files')
      .delete()
      .eq('id', req.params.id);

    if (metadataDelete.error) {
      throw metadataDelete.error;
    }

    res.json({
      success: true,
      message: 'Validated file deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
