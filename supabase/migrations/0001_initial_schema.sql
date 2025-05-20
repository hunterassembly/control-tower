-- Define enums:
CREATE TYPE task_status_enum AS ENUM ('Backlog', 'Up Next', 'In Progress', 'Viewed', 'Waiting', 'Revising', 'Approved', 'Closed');
CREATE TYPE task_update_status_enum AS ENUM ('waiting', 'approved', 'revising');
CREATE TYPE project_role_enum AS ENUM ('admin', 'designer', 'client');

-- CREATE TABLE organization
CREATE TABLE organization (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CREATE TABLE project
CREATE TABLE project (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid REFERENCES organization(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CREATE TABLE project_member
CREATE TABLE project_member (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES project(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role project_role_enum NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (project_id, user_id)
);

-- CREATE TABLE task
CREATE TABLE task (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES project(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status task_status_enum DEFAULT 'Backlog'::task_status_enum NOT NULL,
    assignee_id uuid REFERENCES auth.users(id), -- Nullable
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CREATE TABLE task_update
CREATE TABLE task_update (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id uuid REFERENCES task(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id),
    summary TEXT,
    status task_update_status_enum DEFAULT 'waiting'::task_update_status_enum NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CREATE TABLE task_comment
CREATE TABLE task_comment (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    task_update_id uuid REFERENCES task_update(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CREATE TABLE task_asset
CREATE TABLE task_asset (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    task_update_id uuid REFERENCES task_update(id) ON DELETE CASCADE,
    uploader_id uuid REFERENCES auth.users(id),
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    mime_type TEXT,
    size BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CREATE TABLE timeline
CREATE TABLE timeline (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES project(id) ON DELETE CASCADE,
    task_id uuid REFERENCES task(id) ON DELETE CASCADE, -- Nullable by default
    user_id uuid REFERENCES auth.users(id), -- Nullable by default
    event_type TEXT NOT NULL,
    payload JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Add basic indexes on foreign keys and frequently queried columns
CREATE INDEX IF NOT EXISTS idx_project_organization_id ON project(organization_id);
CREATE INDEX IF NOT EXISTS idx_project_member_project_id ON project_member(project_id);
CREATE INDEX IF NOT EXISTS idx_project_member_user_id ON project_member(user_id);
CREATE INDEX IF NOT EXISTS idx_task_project_id ON task(project_id);
CREATE INDEX IF NOT EXISTS idx_task_status ON task(status);
CREATE INDEX IF NOT EXISTS idx_task_assignee_id ON task(assignee_id);
CREATE INDEX IF NOT EXISTS idx_task_update_task_id ON task_update(task_id);
CREATE INDEX IF NOT EXISTS idx_task_update_user_id ON task_update(user_id);
CREATE INDEX IF NOT EXISTS idx_task_comment_task_update_id ON task_comment(task_update_id);
CREATE INDEX IF NOT EXISTS idx_task_comment_user_id ON task_comment(user_id);
CREATE INDEX IF NOT EXISTS idx_task_asset_task_update_id ON task_asset(task_update_id);
CREATE INDEX IF NOT EXISTS idx_task_asset_uploader_id ON task_asset(uploader_id);
CREATE INDEX IF NOT EXISTS idx_timeline_project_id ON timeline(project_id);
CREATE INDEX IF NOT EXISTS idx_timeline_task_id ON timeline(task_id);
CREATE INDEX IF NOT EXISTS idx_timeline_user_id ON timeline(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_event_type ON timeline(event_type);

-- Implement updated_at auto-update triggers for relevant tables
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to 'task' table
CREATE TRIGGER set_task_updated_at
BEFORE UPDATE ON task
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp(); 