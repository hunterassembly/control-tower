-- Migration: Final fix for infinite recursion in project_member RLS policies
-- Purpose: Replace all existing policies with simple, non-recursive ones

-- Drop ALL existing policies on project_member
DROP POLICY IF EXISTS "Allow users to view project members" ON project_member;
DROP POLICY IF EXISTS "Allow users to view own membership" ON project_member;
DROP POLICY IF EXISTS "Allow authenticated INSERT for project members" ON project_member;
DROP POLICY IF EXISTS "Allow project admins to update members" ON project_member;
DROP POLICY IF EXISTS "Allow project admins to delete members" ON project_member;

-- Create simple, non-recursive policies

-- SELECT: Allow users to see their own memberships only (no cross-table checking)
CREATE POLICY "Users can view own memberships"
ON project_member
FOR SELECT
USING (user_id = auth.uid());

-- INSERT: Allow any authenticated user to insert (business logic controls this)
CREATE POLICY "Authenticated users can insert memberships"
ON project_member
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- UPDATE: Only allow users to update their own membership records
CREATE POLICY "Users can update own memberships"
ON project_member
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE: Only allow users to delete their own membership records (leave project)
CREATE POLICY "Users can delete own memberships"
ON project_member
FOR DELETE
USING (user_id = auth.uid());

-- Note: We're intentionally making these policies simple and non-recursive.
-- Admin functionality for managing other users' memberships will be handled
-- at the application level with service role calls, not through RLS policies. 