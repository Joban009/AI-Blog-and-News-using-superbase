import { create } from 'zustand';
import supabase from '../services/supabase.js';

export const useAuthStore = create((set, get) => ({
  user:    null,
  profile: null,
  loading: true,

  // Boot — called once on app start
  async init() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await get().loadProfile(session.user);
    } else {
      set({ loading: false });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await get().loadProfile(session.user);
      } else {
        set({ user: null, profile: null, loading: false });
      }
    });
  },

  async loadProfile(user) {
    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', user.id).single();
    set({ user, profile, loading: false });
  },

  async register({ username, email, password }) {
    // Check username available
    const { data: existing } = await supabase
      .from('profiles').select('id').eq('username', username).single();
    if (existing) throw new Error('Username already taken');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) throw error;
    return data;
  },

  async login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async logout() {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  isAdmin:         () => get().profile?.role === 'admin',
  isAuthenticated: () => !!get().user,
}));
