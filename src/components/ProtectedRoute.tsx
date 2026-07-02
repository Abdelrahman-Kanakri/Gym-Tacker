import { useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import useIdleLogout from '../hooks/useIdleLogout';
import Loader from './Loader';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized, signOut } = useAuthStore();

  const handleIdle = useCallback(() => {
    signOut();
  }, [signOut]);

  useIdleLogout(IDLE_TIMEOUT_MS, handleIdle, Boolean(user));

  if (!initialized) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
