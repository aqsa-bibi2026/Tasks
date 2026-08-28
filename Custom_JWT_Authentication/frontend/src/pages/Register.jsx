import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, Mail, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-side">
        <span className="eyebrow">CREATE ACCOUNT</span>
        <h1>Start with a clean, custom authentication flow.</h1>
        <p>
          Your password is hashed before storage. Your JWT is signed on the Node server and delivered as an HTTP-only cookie.
        </p>
        <div className="password-rule-card">
          <b>Password rules</b>
          <span>8+ characters</span>
          <span>At least one letter</span>
          <span>At least one number</span>
        </div>
      </div>

      <div className="auth-card">
        <div>
          <span className="eyebrow">REGISTER</span>
          <h2>Create your secure account</h2>
          <p className="muted">Complete all fields to continue.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={onSubmit} className="auth-form">
          <label>
            <span>Full name</span>
            <div className="input-wrap">
              <UserRound size={18} />
              <input
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={form.name}
                onChange={onChange}
                minLength={2}
                required
              />
            </div>
          </label>

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
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
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

          <label>
            <span>Confirm password</span>
            <div className="input-wrap">
              <KeyRound size={18} />
              <input
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={onChange}
                required
              />
            </div>
          </label>

          <button className="btn btn-primary btn-full" type="submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create secure account'}
          </button>
        </form>

        <p className="auth-switch">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  );
}
