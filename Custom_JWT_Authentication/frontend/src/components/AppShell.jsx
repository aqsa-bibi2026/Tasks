import { Link, NavLink, Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function AppShell() {
  return (
    <div className="site-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark"><ShieldCheck size={22} /></span>
          <span>JWT Shield</span>
        </Link>

        <nav className="topnav">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/login">Login</NavLink>
          <Link className="btn btn-small btn-primary" to="/register">Create account</Link>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="footer">
        <span>Task 12 · Custom JWT Authentication</span>
        <span>React + Node + Express + Supabase</span>
      </footer>
    </div>
  );
}
