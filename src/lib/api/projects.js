import { supabase } from '../supabase';

export const projects = {
  // Get all projects for current user
  async list() {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        photos:project_photos(*),
        notes:project_notes(*)
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get single project by ID
  async get(id) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        photos:project_photos(*),
        notes:project_notes(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new project
  async create(project, userId) {
    if (!supabase) throw new Error('Supabase not configured');
    if (!userId) throw new Error('User ID required');

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        title: project.title,
        clay_body: project.clay,
        stage: project.stage || 'wedging',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update project
  async update(id, updates) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('projects')
      .update({
        title: updates.title,
        clay_body: updates.clay,
        stage: updates.stage,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete project
  async delete(id) {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Update project stage
  async updateStage(id, stage) {
    return this.update(id, { stage });
  },

  // Add photo to project
  async addPhoto(projectId, file, stage = null, userId = null) {
    console.log('📷 addPhoto called:', { projectId, fileName: file?.name, stage, userId });

    if (!supabase) throw new Error('Supabase not configured');
    if (!userId) throw new Error('User ID required');

    // Check session before upload
    const { data: { session } } = await supabase.auth.getSession();
    console.log('📷 Session for upload:', session ? `Valid (${session.user?.id})` : 'NO SESSION');
    if (!session) {
      console.error('📷 No session - storage upload will fail due to RLS');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${projectId}/${Date.now()}.${fileExt}`;
    console.log('📷 Upload path:', fileName);

    // Upload to storage
    console.log('📷 Starting upload...');
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('project-photos')
      .upload(fileName, file);

    console.log('📷 Upload result:', { error: uploadError, data: uploadData });
    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('project-photos')
      .getPublicUrl(fileName);

    // Create photo record
    const { data, error } = await supabase
      .from('project_photos')
      .insert({
        project_id: projectId,
        storage_path: fileName,
        url: publicUrl,
        stage,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete photo
  async deletePhoto(photoId, storagePath) {
    if (!supabase) throw new Error('Supabase not configured');

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('project-photos')
      .remove([storagePath]);

    if (storageError) throw storageError;

    // Delete record
    const { error } = await supabase
      .from('project_photos')
      .delete()
      .eq('id', photoId);

    if (error) throw error;
  },

  // Update or create note for a stage
  async upsertNote(projectId, stage, content) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('project_notes')
      .upsert({
        project_id: projectId,
        stage,
        content,
      }, {
        onConflict: 'project_id,stage',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export default projects;
