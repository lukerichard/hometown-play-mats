# Contributing

## Branching
- Do not commit directly to `main`.
- Use `feat/<name>`, `fix/<name>`, `chore/<name>`.

## Commit format
Use conventional commits:
- `feat(scope): ...`
- `fix(scope): ...`
- `docs(scope): ...`
- `chore(scope): ...`

## Pull Requests
- Keep PRs small and focused.
- Include test evidence and rollback notes.
- At least one review pass (self-review minimum if solo).
- PR-only workflow for all agent work (no direct deploys from agent sessions).

## Agent Best Practices (Required)
- **Stitch-first for UI:** Generate/update the UI concept in Stitch before coding implementation.
- **GitHub flow only:** Agents must work on feature branches and open PRs; never push directly to protected branches.
- **No direct Vercel deploys:** Deployment happens from GitHub-integrated workflow after PR merge.
- **Small scoped changes:** One objective per PR (e.g., hero-only), with clear rollback path.
- **Accessibility baseline:** Semantic structure, keyboard focus visibility, and contrast-safe CTAs.
- **Traceability in PR:** Include Stitch project/screen references for UI work.

## Security
- Never commit secrets.
- Use `.env` and GitHub Secrets.
- Rotate compromised tokens immediately.
