import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import {
  AlertTriangle,
  ArrowDownToLine,
  Check,
  CheckCircle2,
  File,
  FileCheck2,
  FileImage,
  FileText,
  FolderLock,
  Gauge,
  LoaderCircle,
  LockKeyhole,
  RefreshCcw,
  Search,
  ShieldCheck,
  ShieldX,
  Trash2,
  UploadCloud,
  X
} from 'lucide-react';

import { api } from './api.js';

const MAX_MB = 8;
const allowed = ['JPG', 'JPEG', 'PNG', 'PDF', 'TXT', 'CSV'];

function formatBytes(bytes) {
  if (!bytes) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function iconFor(mime) {
  if (mime?.startsWith('image/')) {
    return <FileImage size={20} />;
  }

  if (
    mime === 'application/pdf' ||
    mime?.startsWith('text/')
  ) {
    return <FileText size={20} />;
  }

  return <File size={20} />;
}

export default function App() {
  const inputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [report, setReport] = useState(null);
  const [validating, setValidating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadFiles = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await api.get('/files');
      setFiles(data.files || []);
      setStats(data.stats || {});
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Could not load validated files.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return files;

    return files.filter((file) =>
      [
        file.originalName,
        file.detectedMime,
        file.extension
      ].some((value) =>
        String(value || '').toLowerCase().includes(q)
      )
    );
  }, [files, query]);

  async function validateFile(file) {
    if (!file) return;

    setSelectedFile(file);
    setReport(null);
    setMessage('');
    setError('');
    setValidating(true);

    const form = new FormData();
    form.append('file', file);

    try {
      const { data } = await api.post(
        '/files/validate',
        form
      );

      setReport(data.report);
      setMessage(data.message);
    } catch (error) {
      const data = error.response?.data;

      if (data?.report) {
        setReport(data.report);
      }

      setError(
        data?.message ||
        'Validation request failed.'
      );
    } finally {
      setValidating(false);
    }
  }

  async function uploadValidatedFile() {
    if (!selectedFile) return;

    setMessage('');
    setError('');
    setUploading(true);
    setProgress(0);

    const form = new FormData();
    form.append('file', selectedFile);

    try {
      const { data } = await api.post(
        '/files/upload',
        form,
        {
          onUploadProgress(event) {
            if (event.total) {
              setProgress(
                Math.round(
                  event.loaded * 100 / event.total
                )
              );
            }
          }
        }
      );

      setReport(data.report);
      setMessage(data.message);
      setSelectedFile(null);

      if (inputRef.current) {
        inputRef.current.value = '';
      }

      await loadFiles();
    } catch (error) {
      const data = error.response?.data;

      if (data?.report) {
        setReport(data.report);
      }

      setError(
        data?.message ||
        'Secure upload failed.'
      );
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  async function downloadFile(file) {
    try {
      const { data } = await api.get(
        `/files/${file.id}/download`
      );

      window.open(
        data.url,
        '_blank',
        'noopener,noreferrer'
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Download failed.'
      );
    }
  }

  async function deleteFile(file) {
    if (!window.confirm(`Delete "${file.originalName}"?`)) {
      return;
    }

    try {
      await api.delete(`/files/${file.id}`);
      setMessage('File deleted successfully.');
      await loadFiles();
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Delete failed.'
      );
    }
  }

  return (
    <div className="app">
      <aside>
        <div className="brand">
          <span><ShieldCheck size={21} /></span>
          <div>
            <b>FileGuard</b>
            <small>Validation Console</small>
          </div>
        </div>

        <nav>
          <button className="active">
            <FileCheck2 size={18} />
            File validation
          </button>
          <button disabled>
            <FolderLock size={18} />
            Secure storage
          </button>
          <button disabled>
            <Gauge size={18} />
            Risk analytics
          </button>
        </nav>

        <div className="security-card">
          <LockKeyhole size={20} />
          <b>Server-side enforcement</b>
          <p>
            Client checks improve UX, but the Express API is
            the final security authority.
          </p>
          <span>
            <CheckCircle2 size={15} />
            Reject before Storage
          </span>
        </div>

        <div className="task">
          TASK 18
          <strong>Advanced file validation</strong>
        </div>
      </aside>

      <main>
        <header>
          <div>
            <div className="eyebrow">UPLOAD SECURITY</div>
            <h1>
              Trust the content,
              <em> not the filename.</em>
            </h1>
            <p>
              Validate extension, MIME type, real file signature,
              size and filename safety before a file reaches
              Supabase Storage.
            </p>
          </div>

          <div className="secure-pill">
            <ShieldCheck size={17} />
            Server validated
          </div>
        </header>

        <section className="stats">
          <article>
            <FileCheck2 size={21} />
            <div>
              <small>VALIDATED FILES</small>
              <b>{stats.verifiedFiles || 0}</b>
            </div>
          </article>

          <article>
            <FolderLock size={21} />
            <div>
              <small>SECURE STORAGE</small>
              <b>{formatBytes(stats.totalBytes || 0)}</b>
            </div>
          </article>

          <article>
            <Gauge size={21} />
            <div>
              <small>MAX FILE SIZE</small>
              <b>{MAX_MB} MB</b>
            </div>
          </article>

          <article>
            <ShieldCheck size={21} />
            <div>
              <small>ALLOWED TYPES</small>
              <b>{allowed.length}</b>
            </div>
          </article>
        </section>

        <section className="workspace">
          <div className="upload-card">
            <input
              ref={inputRef}
              hidden
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,.txt,.csv"
              onChange={(e) =>
                validateFile(e.target.files?.[0])
              }
            />

            <div className="upload-icon">
              <UploadCloud size={31} />
            </div>

            <div className="eyebrow">SELECT & INSPECT</div>
            <h2>Choose a file to validate</h2>
            <p>
              We inspect more than the browser file extension.
            </p>

            <button
              className="primary"
              onClick={() => inputRef.current?.click()}
              disabled={validating || uploading}
            >
              {validating
                ? <LoaderCircle className="spin" size={18} />
                : <UploadCloud size={18} />}
              Choose file
            </button>

            <div className="rules">
              <span>Allowed</span>
              <div>
                {allowed.map((item) => (
                  <b key={item}>{item}</b>
                ))}
              </div>
              <small>
                Maximum {MAX_MB} MB · executables blocked
              </small>
            </div>
          </div>

          <div className="report-card">
            <div className="report-head">
              <div>
                <div className="eyebrow">VALIDATION REPORT</div>
                <h2>
                  {selectedFile
                    ? selectedFile.name
                    : 'Awaiting file'}
                </h2>
              </div>

              {report && (
                <span
                  className={
                    report.valid ? 'passed' : 'failed'
                  }
                >
                  {report.valid
                    ? <Check size={16} />
                    : <X size={16} />}
                  {report.valid ? 'PASSED' : 'BLOCKED'}
                </span>
              )}
            </div>

            {!report ? (
              <div className="report-empty">
                <ShieldCheck size={38} />
                <h3>No file inspected yet</h3>
                <p>
                  Select a file to see every security check.
                </p>
              </div>
            ) : (
              <>
                <div className="check-list">
                  {report.checks?.map((check, index) => (
                    <div
                      className={`check-row ${
                        check.passed ? 'ok' : 'bad'
                      }`}
                      key={`${check.name}-${index}`}
                    >
                      <span>
                        {check.passed
                          ? <CheckCircle2 size={18} />
                          : <ShieldX size={18} />}
                      </span>

                      <div>
                        <b>{check.name}</b>
                        <small>{check.message}</small>
                      </div>
                    </div>
                  ))}
                </div>

                {report.valid && selectedFile && (
                  <div className="upload-action">
                    <div>
                      <b>Safe to upload</b>
                      <small>
                        Revalidation happens again on upload.
                      </small>
                    </div>

                    <button
                      className="primary"
                      onClick={uploadValidatedFile}
                      disabled={uploading}
                    >
                      {uploading
                        ? <LoaderCircle className="spin" size={18} />
                        : <FolderLock size={18} />}
                      {uploading
                        ? `Uploading ${progress}%`
                        : 'Upload securely'}
                    </button>
                  </div>
                )}

                {!report.valid && (
                  <div className="blocked-box">
                    <AlertTriangle size={19} />
                    Rejected file will not be stored.
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {message && (
          <div className="notice success">
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}

        {error && (
          <div className="notice error">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        <section className="inventory">
          <div className="panel-head">
            <div>
              <div className="eyebrow">ACCEPTED INVENTORY</div>
              <h2>Validated uploads</h2>
            </div>

            <div className="panel-actions">
              <label>
                <Search size={17} />
                <input
                  value={query}
                  onChange={(e) =>
                    setQuery(e.target.value)
                  }
                  placeholder="Search files"
                />
              </label>

              <button
                className="icon-button"
                onClick={loadFiles}
              >
                <RefreshCcw size={17} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="empty">
              <LoaderCircle className="spin" size={30} />
              <h3>Loading validated files</h3>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <FolderLock size={30} />
              <h3>No validated files yet</h3>
              <p>
                Files only appear here after every check passes.
              </p>
            </div>
          ) : (
            <div className="file-list">
              {filtered.map((file) => (
                <article className="file-row" key={file.id}>
                  <span className="file-icon">
                    {iconFor(file.detectedMime)}
                  </span>

                  <div className="file-name">
                    <b>{file.originalName}</b>
                    <small>
                      {file.detectedMime}
                    </small>
                  </div>

                  <div className="validation-badge">
                    <ShieldCheck size={14} />
                    Verified
                  </div>

                  <div className="file-meta">
                    <b>{formatBytes(file.sizeBytes)}</b>
                    <small>
                      {new Date(file.createdAt)
                        .toLocaleString()}
                    </small>
                  </div>

                  <div className="file-actions">
                    <button
                      title="Download"
                      onClick={() => downloadFile(file)}
                    >
                      <ArrowDownToLine size={17} />
                    </button>

                    <button
                      className="danger"
                      title="Delete"
                      onClick={() => deleteFile(file)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
