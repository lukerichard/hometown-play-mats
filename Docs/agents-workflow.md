# Agent Workflow (OpenClaw)

This project uses role-based agents to mimic a small software team.

## Roles
- **Developer (Forge):** builds features, creates branches/PRs, updates docs.
- **QA (Sentinel):** validates acceptance criteria, runs regression checks, files defects.
- **Security (Aegis):** reviews dependencies/secrets/config, proposes risk-ranked fixes.

## Branching Rules
- Never commit directly to `main`/`master`.
- Use branch prefixes: `feat/`, `fix/`, `chore/`.
- Keep PRs small and focused.

## Definition of Done
1. Code implemented with clear scope.
2. Lint/tests pass in CI.
3. PR includes summary, test evidence, and rollback notes.
4. No secrets committed.
5. Security/QA concerns addressed or explicitly tracked.

## Weekly Cadence
- Dev: ship small increments.
- QA: run smoke + high-risk regression checks.
- Security: dependency + secret scan, review branch protections.
