import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';

/**
 * Wraps protected routes. Redirects unauthenticated users to /login
 * with a `redirect` query param so they return after authentication.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isRegistered } = useUser();
  const location = useLocation();

  if (!isRegistered) {
    const redirectTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/register?redirect=${redirectTo}`} replace />;
  }

  return <>{children}</>;
}
