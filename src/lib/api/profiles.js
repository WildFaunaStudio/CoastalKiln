import { supabase } from '../supabase';

// Helper to retry on AbortError
const withRetry = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.name === 'AbortError' && i < retries - 1) {
        console.log(`🔄 Profile retry ${i + 1}/${retries} after AbortError...`);
        await new Promise(r => setTimeout(r, 300 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
};

export const profiles = {
  // Get current user's profile
  async get() {
    if (!supabase) throw new Error('Supabase not configured');

    return withRetry(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    });
  },

  // Get profile by ID
  async getById(id) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, bio, location, avatar_url')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update current user's profile
  async update(updates) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Upload avatar
  async uploadAvatar(file) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/avatar.${fileExt}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update profile with avatar URL
    await this.update({ avatar_url: publicUrl });

    return publicUrl;
  },
};

export default profiles;
