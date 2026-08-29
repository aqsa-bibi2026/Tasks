import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Cloud,
  File,
  FileImage,
  FileText,
  FolderOpen,
  Globe2,
  HardDrive,
  KeyRound,
  Link2,
  LoaderCircle,
  LockKeyhole,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trash2,
  UploadCloud
} from 'lucide-react';
import { api } from './api.js';

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function iconFor(mime) {
  if (mime?.startsWith('image/')) return <FileImage size={19} />;
  if (mime === 'application/pdf' || mime?.startsWith('text/')) return <FileText size={19} />;
  return <File size={19} />;
}

export default function App() {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({});
  const [visibility, setVisibility] = useState('private');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/files');
      setFiles(data.files || []);
      setStats(data.stats || {});
    } catch (error) {
      setError(error.response?.data?.message || 'Could not load storage files.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return files.filter((file) => {
      const matchesFilter = filter === 'all' || file.visibility === filter;
      const matchesQuery = !q || [file.originalName, file.mimeType, file.visibility]
        .some((value) => String(value || '').toLowerCase().includes(q));
      return matchesFilter && matchesQuery;
    });
  }, [files, filter, query]);

  async function uploadFile(file) {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setMessage('');
    setError('');

    const form = new FormData();
    form.append('file', file);
    form.append('visibility', visibility);

    try {
      const { data } = await api.post('/files/upload', form, {
        onUploadProgress(event) {
          if (event.total) {
            setProgress(Math.round(event.loaded * 100 / event.total));
          }
        }
      });

      setMessage(data.message);
      await loadFiles();
    } catch (error) {
      setError(error.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function accessFile(file) {
    setMessage('');
    setError('');

    try {
      const { data } = await api.get(`/files/${file.id}/access`);
      window.open(data.url, '_blank', 'noopener,noreferrer');
      setMessage(data.message);
    } catch (error) {
      setError(error.response?.data?.message || 'Could not create access URL.');
    }
  }

  async function deleteFile(file) {
    if (!window.confirm(`Delete "${file.originalName}"?`)) return;

    try {
      const { data } = await api.delete(`/files/${file.id}`);
      setMessage(data.message);
      await loadFiles();
    } catch (error) {
      setError(error.response?.data?.message || 'Delete failed.');
    }
  }

  return (
    <div className="app">
      <aside>
        <div className="brand">
          <span><Cloud size={21} /></span>
          <div>
            <b>BucketVault</b>
            <small>Access Control Storage</small>
          </div>
        </div>

        <nav>
          <button className="active"><FolderOpen size={18} /> Bucket manager</button>
          <button disabled><ShieldCheck size={18} /> Access policies</button>
          <button disabled><HardDrive size={18} /> Usage analytics</button>
        </nav>

        <div className="compare-card">
          <div>
            <Globe2 size={17} />
            <span><b>Public</b><small>Permanent URL</small></span>
          </div>
          <div>
            <LockKeyhole size={17} />
            <span><b>Private</b><small>Signed URL only</small></span>
          </div>
        </div>

        <div className="task">TASK 19<strong>Public & private buckets</strong></div>
      </aside>

      <main>
        <header>
          <div>
            <div className="eyebrow">STORAGE ACCESS CONTROL</div>
            <h1>One storage layer.<em> Two access models.</em></h1>
            <p>
              Compare permanent public URLs with temporary signed private access
              using two real Supabase Storage buckets.
            </p>
          </div>

          <div className="status-pill">
            <CheckCircle2 size={16} />
            Dual bucket ready
          </div>
        </header>

        <section className="stats">
          <article><FolderOpen size={20} /><div><small>TOTAL FILES</small><b>{stats.totalFiles || 0}</b></div></article>
          <article><Globe2 size={20} /><div><small>PUBLIC FILES</small><b>{stats.publicFiles || 0}</b></div></article>
          <article><LockKeyhole size={20} /><div><small>PRIVATE FILES</small><b>{stats.privateFiles || 0}</b></div></article>
          <article><HardDrive size={20} /><div><small>STORAGE USED</small><b>{formatBytes(stats.totalBytes || 0)}</b></div></article>
        </section>

        <section className="access-grid">
          <article className="access-card public-card">
            <div className="access-top">
              <span><Globe2 size={22} /></span>
              <b>Public Bucket</b>
              <small>task19-public</small>
            </div>
            <h3>Direct public access</h3>
            <p>Files receive a permanent public URL and can be opened without a signed token.</p>
            <ul>
              <li><CheckCircle2 size={15} /> Permanent URL</li>
              <li><CheckCircle2 size={15} /> No signed token</li>
              <li><CheckCircle2 size={15} /> Public assets</li>
            </ul>
          </article>

          <article className="access-card private-card">
            <div className="access-top">
              <span><LockKeyhole size={22} /></span>
              <b>Private Bucket</b>
              <small>task19-private</small>
            </div>
            <h3>Controlled private access</h3>
            <p>Files stay private until the backend creates a temporary signed URL.</p>
            <ul>
              <li><KeyRound size={15} /> Signed URL required</li>
              <li><Clock3 size={15} /> Time-limited access</li>
              <li><ShieldCheck size={15} /> Protected files</li>
            </ul>
          </article>
        </section>

        <section className="upload-panel">
          <div>
            <div className="eyebrow">UPLOAD DESTINATION</div>
            <h2>Choose access level</h2>
            <p>The backend selects the correct Supabase bucket.</p>
          </div>

          <div className="visibility-switch">
            <button
              className={visibility === 'public' ? 'active public' : ''}
              onClick={() => setVisibility('public')}
            >
              <Globe2 size={17} /> Public
            </button>
            <button
              className={visibility === 'private' ? 'active private' : ''}
              onClick={() => setVisibility('private')}
            >
              <LockKeyhole size={17} /> Private
            </button>
          </div>

          <input
            ref={inputRef}
            hidden
            type="file"
            onChange={(e) => uploadFile(e.target.files?.[0])}
          />

          <button
            className="primary"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? <LoaderCircle className="spin" size={18} /> : <UploadCloud size={18} />}
            {uploading ? `Uploading ${progress}%` : `Upload to ${visibility} bucket`}
          </button>
        </section>

        {message && <div className="notice success"><CheckCircle2 size={18} />{message}</div>}
        {error && <div className="notice error"><ShieldCheck size={18} />{error}</div>}

        <section className="inventory">
          <div className="panel-head">
            <div>
              <div className="eyebrow">STORAGE INVENTORY</div>
              <h2>Bucket files</h2>
            </div>

            <div className="panel-actions">
              <div className="filters">
                {['all', 'public', 'private'].map((item) => (
                  <button
                    key={item}
                    className={filter === item ? 'active' : ''}
                    onClick={() => setFilter(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <label>
                <Search size={17} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search files"
                />
              </label>

              <button className="icon-button" onClick={loadFiles}>
                <RefreshCcw size={17} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="empty">
              <LoaderCircle className="spin" size={30} />
              <h3>Loading bucket inventory</h3>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <Cloud size={30} />
              <h3>No files in this view</h3>
              <p>Upload a public or private file.</p>
            </div>
          ) : (
            <div className="file-list">
              {filtered.map((file) => (
                <article className="file-row" key={file.id}>
                  <span className="file-icon">{iconFor(file.mimeType)}</span>

                  <div className="file-name">
                    <b>{file.originalName}</b>
                    <small>{file.mimeType}</small>
                  </div>

                  <div className={`visibility-badge ${file.visibility}`}>
                    {file.visibility === 'public'
                      ? <Globe2 size={14} />
                      : <LockKeyhole size={14} />}
                    {file.visibility}
                  </div>

                  <div className="file-meta">
                    <b>{formatBytes(file.sizeBytes)}</b>
                    <small>{new Date(file.createdAt).toLocaleString()}</small>
                  </div>

                  <div className="file-actions">
                    <button
                      title={file.visibility === 'public' ? 'Open public URL' : 'Generate signed URL'}
                      onClick={() => accessFile(file)}
                    >
                      {file.visibility === 'public'
                        ? <ArrowUpRight size={17} />
                        : <Link2 size={17} />}
                    </button>

                    <button className="danger" title="Delete" onClick={() => deleteFile(file)}>
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
