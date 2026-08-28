import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Database,
  KeyRound,
  LogOut,
  ShieldCheck,
  UserRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <span className="brand-mark"><ShieldCheck size={21} /></span>
          <div>
            <b>JWT Shield</b>
            <small>Secure workspace</small>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div>
            <b>{user?.name}</b>
            <small>{user?.email}</small>
          </div>
        </div>

        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={18} /> Sign out
        </button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <span className="eyebrow">PROTECTED AREA</span>
            <h1>Welcome, {user?.name?.split(' ')[0]}.</h1>
            <p>Your server-verified JWT session is active.</p>
          </div>
          <span className="secure-pill"><CheckCircle2 size={17} /> Authenticated</span>
        </div>

        <section className="dashboard-grid">
          <article className="stat-card">
            <span className="stat-icon"><UserRound size={22} /></span>
            <div>
              <small>Signed in as</small>
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
            </div>
          </article>

          <article className="stat-card">
            <span className="stat-icon"><KeyRound size={22} /></span>
            <div>
              <small>Authentication</small>
              <strong>Custom JWT</strong>
              <span>Signed by Express backend</span>
            </div>
          </article>

          <article className="stat-card">
            <span className="stat-icon"><Database size={22} /></span>
            <div>
              <small>Database</small>
              <strong>Supabase</strong>
              <span>Private users table</span>
            </div>
          </article>
        </section>

        <section className="info-panel">
          <div className="info-panel-heading">
            <div>
              <span className="eyebrow">AUTH FLOW</span>
              <h2>What happened when you logged in?</h2>
            </div>
            <ShieldCheck size={30} />
          </div>

          <div className="timeline">
            {[
              ['01', 'Credentials submitted', 'React sent your email and password to the Express API.'],
              ['02', 'Password verified', 'The backend compared your password with the bcrypt hash stored in Supabase.'],
              ['03', 'JWT signed', 'The server created a signed access token containing your user identity.'],
              ['04', 'Cookie secured', 'The token was returned in an HTTP-only cookie.'],
              ['05', 'Route protected', 'This dashboard loaded only after /auth/me verified your JWT.']
            ].map(([number, title, text]) => (
              <div className="timeline-item" key={number}>
                <span>{number}</span>
                <div>
                  <b>{title}</b>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
