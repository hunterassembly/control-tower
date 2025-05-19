# Projects Dashboard

**Branch Name:** `feature/projects-dashboard`

## Background and Motivation
Admins and Designers need a bird's-eye view of all projects to jump between them quickly and create new ones. This dashboard is also the first post-login screen for most users.

## Key Challenges and Analysis
1. Implementing optimistic UI when creating/caching a new project card via React Query.
2. Handling RLS visibility: Clients should see only their projects, Admins see all.
3. Creating a responsive grid that handles up to ~50 projects gracefully.

## High-level Task Breakdown
- [ ] **(1)** Create branch `feature/projects-dashboard` off `main`.
- [ ] **(2)** Build `/projects` route with responsive grid using Tailwind + shadcn `Card`.
- [ ] **(3)** Fetch projects via Supabase RPC that respects RLS; hook into React Query.
- [ ] **(4)** Implement `+ New Project` modal for Admins only; validate required fields (name, client).
- [ ] **(5)** On create, insert `project` row and update cache optimistically.
- [ ] **(6)** Wire Supabase Realtime subscription to auto-add cards created by others.
- [ ] **(7)** Empty state design for new users with "Create your first project".

### Acceptance Criteria
1. Grid loads ≤200 ms (local dev) and matches Figma spec.
2. Creating a project shows card instantly and database row exists.
3. Clients only see projects where they are a `project_member`.

## Project Status Board
- [ ] Planning ✅
- [ ] Branch created
- [ ] Grid & fetch done
- [ ] New project modal done
- [ ] Realtime subscription done
- [ ] Ready for merge

## Current Status / Progress Tracking
*(empty)*

## Executor's Feedback or Assistance Requests
*(empty)*

--- 