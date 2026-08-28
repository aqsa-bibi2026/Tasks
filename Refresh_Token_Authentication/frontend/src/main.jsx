import React, { createContext, useContext, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import {
  BrowserRouter, Link, Navigate, Route, Routes, useNavigate
} from 'react-router-dom';
import {
  ArrowRight, Fingerprint, KeyRound, LogOut, RefreshCw, ShieldCheck
} from 'lucide-react';
import './styles.css';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

let refreshPromise = null;
api.interceptors.response.use(
  r => r,
  async error => {
    const original = error.config;
    const expired =
      error.response?.status === 401 &&
      error.response?.data?.code === 'ACCESS_TOKEN_EXPIRED';

    if (!expired || original?._retry || String(original?.url).includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${baseURL}/auth/refresh`, {}, { withCredentials:true })
          .finally(() => { refreshPromise = null; });
      }
      await refreshPromise;
      return api(original);
    } catch (e) {
      return Promise.reject(e);
    }
  }
);

const Auth = createContext(null);
const useAuth = () => useContext(Auth);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch {
        try {
          await api.post('/auth/refresh');
          const { data } = await api.get('/auth/me');
          setUser(data.user);
        } catch {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = {
    user, loading,
    async login(form) {
      const { data } = await api.post('/auth/login', form);
      setUser(data.user);
    },
    async register(form) {
      const { data } = await api.post('/auth/register', form);
      setUser(data.user);
    },
    async logout(all=false) {
      try {
        await api.post(all ? '/auth/logout-all' : '/auth/logout');
      } finally {
        setUser(null);
      }
    }
  };

  return <Auth.Provider value={value}>{children}</Auth.Provider>;
}

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center"><div className="spinner" /><p>Restoring session…</p></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center"><div className="spinner" /></div>;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function Header() {
  return (
    <header className="nav">
      <Link className="brand" to="/"><span><RefreshCw size={20}/></span>SessionForge</Link>
      <nav><Link to="/login">Login</Link><Link className="btn small" to="/register">Create account</Link></nav>
    </header>
  );
}

function Home() {
  return (
    <>
      <Header />
      <main className="hero">
        <section>
          <div className="eyebrow">TASK 13 · REFRESH TOKEN AUTHENTICATION</div>
          <h1>Secure sessions that <em>renew safely.</em></h1>
          <p>Short-lived access JWTs, rotating refresh tokens, HTTP-only cookies, hashed token storage and session revocation.</p>
          <div className="actions">
            <Link className="btn" to="/register">Create secure session <ArrowRight size={18}/></Link>
            <Link className="btn ghost" to="/login">Sign in</Link>
          </div>
        </section>
        <section className="visual">
          <div className="token">
            <span><KeyRound size={21}/></span>
            <div><b>Access JWT</b><small>Short-lived API credential</small></div>
            <strong>15m</strong>
          </div>
          <div className="flow"><RefreshCw size={18}/> expire → refresh → rotate</div>
          <div className="token">
            <span><RefreshCw size={21}/></span>
            <div><b>Refresh JWT</b><small>Rotated after successful use</small></div>
            <strong>7d</strong>
          </div>
          <div className="success"><ShieldCheck size={19}/> Old token revoked · replacement hash stored</div>
        </section>
      </main>
      <section className="features">
        {[
          [KeyRound,'Short access token','Protected API access uses a short-lived JWT.'],
          [RefreshCw,'Token rotation','Every refresh replaces the previous refresh token.'],
          [Fingerprint,'Hashed storage','Only a SHA-256 token hash is stored in Supabase.'],
          [ShieldCheck,'Reuse detection','Reusing a revoked refresh token revokes active sessions.']
        ].map(([Icon,t,d]) => (
          <article key={t}><Icon size={23}/><h3>{t}</h3><p>{d}</p></article>
        ))}
      </section>
    </>
  );
}

function AuthPage({ registerMode=false }) {
  const auth = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (registerMode && form.password !== form.confirm) {
      return setError('Passwords do not match.');
    }
    setBusy(true);
    try {
      if (registerMode) {
        await auth.register({ name:form.name, email:form.email, password:form.password });
      } else {
        await auth.login({ email:form.email, password:form.password });
      }
      nav('/dashboard', { replace:true });
    } catch (e) {
      setError(e.response?.data?.message || 'Request failed.');
    } finally { setBusy(false); }
  }

  return (
    <>
      <Header />
      <main className="authpage">
        <section className="authcopy">
          <div className="eyebrow">{registerMode ? 'NEW SESSION' : 'RETURNING SESSION'}</div>
          <h1>{registerMode ? 'Create a session that survives access expiry.' : 'Sign in once. Refresh securely.'}</h1>
          <p>Access and refresh tokens are issued as HTTP-only cookies. Refresh tokens rotate after use.</p>
        </section>
        <section className="card">
          <h2>{registerMode ? 'Create account' : 'Welcome back'}</h2>
          {error && <div className="error">{error}</div>}
          <form onSubmit={submit}>
            {registerMode && <input placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />}
            <input type="email" placeholder="Email address" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
            <input type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
            {registerMode && <input type="password" placeholder="Confirm password" value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} required />}
            <button className="btn full" disabled={busy}>{busy ? 'Please wait…' : registerMode ? 'Create account' : 'Start secure session'}</button>
          </form>
          <p className="switch">{registerMode ? 'Already registered?' : 'Need an account?'} <Link to={registerMode ? '/login' : '/register'}>{registerMode ? 'Login' : 'Register'}</Link></p>
        </section>
      </main>
    </>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [msg, setMsg] = useState('');

  async function out(all=false) {
    await logout(all);
    nav('/login', { replace:true });
  }

  async function rotateNow() {
    setMsg('');
    try {
      const { data } = await api.post('/auth/refresh');
      setMsg(data.message);
    } catch (e) {
      setMsg(e.response?.data?.message || 'Refresh failed.');
    }
  }

  return (
    <main className="dash">
      <aside>
        <div className="brand"><span><RefreshCw size={20}/></span>SessionForge</div>
        <div className="profile"><b>{user?.name}</b><small>{user?.email}</small></div>
        <button onClick={()=>out(false)}><LogOut size={17}/> Logout</button>
        <button onClick={()=>out(true)}><ShieldCheck size={17}/> Logout all sessions</button>
      </aside>
      <section className="dashmain">
        <div className="eyebrow">PROTECTED DASHBOARD</div>
        <h1>Welcome, {user?.name?.split(' ')[0]}.</h1>
        <p>Your access token can expire while your rotating refresh-token session remains active.</p>

        <div className="stats">
          <article><KeyRound/><small>Access token</small><b>15 minute JWT</b></article>
          <article><RefreshCw/><small>Refresh token</small><b>7 day rotating JWT</b></article>
          <article><Fingerprint/><small>Database</small><b>SHA-256 token hash</b></article>
        </div>

        <div className="panel">
          <h2>Live refresh-token rotation test</h2>
          <p>Press the button to call <code>/auth/refresh</code>. The current refresh token is revoked and replaced.</p>
          <button className="btn" onClick={rotateNow}><RefreshCw size={17}/> Rotate refresh token</button>
          {msg && <div className="success result"><ShieldCheck size={18}/>{msg}</div>}
        </div>
      </section>
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/login" element={<PublicOnly><AuthPage/></PublicOnly>}/>
      <Route path="/register" element={<PublicOnly><AuthPage registerMode/></PublicOnly>}/>
      <Route path="/dashboard" element={<Protected><Dashboard/></Protected>}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter><AuthProvider><App/></AuthProvider></BrowserRouter>
);
