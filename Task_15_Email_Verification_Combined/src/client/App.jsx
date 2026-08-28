import React, { useEffect, useRef, useState } from 'react';
import {
  Navigate,
  Route,
  Routes,
  Link,
  useLocation,
  useNavigate
} from 'react-router-dom';

import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock3,
  KeyRound,
  LockKeyhole,
  LogOut,
  Mail,
  MailCheck,
  RefreshCcw,
  ShieldCheck,
  UserRound
} from 'lucide-react';

import { api } from './api.js';
import { useAuth } from './AuthContext.jsx';

function Logo() {
  return (
    <Link className="brand" to="/">
      <span>
        <MailCheck size={20} />
      </span>
      VerifyFlow
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
            Dashboard
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
            TASK 15 · EMAIL VERIFICATION WORKFLOW
          </div>

          <h1>
            Trust starts with a
            <em> verified inbox.</em>
          </h1>

          <p>
            A production-style email verification flow with secure
            one-time codes, expiry, resend protection and verified-only
            account access.
          </p>

          <div className="hero-actions">
            <Link className="btn" to="/register">
              Start verification
              <ArrowRight size={18} />
            </Link>

            <Link className="btn ghost" to="/login">
              Login
            </Link>
          </div>

          <div className="trust-row">
            <span><ShieldCheck size={17} /> Hashed codes</span>
            <span><Clock3 size={17} /> 15-minute expiry</span>
            <span><LockKeyhole size={17} /> Verified-only login</span>
          </div>
        </section>

        <section className="verification-card">
          <div className="mail-illustration">
            <div className="mail-glow" />
            <div className="mail-icon">
              <MailCheck size={38} />
            </div>
            <span className="verified-badge">
              <Check size={15} />
            </span>
          </div>

          <h2>Email verification pipeline</h2>
          <p>
            The backend creates a one-time code, stores only its hash,
            verifies expiry and attempts, then unlocks login.
          </p>

          <div className="flow-list">
            {[
              ['01', 'Register account', 'Password is securely hashed'],
              ['02', 'Issue code', '6-digit one-time verification code'],
              ['03', 'Deliver', 'Console mode or real SMTP email'],
              ['04', 'Verify', 'Hash + expiry + attempt checks'],
              ['05', 'Unlock', 'Verified account can login']
            ].map(([n, title, text]) => (
              <div className="flow-item" key={n}>
                <span>{n}</span>
                <div>
                  <b>{title}</b>
                  <small>{text}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <section className="features">
        {[
          [Mail, 'Verification codes', 'A secure 6-digit code is generated for each verification request.'],
          [ShieldCheck, 'No plain-text code storage', 'Supabase stores a SHA-256 code hash instead of the original code.'],
          [Clock3, 'Expiry & cooldown', 'Codes expire automatically and resend requests are rate controlled.'],
          [BadgeCheck, 'Verified-only access', 'Login and protected account routes require a verified email.']
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

function AuthCard({ registerMode = false }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      if (registerMode) {
        const { data } = await api.post(
          '/auth/register',
          form
        );

        navigate('/verify', {
          replace: true,
          state: {
            email: form.email.trim().toLowerCase(),
            devCode: data.devCode || null,
            message: data.message
          }
        });

        return;
      }

      await login({
        email: form.email,
        password: form.password
      });

      navigate('/dashboard', { replace: true });
    } catch (err) {
      const payload = err.response?.data;

      if (
        !registerMode &&
        payload?.code === 'EMAIL_NOT_VERIFIED'
      ) {
        navigate('/verify', {
          state: {
            email: payload.email || form.email,
            message: payload.message
          }
        });

        return;
      }

      if (
        registerMode &&
        payload?.code === 'EMAIL_PENDING_VERIFICATION'
      ) {
        navigate('/verify', {
          state: {
            email: form.email.trim().toLowerCase(),
            message: payload.message
          }
        });

        return;
      }

      setError(
        payload?.message ||
        'Request failed. Please try again.'
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
              ? 'CREATE VERIFIED ACCOUNT'
              : 'SECURE LOGIN'}
          </div>

          <h1>
            {registerMode
              ? 'One small verification step. Better account security.'
              : 'Only verified accounts move forward.'}
          </h1>

          <p>
            {registerMode
              ? 'Create your account and VerifyFlow will immediately generate a one-time verification code.'
              : 'Login succeeds only after the email verification workflow has been completed.'}
          </p>

          <div className="mini-points">
            <span>
              <CheckCircle2 size={18} />
              Secure password hashing
            </span>

            <span>
              <CheckCircle2 size={18} />
              Time-limited email code
            </span>

            <span>
              <CheckCircle2 size={18} />
              Protected verified dashboard
            </span>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-icon">
            {registerMode
              ? <UserRound size={23} />
              : <KeyRound size={23} />}
          </div>

          <h2>
            {registerMode
              ? 'Create account'
              : 'Welcome back'}
          </h2>

          <p className="card-subtitle">
            {registerMode
              ? 'Your email verification comes next.'
              : 'Enter your verified account credentials.'}
          </p>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <form onSubmit={submit}>
            {registerMode && (
              <label>
                <span>Full name</span>

                <div className="input-shell">
                  <UserRound size={18} />

                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value
                      })
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
                    setForm({
                      ...form,
                      email: e.target.value
                    })
                  }
                  placeholder="you@example.com"
                  required
                />
              </div>
            </label>

            <label>
              <span>Password</span>

              <div className="input-shell">
                <LockKeyhole size={18} />

                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value
                    })
                  }
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>
            </label>

            <button className="btn full" disabled={busy}>
              {busy
                ? 'Please wait…'
                : registerMode
                  ? 'Create & verify account'
                  : 'Login'}
            </button>
          </form>

          <p className="switch">
            {registerMode
              ? 'Already verified?'
              : 'Need an account?'}{' '}
            <Link
              to={
                registerMode
                  ? '/login'
                  : '/register'
              }
            >
              {registerMode
                ? 'Login'
                : 'Create account'}
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}

function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(
    location.state?.email || ''
  );

  const [code, setCode] = useState(
    location.state?.devCode || ''
  );

  const [message, setMessage] = useState(
    location.state?.message ||
    'Enter the 6-digit code sent for this account.'
  );

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  function startCooldown(seconds) {
    setCooldown(seconds);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

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

    setBusy(true);
    setError('');

    try {
      const { data } = await api.post(
        '/auth/verify-email',
        {
          email,
          code
        }
      );

      setVerified(true);
      setMessage(data.message);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Verification failed.'
      );
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError('');

    if (!email) {
      setError(
        'Enter your account email before resending.'
      );
      return;
    }

    try {
      const { data } = await api.post(
        '/auth/resend-verification',
        { email }
      );

      if (data.devCode) {
        setCode(data.devCode);
      }

      setMessage(data.message);
      startCooldown(60);
    } catch (err) {
      const payload = err.response?.data;

      if (payload?.retryAfter) {
        startCooldown(payload.retryAfter);
      }

      setError(
        payload?.message ||
        'Could not resend the code.'
      );
    }
  }

  return (
    <>
      <Header />

      <main className="verify-layout">
        <section className="verify-card">
          <div
            className={
              verified
                ? 'verify-icon success'
                : 'verify-icon'
            }
          >
            {verified
              ? <BadgeCheck size={34} />
              : <MailCheck size={34} />}
          </div>

          <div className="eyebrow">
            EMAIL VERIFICATION
          </div>

          <h1>
            {verified
              ? 'Your inbox is verified.'
              : 'Check your verification code.'}
          </h1>

          <p>{message}</p>

          {!verified ? (
            <form onSubmit={verify}>
              <label>
                <span>Email address</span>

                <div className="input-shell">
                  <Mail size={18} />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </label>

              <label>
                <span>6-digit code</span>

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
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  required
                />
              </label>

              {error && (
                <div className="error-box">
                  {error}
                </div>
              )}

              <button
                className="btn full"
                disabled={busy || code.length !== 6}
              >
                {busy
                  ? 'Verifying…'
                  : 'Verify email'}
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
                  : 'Resend verification code'}
              </button>
            </form>
          ) : (
            <button
              className="btn full"
              onClick={() =>
                navigate('/login', {
                  replace: true
                })
              }
            >
              Continue to login
              <ArrowRight size={18} />
            </button>
          )}

          <div className="verify-note">
            <ShieldCheck size={17} />
            <span>
              Codes expire automatically and only their secure
              hashes are stored in the database.
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
        <p>Checking verified session…</p>
      </div>
    );
  }

  return user
    ? children
    : <Navigate to="/login" replace />;
}

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [protectedTest, setProtectedTest] =
    useState({
      loading: true,
      ok: false,
      message: 'Testing verified-only API…'
    });

  useEffect(() => {
    api
      .get('/account/verified-area')
      .then(({ data }) =>
        setProtectedTest({
          loading: false,
          ok: true,
          message: data.message
        })
      )
      .catch((err) =>
        setProtectedTest({
          loading: false,
          ok: false,
          message:
            err.response?.data?.message ||
            'Protected API failed.'
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

        <div className="verified-pill">
          <BadgeCheck size={16} />
          Email verified
        </div>

        <button
          className="logout-button"
          onClick={signOut}
        >
          <LogOut size={17} />
          Logout
        </button>
      </aside>

      <section className="dashboard-main">
        <div className="eyebrow">
          VERIFIED ACCOUNT AREA
        </div>

        <h1>
          Verification complete.
          <em> Access unlocked.</em>
        </h1>

        <p className="dashboard-lead">
          This dashboard is available only after the email verification
          workflow and authenticated login both succeed.
        </p>

        <div className="dashboard-grid">
          <article className="status-card">
            <div className="status-icon success">
              <BadgeCheck size={25} />
            </div>

            <small>EMAIL STATUS</small>
            <h3>Verified</h3>

            <p>
              {user?.email}
            </p>

            <div className="success-line">
              <CheckCircle2 size={16} />
              Identity gate passed
            </div>
          </article>

          <article className="status-card">
            <div className="status-icon">
              <LockKeyhole size={25} />
            </div>

            <small>PROTECTED API</small>
            <h3>Verified-only route</h3>

            <p>
              GET /api/v1/account/verified-area
            </p>

            <div
              className={
                protectedTest.ok
                  ? 'success-line'
                  : 'warning-line'
              }
            >
              {protectedTest.ok
                ? <CheckCircle2 size={16} />
                : <Clock3 size={16} />}
              {protectedTest.message}
            </div>
          </article>

          <article className="status-card">
            <div className="status-icon">
              <ShieldCheck size={25} />
            </div>

            <small>SECURITY</small>
            <h3>Verification controls</h3>

            <p>
              Expiry, cooldown, attempt limits and code hashing are active.
            </p>

            <div className="success-line">
              <CheckCircle2 size={16} />
              Workflow protected
            </div>
          </article>
        </div>

        <section className="audit-panel">
          <div>
            <div className="eyebrow">
              TASK 15 SUCCESS
            </div>

            <h2>
              Email verification workflow is active end-to-end.
            </h2>
          </div>

          <div className="audit-steps">
            {[
              'Account registered',
              'Verification code issued',
              'Email ownership confirmed',
              'Login permission unlocked',
              'Verified-only API authorized'
            ].map((text, index) => (
              <div key={text}>
                <span>
                  <Check size={15} />
                </span>

                <b>{text}</b>

                <small>
                  Step {String(index + 1).padStart(2, '0')}
                </small>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  return user
    ? <Navigate to="/dashboard" replace />
    : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/register"
        element={
          <PublicOnly>
            <AuthCard registerMode />
          </PublicOnly>
        }
      />

      <Route
        path="/login"
        element={
          <PublicOnly>
            <AuthCard />
          </PublicOnly>
        }
      />

      <Route
        path="/verify"
        element={<VerifyEmail />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}
