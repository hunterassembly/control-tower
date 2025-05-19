# Update Approval Flow

**Branch Name:** `feature/update-approval-flow`

## Background and Motivation
Clients need an ultra-simple approve / request-edits flow. Approved updates close tasks automatically when all updates pass.

## Key Challenges and Analysis
1. Ensuring only the Client role can approve while Designer/Admin can't self-approve.
2. Avoiding race conditions when multiple updates exist; auto-close only when all approved.
3. Slack & email hooks firing exactly once upon final approval.

## High-level Task Breakdown
- [ ] **(1)** Create branch `feature/update-approval-flow` off `main`.
- [ ] **(2)** Build Update Detail Drawer overlay with approve & request-edits buttons.
- [ ] **(3)** On approve click, update `task_update.status` → approved; insert timeline row.
- [ ] **(4)** DB trigger / edge function checks if all updates approved → set task status closed.
- [ ] **(5)** Send Slack notification & Postmark email on auto-close.
- [ ] **(6)** Implement optimistic UI and error rollback.

### Acceptance Criteria
1. Client sees Approve button; Designer/Admin do not.
2. Approving last update auto-closes task and changes column in list view within 1s.
3. Slack and email hooks fire once and contain correct task metadata.

## Project Status Board
- [ ] Planning ✅
- [ ] Branch created
- [ ] Drawer UI done
- [ ] DB trigger done
- [ ] Hooks fire
- [ ] Ready for merge

## Current Status / Progress Tracking
*(empty)*

## Executor's Feedback or Assistance Requests
*(empty)*

--- 