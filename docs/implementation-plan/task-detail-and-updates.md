# Task Detail & Updates

**Branch Name:** `feature/task-detail-and-updates`

## Background and Motivation
Designers attach Loom videos, Figma links, and files to tasks. Clients review them in the task detail page. A smooth flow here means fewer "Where's the latest file?" messages.

## Key Challenges and Analysis
1. Multi-file upload with Supabase Storage + signed URLs, progress feedback.
2. Ensuring embeds (Figma, Loom) render responsively and securely (CSP).
3. Synchronizing task timeline entries with uploads/edits for immutable audit.

## High-level Task Breakdown
- [ ] **(1)** Create branch `feature/task-detail-and-updates` off `main`.
- [ ] **(2)** Scaffold `/tasks/[taskId]` split layout (70/30) with sticky RHS timeline.
- [ ] **(3)** Build "Add Update" modal with fields: summary, Loom URL, Figma URL, file dropzone.
- [ ] **(4)** Upload files to Supabase Storage using `react-dropzone`, display thumbnails.
- [ ] **(5)** On save, insert `task_update` row(s) + `task_asset` rows; set status=waiting.
- [ ] **(6)** Push timeline entry "Update submitted" with payload JSON.
- [ ] **(7)** Implement edit/replace asset flow (Designer only) with versioning placeholder.

### Acceptance Criteria
1. Upload supports multiple files up to 1GB each, progress bar visible.
2. Updates appear under Task › Updates list immediately via React Query cache.
3. Timeline entry matches DB payload; no hard deletes occur.

## Project Status Board
- [ ] Planning ✅
- [ ] Branch created
- [ ] Layout done
- [ ] Update modal done
- [ ] Uploads + Storage done
- [ ] Timeline logging done
- [ ] Ready for merge

## Current Status / Progress Tracking
*(empty)*

## Executor's Feedback or Assistance Requests
*(empty)*

--- 