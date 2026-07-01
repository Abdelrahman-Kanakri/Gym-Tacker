import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toISO } from '../lib/dates';

export default function DatePickerPopover({
  label,
  icon,
  defaultDate,
  onConfirm,
  align = 'right',
}: {
  label: string;
  icon: React.ReactNode;
  defaultDate: Date;
  onConfirm: (dateISO: string) => void;
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(toISO(defaultDate));

  function confirm() {
    if (!value) return;
    onConfirm(value);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setValue(toISO(defaultDate));
          setOpen((o) => !o);
        }}
        className="flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-text-dim hover:border-cyan-dim hover:text-text"
      >
        {icon}
        {label}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.14 }}
              onClick={(e) => e.stopPropagation()}
              className={`absolute top-full z-40 mt-2 w-60 max-w-[80vw] rounded-lg border border-border bg-surface-2 p-3 shadow-xl ${
                align === 'right' ? 'right-0' : 'left-0'
              }`}
            >
              <label className="mb-1.5 block text-[10px] tracking-wider text-text-faint uppercase">
                Pick a date
              </label>
              <input
                type="date"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-md border border-border bg-surface-3 px-2.5 py-2 text-sm text-text"
              />
              <div className="mt-2.5 flex gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-md border border-border bg-transparent py-1.5 text-xs font-semibold text-text-dim hover:text-text"
                >
                  Cancel
                </button>
                <button
                  onClick={confirm}
                  className="flex-1 rounded-md border border-cyan bg-cyan py-1.5 text-xs font-bold text-[#04201d] hover:bg-[#4bf0e0]"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
