# Backend Foundation & Schema

**Branch Name:** `feature/backend-foundation-schema`

## Background and Motivation
The entire MVP rests on a solid database schema, RLS policies, and a bootstrapped Next.js + Supabase project. Getting this done first unblocks every other slice and lets the Executor avoid re-plumbing stuff later.

## Key Challenges and Analysis
1. Designing tables that match the PRD's data model while staying tiny for MVP scope.
2. Crafting least-privilege RLS policies for Admin, Designer, Client roles without shooting ourselves in the foot.
3. Automating migrations via `supabase db push` in CI so we never diverge.
4. Wiring up CI/CD early to catch TypeScript and linting errors on every PR.

## High-level Task Breakdown
- [ ] **(1)** Create branch `feature/backend-foundation-schema` off `main`.
- [ ] **(2)** Scaffold Next.js 14 app (app router) with TypeScript, TailwindCSS, shadcn/ui, ESLint, Prettier.
- [ ] **(3)** Add Supabase CLI; initialise local project and link remote.
- [ ] **(4)** Model core tables: `organization`, `project`, `task`, `task_update`, `task_comment`, `task_asset`, `timeline`, `project_member`.
- [ ] **(5)** Write RLS policies for the three roles covering all CRUD paths.
- [ ] **(6)** Seed initial data script for local dev incl. three demo users per role.
- [ ] **(7)** Add GitHub Actions workflow: install pnpm, run lint, test, `supabase db push --dry-run`.
- [ ] **(8)** Verify local build, run API smoke tests, commit & push; open Draft PR.

### Acceptance Criteria
1. Running `pnpm dev` boots a Next.js app without errors.
2. `supabase test` passes all RLS tests for each role.
3. GitHub Actions shows green for lint, type-check, and db push dry-run.

## Project Status Board
- [ ] Planning ✅ _(you're here)_
- [ ] Branch created
- [ ] Schema & RLS done
- [ ] CI pipeline passes
- [ ] Ready for merge

## Current Status / Progress Tracking
*(empty – to be updated by Executor)*

## Executor's Feedback or Assistance Requests
*(empty – Executor will fill)*

--- 