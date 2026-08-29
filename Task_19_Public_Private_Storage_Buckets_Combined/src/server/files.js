import crypto from 'crypto';
import { Router } from 'express';
import { env } from './config.js';
import { supabase } from './db.js';
import { sanitizeFilename, upload } from './upload.js';

const router = Router();

const bucketFor = (visibility) =>
  visibility === 'private' ? env.privateBucket : env.publicBucket;

function mapFile(row) {
  const item = {
    id: row.id,
    originalName: row.original_name,
    storagePath: row.storage_path,
    bucketName: row.bucket_name,
    visibility: row.visibility,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes),
    createdAt: row.created_at,
    publicUrl: null
  };

  if (row.visibility === 'public') {
    item.publicUrl = supabase.storage
      .from(row.bucket_name)
      .getPublicUrl(row.storage_path).data.publicUrl;
  }

  return item;
}

router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('task19_files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const files = (data || []).map(mapFile);

    res.json({
      success: true,
      files,
      stats: {
        totalFiles: files.length,
        publicFiles: files.filter((f) => f.visibility === 'public').length,
        privateFiles: files.filter((f) => f.visibility === 'private').length,
        totalBytes: files.reduce((sum, f) => sum + f.sizeBytes, 0)
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/upload', upload.single('file'), async (req, res, next) => {
  let storagePath;
  let bucketName;

  try {
    const file = req.file;
    const visibility = req.body.visibility === 'private' ? 'private' : 'public';

    if (!file) {
      return res.status(400).json({ success: false, message: 'Select a file to upload.' });
    }
    if (file.size <= 0) {
      return res.status(400).json({ success: false, message: 'Empty files are not allowed.' });
    }

    bucketName = bucketFor(visibility);
    const safeName = sanitizeFilename(file.originalname);
    const day = new Date().toISOString().slice(0, 10);
    storagePath = `${day}/${crypto.randomUUID()}-${safeName}`;

    const stored = await supabase.storage
      .from(bucketName)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype || 'application/octet-stream',
        cacheControl: '3600',
        upsert: false
      });

    if (stored.error) throw new Error(`Storage upload failed: ${stored.error.message}`);

    const saved = await supabase
      .from('task19_files')
      .insert({
        original_name: file.originalname,
        storage_path: storagePath,
        bucket_name: bucketName,
        visibility,
        mime_type: file.mimetype || 'application/octet-stream',
        size_bytes: file.size
      })
      .select('*')
      .single();

    if (saved.error) {
      await supabase.storage.from(bucketName).remove([storagePath]);
      throw new Error(`Metadata save failed: ${saved.error.message}`);
    }

    res.status(201).json({
      success: true,
      message: `File uploaded to the ${visibility} bucket.`,
      file: mapFile(saved.data)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/access', async (req, res, next) => {
  try {
    const { data: file, error } = await supabase
      .from('task19_files')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!file) return res.status(404).json({ success: false, message: 'File not found.' });

    if (file.visibility === 'public') {
      const url = supabase.storage
        .from(file.bucket_name)
        .getPublicUrl(file.storage_path).data.publicUrl;

      return res.json({
        success: true,
        accessType: 'public',
        url,
        expiresIn: null,
        message: 'Permanent public URL generated. No signed token required.'
      });
    }

    const signed = await supabase.storage
      .from(file.bucket_name)
      .createSignedUrl(file.storage_path, env.signedUrlSeconds, {
        download: file.original_name
      });

    if (signed.error) throw new Error(`Signed URL failed: ${signed.error.message}`);

    res.json({
      success: true,
      accessType: 'signed',
      url: signed.data.signedUrl,
      expiresIn: env.signedUrlSeconds,
      message: `Temporary private URL generated for ${env.signedUrlSeconds} seconds.`
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { data: file, error } = await supabase
      .from('task19_files')
      .select('id, storage_path, bucket_name')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!file) return res.status(404).json({ success: false, message: 'File not found.' });

    const removed = await supabase.storage.from(file.bucket_name).remove([file.storage_path]);
    if (removed.error) throw new Error(`Storage delete failed: ${removed.error.message}`);

    const deleted = await supabase.from('task19_files').delete().eq('id', req.params.id);
    if (deleted.error) throw deleted.error;

    res.json({ success: true, message: 'File deleted from Storage and database.' });
  } catch (error) {
    next(error);
  }
});

export default router;
