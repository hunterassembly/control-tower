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
- [2025-01-27] 400 API errors during development are often EXPECTED SECURITY BEHAVIOR when authentication is required. Always check if user needs to login first at `/login` before assuming there's a bug.
- [2025-01-27] When users successfully authenticate but get "access denied" errors, check if they have project_member records. Successful auth ≠ project access. Use: `psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -c "SELECT pm.role, au.email FROM project_member pm JOIN auth.users au ON pm.user_id = au.id;"`
- [2025-01-27] Always verify the correct port for Next.js dev server with `lsof -i :3000` - don't assume port numbers. Default is 3000, not 3001!
- [2025-01-27] When auth issues are complex, add comprehensive debugging FIRST: console logs in hooks, visual debug displays, and auth state monitoring. This saves hours of guessing. Use prefixed emojis (🔍, 🔐, ✅, ❌) for easy filtering.
- [2025-01-27] 400 API errors that look like auth problems can actually be database schema mismatches! Always check if the code's expected columns/enums match the actual database structure. Use `\d table_name` in psql to verify schema. In this case: missing `position` column, wrong status enum values (`'Backlog'` vs `'backlog'`), and missing project columns caused all the 400s.

### Master Project Board (Overall Ordering & Status)

- [ ] 01 — Backend Foundation & Schema (`feature/backend-foundation-schema`)
- [ ] 02 — Login & Invite Flow (`feature/login-and-invite-flow`)
- [ ] 03 — Projects Dashboard (`feature/projects-dashboard`)
- [ ] 04 — Project Task List (`feature/project-task-list`)
- [ ] 05 — Task Detail & Updates (`feature/task-detail-and-updates`)
- [ ] 06 — Assets Lightbox (`feature/assets-lightbox`)
- [ ] 07 — Update Approval Flow (`feature/update-approval-flow`)
- [ ] 08 — Admin Invites (`feature/admin-invites`)
- [ ] 09 — Notifications & Role Guards (`feature/notifications-and-role-guards`)

_When a slice is kicked off, tick it and prefix with ✅ or mark "in-progress". This gives us a single-glance view without digging into each sub-board._ 