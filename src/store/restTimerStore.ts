import { create } from 'zustand';

interface RestTimerState {
  totalSeconds: number;
  secondsLeft: number;
  running: boolean;
  start: (seconds: number) => void;
  cancel: () => void;
  tick: () => void;
}

let interval: ReturnType<typeof setInterval> | null = null;

export const useRestTimerStore = create<RestTimerState>((set, get) => ({
  totalSeconds: 0,
  secondsLeft: 0,
  running: false,

  start: (seconds) => {
    if (interval) clearInterval(interval);
    set({ totalSeconds: seconds, secondsLeft: seconds, running: true });
    interval = setInterval(() => get().tick(), 1000);
  },

  cancel: () => {
    if (interval) clearInterval(interval);
    interval = null;
    set({ running: false, secondsLeft: 0, totalSeconds: 0 });
  },

  tick: () => {
    const left = get().secondsLeft - 1;
    if (left <= 0) {
      if (interval) clearInterval(interval);
      interval = null;
      set({ secondsLeft: 0, running: false });
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([200, 100, 200]);
      return;
    }
    set({ secondsLeft: left });
  },
}));
