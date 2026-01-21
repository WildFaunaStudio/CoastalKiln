import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { auth } from '../lib/api/auth';
import { profiles } from '../lib/api/profiles';
import storage from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(isSupabaseConfigured());

  // Initialize auth state
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Offline mode - use localStorage
      const localProfile = storage.get('user', {
        username: 'Potter',
        email: '',
        bio: '',
        location: '',
        units: 'metric',
      });
      setProfile(localProfile);
      setLoading(false);
      return;
    }

    // Get initial session
    const initAuth = async () => {
      try {
        const session = await auth.getSession();
        setSession(session);
        setUser(session?.user || null);

        if (session?.user) {
          const userProfile = await profiles.get();
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user || null);

      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const userProfile = await profiles.get();
          setProfile(userProfile);
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign up
  const signUp = async (email, password, username) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured. Running in offline mode.');
    }

    const data = await auth.signUp(email, password, username);
    return data;
  };

  // Sign in
  const signIn = async (email, password) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured. Running in offline mode.');
    }

    const data = await auth.signIn(email, password);
    return data;
  };

  // Sign out
  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      // Clear local storage in offline mode
      storage.remove('user');
      setProfile(null);
      return;
    }

    await auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  // Update profile
  const updateProfile = async (updates) => {
    if (!isSupabaseConfigured()) {
      // Offline mode - update localStorage
      const newProfile = { ...profile, ...updates };
      storage.set('user', newProfile);
      setProfile(newProfile);
      return newProfile;
    }

    const updatedProfile = await profiles.update(updates);
    setProfile(updatedProfile);
    return updatedProfile;
  };

  // Reset password
  const resetPassword = async (email) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured. Running in offline mode.');
    }

    return auth.resetPassword(email);
  };

  // Update password
  const updatePassword = async (newPassword) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured. Running in offline mode.');
    }

    return auth.updatePassword(newPassword);
  };

  const value = {
    user,
    profile,
    session,
    loading,
    isOnline,
    isAuthenticated: !!user || !isSupabaseConfigured(),
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
