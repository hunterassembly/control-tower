-- Migration: Create invite_token table and RLS policies
-- Purpose: Support invite token generation and redemption for user invitations

-- Create the invite_token table
CREATE TABLE public.invite_token (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    email TEXT,
    project_id uuid NOT NULL REFERENCES public.project(id) ON DELETE CASCADE,
    role project_role_enum NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    used_at TIMESTAMPTZ,
    voided_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX idx_invite_token_token ON public.invite_token(token);
CREATE INDEX idx_invite_token_project_id ON public.invite_token(project_id);
CREATE INDEX idx_invite_token_email ON public.invite_token(email);
CREATE INDEX idx_invite_token_expires_at ON public.invite_token(expires_at);

-- Enable RLS
ALTER TABLE public.invite_token ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin of a project
CREATE OR REPLACE FUNCTION public.is_project_admin(target_project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.project_member 
        WHERE project_id = target_project_id 
        AND user_id = auth.uid() 
        AND role = 'admin'
    );
$$;

-- RLS Policy: Admins can manage all invite tokens for their projects
CREATE POLICY "Admins can manage invite tokens for their projects"
ON public.invite_token
FOR ALL
USING (public.is_project_admin(project_id))
WITH CHECK (public.is_project_admin(project_id));

-- RLS Policy: Anyone can SELECT invite tokens by token string (for redemption)
-- This allows the consume-invite-token function to work
CREATE POLICY "Allow token lookup for redemption"
ON public.invite_token
FOR SELECT
USING (token IS NOT NULL);

-- RLS Policy: System/functions can update invite tokens (for marking as used)
-- This will be used by Edge Functions
CREATE POLICY "System can update invite tokens"
ON public.invite_token
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE public.invite_token IS 'Stores invitation tokens for project member invitations';
COMMENT ON COLUMN public.invite_token.token IS 'Unique, secure token string used in invite URLs';
COMMENT ON COLUMN public.invite_token.email IS 'Optional: pre-populate email if known';
COMMENT ON COLUMN public.invite_token.expires_at IS 'Token expiry timestamp';
COMMENT ON COLUMN public.invite_token.used_at IS 'Timestamp when token was successfully redeemed';
COMMENT ON COLUMN public.invite_token.voided_at IS 'Timestamp when token was manually voided by admin'; 