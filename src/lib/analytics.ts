import type { WorkoutData } from '../types/workout';

export interface HistoryPoint {
  dateISO: string;
  weight: number;
  reps: number;
  e1rm: number;
  rpe: number | null;
}

// Epley formula — standard estimate of one-rep max from a lower-rep set.
export function estOneRepMax(weight: number, reps: number): number {
  if (!weight || !reps) return 0;
  return weight * (1 + reps / 30);
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export function getExerciseHistory(data: WorkoutData, exerciseName: string): HistoryPoint[] {
  const target = normalizeName(exerciseName);
  if (!target) return [];

  const points: HistoryPoint[] = [];
  for (const week of Object.values(data.weeks)) {
    for (const [dateISO, day] of Object.entries(week.days)) {
      for (const ex of day.exercises) {
        if (normalizeName(ex.name) !== target) continue;
        for (const s of ex.sets) {
          const weight = parseFloat(s.weight);
          const reps = parseInt(s.reps, 10);
          if (!isNaN(weight) && !isNaN(reps) && weight > 0 && reps > 0) {
            const rpeNum = s.rpe ? parseFloat(s.rpe) : NaN;
            points.push({
              dateISO,
              weight,
              reps,
              e1rm: estOneRepMax(weight, reps),
              rpe: !isNaN(rpeNum) ? rpeNum : null,
            });
          }
        }
      }
    }
  }
  points.sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  return points;
}

export function getBestE1rm(history: HistoryPoint[]): number {
  return history.reduce((max, p) => Math.max(max, p.e1rm), 0);
}

export interface ProgressionSuggestion {
  type: 'increase' | 'maintain' | 'decrease';
  message: string;
}

// "Smart progressive overload": look at the last logged session for this
// exercise (by average RPE across its sets) and suggest a next step.
// RPE <=6 (felt easy) -> progress. RPE >=9 (near failure) -> back off.
// No RPE logged -> can't judge difficulty, so just suggest repeating.
export function suggestProgression(history: HistoryPoint[]): ProgressionSuggestion | null {
  if (history.length === 0) return null;

  const lastDate = history[history.length - 1].dateISO;
  const lastSets = history.filter((p) => p.dateISO === lastDate);
  const topSet = lastSets.reduce((a, b) => (b.weight > a.weight ? b : a));
  const rpes = lastSets.map((s) => s.rpe).filter((r): r is number => r !== null);

  if (rpes.length === 0) {
    return {
      type: 'maintain',
      message: `Last time: ${topSet.weight}kg × ${topSet.reps}. Log an RPE next set for a smarter suggestion.`,
    };
  }

  const avgRpe = rpes.reduce((a, b) => a + b, 0) / rpes.length;

  if (avgRpe <= 6) {
    const bump = topSet.weight >= 40 ? 5 : 2.5;
    return {
      type: 'increase',
      message: `Felt easy last time (RPE ${avgRpe.toFixed(1)}) — try ${topSet.weight + bump}kg, or +2 reps, or +1 set.`,
    };
  }

  if (avgRpe >= 9) {
    return {
      type: 'decrease',
      message: `Pushed hard last time (RPE ${avgRpe.toFixed(1)}) — repeat ${topSet.weight}kg to master it, or drop slightly.`,
    };
  }

  return {
    type: 'maintain',
    message: `On track (RPE ${avgRpe.toFixed(1)}) — repeat ${topSet.weight}kg × ${topSet.reps}.`,
  };
}

export interface DailyBest {
  dateISO: string;
  e1rm: number;
}

// One point per date — the best estimated 1RM logged that day.
export function getDailyBestE1rm(history: HistoryPoint[]): DailyBest[] {
  const byDate = new Map<string, number>();
  for (const p of history) {
    byDate.set(p.dateISO, Math.max(byDate.get(p.dateISO) ?? 0, p.e1rm));
  }
  return Array.from(byDate.entries())
    .map(([dateISO, e1rm]) => ({ dateISO, e1rm }))
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO));
}
