import { Navigate, Link } from 'react-router-dom';
import {
  CalendarClock,
  LayoutTemplate,
  LineChart,
  Sparkles,
  Timer,
  Trophy,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Loader from '../components/Loader';
import HudCorners from '../components/HudCorners';

const FEATURES = [
  {
    icon: CalendarClock,
    title: 'Weekly drill-down',
    body: 'Browse by month, drill into any week, log any day. Duplicate a whole week or copy a single day forward in one tap.',
  },
  {
    icon: Sparkles,
    title: 'Smart progressive overload',
    body: 'Log an RPE and IRON LOG tells you what to try next time — heavier, more reps, or hold steady.',
  },
  {
    icon: Trophy,
    title: 'PRs, tracked automatically',
    body: 'Every set is checked against your full history. A trophy marks a new all-time best estimated 1RM.',
  },
  {
    icon: LineChart,
    title: 'Progression charts',
    body: 'A quick sparkline per exercise shows exactly how your numbers have moved over time.',
  },
  {
    icon: LayoutTemplate,
    title: 'Reusable templates',
    body: 'Save a day as a template once, apply it to any future day in a tap.',
  },
  {
    icon: Timer,
    title: 'Built-in rest timer',
    body: '60/90/120s presets with a vibrating alert when it is time to go again.',
  },
];

export default function Landing() {
  const { user, initialized } = useAuthStore();

  if (!initialized) return <Loader />;
  if (user) return <Navigate to="/app" replace />;

  return (
    <div className="min-h-screen">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at 15% 0%, rgba(46,230,214,0.08), transparent 45%), radial-gradient(circle at 85% 100%, rgba(46,230,214,0.05), transparent 40%)',
        }}
      />

      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6">
        <div className="flex items-baseline gap-2">
          <div className="glow-cyan h-2.5 w-2.5 rounded-[2px] bg-cyan" />
          <h1 className="font-heading m-0 text-2xl leading-none font-black tracking-tight uppercase">
            IRON<span className="text-cyan">LOG</span>
          </h1>
        </div>
        <Link
          to="/login"
          className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-xs font-semibold text-text-dim hover:border-cyan-dim hover:text-text"
        >
          Log in
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-5 pt-10 pb-20 text-center sm:pt-16">
        <div className="relative mx-auto inline-block px-6 py-2 sm:px-10">
          <HudCorners />
          <p className="animate-fade-up m-0 mb-1 font-mono text-[10px] tracking-[0.3em] text-cyan-dim uppercase">
            Weekly progression tracker
          </p>
          <h2 className="font-heading animate-fade-up m-0 text-5xl leading-[0.95] font-black tracking-tight uppercase sm:text-7xl">
            Log every set.
            <br />
            <span className="text-cyan">Never lose the plot.</span>
          </h2>
        </div>
        <p
          className="animate-fade-up mx-auto mt-4 max-w-lg text-sm text-text-dim sm:text-base"
          style={{ animationDelay: '60ms' }}
        >
          A weekly progression tracker built for the gym floor — fast to tap through, dark on the
          eyes, and it tells you what to lift next.
        </p>
        <div
          className="animate-fade-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ animationDelay: '120ms' }}
        >
          <Link
            to="/signup"
            className="glow-cyan w-full rounded-lg border border-cyan bg-cyan px-6 py-3 text-sm font-bold text-[#04201d] hover:bg-[#4bf0e0] sm:w-auto"
          >
            Get started free
          </Link>
          <Link
            to="/login"
            className="w-full rounded-lg border border-border bg-surface-2 px-6 py-3 text-sm font-semibold text-text-dim hover:border-cyan-dim hover:text-text sm:w-auto"
          >
            I already have an account
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, body }, i) => (
            <div
              key={title}
              className="animate-fade-up rounded-xl border border-border bg-surface p-4"
              style={{ animationDelay: `${160 + 40 * i}ms` }}
            >
              <Icon size={18} className="mb-2.5 text-cyan" />
              <h3 className="m-0 mb-1 text-sm font-semibold text-text">{title}</h3>
              <p className="m-0 text-xs text-text-faint">{body}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="pb-10 text-center text-[11px] tracking-wide text-text-faint">
        Sign in with Google — synced to your account, access it from any device.
      </footer>
    </div>
  );
}
