// Coastal Kiln API
// Export all API modules for easy importing

export { auth } from './auth';
export { profiles } from './profiles';
export { projects } from './projects';
export { glazes } from './glazes';
export { reclaim } from './reclaim';
export { guilds } from './guilds';

// Re-export supabase client and config check
export { supabase, isSupabaseConfigured } from '../supabase';
