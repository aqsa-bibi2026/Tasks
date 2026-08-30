import React, { useState } from 'react';

import {
  ArrowRight,
  BellRing,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  Mail,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

import { api } from './api.js';

export default function Login({ onSuccess }) {
  const [email, setEmail] = useState('user@pulsenotify.dev');
  const [password, setPassword] = useState('User@12345');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.login({ email, password });
      onSuccess(data.user);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="visual-orb one" />
        <div className="visual-orb two" />

        <div className="brand login-brand">
          <span><BellRing size={23} /></span>
          <div>
            <b>PulseNotify</b>
            <small>Notification Intelligence</small>
          </div>
        </div>

        <div className="hero-copy">
          <span className="eyebrow">TASK 28 / NOTIFICATIONS</span>
          <h1>
            Every signal.
            <em> One calm inbox.</em>
          </h1>
          <p>
            A business-grade notification hub designed to surface what matters,
            reduce noise and keep action moving.
          </p>

          <div className="hero-points">
            <article>
              <ShieldCheck size={18} />
              <div>
                <b>Secure delivery</b>
                <small>Protected by authenticated APIs</small>
              </div>
            </article>

            <article>
              <Sparkles size={18} />
              <div>
                <b>Smart priorities</b>
                <small>Urgent, high, normal and low</small>
              </div>
            </article>

            <article>
              <BellRing size={18} />
              <div>
                <b>Clean workflow</b>
                <small>Read, filter, search and delete</small>
              </div>
            </article>
          </div>
        </div>
      </div>

      <div className="login-side">
        <form className="login-card" onSubmit={submit}>
          <span className="eyebrow">SECURE ACCESS</span>
          <h2>Welcome back</h2>
          <p>Sign in to open your private notification center.</p>

          {error && <div className="login-error">{error}</div>}

          <label>
            <span><Mail size={14} /> Email</span>
            <div className="input-shell">
              <Mail size={17} />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </label>

          <label>
            <span><KeyRound size={14} /> Password</span>
            <div className="input-shell">
              <KeyRound size={17} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? (
              <>
                <LoaderCircle className="spin" size={17} />
                Signing in...
              </>
            ) : (
              <>
                Open Notification Center
                <ArrowRight size={17} />
              </>
            )}
          </button>

          <div className="demo-credentials">
            <span>Demo account</span>
            <code>user@pulsenotify.dev · User@12345</code>
          </div>
        </form>
      </div>
    </div>
  );
}
