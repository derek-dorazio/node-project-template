# Agent Instructions

This is the canonical instruction file for coding agents working on `<projectName>`.

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

## Workflow Expectations

- Follow the spec-driven lifecycle: Requirements → Domain Model → Use Cases → Design Plans → Execution Plans → Implementation.
- Track work through plan task tables. Mark tasks `In Progress` when starting, `Done` when all layers are complete.
- Do not implement behavior that isn't covered by a documented use case. If a use case is missing, write it first.
- Update every affected plan when finishing work.

## Quality Gates

Before pushing code, agents must pass the required local validation set:

1. `npx turbo typecheck --force`
2. `npx eslint --max-warnings 0`
3. Backend unit tests
4. Backend integration tests
5. SDK functional API tests
6. Merged backend coverage
7. `npm run api:refresh` and `npm run api:validate` when API schemas change

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
