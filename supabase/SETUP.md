# Supabase Setup Guide for Coastal Kiln

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Name**: `coastal-kiln` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** and wait for setup (~2 minutes)

## 2. Get Your API Keys

1. In your project dashboard, go to **Settings** → **API**
2. Copy these values (you'll need them for the app):
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJhbGc...` (safe to expose in frontend)
   - **service_role key**: Keep this SECRET (only for server-side)

## 3. Run the Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **"New Query"**
3. Copy the contents of `schema.sql` and paste it
4. Click **"Run"** (or Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned" for each statement

## 4. Set Up Storage Buckets

Go to **Storage** in your dashboard and create these buckets:

### project-photos
- Click **"New bucket"**
- Name: `project-photos`
- Public bucket: ✅ Yes
- Click **"Create bucket"**

### glaze-tiles
- Name: `glaze-tiles`
- Public bucket: ✅ Yes

### avatars
- Name: `avatars`
- Public bucket: ✅ Yes

### guild-resources
- Name: `guild-resources`
- Public bucket: ❌ No (private)

### Storage Policies

For each PUBLIC bucket (project-photos, glaze-tiles, avatars), add these policies:

**Select policy (allow public reads):**
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-photos');
```

**Insert policy (authenticated users can upload):**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-photos'
  AND auth.role() = 'authenticated'
);
```

**Delete policy (users can delete their own files):**
```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

Repeat for `glaze-tiles` and `avatars` buckets.

## 5. Configure Authentication

1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled (it's on by default)
3. Optional: Configure other providers (Google, Apple, etc.)

### Email Templates (optional)
Go to **Authentication** → **Email Templates** to customize:
- Confirmation email
- Password reset email
- Magic link email

## 6. Environment Variables

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **Important**: Add `.env` to your `.gitignore`!

## 7. Verify Setup

After running the schema, verify tables exist:

1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - profiles
   - projects
   - project_photos
   - project_notes
   - glazes
   - glaze_tiles
   - reclaim_batches
   - guilds
   - guild_memberships
   - guild_posts
   - guild_resources
   - guild_events
   - studio_tips

## Database Schema Overview

```
┌─────────────────┐     ┌──────────────────┐
│  auth.users     │────▶│    profiles      │
└─────────────────┘     └──────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐    ┌─────────────────┐    ┌────────────────┐
│   projects    │    │     glazes      │    │ reclaim_batches│
└───────────────┘    └─────────────────┘    └────────────────┘
        │                      │
        ▼                      ▼
┌───────────────┐    ┌─────────────────┐
│project_photos │    │   glaze_tiles   │
│project_notes  │    └─────────────────┘
└───────────────┘

┌─────────────────┐     ┌──────────────────┐
│     guilds      │◀───▶│guild_memberships │
└─────────────────┘     └──────────────────┘
        │
        ├──▶ guild_posts
        ├──▶ guild_resources
        └──▶ guild_events
```

## Troubleshooting

### "permission denied for table"
- Check RLS policies are set up correctly
- Verify user is authenticated
- Check the user has the right role

### "relation does not exist"
- Make sure you ran the full schema.sql
- Check for any SQL errors in the output

### Storage upload fails
- Verify bucket exists and policies are set
- Check file size limits (default 50MB)
- Ensure user is authenticated

## Next Steps

1. Install Supabase client: `npm install @supabase/supabase-js`
2. Set up the client in your app (see `src/lib/supabase.js`)
3. Create auth context for managing user state
4. Update components to use Supabase instead of localStorage
