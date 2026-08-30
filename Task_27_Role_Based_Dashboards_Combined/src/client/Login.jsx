import React, {
  useState
} from 'react';

import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

import { login } from './api.js';

const demos = [
  {
    role: 'Admin',
    email:
      'admin@rolesphere.dev',
    password:
      'Admin@12345'
  },
  {
    role: 'Manager',
    email:
      'manager@rolesphere.dev',
    password:
      'Manager@12345'
  },
  {
    role: 'Member',
    email:
      'member@rolesphere.dev',
    password:
      'Member@12345'
  }
];

export default function Login({
  onSuccess
}) {
  const [email, setEmail] =
    useState(
      'admin@rolesphere.dev'
    );

  const [password, setPassword] =
    useState('Admin@12345');

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data =
        await login({
          email,
          password
        });

      onSuccess(data.user);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const useDemo = (demo) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setError('');
  };

  return (
    <div className="login-page">
      <Background />

      <section className="login-story">
        <div className="brand login-brand">
          <span>
            <ShieldCheck size={23} />
          </span>

          <div>
            <b>RoleSphere</b>
            <small>
              Access Intelligence
            </small>
          </div>
        </div>

        <div className="story-copy">
          <small className="eyebrow">
            TASK 27 / ROLE ACCESS
          </small>

          <h1>
            One platform.
            <em> Three experiences.</em>
          </h1>

          <p>
            Secure role-aware dashboards
            where every user sees exactly
            the data and actions they are
            authorized to access.
          </p>
        </div>

        <div className="story-features">
          <article>
            <LockKeyhole size={18} />
            <div>
              <b>Protected APIs</b>
              <span>
                JWT + HTTP-only cookie
              </span>
            </div>
          </article>

          <article>
            <ShieldCheck size={18} />
            <div>
              <b>Role middleware</b>
              <span>
                Admin · Manager · Member
              </span>
            </div>
          </article>

          <article>
            <Sparkles size={18} />
            <div>
              <b>Adaptive UI</b>
              <span>
                Dashboard changes by role
              </span>
            </div>
          </article>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <small className="eyebrow">
            SECURE SIGN IN
          </small>

          <h2>
            Welcome back
          </h2>

          <p>
            Choose a demo role or enter
            credentials manually.
          </p>

          <div className="demo-switcher">
            {demos.map((demo) => (
              <button
                key={demo.role}
                type="button"
                onClick={() =>
                  useDemo(demo)
                }
                className={
                  email === demo.email
                    ? 'active'
                    : ''
                }
              >
                {demo.role}
              </button>
            ))}
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <form onSubmit={submit}>
            <label>
              <span>
                <Mail size={14} />
                Email
              </span>

              <div className="login-input">
                <Mail size={17} />

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  required
                />
              </div>
            </label>

            <label>
              <span>
                <KeyRound size={14} />
                Password
              </span>

              <div className="login-input">
                <KeyRound size={17} />

                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                >
                  {showPassword
                    ? <EyeOff size={16} />
                    : <Eye size={16} />}
                </button>
              </div>
            </label>

            <button
              className="primary-button login-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle
                    className="spin"
                    size={17}
                  />
                  Signing in...
                </>
              ) : (
                <>
                  Enter dashboard
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="security-line">
            <ShieldCheck size={14} />
            Password hashes never leave
            the backend.
          </div>
        </div>
      </section>
    </div>
  );
}

function Background() {
  return (
    <>
      <div className="orb orb-one" />
      <div className="orb orb-two" />
      <div className="background-grid" />
    </>
  );
}
