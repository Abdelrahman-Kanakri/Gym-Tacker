import { ChevronRight, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DOW, addDays, shortDate, toISO } from '../lib/dates';
import { dayHasData, useWorkoutStore, weekHasData } from '../store/workoutStore';
import { useToastStore } from '../store/toastStore';
import DayCard from './DayCard';
import DatePickerPopover from './DatePickerPopover';

export default function WeekRow({
  monday,
  contextMonth,
  expanded,
  onToggle,
}: {
  monday: Date;
  contextMonth?: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const mondayISO = toISO(monday);
  const data = useWorkoutStore((s) => s.data);
  const ensureWeek = useWorkoutStore((s) => s.ensureWeek);
  const duplicateWeek = useWorkoutStore((s) => s.duplicateWeek);
  const showToast = useToastStore((s) => s.show);

  const sunday = addDays(monday, 6);
  const logged = weekHasData(data, mondayISO);

  return (
    <div
      className={`mb-2.5 overflow-hidden rounded-[10px] border bg-surface transition-colors ${
        expanded ? 'border-cyan-dim' : 'border-border'
      }`}
    >
      <div
        onClick={onToggle}
        className="flex cursor-pointer items-center gap-4 px-4 py-3.5 select-none hover:bg-surface-2"
      >
        <div className="w-[92px] shrink-0 text-[11px] tracking-wider text-text-faint uppercase">
          {shortDate(monday)}&ndash;{shortDate(sunday)}
          <b className="mt-0.5 block text-xs text-text-dim">{logged ? 'Logged' : 'Empty'}</b>
        </div>

        <div className="flex flex-1 gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => {
            const d = addDays(monday, i);
            const iso = toISO(d);
            const outOfMonth = contextMonth !== undefined && d.getMonth() !== contextMonth;
            const isLogged = dayHasData(data, mondayISO, iso);
            return (
              <div
                key={i}
                className={`flex-1 rounded-md border py-1 text-center text-[9px] tracking-wide ${
                  outOfMonth ? 'opacity-35' : ''
                } ${
                  isLogged
                    ? 'border-cyan-dim bg-cyan/15 font-semibold text-cyan'
                    : 'border-border-soft bg-surface-2 text-text-faint'
                }`}
              >
                {DOW[i][0]}
              </div>
            );
          })}
        </div>

        <div className={`w-4 shrink-0 text-center text-text-faint transition-transform ${expanded ? 'rotate-90 text-cyan' : ''}`}>
          <ChevronRight size={14} className="inline" />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pt-1 pb-4">
              <div className="mb-3.5 flex justify-end border-b border-dashed border-border pb-3">
                <DatePickerPopover
                  label="Duplicate to…"
                  icon={<Layers size={13} />}
                  defaultDate={addDays(monday, 7)}
                  onConfirm={(targetISO) => {
                    ensureWeek(mondayISO);
                    duplicateWeek(mondayISO, targetISO);
                    showToast('Week duplicated');
                  }}
                />
              </div>

              <div className="flex flex-col gap-2.5">
                {Array.from({ length: 7 }).map((_, i) => {
                  const d = addDays(monday, i);
                  return (
                    <DayCard key={i} mondayISO={mondayISO} dateISO={toISO(d)} dowLabel={DOW[i]} dateObj={d} />
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
