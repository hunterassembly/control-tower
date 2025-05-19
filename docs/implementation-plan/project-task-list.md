# Project Task List

**Branch Name:** `feature/project-task-list`

## Background and Motivation
Within a project, tasks flow across statuses. This kanban-esque list is the heartbeat of daily work for Designers and PMs.

## Key Challenges and Analysis
1. Efficiently fetching potentially hundreds of tasks while keeping initial load ≤200 ms.
2. Implementing section collapse/expand with localStorage memory per user.
3. Supporting drag-to-move (desktop) and button move (mobile) without two code paths.

## High-level Task Breakdown
- [ ] **(1)** Create branch `feature/project-task-list` off `main`.
- [ ] **(2)** Build `/projects/[id]/tasks` route; scaffold sections Backlog → Closed.
- [ ] **(3)** Fetch tasks via React Query; paginate or lazy load per section >100 tasks.
- [ ] **(4)** Implement drag & drop using `@dnd-kit` (lightweight) fallback to buttons for ≤768px.
- [ ] **(5)** Persist status move via Supabase RPC; update timeline ("Status changed").
- [ ] **(6)** Bulk move action via checkbox select & overflow menu.
- [ ] **(7)** Supabase Realtime subscription for tasks updates/moves by others.

### Acceptance Criteria
1. Moving a task locally updates UI instantly and DB row within 500 ms.
2. Status menu only shows valid next states (per PRD).
3. Clients cannot move tasks to statuses beyond their permission.

## Project Status Board
- [ ] Planning ✅
- [ ] Branch created
- [ ] Sections rendered
- [ ] Drag & move works
- [ ] Bulk move works
- [ ] Realtime updates
- [ ] Ready for merge

## Current Status / Progress Tracking
*(empty)*

## Executor's Feedback or Assistance Requests
*(empty)*

--- 