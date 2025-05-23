# Login & Invite Flow

**Branch Name:** `feature/login-and-invite-flow`

## Background and Motivation
Authentication is the literal front door to our shiny new platform. This slice focuses on implementing the Supabase magic-link email authentication, which is a non-negotiable as per the PRD. Crucially, it also covers the invite token redemption flow. As the PRD states, "Only invited project_member rows grant visibility," so this mechanism is key to ensuring users are correctly permissioned and land in the right place after their first sign-in. Getting this right ensures a smooth onboarding experience and upholds our security model from day one.

## Key Challenges and Analysis
1.  Implementing a seamless Supabase email magic-link flow. This needs to work flawlessly across different devices and handle various states (e.g., link clicked in different browser, expired links). The PRD specifies this must be "magic-link sign-in; invite token redemption" on the `/login` route.
2.  Designing and implementing a secure invite token system. This involves:
    *   Securely generating tokens that are hard to guess.
    *   Encoding necessary metadata (e.g., `project_id`, `role`, `email`) within the token or linking it securely in the database.
    *   Defining the lifecycle of a token: creation, pending, used, expired, voided.
    *   Ensuring robust Row Level Security (RLS) on the `invite_token` table itself. For example, only Admins should be able to create tokens, and perhaps void them.
3.  Graceful UX for all authentication and invitation scenarios:
    *   Successful magic link sign-in (with and without an invite).
    *   Successful invite token redemption.
    *   Error handling: expired magic link, invalid/expired/used invite token, user already a member, etc. Clear messaging is key.
4.  Handling users who authenticate via magic link but do *not* have an invite token and are not yet members of any project. According to the PRD ("Only invited project_member rows grant visibility"), these users should likely be firewalled or shown a specific "pending invitation" page rather than accessing `/projects`.
5.  Integrating with Postmark for sending invite emails, as per PRD requirements for "Email + Slack notifications." This means not just stubbing it but actually sending the emails.

## High-level Task Breakdown
*Remember to commit frequently after each sub-task is verified!*

- [ ] **(1)** Create branch `feature/login-and-invite-flow` off `main` (if not already done from a previous attempt). Success: Branch exists locally and is pushed to remote.
- [ ] **(2)** Create the `invite_token` table in Supabase. 
    - Columns: `id` (UUID, PK), `token` (TEXT, unique, indexed, securely generated), `email` (TEXT, to pre-fill if known), `project_id` (UUID, FK to `project`), `role` (`project_role_enum`), `expires_at` (TIMESTAMPTZ), `created_at` (TIMESTAMPTZ, default NOW()), `used_at` (TIMESTAMPTZ, nullable), `voided_at` (TIMESTAMPTZ, nullable).
    - Add RLS: Admins can do anything. Users/system can only read/use tokens if they have the token string (for redemption). Deny all by default.
    - Success: Migration file created and applied. RLS tested (manually for now).
- [ ] **(3)** Develop the `/login` page UI (Next.js App Router). 
    - Use shadcn/ui for a centered card layout as per PRD.
    - Include an email input field and a "Send Magic Link" button.
    - Include a designated area for displaying success/error messages related to login and invite redemption.
    - Success: Page renders correctly, form elements are present. No Supabase logic yet.
- [ ] **(4)** Implement Supabase magic-link sign-in client-side logic on the `/login` page.
    - On button click, call `supabase.auth.signInWithOtp()` with the email.
    - Display feedback to the user (e.g., "Check your email for the magic link!").
    - Handle Supabase `onAuthStateChange` to detect when the user has successfully signed in after clicking the link.
    - Success: User can enter email, trigger Supabase OTP, receive email (check Supabase logs/actual email), click link, and `onAuthStateChange` fires indicating authentication.
- [ ] **(5)** Implement client-side logic to handle invite token redemption upon successful authentication.
    - After `onAuthStateChange` indicates a successful sign-in, check if an `invite_token` is present in the URL query parameters.
    - If a token is present, make a call to a new Supabase Edge Function (see next task) to validate and consume the token.
    - Success: Invite token is correctly extracted from the URL.
- [ ] **(6)** Create Supabase Edge Function: `consume-invite-token`.
    - Input: `invite_token` (string).
    - Logic:
        1.  Verify the current user is authenticated.
        2.  Find the `invite_token` record in the database where `token` matches, `used_at` IS NULL, `voided_at` IS NULL, and `expires_at` > NOW().
        3.  If valid: 
            a.  Create a `project_member` record with `user_id = auth.uid()`, `project_id`, and `role` from the token. Handle potential race conditions or if user is already a member.
            b.  Mark the `invite_token` as used (`used_at = NOW()`).
            c.  Return success (e.g., project details or just a confirmation).
        4.  If invalid (not found, used, voided, expired), return an appropriate error status/message.
    - Success: Function deploys. Can be called with a valid token (manually created for now) and it creates `project_member` and marks token used. Invalid tokens return errors.
- [ ] **(7)** Client-side: Handle response from `consume-invite-token` Edge Function.
    - If successful redemption: Redirect user to `/projects/[id]` (if project ID available) or `/projects`.
    - If error from function (e.g., token invalid): Display clear error message on `/login` page.
    - If no invite token was in URL: Check if user is already a member of any project. If yes, redirect to `/projects`. If no (new user, no invite), display a message like "Login successful. Awaiting project invitation." (or redirect to a dedicated waiting page).
    - Success: User is redirected correctly based on invite token status and existing memberships. Errors are shown clearly.

- [ ] **(8)** Implement Admin functionality for generating invite tokens. 
    *   **User Input Needed**: For MVP, shall we implement a full Admin UI (Table + Drawer as per PRD) for generating tokens, or is a Supabase Edge Function callable by an admin (e.g., via a script or manual Supabase Studio call) sufficient to unblock other flows? The PRD mentions "Admin › Invites Table + Drawer Generate token (role, project), void/resend". A full UI is more work for this slice.
    *   If minimal approach: Create a Supabase Edge Function `generate-invite-token`.
        *   Input: `email` (optional), `project_id`, `role`, `expires_in_hours` (optional, e.g., default 72h).
        *   Protected: Only callable by users with an 'admin' role (check custom claims or `project_member` role on a master/admin project).
        *   Logic: Generate a secure unique token string. Store token details in `invite_token` table. Return the full invite URL (e.g., `https://<app-url>/login?invite_token=<token>`).
        *   Success (minimal): Function deploys. Admin can call it, token is created in DB, invite URL is returned.
    *   If full UI: This would involve new routes/components for Admins, a table to list existing tokens, forms to create them, etc. This will be a larger sub-task.
- [ ] **(9)** Integrate Postmark for sending invite emails via a Supabase Edge Function (`send-invite-email`).
    - Triggered after `generate-invite-token` (or called by it).
    - Input: `email`, `invite_url`, `project_name`.
    - Logic: Use Postmark API to send a formatted email containing the magic invite link.
    - PRD reference: "Email + Slack notifications".
    - Success: Email is actually sent via Postmark (or logged clearly in dev with Postmark API calls mocked but details correct). Requires Postmark API key setup.
- [ ] **(10)** (Placeholder for now) Configure Slack notification stub for new invites. PRD requires this, but focus on email first. Success: A simple log message or a TODO comment.
- [ ] **(11)** Write tests (e.g., Playwright for E2E flow, unit tests for Edge Functions if feasible).
    - Test magic link login.
    - Test invite token redemption (happy path, expired, invalid, used).
    - Test behavior for users without invites.
    - Success: Tests pass and cover key scenarios.
- [ ] **(12)** Final review, commit, push, open Draft PR for `feature/login-and-invite-flow`.

### Acceptance Criteria
1.  A new user can enter their email on `/login` and receive a magic link email (verify via Supabase Auth logs and/or actual email receipt).
2.  Clicking a valid magic link authenticates the user. 
    *   If no invite token is involved and the user is already a member of a project, they are redirected to `/projects`.
    *   If no invite token is involved and the user is new (not a member of any project), they see a message on the `/login` page (or a dedicated page) indicating they are logged in but need an invitation to proceed.
3.  An Admin (via mechanism decided in task 8) can generate a project-specific, role-specific invite token for an email address.
4.  The invite email is sent via Postmark (or correctly logged/mocked during dev) and contains a working invite link (e.g., `app.com/login?invite_token=TOKEN`).
5.  A new user clicking a valid magic link from an invite email (which includes the `invite_token` in the URL) is authenticated, the invite token is consumed, a corresponding `project_member` entry is created, and the user is redirected to `/projects` (or the specific project if easily determined).
6.  Attempting to use an invalid (malformed, non-existent), expired, already used, or voided invite token results in a clear, user-friendly error message displayed on the `/login` page without crashing the app.
7.  The `/login` page UI is clean, responsive, and provides clear feedback for all states (e.g., "sending link...", "check email", "error...").

## Project Status Board
- [x] Planning ✅
- [x] Branch created (`feature/login-and-invite-flow`)
- [x] `invite_token` table and RLS created
- [x] `/login` page UI implemented
- [ ] Magic-link client-side logic works (triggers email, `onAuthStateChange` fires)
- [ ] Invite token extraction from URL works
- [ ] Edge Function `consume-invite-token` created and tested
- [ ] Client-side handling of `consume-invite-token` response (redirects, errors) works
- [ ] Admin invite token generation mechanism implemented (TBD: UI or Function-only for MVP)
- [ ] Postmark integration for sending invite emails works
- [ ] Slack notification stub for new invites added
- [ ] Tests written and passing
- [ ] Ready for merge

## Current Status / Progress Tracking
- [2025-05-19]: Switched to Executor mode per user request.
- Created branch `feature/login-and-invite-flow` off `main`.
- **Task (1) ✅ COMPLETE**: Branch created and pushed to remote.
- **Task (3) ✅ COMPLETE**: `/login` page UI implemented using Shadcn login-03 component.
  - Installed `npx shadcn@latest add login-03` successfully.
  - Customized the login form to remove OAuth/password fields and focus on magic-link flow.
  - Updated copy to use "OffMenu" branding and magic-link messaging.
  - Added placeholder area for success/error messages.
  - Dev server running at http://localhost:3000/login and page renders correctly.
- **Task (2) ✅ COMPLETE**: Created `invite_token` table in Supabase.
  - Created migration file `supabase/migrations/0004_invite_token_table.sql`.
  - Applied migration directly without data loss using psql.
  - Table created with all required columns: id, token, email, project_id, role, expires_at, created_at, used_at, voided_at.
  - Added 5 performance indexes including unique constraint on token.
  - Implemented 3 RLS policies for security: admin management, token lookup, system updates.
  - Created helper function `is_project_admin()` for role checking.
  - Database now has 9 tables total, all existing data preserved.
- **Next up**: Implement Supabase magic-link client-side logic (Task 4).

## Executor's Feedback or Assistance Requests
*(empty)*

--- 