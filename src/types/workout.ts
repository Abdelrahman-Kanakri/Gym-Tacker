export interface SetEntry {
  weight: string;
  reps: string;
  rpe?: string;
  notes?: string;
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

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface WorkoutData {
  weeks: Record<string, WeekLog>; // key: Monday ISO (yyyy-mm-dd)
  templates?: WorkoutTemplate[];
}

export const emptyWorkoutData = (): WorkoutData => ({ weeks: {}, templates: [] });
