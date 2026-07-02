import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Timer, X } from 'lucide-react';
import { useRestTimerStore } from '../store/restTimerStore';

const PRESETS = [60, 90, 120];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function RestTimer() {
  const { totalSeconds, secondsLeft, running, start, cancel } = useRestTimerStore();
  const [pickerOpen, setPickerOpen] = useState(false);

  const idle = totalSeconds === 0 && !running;
  const justFinished = !running && totalSeconds > 0 && secondsLeft === 0;

  useEffect(() => {
    if (!justFinished) return;
    const t = setTimeout(() => cancel(), 4000);
    return () => clearTimeout(t);
  }, [justFinished, cancel]);

  return (
    <div className="fixed right-4 bottom-20 z-40 sm:bottom-5">
      <AnimatePresence mode="wait">
        {idle && !pickerOpen && (
          <motion.button
            key="idle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setPickerOpen(true)}
            className="glow-cyan flex items-center gap-1.5 rounded-full border border-cyan-dim bg-surface-2 px-3.5 py-2.5 text-xs font-semibold text-cyan shadow-lg"
          >
            <Timer size={14} />
            Rest
          </motion.button>
        )}

        {idle && pickerOpen && (
          <motion.div
            key="picker"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex items-center gap-1.5 rounded-full border border-border bg-surface-2 p-1.5 shadow-lg"
          >
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => {
                  start(p);
                  setPickerOpen(false);
                }}
                className="rounded-full border border-border-soft bg-surface-3 px-3 py-2 font-mono text-xs font-semibold text-text hover:border-cyan-dim hover:text-cyan"
              >
                {p}s
              </button>
            ))}
            <button
              onClick={() => setPickerOpen(false)}
              className="p-1.5 text-text-faint hover:text-text"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}

        {running && (
          <motion.button
            key="running"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={cancel}
            className="flex items-center gap-2 rounded-full border border-cyan bg-surface-2 py-2.5 pr-4 pl-2.5 shadow-lg"
          >
            <svg width="26" height="26" viewBox="0 0 26 26" className="shrink-0 -rotate-90">
              <circle cx="13" cy="13" r="11" fill="none" stroke="var(--color-border)" strokeWidth="2.5" />
              <circle
                cx="13"
                cy="13"
                r="11"
                fill="none"
                stroke="#2ee6d6"
                strokeWidth="2.5"
                strokeDasharray={2 * Math.PI * 11}
                strokeDashoffset={2 * Math.PI * 11 * (1 - secondsLeft / totalSeconds)}
                strokeLinecap="round"
              />
            </svg>
            <span className="font-mono text-sm font-bold text-cyan">{formatTime(secondsLeft)}</span>
          </motion.button>
        )}

        {justFinished && (
          <motion.button
            key="done"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: [1, 1.08, 1] }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ scale: { duration: 0.4, repeat: 2 } }}
            onClick={cancel}
            className="rounded-full border border-cyan bg-cyan px-4 py-2.5 text-xs font-bold text-[#04201d] shadow-lg"
          >
            Rest done — go!
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
