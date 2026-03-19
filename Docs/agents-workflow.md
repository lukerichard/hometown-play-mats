# Agent Workflow (OpenClaw)

This project now uses a **Stitch-first UI workflow**.

## Roles
- **Designer (Stitch):** source of truth for page layout, visual hierarchy, spacing, and component composition.
- **Frontend Integrator (Pixel):** implements Stitch output with high fidelity and performs only minor polish/accessibility tweaks.
- **Developer (Forge):** builds product logic, data flows, and feature behavior (non-visual heavy lifting).
- **QA (Sentinel):** validates visual fidelity, accessibility, and functional acceptance criteria.
- **Security (Aegis):** reviews dependencies/secrets/config and proposes risk-ranked fixes.

## Stitch-First Rules (Non-Negotiable)
1. **Stitch is the baseline UI spec.**
2. Pixel must not redesign pages from scratch.
3. Pixel changes are limited to:
   - accessibility fixes (contrast, focus-visible, semantics, labels)
   - token alignment (colors/spacing/radius/typography)
   - responsive adjustments needed to preserve Stitch intent
   - tiny copy clarity edits that keep original meaning
4. Any layout/visual direction change beyond minor polish requires explicit sign-off before implementation.

## Pixel Implementation Guardrails
- Reuse Stitch structure first, then patch.
- Keep diffs scoped to the target route/screen.
- Prefer small, surgical PRs over broad restyles.
- Avoid introducing new visual systems when existing tokens/classes can be used.
- Include before/after screenshots against Stitch reference.

## Branching Rules
- Never commit directly to `main`/`master`.
- Use branch prefixes: `feat/`, `fix/`, `chore/`.
- Keep PRs small and focused.

## PR Checklist (UI Work)
- [ ] Stitch reference included (link or image)
- [ ] Screenshot comparison included (implemented vs Stitch)
- [ ] Any differences called out explicitly with rationale
- [ ] Accessibility checks completed (focus, contrast, semantics)
- [ ] Responsive checks completed (375, 768, 1024+)

## Definition of Done
1. UI matches Stitch intent with high fidelity.
2. Lint/tests pass in CI.
3. PR includes summary, visual evidence, and rollback notes.
4. No secrets committed.
5. Security/QA concerns addressed or explicitly tracked.

## Weekly Cadence
- Stitch/Design: define or refine key flows.
- Pixel: implement approved Stitch designs with minor polish only.
- QA: run smoke + visual regression on key routes.
- Security: dependency + secret scan, review branch protections.
