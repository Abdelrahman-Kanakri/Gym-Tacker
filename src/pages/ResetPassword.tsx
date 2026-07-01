import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AuthCard from '../components/AuthCard';
import Loader from '../components/Loader';

export default function ResetPassword() {
  const { user, initialized, updatePassword } = useAuthStore();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!initialized) return <Loader />;

  if (!user) {
    return (
      <AuthCard title="Link expired" subtitle="This reset link is invalid or has expired.">
        <Link
          to="/forgot-password"
          className="block w-full rounded-lg border border-cyan bg-cyan py-2.5 text-center text-sm font-bold text-[#04201d] hover:bg-[#4bf0e0]"
        >
          Request a new link
        </Link>
      </AuthCard>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const err = await updatePassword(password);
    setLoading(false);
    if (err) setError(err);
    else navigate('/', { replace: true });
  }

  return (
    <AuthCard title="Set a new password" subtitle={`For ${user.email}`}>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div>
          <label className="mb-1.5 block text-[11px] tracking-wider text-text-faint uppercase">
            New password
          </label>
          <input
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-cyan-dim"
            placeholder="At least 6 characters"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] tracking-wider text-text-faint uppercase">
            Confirm password
          </label>
          <input
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-cyan-dim"
            placeholder="Repeat password"
          />
        </div>

        {error && <p className="m-0 text-xs text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full rounded-lg border border-cyan bg-cyan py-2.5 text-sm font-bold text-[#04201d] transition-colors hover:bg-[#4bf0e0] disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Save password'}
        </button>
      </form>
    </AuthCard>
  );
}
