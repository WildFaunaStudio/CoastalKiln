import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: Log env vars status
console.log('🔧 Supabase config check:', {
  url: supabaseUrl ? '✓ Found' : '✗ Missing',
  key: supabaseAnonKey ? '✓ Found' : '✗ Missing',
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Running in offline/localStorage mode.\n' +
    'To enable Supabase, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  );
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'coastal-kiln-auth',
        flowType: 'implicit',
      },
      global: {
        fetch: (...args) => fetch(...args),
      },
    })
  : null;

export const isSupabaseConfigured = () => !!supabase;

export default supabase;
