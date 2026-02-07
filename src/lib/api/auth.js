import { supabase } from '../supabase';

// Helper to retry on AbortError
const withRetry = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.name === 'AbortError' && i < retries - 1) {
        console.log(`🔄 Auth retry ${i + 1}/${retries} after AbortError...`);
        await new Promise(r => setTimeout(r, 300 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
};

export const auth = {
  // Sign up with email and password
  async signUp(email, password, username) {
    if (!supabase) throw new Error('Supabase not configured');

    return withRetry(async () => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (error) throw error;
      return data;
    });
  },

  // Sign in with email and password
  async signIn(email, password) {
    if (!supabase) throw new Error('Supabase not configured');

    return withRetry(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    });
  },

  // Sign out
  async signOut() {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    if (!supabase) return null;

    return withRetry(async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    });
  },

  // Get current user
  async getUser() {
    if (!supabase) return null;

    return withRetry(async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    });
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };

    return supabase.auth.onAuthStateChange(callback);
  },

  // Reset password
  async resetPassword(email) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return data;
  },

  // Update password
  async updatePassword(newPassword) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  },
};

export default auth;
