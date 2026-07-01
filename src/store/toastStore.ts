import { create } from 'zustand';

interface ToastState {
  message: string | null;
  show: (message: string) => void;
}

let dismissTimer: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  show: (message) => {
    if (dismissTimer) clearTimeout(dismissTimer);
    set({ message });
    dismissTimer = setTimeout(() => set({ message: null }), 2200);
  },
}));
