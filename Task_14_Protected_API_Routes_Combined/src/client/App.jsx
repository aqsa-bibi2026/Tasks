import React, { useEffect, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  LogOut,
  Mail,
  Route as RouteIcon,
  ShieldAlert,
  ShieldCheck,
  UserRound
} from 'lucide-react';

import { api } from './api.js';
import { useAuth } from './AuthContext.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner" />
        <p>Checking authentication…</p>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function Header() {
  return (
    <header className="nav">
      <Link className="brand" to="/">
        <span><ShieldCheck size={20} /></span>
        RouteGuard
      </Link>
      <nav>
        <Link to="/login">Login</Link>
        <Link className="btn small" to="/register">Create account</Link>
      </nav>
    </header>
  );
}

function Home() {
  const [status, setStatus] = useState('Checking public API…');

  useEffect(() => {
    api.get('/public/status')
      .then(({ data }) => setStatus(data.message))
      .catch(() => setStatus('Public API unavailable.'));
  }, []);

  return (
    <>
      <Header />

      <main className="hero">
        <section>
          <div className="eyebrow">TASK 14 · EXPRESS MIDDLEWARE</div>
          <h1>
            Protect APIs before
            <em> business logic runs.</em>
          </h1>
          <p>
            Reusable authentication and role middleware for Express,
            backed by JWT verification and Supabase.
          </p>

          <div className="hero-actions">
            <Link className="btn" to="/register">
              Test protected routes <ArrowRight size={18} />
            </Link>
            <Link className="btn ghost" to="/login">Sign in</Link>
          </div>

          <div className="status">
            <CheckCircle2 size={18} />
            <div>
              <b>Public API test</b>
              <small>{status}</small>
            </div>
          </div>
        </section>

        <section className="route-card">
          {[
            ['GET', '/api/v1/public/status', 'Public', 'OPEN'],
            ['GET', '/api/v1/protected/profile', 'requireAuth', 'JWT'],
            ['GET', '/api/v1/protected/dashboard', 'requireAuth', 'PROTECTED'],
            ['GET', '/api/v1/protected/admin', 'requireAuth + requireRole', 'ADMIN']
          ].map(([method, url, mid, tag]) => (
            <div className="route-row" key={url}>
              <span className="method">{method}</span>
              <div>
                <b>{url}</b>
                <small>{mid}</small>
              </div>
              <span className="tag">{tag}</span>
            </div>
          ))}
        </section>
      </main>

      <section className="features">
        {[
          ['JWT Validation', 'Missing, invalid and expired tokens return 401 before controller logic.'],
          ['Supabase Check', 'Protected requests verify that the authenticated user still exists.'],
          ['Reusable Middleware', 'Apply requireAuth only to the API endpoints that need protection.'],
          ['Role Authorization', 'Admin endpoints use requireRole after authentication.']
        ].map(([title, text]) => (
          <article key={title}>
            <ShieldCheck size={22} />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>
    </>
  );
}

function AuthPage({ registerMode = false }) {
  const auth = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      if (registerMode) {
        await auth.register(form);
      } else {
        await auth.login({
          email: form.email,
          password: form.password
        });
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header />
      <main className="auth-layout">
        <section>
          <div className="eyebrow">
            {registerMode ? 'CREATE TEST ACCOUNT' : 'SECURE LOGIN'}
          </div>
          <h1>
            {registerMode
              ? 'Create an account to test protected routes.'
              : 'Authenticate to enter protected APIs.'}
          </h1>
          <p>
            Express middleware checks the JWT before protected controllers run.
          </p>
        </section>

        <section className="auth-card">
          <h2>{registerMode ? 'Create account' : 'Login'}</h2>

          {error && <div className="error">{error}</div>}

          <form onSubmit={submit}>
            {registerMode && (
              <label>
                <span>Full name</span>
                <div className="input-shell">
                  <UserRound size={18} />
                  <input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    required
                  />
                </div>
              </label>
            )}

            <label>
              <span>Email</span>
              <div className="input-shell">
                <Mail size={18} />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </label>

            <label>
              <span>Password</span>
              <div className="input-shell">
                <KeyRound size={18} />
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>
            </label>

            <button className="btn full" disabled={busy}>
              {busy ? 'Please wait…' : registerMode ? 'Create account' : 'Login'}
            </button>
          </form>

          <p className="switch">
            {registerMode ? 'Already registered?' : 'Need an account?'}{' '}
            <Link to={registerMode ? '/login' : '/register'}>
              {registerMode ? 'Login' : 'Register'}
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    api.get('/protected/profile')
      .then(({ data }) => setProfile({ ok: true, text: `200 OK — ${data.middleware}` }))
      .catch(err => setProfile({
        ok: false,
        text: `${err.response?.status || 'ERR'} — ${err.response?.data?.message || 'Failed'}`
      }));

    api.get('/protected/dashboard')
      .then(({ data }) => setDashboard({
        ok: true,
        text: `200 OK — role: ${data.stats.role}`
      }))
      .catch(err => setDashboard({
        ok: false,
        text: `${err.response?.status || 'ERR'} — ${err.response?.data?.message || 'Failed'}`
      }));
  }, []);

  async function testAdmin() {
    try {
      const { data } = await api.get('/protected/admin');
      setAdmin({ ok: true, text: `200 OK — ${data.message}` });
    } catch (err) {
      setAdmin({
        ok: false,
        text: `${err.response?.status || 'ERR'} — ${err.response?.data?.message || 'Failed'}`
      });
    }
  }

  async function signOut() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <main className="dashboard">
      <aside>
        <div className="brand">
          <span><ShieldCheck size={20} /></span>
          RouteGuard
        </div>

        <div className="profile">
          <div className="avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <b>{user?.name}</b>
            <small>{user?.email}</small>
          </div>
        </div>

        <div className="role">
          <UserRound size={15} />
          Role: {user?.role}
        </div>

        <button className="logout" onClick={signOut}>
          <LogOut size={17} />
          Logout
        </button>
      </aside>

      <section className="dashboard-main">
        <div className="eyebrow">TASK 14 · PROTECTED ROUTES</div>
        <h1>Middleware access control is active.</h1>
        <p>
          These cards call real protected Express endpoints.
        </p>

        <div className="route-grid">
          <RouteTest
            icon={<LockKeyhole size={21} />}
            title="/protected/profile"
            middleware="requireAuth"
            result={profile}
          />

          <RouteTest
            icon={<RouteIcon size={21} />}
            title="/protected/dashboard"
            middleware="requireAuth"
            result={dashboard}
          />

          <article>
            <span className="route-icon"><ShieldCheck size={21} /></span>
            <small>Role-protected route</small>
            <h3>/protected/admin</h3>
            <p><code>requireAuth + requireRole('admin')</code></p>

            <button className="btn full" onClick={testAdmin}>
              Test admin route
            </button>

            {admin && (
              <div className={`result ${admin.ok ? 'ok' : 'deny'}`}>
                {admin.ok ? <CheckCircle2 size={17} /> : <ShieldAlert size={17} />}
                {admin.text}
              </div>
            )}
          </article>
        </div>

        <section className="pipeline">
          <div>
            <div className="eyebrow">MIDDLEWARE PIPELINE</div>
            <h2>Request → verify → authorize → controller</h2>
          </div>

          <div className="steps">
            {[
              ['01', 'Read token', 'Cookie or Authorization header'],
              ['02', 'Verify JWT', 'Signature, audience, issuer and expiry'],
              ['03', 'Load user', 'Verify the account in Supabase'],
              ['04', 'Check role', 'Optional authorization middleware'],
              ['05', 'Run handler', 'Business logic executes']
            ].map(([n, t, d]) => (
              <div className="step" key={n}>
                <span>{n}</span>
                <div>
                  <b>{t}</b>
                  <small>{d}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function RouteTest({ icon, title, middleware, result }) {
  return (
    <article>
      <span className="route-icon">{icon}</span>
      <small>Protected route</small>
      <h3>{title}</h3>
      <p><code>{middleware}</code></p>
      <div className={`result ${result?.ok ? 'ok' : ''}`}>
        {result?.ok ? <CheckCircle2 size={17} /> : <ShieldAlert size={17} />}
        {result?.text || 'Loading…'}
      </div>
    </article>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/login"
        element={<PublicOnly><AuthPage /></PublicOnly>}
      />
      <Route
        path="/register"
        element={<PublicOnly><AuthPage registerMode /></PublicOnly>}
      />
      <Route
        path="/dashboard"
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
