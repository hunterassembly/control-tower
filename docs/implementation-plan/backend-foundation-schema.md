# Backend Foundation & Schema

**Branch Name:** `feature/backend-foundation-schema`

## Background and Motivation
The entire MVP rests on a solid database schema, RLS policies, and a bootstrapped Next.js + Supabase project. Getting this done first unblocks every other slice and lets the Executor avoid re-plumbing stuff later.

## Key Challenges and Analysis
1. Designing tables that match the PRD's data model while staying tiny for MVP scope. This includes:
    - `organization`: Minimal, likely just `id`, `name`. (Future: multi-tenancy)
    - `project`: `id`, `name`, `organization_id`, `created_at`.
    - `task`: `id`, `project_id`, `title`, `description`, `status` (enum: Backlog, Up Next, In Progress, Viewed, Waiting, Revising, Approved, Closed), `assignee_id` (nullable, `user_id`), `created_at`, `updated_at`.
    - `task_update`: `id`, `task_id`, `user_id`, `summary`, `status` (enum: waiting, approved, revising), `created_at`.
    - `task_comment`: `id`, `task_update_id`, `user_id`, `content`, `created_at`. (Stretch: link directly to task if not under an update?)
    - `task_asset`: `id`, `task_update_id` (or `task_id` if assets can be independent of updates), `uploader_id` (`user_id`), `file_name`, `storage_path`, `mime_type`, `size`, `created_at`.
    - `timeline`: `id`, `project_id` (or `task_id` for finer grain), `user_id` (optional, for system events), `event_type` (e.g., 'task_created', 'status_changed', 'update_submitted', 'asset_uploaded'), `payload` (JSONB for event details), `timestamp`. PRD: "Insert-only timeline table; no hard deletes".
    - `project_member`: `id`, `project_id`, `user_id`, `role` (enum: admin, designer, client), `created_at`. This table is CRITICAL for RLS.
    - `user_profiles`: (Implicitly managed by Supabase Auth, but we'll need a `profiles` table for `user_id`, `full_name`, `avatar_url` if not using Supabase's built-in metadata extensively). PRD implies we link users to tasks/comments.
2. Crafting least-privilege RLS policies for Admin, Designer, Client roles. Examples:
    - `project`: Admins SELECT all. Designers/Clients SELECT if `project_member` entry exists for them. Admins INSERT. No one UPDATEs/DELETEs projects via RLS (use functions).
    - `task`: SELECT if member of project. INSERT by Admins/Designers. UPDATE status/assignee based on role and current status (e.g., Client can move Viewed -> Waiting).
    - `task_asset`: SELECT if member of project. INSERT by Designers. DELETE by uploader or Admin.
    - `timeline`: SELECT if member of project. INSERT by system/functions triggered by user actions. NO UPDATE/DELETE.
    - `project_member`: SELECT by Admins or self. INSERT/UPDATE/DELETE by Admins (or self for leaving project - out of MVP scope?).
3. Automating migrations via `supabase db push` in CI so we never diverge. Ensure migration files are clearly named and atomic.
4. Wiring up CI/CD early to catch TypeScript and linting errors on every PR.
5. Ensuring all tables have `created_at` and `updated_at` (where applicable) timestamps, managed by Postgres defaults.
6. UUIDs for all primary keys (`id`) for obscurity and to prevent enumeration attacks.

## High-level Task Breakdown
- [x] **(1)** Create branch `feature/backend-foundation-schema` off `main`.
- [x] **(2)** Scaffold Next.js 14 app (app router) with TypeScript, TailwindCSS, shadcn/ui, ESLint, Prettier, **NPM**. (Verified existing setup largely matches this; proceeding with NPM and existing icon library Lucide as per user confirmation).
- [x] **(3)** Add Supabase CLI; `supabase init`, `supabase link --project-ref uzdsldwwmbshxfvtfmrg`. Verified `auth` schema baseline is acknowledged by linked project.
- [x] **(4)** Model core tables. Created migration file `supabase/migrations/0001_initial_schema.sql` and applied it successfully to local Supabase instance after resolving initial issues.
    - Define enums: `task_status_enum`, `task_update_status_enum`, `project_role_enum`.
    - `CREATE TABLE organization (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, name TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());`
    - `CREATE TABLE project (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, organization_id uuid REFERENCES organization(id), name TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());`
    - `CREATE TABLE project_member (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, project_id uuid REFERENCES project(id) ON DELETE CASCADE, user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, role project_role_enum NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE (project_id, user_id));`
    - `CREATE TABLE task (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, project_id uuid REFERENCES project(id) ON DELETE CASCADE, title TEXT NOT NULL, description TEXT, status task_status_enum DEFAULT 'Backlog'::task_status_enum NOT NULL, assignee_id uuid REFERENCES auth.users(id), created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());`
    - `CREATE TABLE task_update (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, task_id uuid REFERENCES task(id) ON DELETE CASCADE, user_id uuid REFERENCES auth.users(id), summary TEXT, status task_update_status_enum DEFAULT 'waiting'::task_update_status_enum NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());`
    - `CREATE TABLE task_comment (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, task_update_id uuid REFERENCES task_update(id) ON DELETE CASCADE, user_id uuid REFERENCES auth.users(id), content TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());`
    - `CREATE TABLE task_asset (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, task_update_id uuid REFERENCES task_update(id) ON DELETE CASCADE, uploader_id uuid REFERENCES auth.users(id), file_name TEXT NOT NULL, storage_path TEXT NOT NULL UNIQUE, mime_type TEXT, size BIGINT, created_at TIMESTAMPTZ DEFAULT NOW());`
    - `CREATE TABLE timeline (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, project_id uuid REFERENCES project(id) ON DELETE CASCADE, task_id uuid REFERENCES task(id) ON DELETE CASCADE NULLABLE, user_id uuid REFERENCES auth.users(id) NULLABLE, event_type TEXT NOT NULL, payload JSONB, timestamp TIMESTAMPTZ DEFAULT NOW());`
    - Add basic indexes on foreign keys and frequently queried columns (e.g., `task.project_id`, `task.status`).
    - Implement `updated_at` auto-update triggers for relevant tables (e.g., `task`).
- [x] **(5)** Write RLS policies. Created migration file `supabase/migrations/0002_rls_policies.sql` and applied it successfully to local Supabase instance.
    - Enable RLS for all tables: `ALTER TABLE public.organization ENABLE ROW LEVEL SECURITY;` (repeat for all).
    - `project`:
        - Admins: `CREATE POLICY "Allow admin full access on projects" ON project FOR ALL USING (get_my_claim('user_role')::text = 'admin');` (Requires helper `get_my_claim` or similar, or join with `project_member` if 'admin' is a role there). For MVP, assume 'admin' is a global concept or tied to `organization_member` not yet defined. Simpler: `USING (true)` for admins if we assume a trusted admin role from JWT. PRD mentions "Role-based security (Admin / Client / Designer)" linked to `project_member`.
        - Members: `CREATE POLICY "Allow project members to SELECT their projects" ON project FOR SELECT USING (EXISTS (SELECT 1 FROM project_member pm WHERE pm.project_id = id AND pm.user_id = auth.uid()));`
        - Admins for INSERT: `CREATE POLICY "Allow admins to INSERT projects" ON project FOR INSERT WITH CHECK ((SELECT role FROM project_member WHERE user_id = auth.uid() AND project_id = id) = 'admin');` (Adjust if Admins are global or org-level)
    - `project_member`:
        - Admins SELECT all for their projects: `CREATE POLICY "Admins can SELECT project_members for their projects" ON project_member FOR SELECT USING (is_project_admin(project_id));` (Requires `is_project_admin` helper function).
        - Users SELECT self: `CREATE POLICY "Users can SELECT their own project_member entry" ON project_member FOR SELECT USING (user_id = auth.uid());`
        - Admins INSERT/UPDATE/DELETE: (Similar to above, with `is_project_admin` helper)
    - `task`:
        - Members SELECT: `CREATE POLICY "Allow project members to SELECT tasks" ON task FOR SELECT USING (EXISTS (SELECT 1 FROM project_member pm WHERE pm.project_id = task.project_id AND pm.user_id = auth.uid()));`
        - Designers/Admins INSERT: `CREATE POLICY "Allow Designers/Admins to INSERT tasks" ON task FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM project_member pm WHERE pm.project_id = task.project_id AND pm.user_id = auth.uid() AND (pm.role = 'designer' OR pm.role = 'admin')));`
        - UPDATE (complex, break down by specific fields/status transitions later, e.g., "Clients can update status from Viewed to Waiting"). Start with broader "Members can update tasks": `CREATE POLICY "Allow project members to UPDATE tasks" ON task FOR UPDATE USING (EXISTS (SELECT 1 FROM project_member pm WHERE pm.project_id = task.project_id AND pm.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM project_member pm WHERE pm.project_id = task.project_id AND pm.user_id = auth.uid()));`
    - `task_update`, `task_comment`, `task_asset`: Similar logic to `task` - SELECT for project members, INSERT by appropriate roles (Designer/Admin for updates/assets, any member for comments). DELETE for assets by uploader/Admin.
    - `timeline`:
        - Members SELECT: `CREATE POLICY "Allow project members to SELECT timeline events" ON timeline FOR SELECT USING (EXISTS (SELECT 1 FROM project_member pm WHERE pm.project_id = timeline.project_id AND pm.user_id = auth.uid()));`
        - INSERT (ALLOW ALL or from specific functions): `CREATE POLICY "Allow all authenticated to INSERT timeline events" ON timeline FOR INSERT WITH CHECK (auth.role() = 'authenticated');` (To be locked down via functions later).
    - Define helper functions like `is_project_member(project_id uuid, user_role project_role_enum)` and `is_project_admin(project_id uuid)` in a separate migration or preamble to RLS.
- [x] **(6)** Seed initial data script. Created `supabase/migrations/0003_seed_data.sql` and applied it, populating the local DB with an organization, project, project members (using provided UUIDs), and sample tasks.
    - Create one `organization`.
- [x] **(7)** Add GitHub Actions workflow: Created `.github/workflows/ci.yml` to install dependencies (npm), run lint, run tests (placeholder), and perform `supabase db push --dry-run`. User needs to configure `SUPABASE_ACCESS_TOKEN` and `SUPABASE_CI_DB_PASSWORD` secrets in GitHub.
- [ ] **(8)** Verify local build, run API smoke tests (manual for now), commit & push all `supabase/migrations` and `.github/workflows/ci.yml`; open Draft PR.

### Acceptance Criteria
1. Running `pnpm dev` boots a Next.js app without errors.
1. Running `npm run dev` boots a Next.js app without errors.
2. `supabase test` passes all RLS tests for each role.
3. GitHub Actions shows green for lint, type-check, and db push dry-run.

## Project Status Board
- [x] Planning ✅ _(you're here, and now it's more planned!)_
- [x] Branch created
- [x] Schema & RLS done
- [ ] CI pipeline passes
- [ ] Ready for merge

## Current Status / Progress Tracking
- [2025-05-19]: Switched to Executor mode.
- Created branch `feature/backend-foundation-schema` off `main`.
- Analyzed existing codebase. Confirmed Next.js, TypeScript, Tailwind, shadcn/ui, ESLint, Prettier are already set up with NPM. User approved using existing NPM setup and Lucide icons, updating plan accordingly.
- Initialized Supabase project locally (`supabase init`).
- Linked local project to remote Supabase project `uzdsldwwmbshxfvtfmrg` (`supabase link`). Confirmed baseline `auth` schema is recognized.
- Created `supabase/migrations/0001_initial_schema.sql` with core table definitions.
- Successfully started local Supabase services and applied `0001_initial_schema.sql` migration after troubleshooting port conflicts and a problematic auto-generated auth migration.
- Created `supabase/migrations/0002_rls_policies.sql` with RLS policies for all tables and successfully applied it to the local database.
- Created and applied `supabase/migrations/0003_seed_data.sql` to populate the database with initial sample data for organization, project, members, and tasks.
- Defined GitHub Actions workflow in `.github/workflows/ci.yml` for linting, testing (placeholder), and Supabase dry-run. Awaiting secret configuration by user.

## Executor's Feedback or Assistance Requests
- User needs to configure `SUPABASE_ACCESS_TOKEN` and `SUPABASE_CI_DB_PASSWORD` secrets in the GitHub repository for the CI workflow to function correctly.
- User should review the `npm test` script in `package.json` and ensure it passes or is a suitable placeholder.

--- 