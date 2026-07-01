import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CopyPlus, LayoutTemplate, Plus } from 'lucide-react';
import { addDays, fromISO, shortDate } from '../lib/dates';
import { useWorkoutStore } from '../store/workoutStore';
import { useToastStore } from '../store/toastStore';
import WeekDayPicker from './WeekDayPicker';
import TemplateModal from './TemplateModal';
import ExerciseCard from './ExerciseCard';

export default function DayCard({
  mondayISO,
  dateISO,
  dowLabel,
  dateObj,
}: {
  mondayISO: string;
  dateISO: string;
  dowLabel: string;
  dateObj: Date;
}) {
  const day = useWorkoutStore((s) => s.data.weeks[mondayISO]?.days[dateISO]);
  const ensureDay = useWorkoutStore((s) => s.ensureDay);
  const addExercise = useWorkoutStore((s) => s.addExercise);
  const copyDayTo = useWorkoutStore((s) => s.copyDayTo);
  const showToast = useToastStore((s) => s.show);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!day) ensureDay(mondayISO, dateISO);
  }, [day, mondayISO, dateISO, ensureDay]);

  if (!day) return null;

  return (
    <div className="rounded-[10px] border border-border-soft bg-surface-2 p-3.5">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-bold tracking-wide">{dowLabel}</span>
          <span className="font-mono text-[11px] text-text-faint">{shortDate(dateObj)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTemplatesOpen(true)}
            title="Templates"
            className="flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-text-dim hover:border-cyan-dim hover:text-text"
          >
            <LayoutTemplate size={12} />
            Template
          </button>
          <button
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-text-dim hover:border-cyan-dim hover:text-text"
          >
            <CopyPlus size={12} />
            Copy to…
          </button>
          <WeekDayPicker
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            mode="day"
            title="Copy to which day?"
            initialDate={addDays(fromISO(dateISO), 7)}
            onConfirm={(targetISO) => {
              copyDayTo(mondayISO, dateISO, targetISO);
              showToast('Day copied');
            }}
          />
        </div>
      </div>

      {day.exercises.length === 0 ? (
        <div className="py-4.5 text-center text-xs text-text-faint">Rest day — nothing logged</div>
      ) : (
        <AnimatePresence initial={false}>
          {day.exercises.map((ex) => (
            <motion.div
              key={ex.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
            >
              <ExerciseCard mondayISO={mondayISO} dateISO={dateISO} exercise={ex} />
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => addExercise(mondayISO, dateISO)}
        className="mt-1.5 flex items-center gap-1 rounded-md border border-border bg-surface-2 px-2.5 py-1.5 text-[11px] font-semibold text-text-dim hover:border-cyan-dim hover:text-text"
      >
        <Plus size={12} />
        Add exercise
      </motion.button>

      <TemplateModal
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        mondayISO={mondayISO}
        dateISO={dateISO}
        currentExercises={day.exercises}
      />
    </div>
  );
}
