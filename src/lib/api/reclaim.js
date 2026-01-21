import { supabase } from '../supabase';

export const reclaim = {
  // Get all reclaim batches for current user
  async list() {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('reclaim_batches')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get single batch by ID
  async get(id) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('reclaim_batches')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new reclaim batch
  async create(batch) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('reclaim_batches')
      .insert({
        user_id: user.id,
        source: batch.source,
        weight_kg: batch.weight || null,
        status: batch.status || 'soaking',
        notes: batch.notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update batch
  async update(id, updates) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('reclaim_batches')
      .update({
        source: updates.source,
        weight_kg: updates.weight,
        status: updates.status,
        notes: updates.notes,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete batch
  async delete(id) {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('reclaim_batches')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Update status only
  async updateStatus(id, status) {
    return this.update(id, { status });
  },

  // Get total reclaimed weight
  async getTotalWeight() {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('reclaim_batches')
      .select('weight_kg');

    if (error) throw error;

    return data.reduce((sum, batch) => sum + (batch.weight_kg || 0), 0);
  },
};

export default reclaim;
