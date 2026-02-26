# Security Baseline

## Repo Controls
- Enable branch protection on `main`
- Require PR before merge
- Require CI checks to pass
- Enable secret scanning + Dependabot alerts

## Secrets
- Store API keys in GitHub Secrets / local `.env`
- Never commit `.env` or tokens
- Rotate tokens quarterly or immediately after exposure

## Agent Guardrails
- Dev agent: no direct pushes to `main`
- QA agent: must report test evidence
- Security agent: weekly dependency + secret scan
