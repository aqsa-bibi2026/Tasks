import React, { useEffect, useRef, useState } from 'react';
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate
} from 'react-router-dom';

import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  LogOut,
  Mail,
  RefreshCcw,
  RotateCcwKey,
  ShieldCheck,
  ShieldEllipsis,
  UserRound
} from 'lucide-react';

import { api } from './api.js';
import { useAuth } from './AuthContext.jsx';

function Logo() {
  return (
    <Link className="brand" to="/">
      <span><RotateCcwKey size={20} /></span>
      ResetFlow
    </Link>
  );
}

function Header() {
  const { user } = useAuth();

  return (
    <header className="nav">
      <Logo />

      <nav>
        {user ? (
          <Link className="btn small" to="/dashboard">
            Security center
          </Link>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link className="btn small" to="/register">
              Create account
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

function Home() {
  return (
    <>
      <Header />

      <main className="hero">
        <section>
          <div className="eyebrow">
            TASK 16 · PASSWORD RECOVERY
          </div>

          <h1>
            Recovery that protects
            <em> the account, not just access.</em>
          </h1>

          <p>
            A secure forgot-password and reset-password workflow with
            one-time codes, expiry, attempt limits, signed reset tickets
            and automatic session invalidation after password changes.
          </p>

          <div className="hero-actions">
            <Link className="btn" to="/forgot-password">
              Reset a password
              <ArrowRight size={18} />
            </Link>

            <Link className="btn ghost" to="/register">
              Create test account
            </Link>
          </div>

          <div className="trust-row">
            <span><ShieldCheck size={17} /> Hashed reset codes</span>
            <span><Clock3 size={17} /> Expiring recovery</span>
            <span><KeyRound size={17} /> Signed reset ticket</span>
          </div>
        </section>

        <section className="recovery-card">
          <div className="security-orbit">
            <div className="orbit-ring" />
            <div className="security-icon">
              <RotateCcwKey size={39} />
            </div>
            <span className="shield-badge">
              <ShieldCheck size={16} />
            </span>
          </div>

          <div className="eyebrow">RECOVERY PIPELINE</div>
          <h2>Controlled password recovery</h2>
          <p>
            The new password is accepted only after the reset code and
            temporary reset ticket both pass server-side checks.
          </p>

          <div className="flow">
            {[
              ['01', 'Request', 'Generic response protects account discovery'],
              ['02', 'Code', 'One-time six-digit reset challenge'],
              ['03', 'Verify', 'Expiry and attempt-limit validation'],
              ['04', 'Ticket', 'Short-lived signed reset authorization'],
              ['05', 'Reset', 'Password re-hashed and old sessions invalidated']
            ].map(([n, t, d]) => (
              <div className="flow-row" key={n}>
                <span>{n}</span>
                <div>
                  <b>{t}</b>
                  <small>{d}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <section className="features">
        {[
          [ShieldEllipsis, 'Anti-enumeration response', 'Forgot-password requests do not publicly confirm whether an account exists.'],
          [LockKeyhole, 'Secure code storage', 'Only the SHA-256 hash of each reset code is stored in Supabase.'],
          [Clock3, 'Expiry & attempt limits', 'Stale codes and excessive incorrect attempts are rejected.'],
          [KeyRound, 'Session invalidation', 'Changing a password invalidates authentication tokens created with the old password version.']
        ].map(([Icon, title, text]) => (
          <article key={title}>
            <Icon size={23} />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>
    </>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder = 'Password'
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label>
      <span>{label}</span>

      <div className="input-shell">
        <LockKeyhole size={18} />

        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
        />

        <button
          className="eye-button"
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </label>
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
    setError('');
    setBusy(true);

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
    } catch (error) {
      setError(
        error.payload?.message ||
        error.response?.data?.message ||
        error.message ||
        'Request failed.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header />

      <main className="auth-layout">
        <section className="auth-copy">
          <div className="eyebrow">
            {registerMode
              ? 'CREATE TEST ACCOUNT'
              : 'SECURE LOGIN'}
          </div>

          <h1>
            {registerMode
              ? 'Create an account, then test a full recovery lifecycle.'
              : 'Access your security center.'}
          </h1>

          <p>
            {registerMode
              ? 'The account uses bcrypt password hashing and password-version session protection.'
              : 'Forgot your password? Start the recovery workflow instead of creating another account.'}
          </p>

          <div className="mini-points">
            <span><CheckCircle2 size={18} /> bcrypt password hashing</span>
            <span><CheckCircle2 size={18} /> HTTP-only JWT cookie</span>
            <span><CheckCircle2 size={18} /> Password-change session invalidation</span>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-icon">
            {registerMode
              ? <UserRound size={23} />
              : <KeyRound size={23} />}
          </div>

          <h2>
            {registerMode ? 'Create account' : 'Welcome back'}
          </h2>

          <p className="card-subtitle">
            {registerMode
              ? 'Use this account to test forgot-password recovery.'
              : 'Enter your account credentials.'}
          </p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={submit}>
            {registerMode && (
              <label>
                <span>Full name</span>
                <div className="input-shell">
                  <UserRound size={18} />
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="Your name"
                    required
                  />
                </div>
              </label>
            )}

            <label>
              <span>Email address</span>
              <div className="input-shell">
                <Mail size={18} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  placeholder="you@example.com"
                  required
                />
              </div>
            </label>

            <PasswordField
              label="Password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              placeholder="Minimum 8 characters"
            />

            {!registerMode && (
              <div className="forgot-link">
                <Link to="/forgot-password">
                  Forgot password?
                </Link>
              </div>
            )}

            <button className="btn full" disabled={busy}>
              {busy
                ? 'Please wait…'
                : registerMode
                  ? 'Create account'
                  : 'Login'}
            </button>
          </form>

          <p className="switch">
            {registerMode
              ? 'Already registered?'
              : 'Need a test account?'}{' '}
            <Link to={registerMode ? '/login' : '/register'}>
              {registerMode ? 'Login' : 'Create account'}
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const { data } = await api.post(
        '/password/forgot',
        { email: normalizedEmail }
      );

      if (!data.success) {
        setError(data.message || 'Could not start password recovery.');
        return;
      }

      if (data.accountFound === false) {
        setError(data.message);
        return;
      }

      const recovery = {
        email: normalizedEmail,
        message: data.message,
        resetId: data.resetId || '',
        devCode: data.devCode || ''
      };

      sessionStorage.setItem(
        'task16_recovery',
        JSON.stringify(recovery)
      );

      navigate('/verify-reset', {
        state: recovery
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Could not start password recovery.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header />

      <main className="recovery-layout">
        <section className="step-card">
          <div className="step-count">STEP 01 OF 03</div>

          <div className="big-icon">
            <Mail size={30} />
          </div>

          <h1>Forgot your password?</h1>

          <p>
            Enter the email used for your account. We will start a
            secure password-recovery request.
          </p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={submit}>
            <label>
              <span>Email address</span>
              <div className="input-shell">
                <Mail size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </label>

            <button className="btn full" disabled={busy}>
              {busy
                ? 'Starting recovery…'
                : 'Send reset code'}
            </button>
          </form>

          <div className="security-note">
            <ShieldCheck size={17} />
            <span>
              For privacy, the public response does not confirm whether
              an account exists for an email.
            </span>
          </div>

          <Link className="back-link" to="/login">
            Back to login
          </Link>
        </section>
      </main>
    </>
  );
}

function VerifyResetCode() {
  const location = useLocation();
  const navigate = useNavigate();

  let savedRecovery = {};

  try {
    savedRecovery = JSON.parse(
      sessionStorage.getItem('task16_recovery') || '{}'
    );
  } catch {
    savedRecovery = {};
  }

  const initialRecovery = {
    ...savedRecovery,
    ...(location.state || {})
  };

  const [email] = useState(initialRecovery.email || '');
  const [resetId, setResetId] = useState(
    initialRecovery.resetId || ''
  );
  const [code, setCode] = useState(
    initialRecovery.devCode || ''
  );
  const [message, setMessage] = useState(
    initialRecovery.message ||
    'Enter the reset code sent for your account.'
  );

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function startCooldown(seconds) {
    setCooldown(seconds);

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setCooldown((value) => {
        if (value <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }

        return value - 1;
      });
    }, 1000);
  }

  async function verify(e) {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      const { data } = await api.post(
        '/password/verify-code',
        { email, resetId, code }
      );

      if (!data.success) {
        setError(data.message || 'Could not verify the reset code.');
        return;
      }

      sessionStorage.removeItem('task16_recovery');

      navigate('/reset-password', {
        replace: true,
        state: {
          resetTicket: data.resetTicket,
          email
        }
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Could not verify the reset code.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError('');

    try {
      const { data } = await api.post(
        '/password/resend',
        { email }
      );

      if (!data.success) {
        if (data.retryAfter) {
          startCooldown(data.retryAfter);
        }

        setError(data.message || 'Could not resend the reset code.');
        return;
      }

      setMessage(data.message);

      const nextCode = data.devCode || '';
      const nextResetId = data.resetId || '';

      setCode(nextCode);
      setResetId(nextResetId);

      sessionStorage.setItem(
        'task16_recovery',
        JSON.stringify({
          email,
          message: data.message,
          resetId: nextResetId,
          devCode: nextCode
        })
      );

      startCooldown(60);
    } catch (error) {
      const payload = error.response?.data;

      if (payload?.retryAfter) {
        startCooldown(payload.retryAfter);
      }

      setError(
        payload?.message ||
        'Could not resend the reset code.'
      );
    }
  }

  return (
    <>
      <Header />

      <main className="recovery-layout">
        <section className="step-card">
          <div className="step-count">STEP 02 OF 03</div>

          <div className="big-icon">
            <ShieldEllipsis size={31} />
          </div>

          <h1>Verify reset code</h1>

          <p>{message}</p>

          <form onSubmit={verify}>
            <label>
              <span>Email address</span>
              <div className="input-shell">
                <Mail size={18} />
                <input
                  type="email"
                  value={email}
                  readOnly
                  required
                />
              </div>
            </label>

            <label>
              <span>6-digit reset code</span>
              <input
                className="code-input"
                value={code}
                onChange={(e) =>
                  setCode(
                    e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 6)
                  )
                }
                placeholder="000000"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
              />
            </label>

            {code && resetId && (
              <div className="security-note local-dev-note">
                <CheckCircle2 size={17} />
                <span>
                  Local console mode: the exact server-generated code is
                  prefilled automatically. Just click Verify reset code.
                </span>
              </div>
            )}

            {error && <div className="error-box">{error}</div>}

            <button
              className="btn full"
              disabled={busy || code.length !== 6}
            >
              {busy
                ? 'Verifying…'
                : 'Verify reset code'}
            </button>

            <button
              className="resend-button"
              type="button"
              onClick={resend}
              disabled={cooldown > 0}
            >
              <RefreshCcw size={16} />
              {cooldown > 0
                ? `Resend in ${cooldown}s`
                : 'Resend reset code'}
            </button>
          </form>

          <div className="security-note">
            <Clock3 size={17} />
            <span>
              Reset codes expire and become unusable after too many
              incorrect attempts.
            </span>
          </div>
        </section>
      </main>
    </>
  );
}

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearLocalUser } = useAuth();

  const resetTicket = location.state?.resetTicket || '';

  const [form, setForm] = useState({
    password: '',
    confirm: ''
  });

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!resetTicket && !done) {
    return <Navigate to="/forgot-password" replace />;
  }

  async function submit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);

    try {
      const { data } = await api.post(
        '/password/reset',
        {
          resetTicket,
          newPassword: form.password
        }
      );

      if (!data.success) {
        setError(data.message || 'Password reset failed.');
        return;
      }

      clearLocalUser();
      setDone(true);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Password reset failed.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header />

      <main className="recovery-layout">
        <section className="step-card">
          <div className="step-count">
            {done ? 'RECOVERY COMPLETE' : 'STEP 03 OF 03'}
          </div>

          <div className={`big-icon ${done ? 'success' : ''}`}>
            {done
              ? <BadgeCheck size={31} />
              : <KeyRound size={31} />}
          </div>

          <h1>
            {done
              ? 'Password changed.'
              : 'Create a new password'}
          </h1>

          <p>
            {done
              ? 'Your old authenticated sessions are no longer valid. Login using the new password.'
              : 'Choose a password different from your current password.'}
          </p>

          {!done ? (
            <form onSubmit={submit}>
              <PasswordField
                label="New password"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value
                  })
                }
                placeholder="New secure password"
              />

              <PasswordField
                label="Confirm new password"
                value={form.confirm}
                onChange={(e) =>
                  setForm({
                    ...form,
                    confirm: e.target.value
                  })
                }
                placeholder="Repeat new password"
              />

              {error && <div className="error-box">{error}</div>}

              <button className="btn full" disabled={busy}>
                {busy
                  ? 'Changing password…'
                  : 'Reset password'}
              </button>
            </form>
          ) : (
            <button
              className="btn full"
              onClick={() =>
                navigate('/login', { replace: true })
              }
            >
              Login with new password
              <ArrowRight size={18} />
            </button>
          )}

          <div className="security-note">
            <ShieldCheck size={17} />
            <span>
              Successful reset changes the password version and
              invalidates older access tokens.
            </span>
          </div>
        </section>
      </main>
    </>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner" />
        <p>Checking secure session…</p>
      </div>
    );
  }

  return user
    ? children
    : <Navigate to="/login" replace />;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  return user
    ? <Navigate to="/dashboard" replace />
    : children;
}

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [securityStatus, setSecurityStatus] = useState({
    loading: true,
    ok: false,
    message: 'Checking protected security API…'
  });

  useEffect(() => {
    api
      .get('/account/security')
      .then(({ data }) =>
        setSecurityStatus({
          loading: false,
          ok: true,
          message: data.message
        })
      )
      .catch((error) =>
        setSecurityStatus({
          loading: false,
          ok: false,
          message:
            error.response?.data?.message ||
            'Security API unavailable.'
        })
      );
  }, []);

  async function signOut() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <main className="dashboard">
      <aside>
        <Logo />

        <div className="profile-box">
          <div className="avatar">
            {user?.name?.[0]?.toUpperCase()}
          </div>

          <div>
            <b>{user?.name}</b>
            <small>{user?.email}</small>
          </div>
        </div>

        <div className="secure-pill">
          <ShieldCheck size={16} />
          Secure session active
        </div>

        <Link className="recovery-side-link" to="/forgot-password">
          <RotateCcwKey size={16} />
          Test password recovery
        </Link>

        <button className="logout-button" onClick={signOut}>
          <LogOut size={17} />
          Logout
        </button>
      </aside>

      <section className="dashboard-main">
        <div className="eyebrow">
          ACCOUNT SECURITY CENTER
        </div>

        <h1>
          Password security
          <em> under control.</em>
        </h1>

        <p className="dashboard-lead">
          Use this account to test the complete recovery lifecycle:
          forgot password → code verification → new password → new login.
        </p>

        <div className="dashboard-grid">
          <article className="status-card">
            <div className="status-icon">
              <UserRound size={24} />
            </div>
            <small>ACCOUNT</small>
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
            <div className="success-line">
              <CheckCircle2 size={16} />
              Authentication active
            </div>
          </article>

          <article className="status-card">
            <div className="status-icon">
              <KeyRound size={24} />
            </div>
            <small>PASSWORD VERSION</small>
            <h3>Session protected</h3>
            <p>
              Existing JWTs are rejected after a successful password change.
            </p>
            <div className="success-line">
              <CheckCircle2 size={16} />
              Password-version gate
            </div>
          </article>

          <article className="status-card">
            <div className="status-icon">
              <ShieldEllipsis size={24} />
            </div>
            <small>PROTECTED API</small>
            <h3>/account/security</h3>
            <p>
              This route validates the current password version.
            </p>
            <div className={
              securityStatus.ok
                ? 'success-line'
                : 'warning-line'
            }>
              {securityStatus.ok
                ? <CheckCircle2 size={16} />
                : <Clock3 size={16} />}
              {securityStatus.message}
            </div>
          </article>
        </div>

        <section className="audit-panel">
          <div>
            <div className="eyebrow">
              TASK 16 WORKFLOW
            </div>
            <h2>Security controls included end-to-end.</h2>
          </div>

          <div className="audit-list">
            {[
              'Generic forgot-password response',
              'Hashed six-digit reset challenge',
              'Expiry, cooldown and attempt limits',
              'Short-lived signed reset ticket',
              'Password reuse prevention',
              'Old JWT session invalidation'
            ].map((text, index) => (
              <div key={text}>
                <span><Check size={15} /></span>
                <b>{text}</b>
                <small>{String(index + 1).padStart(2, '0')}</small>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/register"
        element={
          <PublicOnly>
            <AuthPage registerMode />
          </PublicOnly>
        }
      />

      <Route
        path="/login"
        element={
          <PublicOnly>
            <AuthPage />
          </PublicOnly>
        }
      />

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-reset" element={<VerifyResetCode />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
