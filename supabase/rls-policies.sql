-- Row Level Security (RLS) Policies for banana.fyi
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

-- ============================================
-- PRESENTATIONS TABLE
-- ============================================

-- Enable RLS on presentations table
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own presentations
CREATE POLICY "Users can view own presentations"
ON presentations
FOR SELECT
USING (auth.uid()::text = user_id);

-- Policy: Users can only insert their own presentations
CREATE POLICY "Users can insert own presentations"
ON presentations
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can only update their own presentations
CREATE POLICY "Users can update own presentations"
ON presentations
FOR UPDATE
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can only delete their own presentations
CREATE POLICY "Users can delete own presentations"
ON presentations
FOR DELETE
USING (auth.uid()::text = user_id);

-- ============================================
-- SLIDES TABLE
-- ============================================

-- Enable RLS on slides table
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view slides belonging to their presentations
CREATE POLICY "Users can view own slides"
ON slides
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM presentations
    WHERE presentations.id = slides.presentation_id
    AND presentations.user_id = auth.uid()::text
  )
);

-- Policy: Users can insert slides to their presentations
CREATE POLICY "Users can insert own slides"
ON slides
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM presentations
    WHERE presentations.id = slides.presentation_id
    AND presentations.user_id = auth.uid()::text
  )
);

-- Policy: Users can update slides in their presentations
CREATE POLICY "Users can update own slides"
ON slides
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM presentations
    WHERE presentations.id = slides.presentation_id
    AND presentations.user_id = auth.uid()::text
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM presentations
    WHERE presentations.id = slides.presentation_id
    AND presentations.user_id = auth.uid()::text
  )
);

-- Policy: Users can delete slides from their presentations
CREATE POLICY "Users can delete own slides"
ON slides
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM presentations
    WHERE presentations.id = slides.presentation_id
    AND presentations.user_id = auth.uid()::text
  )
);

-- ============================================
-- PRISMA MIGRATIONS TABLE
-- ============================================

-- Enable RLS on _prisma_migrations table (internal Prisma table)
-- No policies = only service role can access (which is what we want)
ALTER TABLE _prisma_migrations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SERVICE ROLE BYPASS
-- ============================================
-- Note: If your API routes use the service role key (which bypasses RLS),
-- these policies won't affect your Prisma operations.
-- However, they provide defense-in-depth and are required if you ever
-- access the database through Supabase's client SDK directly.

-- ============================================
-- STORAGE BUCKET SETUP
-- ============================================

-- First, create the bucket if it doesn't exist (uncomment and run once)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('slide-images', 'slide-images', false)
-- ON CONFLICT (id) DO NOTHING;

-- Storage path structure: userId/presentationId/slideId.png
-- The first folder is always the user's ID

-- Policy: Users can view their own images
CREATE POLICY "Users can view own images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'slide-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can upload to their own folder
CREATE POLICY "Users can upload own images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'slide-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own images
CREATE POLICY "Users can update own images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'slide-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'slide-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'slide-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify RLS is enabled:

-- Check if RLS is enabled on tables:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- List all policies:
-- SELECT * FROM pg_policies WHERE schemaname = 'public';
