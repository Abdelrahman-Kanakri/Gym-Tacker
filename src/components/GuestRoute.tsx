import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Loader from './Loader';

export default function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();

  if (!initialized) return <Loader />;
  if (user) return <Navigate to="/" replace />;

  return <>{children}</>;
}
