# Increment 1 Backlog (Auth & Tenant Foundation)

## Pre-Increment Learning Tasks (Phase -1)
- **LEARN-TS:** Complete TypeScript + Node fundamentals course; build sandbox auth API and capture notes in `docs/learning/ts-node-basics.md`.
- **LEARN-AUTH:** Follow JWT auth tutorial (NestJS or FastAPI); document flow in `docs/learning/auth-spike.md`.
- **LEARN-TEST:** Practice Jest + Supertest; record testing checklist in `docs/learning/testing-notes.md`.
- **LEARN-GIT:** Finish Git refresher; update personal workflow cheatsheet in `docs/learning/git-notes.md`.

> Mark each task complete before starting the related implementation story; note any open questions in `docs/learning/open-questions.md`.

## Definition of Ready (Increment 1)
A story is ready when:
- Problem and user value are clearly stated (why future-you or the customer cares).
- Acceptance criteria are testable and align with compliance guardrails.
- Dependencies and open questions are documented with an owner (usually you).
- UX/API requirements are sketched (wireframe or contract stub) or explicitly deferred.
- Data impacts and migration steps are identified.
- Success metrics or observable behaviours are defined and practical to measure solo.

---

## Stories

### AUTH-001: User Registration Creates Tenant Context
- **Status:** Completed (registration endpoint returns tokens and queues verification email).
- **User Value:** Prospective customers can self-register and receive immediate access to a dedicated tenant workspace.
- **Scope:**
  - Registration form collecting name, email, password, organization name, state.
  - Password strength validation (OWASP baseline) and Florida acknowledgement checkbox.
  - Persist user, organization (tenant), membership with `owner` role.
  - Send verification email (stub provider acceptable).
- **Acceptance Criteria:**
  - Given valid inputs, system creates user + tenant + membership and returns auth tokens.
  - Registration fails gracefully with validation errors for weak password, duplicate email, or missing Florida acknowledgement.
  - Audit log records `USER_REGISTERED` event with tenant ID.
  - Verification email job enqueued/logged for delivery.
- **Test Notes:** Unit tests for validation + service orchestration; integration test hitting `/auth/register` happy path & error cases.
- **Dependencies:** Argon2 password hashing + Nodemailer transport in place; record production email choice before launch.
- **Compliance:** Display UPL disclaimer on form; log acceptance timestamp.
- **Open Questions:** Monitor compliance guidance on enforcing email verification before login; update policy if requirements change.

### AUTH-002: Email/Password Login with JWT Issuance
- **Status:** In progress (login + audit logging implemented; rate limiting still outstanding).
- **User Value:** Registered users can securely log in to the platform and start work sessions.
- **Scope:**
  - `/auth/login` endpoint verifying credentials.
  - Issue 15-minute access token + 7-day refresh token stored server-side (revocation list/table).
  - Failed login rate limiting (5/min/IP).
- **Acceptance Criteria:**
  - Successful login returns tokens and tenant context payload (tenant id, default role).
  - Failed login attempts log but do not leak credential information.
  - Rate limit triggers after configured threshold with `429` response.
  - Audit log records `USER_LOGGED_IN` and `USER_LOGIN_FAILED` with metadata.
- **Test Notes:** Unit tests for auth service, integration tests for success/failure/locked scenario, basic load script for rate limiting.
- **Dependencies:** Token signing keys stored securely (local secrets manager or env vars); logging format chosen.
- **Compliance:** Ensure login responses include disclaimer link; align with security checklist. Document policy that login is allowed prior to email verification (monitor for change requests).

### AUTH-003: Token Refresh & Revocation
- **Status:** Not started.
- **User Value:** Users can maintain sessions without re-entering credentials while preserving security.
- **Scope:**
  - `/auth/refresh` endpoint exchanging valid refresh token for new access token.
  - `/auth/logout` endpoint revoking refresh token.
  - Store refresh token metadata (device, IP, expires).
- **Acceptance Criteria:**
  - Refresh with valid token issues new access token and rotates refresh token.
  - Refresh with revoked/expired token returns `401` and logs event.
  - Logout invalidates refresh token and future refresh attempts fail.
  - Token reuse detection triggers alert/log.
- **Test Notes:** Integration tests covering refresh success, expired token, revoked token; unit tests for token repository logic.
- **Dependencies:** Storage decision (Postgres table vs Redis). If Redis deferred, document cleanup job strategy.
- **Compliance:** Retain audit trail for token events.

### TENANT-001: Tenant & Role Management Scaffold
- **Status:** Not started.
- **User Value:** Ensures tenant context and roles exist from day one, setting up future RBAC work.
- **Scope:**
  - Data model for tenant, membership, roles (`owner`, `staff`).
  - Middleware attaching tenant + role to authenticated requests.
  - Admin endpoint `/tenant/members` (GET) returning members + roles (owner only).
- **Acceptance Criteria:**
  - Authenticated requests include tenant context in request scope.
  - Owner sees members list; staff receives `403` for admin endpoint.
  - Creating user via registration assigns `owner` role automatically.
  - Audit log captures role changes.
- **Test Notes:** Unit tests for role guard middleware; integration test for endpoint authorisation.
- **Dependencies:** Finalise audit log storage approach; confirm how roles map to future features.
- **Compliance:** Enforce least privilege; ensure disclaimers accessible to all roles.

### OPS-001: Health Checks & Observability Baseline
- **Status:** Completed (versioned /health, /health/detailed with DB probe, structured logging in place).
- **User Value:** Future-you (or ops later) can monitor service uptime and triage issues quickly.
- **Scope:**
  - `/health` public endpoint returning status + version.
  - `/health/detailed` protected endpoint listing database/storage dependencies.
  - Structured logging format and log transport configuration.
- **Acceptance Criteria:**
  - `GET /health` returns `{ status: "ok", version }` without auth.
  - `GET /health/detailed` returns dependency statuses; failure cascades return `503` with code `HEALTH_CHECK_FAILED`.
  - Logs include correlation ID for each request.
  - Health endpoints documented in API spec/README.
- **Test Notes:** Automated tests hitting both endpoints; failure simulation script noted for future.
- **Dependencies:** Choose logging library (pino/winston) and align with hosting platform health checks.
- **Compliance:** Ensure no sensitive data leaks in health/log outputs.

### AUDIT-001: Auth Event Audit Logging
- **Status:** Not started.
- **User Value:** Provides compliance-ready record of critical authentication events and supports future investigations.
- **Scope:**
  - Define audit log schema (timestamp, actor, tenant, event type, metadata).
  - Capture events from AUTH-001/002/003 and TENANT-001 flows.
  - Provide `/admin/audit/auth-events` endpoint (owner-only) with pagination.
- **Acceptance Criteria:**
  - Each targeted event persists to audit store synchronously or via queue (decision needed).
  - Endpoint returns events filtered by tenant; staff access returns `403`.
  - Audit entries immutable (append-only) with retention policy documented.
  - Security review signs off on stored metadata (no unnecessary PII).
- **Test Notes:** Unit tests for audit service; integration tests verifying events; contract test for admin endpoint.
- **Dependencies:** Storage decision (Postgres table with immutability pattern); pagination approach (cursor vs offset).
- **Compliance:** Align with UPL logging requirements; ensure audit logs support potential subpoenas.

---

## Supporting Tasks (Non-story)
- **DOC-001:** Draft ADR-005 covering hosting & auth stack decisions; store in `docs/adr/`.
- **SEC-001:** Create initial threat model for auth flows in `docs/security/` (mind map or table is fine).
- **OPS-SETUP:** Keep GitHub Actions CI green; update workflow once real `lint`/`test` scripts exist.
- **ADMIN-LOG:** Start `docs/risk-register.md` with insights from Phase -1 and Phase 0.
- **JOURNAL:** Set up `docs/journal.md` for daily reflections and blockers.

## Personal Working Notes
- Tackle one story at a time; keep a daily log of progress/roadblocks.
- If a story balloons, split it into a spike + follow-up and capture the decision in an ADR or journal entry.
- Use Friday retro to review status of each story and adjust priorities before the next increment.







