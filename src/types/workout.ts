export interface SetEntry {
  weight: string;
  reps: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: SetEntry[];
}

export interface DayLog {
  exercises: Exercise[];
}

export interface WeekLog {
  days: Record<string, DayLog>; // key: date ISO (yyyy-mm-dd)
}

export interface WorkoutData {
  weeks: Record<string, WeekLog>; // key: Monday ISO (yyyy-mm-dd)
}

export const emptyWorkoutData = (): WorkoutData => ({ weeks: {} });
