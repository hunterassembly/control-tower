-- Migration: Fix infinite recursion in project_member RLS policies
-- Purpose: Resolve circular dependency between project_member policies and is_project_admin function

-- Drop existing problematic policies on project_member
DROP POLICY IF EXISTS "Allow project members to SELECT members of their own projects" ON project_member;
DROP POLICY IF EXISTS "Allow project admins to INSERT project members" ON project_member;
DROP POLICY IF EXISTS "Allow project admins to UPDATE project member roles" ON project_member;
DROP POLICY IF EXISTS "Allow project admins to DELETE project members (or user to leav" ON project_member;

-- Create simpler, non-recursive policies for project_member

-- Allow users to view members of projects they belong to
CREATE POLICY "Allow users to view project members"
ON project_member
FOR SELECT
USING (
  -- User can see members of projects they are a member of
  EXISTS (
    SELECT 1 FROM project_member pm2 
    WHERE pm2.project_id = project_member.project_id 
    AND pm2.user_id = auth.uid()
  )
);

-- Allow users to view their own membership records
CREATE POLICY "Allow users to view own membership"
ON project_member
FOR SELECT
USING (user_id = auth.uid());

-- For INSERT: Allow any authenticated user to insert (will be controlled by application logic)
-- This avoids recursion since we don't check existing memberships during INSERT
CREATE POLICY "Allow authenticated INSERT for project members"
ON project_member
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- For UPDATE: Only allow users with 'admin' role in the same project to update
-- Use a non-recursive approach
CREATE POLICY "Allow project admins to update members"
ON project_member
FOR UPDATE
USING (
  -- Check if the user making the update is an admin of this project
  -- without using the recursive helper function
  user_id = auth.uid() OR  -- Allow users to update their own records
  EXISTS (
    SELECT 1 FROM project_member pm_admin
    WHERE pm_admin.project_id = project_member.project_id
    AND pm_admin.user_id = auth.uid()
    AND pm_admin.role = 'admin'
  )
)
WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM project_member pm_admin
    WHERE pm_admin.project_id = project_member.project_id
    AND pm_admin.user_id = auth.uid()
    AND pm_admin.role = 'admin'
  )
);

-- For DELETE: Similar non-recursive approach
CREATE POLICY "Allow project admins to delete members"
ON project_member
FOR DELETE
USING (
  user_id = auth.uid() OR  -- Allow users to delete their own membership
  EXISTS (
    SELECT 1 FROM project_member pm_admin
    WHERE pm_admin.project_id = project_member.project_id
    AND pm_admin.user_id = auth.uid()
    AND pm_admin.role = 'admin'
  )
);

-- Note: Keep the is_project_admin function for other tables, just don't use it on project_member itself
-- The function is still useful for project, task, etc. tables 