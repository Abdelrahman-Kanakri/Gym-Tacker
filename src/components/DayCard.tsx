import { CopyPlus, Plus } from 'lucide-react';
import { shortDate } from '../lib/dates';
import { useWorkoutStore } from '../store/workoutStore';
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
  const copyDayToNextWeek = useWorkoutStore((s) => s.copyDayToNextWeek);

  if (!day) {
    ensureDay(mondayISO, dateISO);
    return null;
  }

  return (
    <div className="rounded-[10px] border border-border-soft bg-surface-2 p-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-bold tracking-wide">{dowLabel}</span>
          <span className="font-mono text-[11px] text-text-faint">{shortDate(dateObj)}</span>
        </div>
        <button
          onClick={() => copyDayToNextWeek(mondayISO, dateISO)}
          title="Copy this day to next week, same weekday"
          className="flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-text-dim hover:border-cyan-dim hover:text-text"
        >
          <CopyPlus size={12} />
          Next wk
        </button>
      </div>

      {day.exercises.length === 0 ? (
        <div className="py-4.5 text-center text-xs text-text-faint">Rest day — nothing logged</div>
      ) : (
        day.exercises.map((ex) => (
          <ExerciseCard key={ex.id} mondayISO={mondayISO} dateISO={dateISO} exercise={ex} />
        ))
      )}

      <button
        onClick={() => addExercise(mondayISO, dateISO)}
        className="mt-1.5 flex items-center gap-1 rounded-md border border-border bg-surface-2 px-2.5 py-1.5 text-[11px] font-semibold text-text-dim hover:border-cyan-dim hover:text-text"
      >
        <Plus size={12} />
        Add exercise
      </button>
    </div>
  );
}
