-- Coastal Kiln Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  bio TEXT,
  location TEXT,
  avatar_url TEXT,
  units TEXT DEFAULT 'metric' CHECK (units IN ('metric', 'imperial')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- POTTERY PROJECTS
-- ============================================
CREATE TYPE pottery_stage AS ENUM (
  'wedging',
  'throwing',
  'trimming',
  'drying',
  'leather_hard',
  'bisque_fired',
  'glazing',
  'glaze_fired',
  'complete'
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  clay_body TEXT,
  stage pottery_stage DEFAULT 'wedging',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_stage ON projects(stage);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- PROJECT PHOTOS
-- ============================================
CREATE TABLE project_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  stage pottery_stage, -- which stage the photo was taken at
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_project_photos_project_id ON project_photos(project_id);

ALTER TABLE project_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own project photos" ON project_photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_photos.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- ============================================
-- PROJECT NOTES (per stage)
-- ============================================
CREATE TABLE project_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  stage pottery_stage NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, stage)
);

CREATE INDEX idx_project_notes_project_id ON project_notes(project_id);

ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own project notes" ON project_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_notes.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- ============================================
-- GLAZE RECIPES
-- ============================================
CREATE TABLE glazes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  firing_type TEXT, -- e.g., "Cone 6", "Cone 10"
  recipe TEXT,
  notes TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_glazes_user_id ON glazes(user_id);

ALTER TABLE glazes ENABLE ROW LEVEL SECURITY;

-- Users can see their own glazes and public glazes
CREATE POLICY "Users can view own and public glazes" ON glazes
  FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can insert own glazes" ON glazes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own glazes" ON glazes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own glazes" ON glazes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- GLAZE TEST TILES (photos)
-- ============================================
CREATE TABLE glaze_tiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  glaze_id UUID NOT NULL REFERENCES glazes(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  clay_body TEXT,
  firing_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_glaze_tiles_glaze_id ON glaze_tiles(glaze_id);

ALTER TABLE glaze_tiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own glaze tiles" ON glaze_tiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM glazes
      WHERE glazes.id = glaze_tiles.glaze_id
      AND glazes.user_id = auth.uid()
    )
  );

-- ============================================
-- CLAY RECLAIM BATCHES
-- ============================================
CREATE TYPE reclaim_status AS ENUM (
  'soaking',
  'drying',
  'wedging',
  'ready'
);

CREATE TABLE reclaim_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  weight_kg DECIMAL(6,2),
  status reclaim_status DEFAULT 'soaking',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reclaim_batches_user_id ON reclaim_batches(user_id);

ALTER TABLE reclaim_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own reclaim batches" ON reclaim_batches
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- GUILDS
-- ============================================
CREATE TABLE guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guilds_invite_code ON guilds(invite_code);

ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;

-- Anyone can view guilds (for discovery)
CREATE POLICY "Anyone can view guilds" ON guilds
  FOR SELECT USING (TRUE);

CREATE POLICY "Guild creators can update their guilds" ON guilds
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can create guilds" ON guilds
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- ============================================
-- GUILD MEMBERSHIPS
-- ============================================
CREATE TYPE membership_role AS ENUM ('member', 'admin', 'owner');

CREATE TABLE guild_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role membership_role DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guild_id, user_id)
);

CREATE INDEX idx_guild_memberships_guild_id ON guild_memberships(guild_id);
CREATE INDEX idx_guild_memberships_user_id ON guild_memberships(user_id);

ALTER TABLE guild_memberships ENABLE ROW LEVEL SECURITY;

-- Users can see memberships for guilds they're in
CREATE POLICY "Users can view guild memberships" ON guild_memberships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM guild_memberships gm
      WHERE gm.guild_id = guild_memberships.guild_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join guilds" ON guild_memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave guilds" ON guild_memberships
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- GUILD POSTS (message board)
-- ============================================
CREATE TABLE guild_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guild_posts_guild_id ON guild_posts(guild_id);

ALTER TABLE guild_posts ENABLE ROW LEVEL SECURITY;

-- Only guild members can view posts
CREATE POLICY "Guild members can view posts" ON guild_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM guild_memberships
      WHERE guild_memberships.guild_id = guild_posts.guild_id
      AND guild_memberships.user_id = auth.uid()
    )
  );

-- Only guild members can create posts
CREATE POLICY "Guild members can create posts" ON guild_posts
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM guild_memberships
      WHERE guild_memberships.guild_id = guild_posts.guild_id
      AND guild_memberships.user_id = auth.uid()
    )
  );

-- Authors can update their own posts
CREATE POLICY "Authors can update own posts" ON guild_posts
  FOR UPDATE USING (auth.uid() = author_id);

-- Authors can delete their own posts
CREATE POLICY "Authors can delete own posts" ON guild_posts
  FOR DELETE USING (auth.uid() = author_id);

-- ============================================
-- GUILD RESOURCES
-- ============================================
CREATE TABLE guild_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  resource_type TEXT DEFAULT 'link', -- 'link', 'pdf', 'video'
  url TEXT,
  storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guild_resources_guild_id ON guild_resources(guild_id);

ALTER TABLE guild_resources ENABLE ROW LEVEL SECURITY;

-- Only guild members can view resources
CREATE POLICY "Guild members can view resources" ON guild_resources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM guild_memberships
      WHERE guild_memberships.guild_id = guild_resources.guild_id
      AND guild_memberships.user_id = auth.uid()
    )
  );

-- Guild members can add resources
CREATE POLICY "Guild members can add resources" ON guild_resources
  FOR INSERT WITH CHECK (
    auth.uid() = added_by AND
    EXISTS (
      SELECT 1 FROM guild_memberships
      WHERE guild_memberships.guild_id = guild_resources.guild_id
      AND guild_memberships.user_id = auth.uid()
    )
  );

-- ============================================
-- GUILD EVENTS
-- ============================================
CREATE TABLE guild_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guild_events_guild_id ON guild_events(guild_id);

ALTER TABLE guild_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guild members can view events" ON guild_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM guild_memberships
      WHERE guild_memberships.guild_id = guild_events.guild_id
      AND guild_memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "Guild admins can manage events" ON guild_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM guild_memberships
      WHERE guild_memberships.guild_id = guild_events.guild_id
      AND guild_memberships.user_id = auth.uid()
      AND guild_memberships.role IN ('admin', 'owner')
    )
  );

-- ============================================
-- STUDIO TIPS (shared knowledge base)
-- ============================================
CREATE TABLE studio_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('clay_reclaim', 'diy_tools', 'plaster_bats', 'firing', 'glazing', 'other')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  is_approved BOOLEAN DEFAULT FALSE, -- for moderation
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_studio_tips_category ON studio_tips(category);

ALTER TABLE studio_tips ENABLE ROW LEVEL SECURITY;

-- Everyone can view approved tips
CREATE POLICY "Anyone can view approved tips" ON studio_tips
  FOR SELECT USING (is_approved = TRUE OR auth.uid() = author_id);

CREATE POLICY "Authenticated users can submit tips" ON studio_tips
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own tips" ON studio_tips
  FOR UPDATE USING (auth.uid() = author_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_glazes_updated_at
  BEFORE UPDATE ON glazes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reclaim_batches_updated_at
  BEFORE UPDATE ON reclaim_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_guilds_updated_at
  BEFORE UPDATE ON guilds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to generate invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
BEGIN
  RETURN UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STORAGE BUCKETS (run in Supabase Dashboard)
-- ============================================
-- These need to be created via Supabase Dashboard or API:
-- 1. project-photos (public read, authenticated write)
-- 2. glaze-tiles (public read, authenticated write)
-- 3. avatars (public read, authenticated write)
-- 4. guild-resources (private, member access only)
