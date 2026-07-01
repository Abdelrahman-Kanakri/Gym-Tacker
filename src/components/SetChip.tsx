import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquare, Trophy, X } from 'lucide-react';
import type { SetEntry } from '../types/workout';

export default function SetChip({
  set,
  isTop,
  isPR,
  onChange,
  onRemove,
}: {
  set: SetEntry;
  isTop: boolean;
  isPR: boolean;
  onChange: (field: 'weight' | 'reps' | 'rpe' | 'notes', value: string) => void;
  onRemove: () => void;
}) {
  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className={`flex flex-col gap-1 rounded-lg border py-1 pr-1.5 pl-2.5 ${
        isTop ? 'border-cyan bg-cyan/15 shadow-[0_0_8px_rgba(46,230,214,0.12)]' : 'border-border bg-surface-3'
      }`}
    >
      <div className="flex items-center gap-1">
        {isPR && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            title="All-time best estimated 1RM"
            className="flex items-center text-amber"
          >
            <Trophy size={11} />
          </motion.span>
        )}
        <input
          type="text"
          inputMode="decimal"
          placeholder="kg"
          value={set.weight}
          onChange={(e) => onChange('weight', e.target.value)}
          className="w-9 bg-transparent text-center font-mono text-xs text-text"
        />
        <span className="text-[11px] text-text-faint">&times;</span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="reps"
          value={set.reps}
          onChange={(e) => onChange('reps', e.target.value)}
          className="w-9 bg-transparent text-center font-mono text-xs text-text"
        />
        <span className="text-[10px] text-text-faint">@</span>
        <input
          type="text"
          inputMode="decimal"
          placeholder="RPE"
          value={set.rpe ?? ''}
          onChange={(e) => onChange('rpe', e.target.value)}
          className="w-8 bg-transparent text-center font-mono text-xs text-text placeholder:text-[9px]"
        />
        <button
          onClick={() => setNotesOpen((o) => !o)}
          title="Note"
          className={`p-0.5 ${set.notes ? 'text-cyan' : 'text-text-faint hover:text-text'}`}
        >
          <MessageSquare size={11} />
        </button>
        <button onClick={onRemove} className="p-0.5 text-text-faint hover:text-danger">
          <X size={12} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {notesOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <input
              type="text"
              placeholder="Note (e.g. felt heavy, form cue…)"
              value={set.notes ?? ''}
              onChange={(e) => onChange('notes', e.target.value)}
              className="w-40 border-b border-border bg-transparent pb-1 text-[11px] text-text placeholder:text-text-faint"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
