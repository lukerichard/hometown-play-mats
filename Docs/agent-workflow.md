# Agent Workflow Guardrails

These rules apply to all coding agents working in this repository.

## 1) UI work is Stitch-first
1. Generate/update UI direction in Stitch first.
2. Capture Stitch references in the PR (project id + key screen ids/links).
3. Implement code only after Stitch direction is set.

## 2) GitHub PR workflow only
- Work from feature branches (`feat/*`, `fix/*`, `chore/*`).
- Open PRs for review; do not push directly to protected branches.
- Keep PR scope tight and reviewable.

## 3) No direct Vercel deployment from agents
- Agents must not run direct production deployment commands.
- Deployment should be triggered by GitHub-integrated pipeline after merge.

## 4) Quality baseline
- Semantic HTML where relevant.
- Keyboard-visible focus states.
- WCAG-friendly contrast for CTAs and key text.
- Mobile behavior validated (375px baseline for web UI).

## 5) PR evidence required
- What changed and why.
- Test/sanity commands run.
- Risk + rollback plan.
- Stitch references (for UI changes).
