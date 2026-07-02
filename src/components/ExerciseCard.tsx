import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LineChart, TrendingDown, TrendingUp, Equal, X } from 'lucide-react';
import { useWorkoutStore } from '../store/workoutStore';
import {
  estOneRepMax,
  getBestE1rm,
  getDailyBestE1rm,
  getExerciseHistory,
  suggestProgression,
} from '../lib/analytics';
import type { Exercise } from '../types/workout';
import SetChip from './SetChip';
import ExerciseChart from './ExerciseChart';

const SUGGESTION_STYLE = {
  increase: { icon: TrendingUp, className: 'border-cyan-dim bg-cyan/10 text-cyan' },
  maintain: { icon: Equal, className: 'border-border text-text-dim' },
  decrease: { icon: TrendingDown, className: 'border-amber/40 bg-amber/10 text-amber' },
};

export default function ExerciseCard({
  mondayISO,
  dateISO,
  exercise,
}: {
  mondayISO: string;
  dateISO: string;
  exercise: Exercise;
}) {
  const data = useWorkoutStore((s) => s.data);
  const updateExerciseName = useWorkoutStore((s) => s.updateExerciseName);
  const removeExercise = useWorkoutStore((s) => s.removeExercise);
  const addSet = useWorkoutStore((s) => s.addSet);
  const removeSet = useWorkoutStore((s) => s.removeSet);
  const updateSet = useWorkoutStore((s) => s.updateSet);
  const [chartOpen, setChartOpen] = useState(false);

  let topIdx = -1;
  let topWeight = -Infinity;
  exercise.sets.forEach((s, i) => {
    const w = parseFloat(s.weight);
    if (!isNaN(w) && w > topWeight) {
      topWeight = w;
      topIdx = i;
    }
  });

  const history = useMemo(() => getExerciseHistory(data, exercise.name), [data, exercise.name]);
  const bestE1rm = useMemo(() => getBestE1rm(history), [history]);
  const dailyBest = useMemo(() => getDailyBestE1rm(history), [history]);
  const suggestion = useMemo(
    () => suggestProgression(history.filter((p) => p.dateISO !== dateISO)),
    [history, dateISO]
  );

  return (
    <div className="mb-2 rounded-lg border border-border-soft bg-surface p-3">
      <div className="mb-2 flex items-center gap-2">
        <input
          list="exercise-suggestions"
          placeholder="Exercise name"
          value={exercise.name}
          onChange={(e) => updateExerciseName(mondayISO, dateISO, exercise.id, e.target.value)}
          className="flex-1 border-b border-transparent bg-transparent py-1 text-sm font-semibold text-text placeholder:font-medium placeholder:text-text-faint focus:border-cyan-dim"
        />
        <button
          onClick={() => setChartOpen((o) => !o)}
          title="Progression chart"
          disabled={!exercise.name.trim()}
          className={`p-1 disabled:opacity-30 ${chartOpen ? 'text-cyan' : 'text-text-faint hover:text-text'}`}
        >
          <LineChart size={14} />
        </button>
        <button
          onClick={() => removeExercise(mondayISO, dateISO, exercise.id)}
          className="p-1 text-text-faint hover:text-danger"
          title="Remove exercise"
        >
          <X size={14} />
        </button>
      </div>

      {suggestion &&
        (() => {
          const { icon: Icon, className } = SUGGESTION_STYLE[suggestion.type];
          return (
            <div className={`mb-2 flex items-start gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] ${className}`}>
              <Icon size={12} className="mt-0.5 shrink-0" />
              <span>{suggestion.message}</span>
            </div>
          );
        })()}

      <AnimatePresence initial={false}>
        {chartOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <ExerciseChart daily={dailyBest} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-1.5">
        <AnimatePresence initial={false}>
          {exercise.sets.map((set, i) => {
            const weight = parseFloat(set.weight);
            const reps = parseInt(set.reps, 10);
            const e1rm = !isNaN(weight) && !isNaN(reps) ? estOneRepMax(weight, reps) : 0;
            const isPR = bestE1rm > 0 && e1rm > 0 && Math.abs(e1rm - bestE1rm) < 0.01;
            return (
              <SetChip
                key={i}
                set={set}
                isTop={i === topIdx && topWeight > -Infinity}
                isPR={isPR}
                onChange={(field, value) => updateSet(mondayISO, dateISO, exercise.id, i, field, value)}
                onRemove={() => removeSet(mondayISO, dateISO, exercise.id, i)}
              />
            );
          })}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => addSet(mondayISO, dateISO, exercise.id)}
          title="Add set"
          className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-dashed border-border text-text-faint hover:border-cyan hover:text-cyan"
        >
          +
        </motion.button>
      </div>
    </div>
  );
}
