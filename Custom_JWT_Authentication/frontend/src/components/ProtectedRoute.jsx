import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="screen-center">
        <div className="spinner" />
        <p>Checking secure session…</p>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
