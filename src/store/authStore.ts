import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getAuthErrorMessage } from '../lib/authErrors';
import { loadTracker } from '../lib/preload';

interface AuthState {
  session: Session | null;
  user: User | null;
  initialized: boolean;
  signInWithPassword: (email: string, password: string) => Promise<string | null>;
  signUpWithPassword: (email: string, password: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  resetPasswordForEmail: (email: string) => Promise<string | null>;
  updatePassword: (newPassword: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  supabase.auth.getSession().then(({ data }) => {
    if (data.session) loadTracker();
    set({ session: data.session, user: data.session?.user ?? null, initialized: true });
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    if (session) loadTracker();
    set({ session, user: session?.user ?? null, initialized: true });
  });

  return {
    session: null,
    user: null,
    initialized: false,

    signInWithPassword: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return getAuthErrorMessage(error);
    },

    signUpWithPassword: async (email, password) => {
      const { error } = await supabase.auth.signUp({ email, password });
      return getAuthErrorMessage(error);
    },

    signInWithGoogle: async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      return getAuthErrorMessage(error);
    },

    resetPasswordForEmail: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return getAuthErrorMessage(error);
    },

    updatePassword: async (newPassword) => {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return getAuthErrorMessage(error);
    },

    signOut: async () => {
      await supabase.auth.signOut();
    },
  };
});
