import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Cookie,
  Database,
  KeyRound,
  LockKeyhole,
  Server,
  ShieldCheck
} from 'lucide-react';

const features = [
  {
    icon: LockKeyhole,
    title: 'Hashed credentials',
    text: 'Passwords are protected with bcrypt before they are stored in Supabase.'
  },
  {
    icon: KeyRound,
    title: 'Signed JWT session',
    text: 'The Express backend creates and validates your custom access token.'
  },
  {
    icon: Cookie,
    title: 'HTTP-only cookie',
    text: 'The browser keeps the JWT in a cookie that normal frontend JavaScript cannot read.'
  },
  {
    icon: ShieldCheck,
    title: 'Protected routes',
    text: 'Both backend endpoints and React pages enforce authentication.'
  }
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">FULL-STACK SECURITY · TASK 12</span>
          <h1>Custom JWT authentication, built the right way.</h1>
          <p>
            A complete React and Express authentication flow backed by Supabase:
            register, login, protected dashboard, session verification and logout.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/register">
              Build your account <ArrowRight size={18} />
            </Link>
            <Link className="btn btn-ghost" to="/login">Sign in</Link>
          </div>

          <div className="trust-row">
            <span><ShieldCheck size={17} /> bcrypt hashing</span>
            <span><KeyRound size={17} /> signed JWT</span>
            <span><Database size={17} /> Supabase Postgres</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="security-card">
            <div className="security-card-header">
              <span className="status-dot" />
              <span>Authentication pipeline</span>
              <span className="status-badge">Secure</span>
            </div>

            <div className="pipeline">
              <div className="pipeline-row">
                <span className="pipeline-icon"><Server size={18} /></span>
                <div>
                  <b>Express API</b>
                  <small>Validates credentials</small>
                </div>
                <span className="check">✓</span>
              </div>
              <div className="pipeline-line" />
              <div className="pipeline-row">
                <span className="pipeline-icon"><Database size={18} /></span>
                <div>
                  <b>Supabase</b>
                  <small>Stores hashed password</small>
                </div>
                <span className="check">✓</span>
              </div>
              <div className="pipeline-line" />
              <div className="pipeline-row">
                <span className="pipeline-icon"><KeyRound size={18} /></span>
                <div>
                  <b>JWT issued</b>
                  <small>Signed server-side</small>
                </div>
                <span className="check">✓</span>
              </div>
              <div className="pipeline-line" />
              <div className="pipeline-row">
                <span className="pipeline-icon"><Cookie size={18} /></span>
                <div>
                  <b>HTTP-only cookie</b>
                  <small>Session delivered safely</small>
                </div>
                <span className="check">✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="section-heading">
          <span className="eyebrow">WHAT IS INCLUDED</span>
          <h2>One focused authentication project.</h2>
          <p>No refresh tokens or unrelated task modules — this ZIP is specifically Task 12.</p>
        </div>

        <div className="feature-grid">
          {features.map(({ icon: Icon, title, text }) => (
            <article className="feature-card" key={title}>
              <span className="feature-icon"><Icon size={21} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
