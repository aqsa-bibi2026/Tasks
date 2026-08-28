import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="screen-center">
        <div className="spinner" />
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
