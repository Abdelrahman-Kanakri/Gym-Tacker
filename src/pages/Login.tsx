import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { EMAIL_PASSWORD_AUTH_ENABLED } from '../lib/featureFlags';
import AuthCard from '../components/AuthCard';
import GoogleIcon from '../components/GoogleIcon';

export default function Login() {
  const { signInWithPassword, signInWithGoogle } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await signInWithPassword(email, password);
    setLoading(false);
    if (err) setError(err);
  }

  async function onGoogle() {
    setError(null);
    setGoogleLoading(true);
    const err = await signInWithGoogle();
    if (err) {
      setError(err);
      setGoogleLoading(false);
    }
  }

  return (
    <AuthCard title="Welcome back" subtitle="Log in to keep tracking your progression.">
      <button
        type="button"
        onClick={onGoogle}
        disabled={googleLoading}
        className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-surface-2 py-2.5 text-sm font-semibold text-text transition-colors hover:border-cyan-dim disabled:opacity-60"
      >
        <GoogleIcon />
        {googleLoading ? 'Redirecting…' : 'Continue with Google'}
      </button>

      {error && <p className="m-0 mt-3 text-xs text-danger">{error}</p>}

      {EMAIL_PASSWORD_AUTH_ENABLED ? (
        <>
          <div className="my-4 flex items-center gap-3 text-[11px] tracking-widest text-text-faint uppercase">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] tracking-wider text-text-faint uppercase">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-cyan-dim"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-[11px] tracking-wider text-text-faint uppercase">Password</label>
                <Link to="/forgot-password" className="text-[11px] font-semibold text-cyan hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-cyan-dim"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-lg border border-cyan bg-cyan py-2.5 text-sm font-bold text-[#04201d] transition-colors hover:bg-[#4bf0e0] disabled:opacity-60"
            >
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>
        </>
      ) : (
        <p className="mt-4 text-center text-xs text-text-faint">
          Email/password sign-in is temporarily unavailable. Google is the only way in for now.
        </p>
      )}

      <p className="mt-5 text-center text-xs text-text-faint">
        No account yet?{' '}
        <Link to="/signup" className="font-semibold text-cyan hover:underline">
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
