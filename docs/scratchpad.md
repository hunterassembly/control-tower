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

### Master Project Board (Overall Ordering & Status)

- [ ] in-progress 01 — Backend Foundation & Schema (`feature/backend-foundation-schema`)
- [ ] in-progress 02 — Login & Invite Flow (`feature/login-and-invite-flow`)
- [ ] 03 — Projects Dashboard (`feature/projects-dashboard`)
- [ ] 04 — Project Task List (`feature/project-task-list`)
- [ ] 05 — Task Detail & Updates (`feature/task-detail-and-updates`)
- [ ] 06 — Assets Lightbox (`feature/assets-lightbox`)
- [ ] 07 — Update Approval Flow (`feature/update-approval-flow`)
- [ ] 08 — Admin Invites (`feature/admin-invites`)
- [ ] 09 — Notifications & Role Guards (`feature/notifications-and-role-guards`)

_When a slice is kicked off, tick it and prefix with ✅ or mark "in-progress". This gives us a single-glance view without digging into each sub-board._ 