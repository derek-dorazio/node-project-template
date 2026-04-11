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
5. **[Testing Rules](testing-rules.md)** — unit, integration, functional API, smoke, E2E, and contract testing strategy
6. **[Model Change Rules](model-change-rules.md)** — definition of done when domain models change

## Persona Playbooks

The `agents/` directory contains role-scoped playbooks for common kinds of work:

- `agents/product-manager.md` — requirements discovery, use-case design, UX flow review
- `agents/project-manager.md` — slicing work, sequencing, plan reconciliation
- `agents/data-modeler.md` — domain model derivation, Mermaid diagrams, data dictionaries
- `agents/architect.md` — design plans, execution slices, CI/CD, infrastructure
- `agents/backend-developer.md` — service implementation, DTOs, mappers, backend tests
- `agents/frontend-developer.md` — React app implementation, SDK consumption, frontend tests
- `agents/code-reviewer.md` — review passes, findings tables, acceptance decisions

Use these playbooks to focus the workflow for that role.

Important:

- `AGENTS.md` and `rules/` remain the canonical shared contract.
- `agents/` files must not redefine or contradict repo-wide policy.
- Cross-cutting workflow requirements such as checking plans, updating task rows, and validating slices remain required for all agents, not just the project-manager persona.

## Workflow Expectations

- Follow the spec-driven lifecycle: Requirements → Domain Model → Use Cases → Design Plans → Execution Plans → Implementation.
- Track work through plan task tables. Mark tasks `In Progress` when starting, `Done` when all layers are complete.
- Do not implement behavior that isn't covered by a documented use case. If a use case is missing, write it first.
- Update every affected plan when finishing work.
- Do not maintain competing instruction sets across `AGENTS.md`, `CLAUDE.md`, `rules/`, and `agents/`.

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
├── plans/                 # Spec documents, design plans, execution plans
├── rules/                 # Architecture, service, testing, workflow rules
└── infrastructure/        # Docker, Terraform, CI/CD configuration
```
