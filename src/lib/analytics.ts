import type { WorkoutData } from '../types/workout';

export interface HistoryPoint {
  dateISO: string;
  weight: number;
  reps: number;
  e1rm: number;
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
            points.push({ dateISO, weight, reps, e1rm: estOneRepMax(weight, reps) });
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
