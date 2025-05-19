Product Requirements Document (PRD)

(MVP - Internal Client-Engagement Platform)

Item	Detail
Version	0.9-draft (2025-05-19)
Author	CTO (acting)
Stakeholders	Hunter (CEO), Design Leads, Engineering, Client Success
Review cadence	Daily stand-up during 2-week MVP sprint


⸻

1. Purpose & Problem Statement

OffMenu coordinates dozens of active design projects through a patchwork of Slack threads, Google Docs, and Figma links. This causes status ambiguity, delayed approvals, and no single source of truth. We need one internal web app where Admins, Designers, and Clients can create tasks, share updates, approve work, and track history in real-time.

⸻

2. Goals & Success Metrics

Goal	KPI / Definition of Done
Centralise project data	100 % of new client work created in the platform within 30 days
Speed up approvals	Median turnaround from “Waiting for Review” → “Approved” ≤ 24 h
Zero status confusion	90 % of users rate “I always know project status” ≥ 4/5 in post-MVP survey
Immutable audit	100 % of status or content changes generate a timeline entry


⸻

3. Scope & Out-of-Scope

In scope
	•	Task life-cycle: Backlog → Up Next → In Progress → Viewed → Waiting → Revising → Approved/Closed
	•	Asset uploads, Loom & Figma embeds
	•	Email + Slack notifications
	•	Supabase Realtime updates
	•	Role-based security (Admin / Client / Designer)
	•	Invite flow (magic-link)

Out of scope (MVP)
	•	Time tracking & metrics dashboards
	•	SSO providers
	•	External integrations (Linear, Jira, Drive)
	•	Mobile app

⸻

4. Personas

Persona	Needs	Pain today
Admin (PM/Account lead)	Create projects, invite users, see all tasks, ensure delivery	Chasing status across tools
Designer	Receive clear briefs, upload work, get feedback quickly	Feedback lost in DM silos
Client	Visibility, easy approvals, comment trail	Too many links, uncertain next steps


⸻

5. User Stories & Acceptance Criteria

5.1 Task Management

Story A1: As an Admin, I can create a task inside a project so that designers have a clear brief.
Acceptance
	•	Required fields: title, description, assignee, status(default=Backlog)
	•	Task appears in correct section immediately (Realtime push)
	•	Timeline logs “Task created” row

Story C1: As a Client, I can move a task from “Viewed” to “Waiting for Review” after reading it.
Acceptance
	•	Status menu lists only valid next states
	•	Email + Slack notify the Designer

5.2 Update & Approval

Story D1: As a Designer, I can submit an update with Loom & Figma URLs and multiple files.
Acceptance
	•	Each file stored in Supabase Storage with signed URL
	•	Update status = “waiting” and visible under Task › Updates
	•	Timeline logs “Update submitted” with payload

Story C2: As a Client, I can approve an update so that the task progresses.
Acceptance
	•	Clicking Approve sets update→approved
	•	If all updates approved, task auto-closes and Slack hook fires
	•	Audit entry inserted

(Complete table of stories in appendix.)

⸻

6. Functional Requirements by Screen

Route	Layout	Key Components & Actions
/login	Center card	Magic-link sign-in; invite token redemption
/projects	Grid of project cards	Open project; +New Project (Admin)
/projects/[id]/tasksTask List View	Section stack (Backlog … Closed)Collapse/expand	Row overflow “⋮”: View, Move, Delete, Approve (A & C); bulk move
Task Detail /tasks/[taskId]	70 / 30 split	Edit description, upload asset, Add Update (modal), sticky Actions (Close), Timeline RHS
Update Modal	Sheet	Fields: summary, Figma, Loom preview, file drop; Save / Submit
Update Detail Drawer	Full overlay	Approve / Request edits buttons, comment thread
Assets	Lightbox grid	Download; Delete (own uploads)
Admin › Invites	Table + Drawer	Generate token (role, project), void/resend


⸻

7. Non-Functional Requirements

Category	Requirement
Performance	List view initial load ≤ 200 ms p95; lazy load > 100 tasks
Security	Supabase RLS; signed URLs expire after 24 h
Reliability	Edge Function errors logged to Sentry; SLA 99 % uptime
Accessibility	WCAG 2.1 AA (keyboard, contrast, alt tags)
Audit	Insert-only timeline table; no hard deletes


⸻

8. Technical Specifications

8.1 Architecture
	•	Frontend: Next.js 14 (app router), TypeScript, TailwindCSS, shadcn/ui
	•	State: TanStack React Query + Supabase Realtime channels
	•	Backend: Supabase Postgres with RLS, Edge Functions (Slack, Postmark)
	•	Storage: Supabase Storage (no file-size limit)
	•	CI/CD: GitHub → Vercel; supabase db push migrations

8.2 Data Model (excerpt)

organization → project → task
task → task_update → task_comment
task → task_asset
timeline (immutable)

8.3 Constraints & Non-Negotiables
	•	Auth must be Supabase email magic-link (no SSO)
	•	Tech stack locked for 2-week MVP (no GraphQL/tRPC)
	•	Only invited project_member rows grant visibility

Rationale: explicit constraints help AI-assisted tooling (Cursor) stay on-track  ￼

⸻

9. Milestones & Timeline

Date	Deliverable
Day 1-2	Repo scaffold, DB schema, RLS
Day 3	Auth + invite flow
Day 4 - 5	Task List (read/write) – Internal demo
Day 6 - 7	Task CRUD, asset uploads, Update modal
Day 8 - 9	Comments, approvals, auto-close trigger
Day 10	Slack & Postmark functions
Day 11-12	Role guards, polish, accessibility
Day 13	QA, seed staging
Day 14	Prod deploy & hand-off


⸻

10. Open Questions / Risks

Item	Owner	Due
Final copy for email templates	Hunter	D-3
Slack channel IDs for hooks	Ops	D-5
Will small-screen users need drag gest ures or buttons to reorder tasks?	Design	D-6
Legal review of storage TOS for large client files	Legal	D-10


⸻

Appendix – Full User Story & Acceptance Table

(Omitted here for brevity; lives in /docs/PRD-appendix.md in repo.)

⸻

How this PRD follows ChatPRD best practices
	•	Clear sections & consistent headings (Intro, Stories, Acceptance, Constraints).
	•	Sharp user stories with bullet-proof acceptance criteria.
	•	Constraints explicitly called out (stack, auth).
	•	Technical specs & data model included for AI reference.
	•	Consistent formatting optimised for Cursor ingestion.  ￼