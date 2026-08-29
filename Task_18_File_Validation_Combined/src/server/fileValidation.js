import path from 'path';
import { fileTypeFromBuffer } from 'file-type';
import { maxFileSizeBytes } from './config.js';

const binaryRules = {
  '.jpg': {
    detectedExts: new Set(['jpg']),
    detectedMimes: new Set(['image/jpeg']),
    claimedMimes: new Set(['image/jpeg'])
  },
  '.jpeg': {
    detectedExts: new Set(['jpg']),
    detectedMimes: new Set(['image/jpeg']),
    claimedMimes: new Set(['image/jpeg'])
  },
  '.png': {
    detectedExts: new Set(['png']),
    detectedMimes: new Set(['image/png']),
    claimedMimes: new Set(['image/png'])
  },
  '.pdf': {
    detectedExts: new Set(['pdf']),
    detectedMimes: new Set(['application/pdf']),
    claimedMimes: new Set(['application/pdf'])
  }
};

const textRules = {
  '.txt': new Set(['text/plain']),
  '.csv': new Set([
    'text/csv',
    'text/plain',
    'application/csv',
    'application/vnd.ms-excel'
  ])
};

const dangerousExtensions = new Set([
  '.exe', '.com', '.bat', '.cmd', '.msi',
  '.ps1', '.psm1', '.sh', '.bash',
  '.js', '.mjs', '.cjs', '.vbs',
  '.jar', '.scr', '.dll', '.sys',
  '.php', '.py', '.pl', '.rb'
]);

function lowerExt(filename) {
  return path.extname(filename || '').toLowerCase();
}

function getExtensions(filename) {
  const base = path.basename(filename || '').toLowerCase();
  const parts = base.split('.');

  if (parts.length <= 1) return [];

  return parts.slice(1).map((part) => `.${part}`);
}

export function sanitizeFilename(filename) {
  const ext = lowerExt(filename);

  const base = path
    .basename(filename || 'file', ext)
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'file';

  return `${base}${ext}`;
}

function hasNullByte(buffer) {
  const sample = buffer.subarray(
    0,
    Math.min(buffer.length, 8192)
  );

  return sample.includes(0);
}

function looksLikeText(buffer) {
  const sample = buffer.subarray(
    0,
    Math.min(buffer.length, 8192)
  );

  if (sample.length === 0 || hasNullByte(sample)) {
    return false;
  }

  let suspicious = 0;

  for (const byte of sample) {
    const allowedControl =
      byte === 9 || byte === 10 || byte === 13;

    const printable =
      byte >= 32 ||
      allowedControl;

    if (!printable) suspicious += 1;
  }

  return suspicious / sample.length < 0.02;
}

function dangerousDoubleExtension(filename) {
  const extensions = getExtensions(filename);

  if (extensions.length <= 1) return null;

  const prior = extensions.slice(0, -1);

  return prior.find((ext) =>
    dangerousExtensions.has(ext)
  ) || null;
}

export async function validateUploadedFile(file) {
  const checks = [];
  const fail = (name, message) => {
    checks.push({
      name,
      passed: false,
      message
    });
  };

  const pass = (name, message) => {
    checks.push({
      name,
      passed: true,
      message
    });
  };

  if (!file) {
    return {
      valid: false,
      checks: [{
        name: 'File selected',
        passed: false,
        message: 'No file was received.'
      }]
    };
  }

  const originalName = file.originalname || 'file';
  const ext = lowerExt(originalName);
  const claimedMime =
    String(file.mimetype || 'application/octet-stream')
      .toLowerCase();

  if (file.size <= 0) {
    fail('File content', 'Empty files are not allowed.');
  } else {
    pass('File content', 'File contains data.');
  }

  if (file.size > maxFileSizeBytes) {
    fail(
      'File size',
      'File exceeds the configured maximum size.'
    );
  } else {
    pass('File size', 'File size is within the allowed limit.');
  }

  const allowedExtension =
    Object.hasOwn(binaryRules, ext) ||
    Object.hasOwn(textRules, ext);

  if (!allowedExtension) {
    fail(
      'Extension',
      `Extension "${ext || '(none)'}" is not allowed.`
    );
  } else {
    pass('Extension', `${ext} is allowed.`);
  }

  const doubleDanger = dangerousDoubleExtension(originalName);

  if (doubleDanger) {
    fail(
      'Double extension',
      `Dangerous hidden extension detected: ${doubleDanger}`
    );
  } else {
    pass(
      'Double extension',
      'No dangerous hidden extension detected.'
    );
  }

  let detectedMime = '';
  let detectedExt = '';

  if (Object.hasOwn(binaryRules, ext)) {
    const detected = await fileTypeFromBuffer(file.buffer);
    detectedMime = detected?.mime || '';
    detectedExt = detected?.ext || '';

    const rule = binaryRules[ext];

    if (!rule.claimedMimes.has(claimedMime)) {
      fail(
        'Claimed MIME type',
        `Browser MIME "${claimedMime}" does not match ${ext}.`
      );
    } else {
      pass(
        'Claimed MIME type',
        `${claimedMime} matches ${ext}.`
      );
    }

    if (!detected) {
      fail(
        'Content signature',
        'No valid binary signature was detected.'
      );
    } else if (
      !rule.detectedExts.has(detected.ext) ||
      !rule.detectedMimes.has(detected.mime)
    ) {
      fail(
        'Content signature',
        `Content detected as ${detected.mime} (.${detected.ext}), not ${ext}.`
      );
    } else {
      pass(
        'Content signature',
        `Magic bytes confirm ${detected.mime}.`
      );
    }
  } else if (Object.hasOwn(textRules, ext)) {
    detectedMime =
      ext === '.csv' ? 'text/csv' : 'text/plain';
    detectedExt = ext.slice(1);

    if (!textRules[ext].has(claimedMime)) {
      fail(
        'Claimed MIME type',
        `Browser MIME "${claimedMime}" is not accepted for ${ext}.`
      );
    } else {
      pass(
        'Claimed MIME type',
        `${claimedMime} is accepted for ${ext}.`
      );
    }

    if (!looksLikeText(file.buffer)) {
      fail(
        'Content signature',
        'Text validation failed: binary/control bytes detected.'
      );
    } else {
      pass(
        'Content signature',
        'Content looks like a valid text document.'
      );
    }
  }

  const safeName = sanitizeFilename(originalName);

  if (safeName !== originalName) {
    pass(
      'Safe filename',
      `Filename will be stored safely as "${safeName}".`
    );
  } else {
    pass(
      'Safe filename',
      'Filename is already safe.'
    );
  }

  return {
    valid: checks.every((check) => check.passed),
    originalName,
    safeName,
    extension: ext,
    claimedMime,
    detectedMime,
    detectedExt,
    sizeBytes: file.size,
    checks
  };
}
