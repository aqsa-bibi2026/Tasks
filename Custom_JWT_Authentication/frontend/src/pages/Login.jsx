import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-side">
        <span className="eyebrow">WELCOME BACK</span>
        <h1>Your secure workspace is one login away.</h1>
        <p>
          The JWT is created only after your bcrypt password check succeeds on the backend.
        </p>
        <div className="auth-points">
          <span><ShieldCheck size={18} /> Server-side password verification</span>
          <span><KeyRound size={18} /> Signed JWT access token</span>
        </div>
      </div>

      <div className="auth-card">
        <div>
          <span className="eyebrow">SIGN IN</span>
          <h2>Access your account</h2>
          <p className="muted">Enter the credentials you registered with.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={onSubmit} className="auth-form">
          <label>
            <span>Email address</span>
            <div className="input-wrap">
              <Mail size={18} />
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={onChange}
                required
              />
            </div>
          </label>

          <label>
            <span>Password</span>
            <div className="input-wrap">
              <KeyRound size={18} />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Your password"
                value={form.password}
                onChange={onChange}
                required
              />
              <button
                className="icon-button"
                type="button"
                aria-label="Toggle password visibility"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <button className="btn btn-primary btn-full" type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in securely'}
          </button>
        </form>

        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </section>
  );
}
