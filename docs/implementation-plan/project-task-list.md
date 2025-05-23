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
- [x] ✅ Planning
- [x] ✅ Branch created 
- [x] ✅ Core navigation structure
- [ ] Task data fetching
- [ ] Basic task cards
- [ ] Expandable interactions
- [ ] Context menus & actions
- [ ] Drag & drop reordering
- [ ] Update notifications
- [ ] Approval workflow  
- [ ] Real-time updates
- [ ] Search & filtering
- [ ] Mobile responsive
- [ ] Ready for merge

## Current Status / Progress Tracking
- **✅ Analysis Complete**: Detailed UI breakdown from screenshot completed
- **✅ Plan Updated**: Comprehensive 28-task implementation plan created
- **✅ Schema Validation Complete**: Database schema analysis shows excellent alignment
- **✅ Design System Complete**: Comprehensive OffMenu design system created in globals.css
- **✅ PHASE 1 COMPLETE**: Core structure and navigation implemented (Tasks 1-5)
  - ✅ Branch `feature/project-task-list` created
  - ✅ `/projects/[id]` main project page route built 
  - ✅ Project header with tab navigation (Tasks/Overview/Assets)
  - ✅ User controls (notifications, settings, profile icons)
  - ✅ Task sections layout (In Progress, Up Next, Backlog) with placeholders
  - ✅ OffMenu design system classes added to globals.css
  - ✅ Committed: b8f5b8b "feat: Phase 1 complete - Core project page structure"
- **🚀 STARTING PHASE 2**: Ready for Task Data & Basic Display (Tasks 6-10)

## Executor's Feedback or Assistance Requests
*(empty)*

--- 