import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { supabase } from '../lib/supabase';
import { addDays, fromISO, getMonday, toISO } from '../lib/dates';
import type { Exercise, WorkoutData } from '../types/workout';

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function cloneExercises(exercises: Exercise[]): Exercise[] {
  return exercises.map((ex) => ({
    id: uid(),
    name: ex.name,
    sets: ex.sets.map((s) => ({ ...s })),
  }));
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface WorkoutState {
  data: WorkoutData;
  userId: string | null;
  loading: boolean;
  saveStatus: SaveStatus;

  load: (userId: string) => Promise<void>;
  reset: () => void;

  ensureWeek: (mondayISO: string) => void;
  ensureDay: (mondayISO: string, dateISO: string) => void;

  addExercise: (mondayISO: string, dateISO: string) => void;
  removeExercise: (mondayISO: string, dateISO: string, exerciseId: string) => void;
  updateExerciseName: (mondayISO: string, dateISO: string, exerciseId: string, name: string) => void;

  addSet: (mondayISO: string, dateISO: string, exerciseId: string) => void;
  removeSet: (mondayISO: string, dateISO: string, exerciseId: string, index: number) => void;
  updateSet: (
    mondayISO: string,
    dateISO: string,
    exerciseId: string,
    index: number,
    field: 'weight' | 'reps' | 'rpe' | 'notes',
    value: string
  ) => void;

  duplicateWeek: (mondayISO: string, targetMondayISO?: string) => string;
  copyDayTo: (mondayISO: string, dateISO: string, targetDateISO?: string) => string;

  saveTemplate: (name: string, exercises: Exercise[]) => void;
  deleteTemplate: (templateId: string) => void;
  applyTemplateToDay: (mondayISO: string, dateISO: string, templateId: string) => void;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

export const useWorkoutStore = create<WorkoutState>()(
  immer((set, get) => {
    function scheduleSave() {
      const userId = get().userId;
      if (!userId) return;
      if (saveTimer) clearTimeout(saveTimer);
      set((s) => {
        s.saveStatus = 'saving';
      });
      saveTimer = setTimeout(async () => {
        const { error } = await supabase
          .from('workout_logs')
          .update({ data: get().data, updated_at: new Date().toISOString() })
          .eq('user_id', userId);
        set((s) => {
          s.saveStatus = error ? 'error' : 'saved';
        });
      }, 600);
    }

    return {
      data: { weeks: {}, templates: [] },
      userId: null,
      loading: true,
      saveStatus: 'idle',

      load: async (userId) => {
        set((s) => {
          s.loading = true;
          s.userId = userId;
        });

        const { data: row, error } = await supabase
          .from('workout_logs')
          .select('data')
          .eq('user_id', userId)
          .single();

        set((s) => {
          const loaded = !error && row?.data ? (row.data as WorkoutData) : { weeks: {} };
          s.data = { weeks: loaded.weeks ?? {}, templates: loaded.templates ?? [] };
          s.loading = false;
        });

        if (realtimeChannel) supabase.removeChannel(realtimeChannel);
        realtimeChannel = supabase
          .channel(`workout_logs_${userId}`)
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'workout_logs', filter: `user_id=eq.${userId}` },
            (payload) => {
              const incoming = (payload.new as { data?: WorkoutData }).data;
              if (incoming) {
                set((s) => {
                  s.data = { weeks: incoming.weeks ?? {}, templates: incoming.templates ?? [] };
                });
              }
            }
          )
          .subscribe();
      },

      reset: () => {
        if (realtimeChannel) {
          supabase.removeChannel(realtimeChannel);
          realtimeChannel = null;
        }
        if (saveTimer) clearTimeout(saveTimer);
        set((s) => {
          s.data = { weeks: {}, templates: [] };
          s.userId = null;
          s.loading = true;
          s.saveStatus = 'idle';
        });
      },

      ensureWeek: (mondayISO) =>
        set((s) => {
          if (!s.data.weeks[mondayISO]) s.data.weeks[mondayISO] = { days: {} };
        }),

      ensureDay: (mondayISO, dateISO) =>
        set((s) => {
          const week = s.data.weeks[mondayISO] ?? (s.data.weeks[mondayISO] = { days: {} });
          if (!week.days[dateISO]) week.days[dateISO] = { exercises: [] };
        }),

      addExercise: (mondayISO, dateISO) => {
        set((s) => {
          s.data.weeks[mondayISO].days[dateISO].exercises.push({
            id: uid(),
            name: '',
            sets: [{ weight: '', reps: '' }],
          });
        });
        scheduleSave();
      },

      removeExercise: (mondayISO, dateISO, exerciseId) => {
        set((s) => {
          const day = s.data.weeks[mondayISO].days[dateISO];
          day.exercises = day.exercises.filter((e) => e.id !== exerciseId);
        });
        scheduleSave();
      },

      updateExerciseName: (mondayISO, dateISO, exerciseId, name) => {
        set((s) => {
          const ex = s.data.weeks[mondayISO].days[dateISO].exercises.find((e) => e.id === exerciseId);
          if (ex) ex.name = name;
        });
        scheduleSave();
      },

      addSet: (mondayISO, dateISO, exerciseId) => {
        set((s) => {
          const ex = s.data.weeks[mondayISO].days[dateISO].exercises.find((e) => e.id === exerciseId);
          if (!ex) return;
          const last = ex.sets[ex.sets.length - 1];
          ex.sets.push({ weight: last ? last.weight : '', reps: last ? last.reps : '' });
        });
        scheduleSave();
      },

      removeSet: (mondayISO, dateISO, exerciseId, index) => {
        set((s) => {
          const ex = s.data.weeks[mondayISO].days[dateISO].exercises.find((e) => e.id === exerciseId);
          if (ex) ex.sets = ex.sets.filter((_, i) => i !== index);
        });
        scheduleSave();
      },

      updateSet: (mondayISO, dateISO, exerciseId, index, field, value) => {
        set((s) => {
          const ex = s.data.weeks[mondayISO].days[dateISO].exercises.find((e) => e.id === exerciseId);
          if (ex && ex.sets[index]) ex.sets[index][field] = value;
        });
        scheduleSave();
      },

      duplicateWeek: (mondayISO, targetMondayISO) => {
        const srcMonday = fromISO(mondayISO);
        const targetMonday = targetMondayISO ? getMonday(fromISO(targetMondayISO)) : addDays(srcMonday, 7);
        const targetISO = toISO(targetMonday);

        set((s) => {
          const src = s.data.weeks[mondayISO];
          const target = s.data.weeks[targetISO] ?? (s.data.weeks[targetISO] = { days: {} });
          Object.keys(src.days).forEach((dateISO) => {
            const srcDate = fromISO(dateISO);
            const offset = Math.round((srcDate.getTime() - srcMonday.getTime()) / 86400000);
            const targetDateISO = toISO(addDays(targetMonday, offset));
            target.days[targetDateISO] = {
              exercises: cloneExercises(src.days[dateISO].exercises),
            };
          });
        });
        scheduleSave();
        return targetISO;
      },

      copyDayTo: (mondayISO, dateISO, targetDateISO) => {
        const monday = fromISO(mondayISO);
        const date = fromISO(dateISO);
        const offset = Math.round((date.getTime() - monday.getTime()) / 86400000);
        const finalTargetDate = targetDateISO ? fromISO(targetDateISO) : addDays(addDays(monday, 7), offset);
        const targetMonday = getMonday(finalTargetDate);
        const targetISO = toISO(targetMonday);
        const targetDateFinalISO = toISO(finalTargetDate);

        set((s) => {
          const srcDay = s.data.weeks[mondayISO].days[dateISO];
          const targetWeek = s.data.weeks[targetISO] ?? (s.data.weeks[targetISO] = { days: {} });
          targetWeek.days[targetDateFinalISO] = {
            exercises: cloneExercises(srcDay.exercises),
          };
        });
        scheduleSave();
        return targetISO;
      },

      saveTemplate: (name, exercises) => {
        set((s) => {
          if (!s.data.templates) s.data.templates = [];
          s.data.templates.push({ id: uid(), name, exercises: cloneExercises(exercises) });
        });
        scheduleSave();
      },

      deleteTemplate: (templateId) => {
        set((s) => {
          s.data.templates = (s.data.templates ?? []).filter((t) => t.id !== templateId);
        });
        scheduleSave();
      },

      applyTemplateToDay: (mondayISO, dateISO, templateId) => {
        set((s) => {
          const template = (s.data.templates ?? []).find((t) => t.id === templateId);
          if (!template) return;
          const day = s.data.weeks[mondayISO].days[dateISO];
          day.exercises.push(...cloneExercises(template.exercises));
        });
        scheduleSave();
      },
    };
  })
);

export function weekHasData(data: WorkoutData, mondayISO: string): boolean {
  const w = data.weeks[mondayISO];
  if (!w) return false;
  return Object.values(w.days).some((d) => d.exercises.length > 0);
}

export function dayHasData(data: WorkoutData, mondayISO: string, dateISO: string): boolean {
  const w = data.weeks[mondayISO];
  if (!w || !w.days[dateISO]) return false;
  return w.days[dateISO].exercises.length > 0;
}
