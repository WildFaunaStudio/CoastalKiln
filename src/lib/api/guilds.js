import { supabase } from '../supabase';

export const guilds = {
  // Get all guilds (for discovery)
  async listAll() {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('guilds')
      .select(`
        *,
        member_count:guild_memberships(count)
      `)
      .order('name');

    if (error) throw error;
    return data;
  },

  // Get guilds user is a member of
  async listMine() {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('guild_memberships')
      .select(`
        role,
        guild:guilds(
          *,
          member_count:guild_memberships(count),
          upcoming_event:guild_events(title, event_date)
        )
      `)
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false });

    if (error) throw error;
    return data.map(m => ({ ...m.guild, myRole: m.role }));
  },

  // Get single guild with full details
  async get(id) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('guilds')
      .select(`
        *,
        members:guild_memberships(
          role,
          profile:profiles(id, username, avatar_url)
        ),
        posts:guild_posts(
          *,
          author:profiles(id, username, avatar_url)
        ),
        resources:guild_resources(
          *,
          added_by_profile:profiles(username)
        ),
        events:guild_events(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Check if current user is a member and get their role
    const myMembership = data.members?.find(m => m.profile?.id === user?.id);

    return {
      ...data,
      isMember: !!myMembership,
      myRole: myMembership?.role || null,
      isAdmin: myMembership?.role === 'admin' || myMembership?.role === 'owner',
    };
  },

  // Create new guild
  async create(guild) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Generate invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create guild
    const { data, error } = await supabase
      .from('guilds')
      .insert({
        name: guild.name,
        description: guild.description,
        location: guild.location,
        invite_code: inviteCode,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Add creator as owner
    await supabase
      .from('guild_memberships')
      .insert({
        guild_id: data.id,
        user_id: user.id,
        role: 'owner',
      });

    return data;
  },

  // Update guild
  async update(id, updates) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
      .from('guilds')
      .update({
        name: updates.name,
        description: updates.description,
        location: updates.location,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Join guild by invite code
  async joinByCode(inviteCode) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Find guild by invite code
    const { data: guild, error: findError } = await supabase
      .from('guilds')
      .select('id')
      .eq('invite_code', inviteCode.toUpperCase())
      .single();

    if (findError || !guild) throw new Error('Invalid invite code');

    // Check if already a member
    const { data: existing } = await supabase
      .from('guild_memberships')
      .select('id')
      .eq('guild_id', guild.id)
      .eq('user_id', user.id)
      .single();

    if (existing) throw new Error('Already a member');

    // Join guild
    const { error } = await supabase
      .from('guild_memberships')
      .insert({
        guild_id: guild.id,
        user_id: user.id,
        role: 'member',
      });

    if (error) throw error;
    return guild.id;
  },

  // Join guild directly (for public guilds)
  async join(guildId) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('guild_memberships')
      .insert({
        guild_id: guildId,
        user_id: user.id,
        role: 'member',
      });

    if (error) throw error;
  },

  // Leave guild
  async leave(guildId) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('guild_memberships')
      .delete()
      .eq('guild_id', guildId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  // Create post
  async createPost(guildId, content) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('guild_posts')
      .insert({
        guild_id: guildId,
        author_id: user.id,
        content,
      })
      .select(`
        *,
        author:profiles(id, username, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Delete post
  async deletePost(postId) {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('guild_posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
  },

  // Add resource
  async addResource(guildId, resource) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('guild_resources')
      .insert({
        guild_id: guildId,
        added_by: user.id,
        title: resource.title,
        resource_type: resource.type,
        url: resource.url,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete resource
  async deleteResource(resourceId) {
    if (!supabase) throw new Error('Supabase not configured');

    const { error } = await supabase
      .from('guild_resources')
      .delete()
      .eq('id', resourceId);

    if (error) throw error;
  },

  // Create event
  async createEvent(guildId, event) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('guild_events')
      .insert({
        guild_id: guildId,
        created_by: user.id,
        title: event.title,
        description: event.description,
        event_date: event.date,
        location: event.location,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export default guilds;
