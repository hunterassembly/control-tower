# Admin Invites

**Branch Name:** `feature/admin-invites`

## Background and Motivation
Admins must be able to generate, resend, and void invite tokens to onboard clients/designers quickly.

## Key Challenges and Analysis
1. Preventing token spam via rate limiting or debounce.
2. Handling resend and void logic cleanly in the edge function.
3. Table + drawer UX that scales to dozens of pending invites.

## High-level Task Breakdown
- [ ] **(1)** Create branch `feature/admin-invites` off `main`.
- [ ] **(2)** Build `/admin/invites` route with table of tokens (status, role, email, created, expires).
- [ ] **(3)** Drawer to create new token (email, project, role, expiry) and call edge function.
- [ ] **(4)** Resend button triggers email send again, marks `last_sent_at`.
- [ ] **(5)** Void button sets `voided=true` and grey's out row.
- [ ] **(6)** Real-time table refresh via channel subscription.

### Acceptance Criteria
1. Creating token inserts row, sends email, and appears in table instantly.
2. Voided token cannot be redeemed (checked in login flow).
3. Resend logs new `last_sent_at` timestamp and sends email.

## Project Status Board
- [ ] Planning ✅
- [ ] Branch created
- [ ] Table UI done
- [ ] Token create works
- [ ] Resend & void work
- [ ] Ready for merge

## Current Status / Progress Tracking
*(empty)*

## Executor's Feedback or Assistance Requests
*(empty)*

--- 