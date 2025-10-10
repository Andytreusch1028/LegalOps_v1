# LegalOps v2 - Implementation Blueprint (Solo Novice Edition)

## Purpose & Alignment
- Turn `.md_Files/DEVELOPMENT_PROTOCOL.md` into an actionable plan tailored to a single, early-career builder.
- Front-load learning so core skills (Git, TypeScript/Node, React/Next.js, testing) are in place before production work.
- Maintain UPL compliance and "Never Break What Works" by shipping small, well-tested increments.

---

## Phase -1: Skills Ramp (Weeks -2 to 0)
| Track | Goals | Activities | Outputs |
| --- | --- | --- | --- |
| Git & Workflow | Confident with branching, commits, PR hygiene | Complete Git tutorial, practice repo, follow `.md_Files/DEVELOPMENT_PROTOCOL.md` Git checklist | Git cheat sheet, personal workflow notes |
| TypeScript & Node Basics | Build comfort with language + backend | Work through TypeScript handbook basics, Node fundamentals course, code mini auth API | Notes + sample repo in `/sandboxes/` |
| Frontend (React/Next.js) | Understand component model & routing | Complete intro React course, build simple dashboard in Next.js | Component snippets, UI glossary |
| Testing Foundations | Apply unit/integration testing | Follow Jest/Supertest tutorials, add tests to sandbox projects | Testing checklist |
| Security & Compliance | Internalise UPL and auth best practices | Read DEVELOPMENT_PROTOCOL compliance sections, OWASP Top 10 overview | Compliance crib sheet |

**Exit Criteria:** All tutorials complete, cheat sheets stored in `/docs/learning/`, backlog open questions for remaining gaps.

---

## Phase 0: Discovery & Architecture (Weeks 0-2)
| Track | Key Outcomes | Solo-Friendly Activities | Deliverables |
| --- | --- | --- | --- |
| Product & Compliance | Clear MVP value props, UPL boundaries | Review APP_OVERVIEW, interview stakeholders/mentors, capture assumptions | MVP value note, persona snapshots, legal guardrails |
| Domain & Data | Stable domain language and data needs | Self-led domain mapping, integration research | Context sketch, domain glossary, entity/data outline |
| Technology & Operations | Right-sized initial stack and environments | Compare PaaS options, choose starter templates, define deploy flow | ADR-001..004, environment topology sketch, DevOps checklist |
| Delivery Planning | Prioritised backlog + calendar | Story mapping (markdown/FigJam), refine Increment 1, schedule personal work blocks | Backlog ready, Definition of Ready/Done note, risk log |
| Security & Privacy | Documented requirements | Solo threat brainstorm, data classification, compliance checklist | Threat model summary, security requirements note |

**Exit Gate:** Deliverables saved in `/docs/`, risks logged, Increment 1 backlog meets Definition of Ready, unresolved questions tracked.

---

## Delivery Rhythm & Personal Governance
- **Cadence:** 2-week increments (Mon start, Fri review). Reserve 60?min on Fridays for demo recording + retro notes.
- **Daily:** 10?min morning check-in to plan tasks and review blockers.
- **Weekly:** Friday retro journal; schedule 30?min architecture/roadmap review every other week.
- **Monthly:** Compliance checklist audit (15?min) using UPL/compliance crib sheet.
- **Quality Gates:** Run full automated tests before merging to `main`; execute personal code-review checklist (security, tests, docs) before commit; perform staging smoke test or scripted verification before declaring increment done.
- **Documentation:** Keep ADRs, changelog per increment, and evolving architecture diagrams up to date.

---

## Increment Plan (MVP Scope + Learning Spikes)

### Increment 1 (Weeks 1-2): Auth & Tenant Foundation + Learning Spike
- **Learning Spike (first 2-3 days):** Build tutorial NestJS (or FastAPI) auth sample with JWT + Prisma; document findings in `/docs/learning/auth-spike.md`.
- **Goal:** Users can register/login with tenant context.
- **Scope:**
  - Monolith (NestJS + Next.js or FastAPI + Next.js) deployed to managed PaaS.
  - `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh` with JWT.
  - Tenant model (organisation + membership) with `owner` and `staff` roles.
  - Health endpoints + initial audit logging stub.
- **Definition of Done:** Tests cover auth flows; CI green; deployment instructions documented; ADR-005 approved; demo notes/video recorded.

### Increment 2 (Weeks 3-4): Entity Onboarding Slice + Compliance Spike
- **Learning Spike (1-2 days):** Research Florida formation requirements and model data validation; record in `/docs/learning/entity-compliance.md`.
- **Goal:** Registered user creates and manages business entity with compliance checklist.
- **Definition of Done:** CRUD tests, accessibility scan, audit logs, demo recorded.

### Increment 3 (Weeks 5-6): Document Library MVP + Storage Spike
- **Learning Spike (1 day):** Prototype S3 upload/download with signed URLs; capture learnings in `/docs/learning/storage-spike.md`.
- **Goal:** Tenant owners manage documents with versioning and UPL disclaimers.
- **Definition of Done:** File validation tests, updated threat model, access logging, demo recorded.

> Future increments (communications, automation, payments, analytics) planned once MVP stabilises.

---

## Architecture Starting Point
- **Pattern:** Modular monolith (NestJS/FastAPI + Next.js) with clear boundaries for future extraction.
- **Hosting:** Managed PaaS (Render, Railway, Elastic Beanstalk) + managed Postgres (RDS/Neon). Defer Kubernetes.
- **Core Services:** Auth via NestJS Passport (or FastAPI auth libs); Postgres with Prisma/TypeORM; S3-compatible storage; transactional email sandbox (Postmark/SES).
- **Tooling:** pnpm or npm, ESLint, Prettier, Husky for pre-commit lint/test; optional Nx for structure.
- **Observability:** Structured logging, health metrics, error monitoring (Sentry) when feasible.

---

## Testing & QA Strategy
- **Automated:** Unit coverage target 70% by end of Increment 2; integration tests for key flows each increment; Playwright/Cypress smoke prior to completion.
- **Manual:** Learning spikes culminate in exploratory testing; Friday demos double as exploratory sessions; record findings.
- **Security:** Run npm audit (`npm audit --production`) monthly; update threat model per increment; document mitigations.

---

## Knowledge Management
- **Self-Review Checklist:** Store in `/docs/checklists/code-review.md` (security, tests, docs, accessibility).
- **ADRs:** `/docs/adr/ADR-###.md` with context/decision/consequences.
- **Risk Register:** `/docs/risk-register.md`, updated weekly (5?min).
- **Runbooks:** `/docs/runbooks/` for auth, deployments, incidents.
- **Learning Vault:** `/docs/learning/` to hold spike summaries, tutorials completed, and references.
- **Journal:** Optional `/docs/journal.md` for daily reflections and TODOs.

---

## Immediate Actions Checklist
1. Create `/docs/learning/` directory; add learning log template and populate with planned courses.
2. Schedule Phase -1 activities (block calendar for Git, TS/Node, React, testing, security) and track progress.
3. Update `docs/phase0/discovery-schedule.md` with personal milestones and outreach plans.
4. Refine Increment 1 backlog decisions (hashing library, token storage) in `docs/backlog/increment-1.md`.
5. Set up personal task board (GitHub Projects or markdown kanban) and calendar reminders for daily/weekly rituals.

---

**Next Review:** After completing Phase -1 learning ramp, revisit this blueprint to confirm comfort level, adjust scope if needed, then proceed to Phase 0.
