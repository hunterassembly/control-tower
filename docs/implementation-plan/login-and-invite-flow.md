# Login & Invite Flow

**Branch Name:** `feature/login-and-invite-flow`

## Background and Motivation
Authentication is the literal front door. Supabase magic-link flow plus invite-token redemption must be bullet-proof before anyone can even see the app.

## Key Challenges and Analysis
1. Handling Supabase email magic-link in both web and mobile widths without weird flashes.
2. Securely encoding invite metadata (project ID, role) in the token and cleaning up invalid / expired tokens.
3. Ensuring the UX gracefully handles auth errors (expired link, already accepted, etc.).

## High-level Task Breakdown
- [ ] **(1)** Create branch `feature/login-and-invite-flow` off `main`.
- [ ] **(2)** Add `/login` route with centered card layout using shadcn/ui.
- [ ] **(3)** Implement magic-link sign-in via Supabase JS client.
- [ ] **(4)** Create `invite_token` table in Supabase with columns (id, email, project_id, role, expires_at, voided).
- [ ] **(5)** Edge function to generate tokens, send Postmark email (stubbed for now).
- [ ] **(6)** On successful auth, check `invite_token` validity, insert `project_member` row, mark token used.
- [ ] **(7)** Add happy-path redirect to `/projects` and error states banner.
- [ ] **(8)** Configure Slack notification stub for new invites (placeholder).

### Acceptance Criteria
1. Entering email triggers magic link email (seen in Supabase Auth logs).
2. Clicking link redirects to app, verifies token, adds membership, then routes to `/projects`.
3. Invalid or expired token shows inline error without crashing.

## Project Status Board
- [ ] Planning ✅
- [ ] Branch created
- [ ] Magic link works
- [ ] Invite redemption works
- [ ] Error UX polished
- [ ] Ready for merge

## Current Status / Progress Tracking
*(empty – Executor will fill)*

## Executor's Feedback or Assistance Requests
*(empty)*

--- 