import { Plus, X } from 'lucide-react';
import { useWorkoutStore } from '../store/workoutStore';
import type { Exercise } from '../types/workout';
import SetChip from './SetChip';

export default function ExerciseCard({
  mondayISO,
  dateISO,
  exercise,
}: {
  mondayISO: string;
  dateISO: string;
  exercise: Exercise;
}) {
  const updateExerciseName = useWorkoutStore((s) => s.updateExerciseName);
  const removeExercise = useWorkoutStore((s) => s.removeExercise);
  const addSet = useWorkoutStore((s) => s.addSet);
  const removeSet = useWorkoutStore((s) => s.removeSet);
  const updateSet = useWorkoutStore((s) => s.updateSet);

  let topIdx = -1;
  let topWeight = -Infinity;
  exercise.sets.forEach((s, i) => {
    const w = parseFloat(s.weight);
    if (!isNaN(w) && w > topWeight) {
      topWeight = w;
      topIdx = i;
    }
  });

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
          onClick={() => removeExercise(mondayISO, dateISO, exercise.id)}
          title="Remove exercise"
          className="p-1 text-text-faint hover:text-danger"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {exercise.sets.map((set, i) => (
          <SetChip
            key={i}
            set={set}
            isTop={i === topIdx && topWeight > -Infinity}
            onChange={(field, value) => updateSet(mondayISO, dateISO, exercise.id, i, field, value)}
            onRemove={() => removeSet(mondayISO, dateISO, exercise.id, i)}
          />
        ))}
        <button
          onClick={() => addSet(mondayISO, dateISO, exercise.id)}
          title="Add set"
          className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-dashed border-border text-text-faint hover:border-cyan hover:text-cyan"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
