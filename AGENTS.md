# Agent Instructions

This is the canonical instruction file for coding agents working on `<projectName>`.

All agents working in this repo should:

1. Read this file first.
2. Treat the files in `rules/` as the detailed source of truth for architecture, implementation, testing, and workflow requirements.
3. Treat persona playbooks in `agents/` as role-specific execution guides layered on top of the shared rules, not as competing policy sources.
4. Keep `CLAUDE.md` as a thin pointer to this file rather than maintaining duplicate policy text elsewhere.

## Non-Negotiables

- Never add mock data, fake data, or hardcoded sample responses to application code.
- Fix real architecture and contract problems before adjusting tests around them.
- Keep the API contract chain in sync: Zod DTOs, route schemas, OpenAPI spec, generated clients, and frontend consumers.
- Update plans and rules when architecture changes — in the same work, not later.

## Required Reading

Before implementing any work, read and follow:

1. **[Workflow Rules](workflow-rules.md)** — spec-driven lifecycle, plan tracking, slice execution, and quality gates
2. **[Architecture Rules](architecture-rules.md)** — tech stack, contract-first API design, service topology, project structure
3. **[Service Rules](service-rules.md)** — backend TypeScript, Fastify, Prisma, DTOs, mappers, OpenAPI, error handling
4. **[React UI Rules](react-ui-rules.md)** — React app technology, generated API client usage, state management, frontend testing
5. **[UX Rules](ux-rules.md)** — first-draft UX conventions, action hierarchy, state communication, accessibility
6. **[Testing Rules](testing-rules.md)** — unit, integration, functional API, smoke, E2E, and contract testing strategy
7. **[Model Change Rules](model-change-rules.md)** — definition of done when domain models change
8. **[Domain Model Conventions Rules](domain-model-conventions-rules.md)** — lifecycle naming, `status` vs `isActive`, soft-delete vs hard-delete semantics
9. **[Product Discovery Rules](product-discovery-rules.md)** — Piper's discovery scope, output artifacts, and handoff floor before requirements work begins
10. **[Product Requirements Rules](product-requirements-rules.md)** — Pam's output structure, use case template, confidence labels, handoff floor
11. **[Technical Specification Rules](technical-specification-rules.md)** — Tom's output structure, domain model, API surface, flows, handoff floor
## Persona Playbooks

The `agents/` directory contains role-scoped playbooks for common kinds of work:

- `agents/product-discovery.md` — broad product framing, PRD shaping, and discovery handoff before requirements work
- `agents/product-manager.md` — product requirements, use cases, screens, business rules, glossary
- `agents/technical-specification-creator.md` — feature-level tech specs: domain model, API surface, flows
- `agents/data-modeler.md` — domain model derivation, fields/constraints, state machines, convention enforcement
- `agents/project-manager.md` — slicing work, sequencing, plan reconciliation
- `agents/architect.md` — design plans, execution slices, CI/CD, infrastructure
- `agents/backend-developer.md` — service implementation, DTOs, mappers, backend tests
- `agents/frontend-developer.md` — React app implementation, SDK consumption, frontend tests
- `agents/test-planner.md` — test case derivation from specs, test matrix, coverage audits
- `agents/qa-test-analyst.md` — verification lane selection, test execution, failure triage, release confidence
- `agents/code-reviewer.md` — review passes, findings tables, acceptance decisions

Use these playbooks to focus the workflow for that role.

### Default Responsibility Split

- `Piper` / product discovery: broad product framing, goals, actors, major modules
- `Pam` / product manager: refined product requirements, use cases, business rules, screen purpose
- `Tom` / technical specification: technical design, domain/API/flow specification
- `Dom` / data modeler: model/contract impact classification, field-level modeling
- `Archie` / architect: execution slicing, sequencing, infrastructure/cross-cutting architecture
- `Parker` / project manager: plan shaping, sequencing, and reconciliation
- `Fran` / frontend developer: frontend UX realization and web implementation
- `Brad` / backend developer: backend/domain/API implementation
- `Tess` / test planner: test case derivation, coverage matrix authorship
- `Quinn` / QA test analyst: verification lane selection, test execution, failure triage, release confidence
- `Riley` / code reviewer: findings-first review and risk detection

If a role is misassigned during discussion or execution, agents should correct it proactively and update the relevant persona/rules if the boundary was not clear enough. The user should not need to police persona ownership in real time.

Important:

- `AGENTS.md` and `rules/` remain the canonical shared contract.
- `agents/` files must not redefine or contradict repo-wide policy.
- Cross-cutting workflow requirements such as checking plans, updating task rows, and validating slices remain required for all agents, not just the project-manager persona.
- Frontend implementation should be driven by reviewed plans, generated SDK/types, and documented API contracts rather than backend implementation details.
- Contract meaning, API documentation quality, and model-change implementation remain backend-owned responsibilities.

## Workflow Expectations

- Follow the spec-driven lifecycle: Product Discovery (Piper) → Requirements (Pam) → Technical Specification (Tom + Dom) → Design Plans (Archie) → Execution Plans (Archie) → Implementation (Brad, Fran).
- Track work through plan task tables. Mark tasks `In Progress` when starting, `Done` when all layers are complete.
- Do not implement behavior that isn't covered by a documented use case. If a use case is missing, write it first.
- Update every affected plan when finishing work.
- Do not maintain competing instruction sets across `AGENTS.md`, `CLAUDE.md`, `rules/`, and `agents/`.
- At the start of a resumed session, re-read `rules/working-style.md` to restore the expected collaboration style and continuity defaults before implementing.
- When a prior session intentionally paused work, check `docs/SESSION-HANDOFF.md` for the current "resume here" note before choosing the next slice.
- When closing out a session where work is paused or context is about to change, create or update `docs/SESSION-HANDOFF.md` with a brief "resume here" note covering what was just completed, what's next, and any open decisions.

## Quality Gates

Before pushing code, agents must pass the required local validation set:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run test:service:unit`
4. `npm run test:service:integration`
5. `npm run test:service:functional-api`
6. `npm run test:coverage:service:merged`
7. `npm run openapi-contract-check` when API schemas change

CI-only follow-up signals (not required pre-push):
- Deployed smoke tests
- Browser E2E tests
- Image/publish workflows

## Repo Map

```
<projectName>/
├── packages/
│   ├── core-api/          # Backend Fastify service
│   └── shared/            # Shared DTOs, domain types, events, generated SDK
├── clients/
│   └── <projectName>/     # React web application
├── tests/
│   ├── unit/              # Service-level unit tests
│   ├── integration/       # DB-backed integration tests (Fastify inject)
│   ├── functional/        # SDK functional API tests (full-stack through generated client)
│   └── api/               # Deployed smoke tests (thin health/auth verification)
├── requirements/
│   ├── reference/         # Seed discovery materials
│   ├── product-overview/  # Piper's discovery artifacts
│   └── product-requirements/ # Pam's refined product requirements
├── tech-specs/            # Tom's technical specifications (per-feature)
├── plans/                 # Design plans, execution plans, task tables
├── rules/                 # Architecture, service, testing, workflow rules
├── agents/                # Persona playbooks (Pam, Tom, Dom, Archie, etc.)
└── infrastructure/        # Docker, Terraform, CI/CD configuration
```
