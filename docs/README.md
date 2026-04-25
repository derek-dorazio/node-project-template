# Documentation

This directory contains reference documentation. It is **not** the source of truth for implementation guidance — that lives in `rules/` and `plans/`.

## Expected Contents

- **adr/** — Architecture Decision Records. Cross-cutting decisions that outlast a single slice. See `adr/README.md`.
- **PERSONA-FLOW.md** — End-to-end flow through the agent personas, from product idea to shipped code.
- **PROJECT-SETUP.md** — First-time project setup, AWS/CI bootstrap, environment configuration.
- **DATABASE-SCHEMA.md** — Current database schema reference
- **API-REFERENCE.md** — API endpoint reference (supplement to generated OpenAPI)
- **DEVELOPER-SETUP.md** — Local development environment setup guide
- **DEPLOYMENT.md** — Deployment process and environment configuration

## Important

If `docs/` conflicts with active plans or rules, follow the plans/rules. Update or remove stale docs rather than letting them mislead future work.
