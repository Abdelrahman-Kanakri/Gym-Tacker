import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useWorkoutStore, weekHasData } from '../store/workoutStore';
import { MONTH_NAMES, addDays, fromISO, getMonday, toISO } from '../lib/dates';
import Header from '../components/Header';
import WeekRow from '../components/WeekRow';
import Loader from '../components/Loader';
import ToastHost from '../components/ToastHost';
import RestTimer from '../components/RestTimer';
import BottomNav from '../components/BottomNav';

type View = 'month' | 'list';

export default function Tracker() {
  const user = useAuthStore((s) => s.user);
  const { data, loading, load, ensureWeek } = useWorkoutStore();

  const [view, setView] = useState<View>('month');
  const [viewDate, setViewDate] = useState(new Date());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    load(user.id).then(() => {
      const thisMonday = toISO(getMonday(new Date()));
      ensureWeek(thisMonday);
      setExpandedWeeks((s) => new Set(s).add(thisMonday));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    Object.values(data.weeks).forEach((w) =>
      Object.values(w.days).forEach((d) => d.exercises.forEach((ex) => ex.name && names.add(ex.name)))
    );
    return Array.from(names);
  }, [data]);

  function toggleWeek(iso: string) {
    setExpandedWeeks((s) => {
      const next = new Set(s);
      if (next.has(iso)) next.delete(iso);
      else next.add(iso);
      return next;
    });
  }

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen pb-24 sm:pb-16">
      <Header view={view} onViewChange={setView} />

      <main className="mx-auto max-w-3xl px-5 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
          >
            {view === 'month' ? (
              <MonthView
                viewDate={viewDate}
                setViewDate={setViewDate}
                expandedWeeks={expandedWeeks}
                onToggle={toggleWeek}
              />
            ) : (
              <ListView expandedWeeks={expandedWeeks} onToggle={toggleWeek} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <datalist id="exercise-suggestions">
        {exerciseNames.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>

      <footer className="pt-6 text-center text-[11px] tracking-wide text-text-faint">
        Synced to your account — access it from any device.
      </footer>

      <ToastHost />
      <RestTimer />
      <BottomNav view={view} onViewChange={setView} />
    </div>
  );
}

function MonthView({
  viewDate,
  setViewDate,
  expandedWeeks,
  onToggle,
}: {
  viewDate: Date;
  setViewDate: (d: Date) => void;
  expandedWeeks: Set<string>;
  onToggle: (iso: string) => void;
}) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const [direction, setDirection] = useState(1);

  const weeks = useMemo(() => {
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    let cursor = getMonday(firstOfMonth);
    const list: Date[] = [];
    while (cursor <= lastOfMonth) {
      list.push(new Date(cursor));
      cursor = addDays(cursor, 7);
    }
    return list;
  }, [year, month]);

  function go(target: Date, dir: number) {
    setDirection(dir);
    setViewDate(target);
  }

  return (
    <div>
      <div className="mb-4.5 flex items-center justify-between">
        <h2 className="m-0 text-[22px] font-semibold">
          {MONTH_NAMES[month]} <span className="font-mono text-base text-text-faint">{year}</span>
        </h2>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => go(new Date(year, month - 1, 1), -1)}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-border bg-surface-2 text-text-dim hover:border-cyan-dim hover:text-cyan"
          >
            <ChevronLeft size={15} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => go(new Date(), 0)}
            className="rounded-lg border border-border bg-surface-2 px-3 text-[11px] font-semibold tracking-wide text-text-dim uppercase hover:border-cyan-dim hover:text-cyan"
          >
            Today
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => go(new Date(year, month + 1, 1), 1)}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-border bg-surface-2 text-text-dim hover:border-cyan-dim hover:text-cyan"
          >
            <ChevronRight size={15} />
          </motion.button>
        </div>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`${year}-${month}`}
          custom={direction}
          initial={{ opacity: 0, x: 14 * direction }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -14 * direction }}
          transition={{ duration: 0.16 }}
        >
          {weeks.map((monday) => (
            <WeekRow
              key={toISO(monday)}
              monday={monday}
              contextMonth={month}
              expanded={expandedWeeks.has(toISO(monday))}
              onToggle={() => onToggle(toISO(monday))}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ListView({
  expandedWeeks,
  onToggle,
}: {
  expandedWeeks: Set<string>;
  onToggle: (iso: string) => void;
}) {
  const data = useWorkoutStore((s) => s.data);

  const mondayKeys = useMemo(
    () =>
      Object.keys(data.weeks)
        .filter((k) => weekHasData(data, k))
        .sort((a, b) => b.localeCompare(a)),
    [data]
  );

  if (mondayKeys.length === 0) {
    return (
      <div className="py-16 text-center text-text-faint">
        <Dumbbell size={28} className="mx-auto mb-2.5 text-cyan-dim" />
        <div>Nothing logged yet. Switch to Month view and start your first week.</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3.5 text-xs text-text-faint">Every logged week, most recent first.</div>
      {mondayKeys.map((k) => (
        <WeekRow key={k} monday={fromISO(k)} expanded={expandedWeeks.has(k)} onToggle={() => onToggle(k)} />
      ))}
    </div>
  );
}
