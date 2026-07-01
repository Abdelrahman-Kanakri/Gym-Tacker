import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { EMAIL_PASSWORD_AUTH_ENABLED } from '../lib/featureFlags';
import AuthCard from '../components/AuthCard';
import GoogleIcon from '../components/GoogleIcon';

export default function Signup() {
  const { signUpWithPassword, signInWithGoogle } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const err = await signUpWithPassword(email, password);
    setLoading(false);
    if (err) setError(err);
    else setDone(true);
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

  if (done) {
    return (
      <AuthCard title="Check your inbox" subtitle="Almost there.">
        <p className="m-0 text-sm text-text-dim">
          We sent a confirmation link to <span className="text-text">{email}</span>. Click it to activate your
          account, then log in.
        </p>
        <Link
          to="/login"
          className="mt-5 block w-full rounded-lg border border-cyan bg-cyan py-2.5 text-center text-sm font-bold text-[#04201d] hover:bg-[#4bf0e0]"
        >
          Back to login
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create your account" subtitle="Start logging sets, track your progression.">
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
              <label className="mb-1.5 block text-[11px] tracking-wider text-text-faint uppercase">Password</label>
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

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-lg border border-cyan bg-cyan py-2.5 text-sm font-bold text-[#04201d] transition-colors hover:bg-[#4bf0e0] disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Sign up'}
            </button>
          </form>
        </>
      ) : (
        <p className="mt-4 text-center text-xs text-text-faint">
          Email/password sign-up is temporarily unavailable. Google is the only way to sign up for now.
        </p>
      )}

      <p className="mt-5 text-center text-xs text-text-faint">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-cyan hover:underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
