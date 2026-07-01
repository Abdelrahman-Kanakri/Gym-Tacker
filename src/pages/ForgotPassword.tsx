import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AuthCard from '../components/AuthCard';

export default function ForgotPassword() {
  const resetPasswordForEmail = useAuthStore((s) => s.resetPasswordForEmail);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await resetPasswordForEmail(email);
    setLoading(false);
    if (err) setError(err);
    else setDone(true);
  }

  if (done) {
    return (
      <AuthCard title="Check your inbox" subtitle="Almost there.">
        <p className="m-0 text-sm text-text-dim">
          If an account exists for <span className="text-text">{email}</span>, we sent a link to set a new
          password. It also works for accounts that only ever signed in with Google.
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
    <AuthCard title="Reset your password" subtitle="We'll email you a link to set a new one.">
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

        {error && <p className="m-0 text-xs text-danger">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full rounded-lg border border-cyan bg-cyan py-2.5 text-sm font-bold text-[#04201d] transition-colors hover:bg-[#4bf0e0] disabled:opacity-60"
        >
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-text-faint">
        Remembered it?{' '}
        <Link to="/login" className="font-semibold text-cyan hover:underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
