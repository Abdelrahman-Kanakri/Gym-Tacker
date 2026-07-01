import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { DOW, MONTH_NAMES, addDays, getMonday, shortDate, toISO } from '../lib/dates';
import { dayHasData, weekHasData, useWorkoutStore } from '../store/workoutStore';

type Mode = 'week' | 'day';

export default function WeekDayPicker({
  open,
  onClose,
  mode,
  initialDate,
  onConfirm,
  title,
}: {
  open: boolean;
  onClose: () => void;
  mode: Mode;
  initialDate: Date;
  onConfirm: (iso: string) => void;
  title: string;
}) {
  const data = useWorkoutStore((s) => s.data);
  const [viewDate, setViewDate] = useState(initialDate);
  const [selectedMonday, setSelectedMonday] = useState<Date | null>(null);

  useEffect(() => {
    if (open) {
      setViewDate(initialDate);
      setSelectedMonday(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const weeks: Date[] = [];
  {
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    let cursor = getMonday(firstOfMonth);
    while (cursor <= lastOfMonth) {
      weeks.push(new Date(cursor));
      cursor = addDays(cursor, 7);
    }
  }

  function pickWeek(monday: Date) {
    if (mode === 'week') {
      onConfirm(toISO(monday));
      onClose();
    } else {
      setSelectedMonday(monday);
    }
  }

  function pickDay(date: Date) {
    onConfirm(toISO(date));
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl border border-border bg-surface p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="m-0 text-base font-semibold">{title}</h3>
              <button onClick={onClose} className="p-1 text-text-faint hover:text-text">
                <X size={16} />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {selectedMonday ? (
                <motion.div
                  key="days"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.15 }}
                >
                  <button
                    onClick={() => setSelectedMonday(null)}
                    className="mb-3 flex items-center gap-1 text-[11px] font-semibold text-text-dim hover:text-text"
                  >
                    <ChevronLeft size={12} />
                    Back to weeks
                  </button>
                  <div className="mb-2 text-[11px] tracking-wider text-text-faint uppercase">
                    {shortDate(selectedMonday)} &ndash; {shortDate(addDays(selectedMonday, 6))}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const d = addDays(selectedMonday, i);
                      const iso = toISO(d);
                      const logged = dayHasData(data, toISO(selectedMonday), iso);
                      return (
                        <button
                          key={i}
                          onClick={() => pickDay(d)}
                          className="flex items-center justify-between rounded-md border border-border-soft bg-surface-2 px-3 py-2 text-left hover:border-cyan-dim"
                        >
                          <span className="text-sm font-semibold text-text">
                            {DOW[i]} <span className="font-mono text-xs text-text-faint">{shortDate(d)}</span>
                          </span>
                          {logged && <span className="font-mono text-[10px] text-cyan">logged</span>}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="weeks"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-semibold">
                      {MONTH_NAMES[month]} <span className="font-mono text-xs text-text-faint">{year}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setViewDate(new Date(year, month - 1, 1))}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-2 text-text-dim hover:border-cyan-dim hover:text-cyan"
                      >
                        <ChevronLeft size={13} />
                      </button>
                      <button
                        onClick={() => setViewDate(new Date(year, month + 1, 1))}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-2 text-text-dim hover:border-cyan-dim hover:text-cyan"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {weeks.map((monday) => {
                      const mondayISO = toISO(monday);
                      const logged = weekHasData(data, mondayISO);
                      return (
                        <button
                          key={mondayISO}
                          onClick={() => pickWeek(monday)}
                          className="flex items-center justify-between rounded-md border border-border-soft bg-surface-2 px-3 py-2 text-left hover:border-cyan-dim"
                        >
                          <span className="text-sm font-semibold text-text">
                            {shortDate(monday)} &ndash; {shortDate(addDays(monday, 6))}
                          </span>
                          {logged && <span className="font-mono text-[10px] text-cyan">logged</span>}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
