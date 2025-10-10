# Coding Pattern Preferences

## General Principles
- Prefer the simplest viable implementation; avoid premature abstraction or over-engineering.
- Check for existing utilities or patterns before adding new code to prevent duplication.
- Keep each file under ~250 lines; refactor or split when approaching that threshold.
- Limit changes to the explicit request or clearly related fixes; flag scope creep early.
- Remove any deprecated logic once a replacement is confirmed working.

## Implementation Approach
- Extend existing patterns, modules, or services before introducing new frameworks.
- Use dependency injection or clear constructors instead of hidden globals.
- Keep functions cohesive and short; extract helpers when branching logic grows.
- Prefer configuration-driven behaviour over hard-coded environment assumptions.

## Environment Awareness
- Honor separate DEV, TEST, and PROD behaviours by reading from environment configuration.
- Never introduce mocked or fake data in non-test code; mocks belong only in automated tests.
- Preserve local developer `.env` files---ask before modifying shared secrets or configs.
- Provide safe defaults that fail loudly if required environment variables are missing.

## Clean Code & Organization
- Maintain consistent naming (snake_case for files, camelCase for variables unless codebase states otherwise) and stay aligned with the domain vocabulary (e.g., use tenant/membership consistently).
- Keep modules focused on a single responsibility and organise them within existing folder conventions.
- Document non-obvious design choices with concise comments or ADR updates.
- When data models or API contracts change, update the corresponding documentation or schemas in the same change set.
- Delete unused code paths, feature flags, or files once their purpose is complete.

## Testing Expectations
- Add or update automated tests alongside any functional change.
- Favour integration tests to cover real flows; supplement with unit tests for edge cases.
- Avoid flakey timing-based tests; use deterministic data and clear assertions.
- Ensure mocks/stubs exist only inside the test suite.

## Tooling & Scripts
- Before creating a new script, confirm the task cannot be handled by existing tooling.
- Scripts should be idempotent, documented, and kept minimal; remove one-off helpers after use.
- Log key steps in batch/PowerShell helpers so future runs are traceable.

## Collaboration & Documentation
- Update `docs/journal.md` with daily progress, blockers, and next steps.
- Include verification notes (tests run and manual checks) in commit messages or PR descriptions.
- Capture noteworthy technical decisions in ADRs or the backlog notes.
- Tag any temporary workaround with a TODO that names the owner and revisit date so it does not linger.
- Surface new risks or compliance considerations immediately in the risk register.


