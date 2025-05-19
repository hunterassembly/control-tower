# Notifications & Role Guards

**Branch Name:** `feature/notifications-and-role-guards`

## Background and Motivation
Automated Slack & email notifications keep stakeholders looped in, while UI role guards ensure users only see what they should.

## Key Challenges and Analysis
1. Avoiding noisy duplicate notifications on rapid status changes.
2. Implementing centralized role guard HOC / middleware to simplify page protection.
3. Securely storing Slack webhook URLs and email templates.

## High-level Task Breakdown
- [ ] **(1)** Create branch `feature/notifications-and-role-guards` off `main`.
- [ ] **(2)** Build shared `useRoleGuard()` hook that redirects unauthorized users.
- [ ] **(3)** Edge function for Slack hooks: task closed, update submitted.
- [ ] **(4)** Postmark email templates: invite, update-approved, task-closed.
- [ ] **(5)** Throttle duplicate triggers (e.g., by debounce within Edge function).
- [ ] **(6)** Integrate hooks within respective slices (task list, update approval).

### Acceptance Criteria
1. Unauthorized users hitting a page get redirected to `/projects` with toast.
2. Slack message appears in channel exactly once per event; contents match task data.
3. Emails get logged in Supabase for audit with delivery status.

## Project Status Board
- [ ] Planning ✅
- [ ] Branch created
- [ ] Role guard hook done
- [ ] Slack function done
- [ ] Email templates done
- [ ] Integration done
- [ ] Ready for merge

## Current Status / Progress Tracking
*(empty)*

## Executor's Feedback or Assistance Requests
*(empty)*

--- 