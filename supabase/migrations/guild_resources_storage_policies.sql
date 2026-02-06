-- Storage policies for guild-resources bucket
-- Run this in your Supabase Dashboard SQL Editor

-- Members can upload to their guild's folder
CREATE POLICY "Guild members can upload resources"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'guild-resources' AND
  EXISTS (
    SELECT 1 FROM guild_memberships
    WHERE guild_memberships.guild_id = (storage.foldername(name))[1]::uuid
    AND guild_memberships.user_id = auth.uid()
  )
);

-- Members can view guild resources
CREATE POLICY "Guild members can view resources"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'guild-resources' AND
  EXISTS (
    SELECT 1 FROM guild_memberships
    WHERE guild_memberships.guild_id = (storage.foldername(name))[1]::uuid
    AND guild_memberships.user_id = auth.uid()
  )
);

-- Members can delete resources they uploaded (optional - add if needed)
CREATE POLICY "Guild members can delete own resources"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'guild-resources' AND
  EXISTS (
    SELECT 1 FROM guild_memberships
    WHERE guild_memberships.guild_id = (storage.foldername(name))[1]::uuid
    AND guild_memberships.user_id = auth.uid()
  ) AND
  owner = auth.uid()
);
