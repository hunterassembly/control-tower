## Scratchpad

This document is the shared brain-dump playground for both Planner and Executor roles. Append notes here, never delete history.

### Implementation Plan Files

- [Backend Foundation & Schema](implementation-plan/backend-foundation-schema.md)
- [Login and Invite Flow](implementation-plan/login-and-invite-flow.md)
- [Projects Dashboard](implementation-plan/projects-dashboard.md)
- [Project Task List](implementation-plan/project-task-list.md)
- [Task Detail & Updates](implementation-plan/task-detail-and-updates.md)
- [Update Approval Flow](implementation-plan/update-approval-flow.md)
- [Assets Lightbox](implementation-plan/assets-lightbox.md)
- [Admin Invites](implementation-plan/admin-invites.md)
- [Notifications & Role Guards](implementation-plan/notifications-and-role-guards.md)

---

### Lessons Learned

_Add new items to the list below as `- [YYYY-MM-DD] Your wisdom here`_

- [2025-05-19] Initial project scaffolding created by Planner.
- [2025-05-19] GitHub Actions removed from project scope per user request - using manual verification and testing instead for MVP.
- [2025-05-19] When applying new Supabase migrations, use direct psql application instead of `supabase db reset` to avoid data loss.
- [2025-05-19] Next.js HMR can fail when converting server components to client components ("use client"). Fix: kill dev server, rm -rf .next, restart npm run dev.
- [2025-05-19] Magic-link authentication flow tested successfully: login form → Supabase email → Inbucket → magic link click → redirect to /projects.
- [2025-05-23] MAJOR MILESTONE: Complete end-to-end invite token redemption flow working! Fixed RLS infinite recursion by removing cross-table queries in project_member policies. localStorage approach successfully preserves invite tokens through magic link redirects. Invitation system is production-ready pending Edge Function deployment.
- [2025-05-23] UI COMPLEXITY DISCOVERY: The "project task list" is actually the main project page (/projects/[id]) where users land after authentication. Screenshot analysis reveals 28+ sophisticated features including expandable task cards, role-based actions, real-time notifications, drag-and-drop, approval workflows, and multi-tab navigation. This is the primary workspace, not a simple dashboard.
- [2025-05-23] EXCELLENT SCHEMA ALIGNMENT: Database schema analysis shows perfect alignment with UI requirements. All sophisticated features (comments, updates, approvals, status tracking, role-based permissions) are already supported by existing tables and enums. No schema changes needed for implementation.
- [2025-05-23] DESIGN SYSTEM FOUNDATION: Created comprehensive OffMenu design system in globals.css with 50+ CSS custom properties matching screenshot UI. Includes component classes, status colors, interactive states, and dark mode support. Using modern oklch color space and Tailwind CSS v4 approach for optimal performance and maintainability.

### Master Project Board (Overall Ordering & Status)

- [x] ✅ 01 — Backend Foundation & Schema (`feature/backend-foundation-schema`)
- [x] ✅ 02 — Login & Invite Flow (`feature/login-and-invite-flow`) - **CORE COMPLETE**
- [ ] in-progress 03 — Project Task List (`feature/project-task-list`) - **PRIMARY WORKSPACE**
- [ ] 04 — Projects Dashboard (`feature/projects-dashboard`) - *DEPRIORITIZED*
- [ ] 05 — Task Detail & Updates (`feature/task-detail-and-updates`)
- [ ] 06 — Assets Lightbox (`feature/assets-lightbox`)
- [ ] 07 — Update Approval Flow (`feature/update-approval-flow`)
- [ ] 08 — Admin Invites (`feature/admin-invites`)
- [ ] 09 — Notifications & Role Guards (`feature/notifications-and-role-guards`)

_When a slice is kicked off, tick it and prefix with ✅ or mark "in-progress". This gives us a single-glance view without digging into each sub-board._ 