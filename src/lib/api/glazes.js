import { supabase } from '../supabase';

export const glazes = {
  // Get all glazes for current user (plus public ones)
  async list() {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('glazes')
      .select(`
        *,
        tiles:glaze_tiles(*)
      `)
      .or(`user_id.eq.${user?.id},is_public.eq.true`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get user's own glazes only
  async listOwn() {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('glazes')
      .select(`
        *,
        tiles:glaze_tiles(*)
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get single glaze by ID
  async get(id) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('glazes')
      .select(`
        *,
        tiles:glaze_tiles(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new glaze
  async create(glaze) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('glazes')
      .insert({
        user_id: user.id,
        name: glaze.name,
        firing_type: glaze.type,
        recipe: glaze.recipe,
        notes: glaze.notes,
        is_public: glaze.isPublic || false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update glaze
  async update(id, updates) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('glazes')
      .update({
        name: updates.name,
        firing_type: updates.type,
        recipe: updates.recipe,
        notes: updates.notes,
        is_public: updates.isPublic,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete glaze
  async delete(id) {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('glazes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Add test tile photo
  async addTile(glazeId, file, clayBody = null, firingNotes = null) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${glazeId}/${Date.now()}.${fileExt}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('glaze-tiles')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('glaze-tiles')
      .getPublicUrl(fileName);

    // Create tile record
    const { data, error } = await supabase
      .from('glaze_tiles')
      .insert({
        glaze_id: glazeId,
        storage_path: fileName,
        url: publicUrl,
        clay_body: clayBody,
        firing_notes: firingNotes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete test tile
  async deleteTile(tileId, storagePath) {
    if (!supabase) throw new Error('Supabase not configured');

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('glaze-tiles')
      .remove([storagePath]);

    if (storageError) throw storageError;

    // Delete record
    const { error } = await supabase
      .from('glaze_tiles')
      .delete()
      .eq('id', tileId);

    if (error) throw error;
  },
};

export default glazes;
