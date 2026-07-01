import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useWorkoutStore, type SaveStatus } from '../store/workoutStore';

const STATUS_COLOR: Record<SaveStatus, string> = {
  idle: 'bg-text-faint',
  saving: 'bg-amber',
  saved: 'bg-cyan shadow-[0_0_6px_var(--color-cyan)]',
  error: 'bg-danger',
};

const STATUS_LABEL: Record<SaveStatus, string> = {
  idle: 'Synced',
  saving: 'Saving…',
  saved: 'Synced',
  error: 'Save failed',
};

export default function Header({
  view,
  onViewChange,
}: {
  view: 'month' | 'list';
  onViewChange: (v: 'month' | 'list') => void;
}) {
  const { user, signOut } = useAuthStore();
  const saveStatus = useWorkoutStore((s) => s.saveStatus);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/90 px-5 pt-4 pb-3.5 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2.5">
          <div className="glow-cyan h-2.5 w-2.5 rounded-[2px] bg-cyan" />
          <div>
            <h1 className="m-0 text-[19px] font-bold tracking-[0.14em] uppercase">
              IRON<span className="text-cyan">LOG</span>
            </h1>
            <small className="mt-0.5 block text-[10px] tracking-wider text-text-faint uppercase">
              weekly progression tracker
            </small>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 py-1.5">
            <motion.span
              key={saveStatus}
              initial={{ scale: 0.5, opacity: 0.4 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className={`inline-block h-[7px] w-[7px] rounded-full ${STATUS_COLOR[saveStatus]}`}
            />
            <span className="font-mono text-[11px] text-text-dim">{STATUS_LABEL[saveStatus]}</span>
          </div>

          <div className="relative flex gap-0.5 rounded-full border border-border bg-surface-2 p-[3px]">
            {(['month', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => onViewChange(v)}
                className={`relative z-10 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase transition-colors ${
                  view === v ? 'text-[#04201d]' : 'text-text-dim hover:text-text'
                }`}
              >
                {view === v && (
                  <motion.span
                    layoutId="view-toggle-pill"
                    transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                    className="absolute inset-0 -z-10 rounded-full bg-cyan"
                  />
                )}
                {v === 'month' ? 'Month' : 'All Weeks'}
              </button>
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={signOut}
            title={user?.email ?? 'Sign out'}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-text-faint transition-colors hover:border-danger hover:text-danger"
          >
            <LogOut size={14} />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
