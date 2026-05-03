# Architecture Rules

All plan documents and implementation work must conform to these rules. This is the single source of truth for system-level architecture, infrastructure, and cross-cutting decisions.

**For implementation-level rules, see:**
- **[Service Rules](service-rules.md)** — backend TypeScript, Fastify, Prisma, OpenAPI, DTO, and mapper rules
- **[React UI Rules](react-ui-rules.md)** — React app technology, generated API client usage, TanStack Query, and frontend testing patterns
- **[UX Rules](ux-rules.md)** — first-draft UX conventions, action hierarchy, state communication, accessibility
- **[Testing Rules](testing-rules.md)** — unit, integration, functional API, smoke, and browser E2E rules
- **[Workflow Rules](workflow-rules.md)** — spec-driven lifecycle, plan tracking, and rule maintenance
- **[Domain Model Conventions Rules](domain-model-conventions-rules.md)** — lifecycle naming, `status` vs `isActive`, and shared domain-model consistency defaults

---

## 1. Tech Stack Summary

### Backend

| Concern | Choice | Details In |
|---|---|---|
| Language | TypeScript (strict mode) | [Service Rules](service-rules.md) |
| API framework | Fastify | [Service Rules](service-rules.md) |
| Validation | Zod DTO schemas converted to Fastify JSON Schema | [Service Rules](service-rules.md) |
| API contract | OpenAPI 3.1 generated from live Fastify route schemas | [Service Rules](service-rules.md) |
| Client generation | `@hey-api/openapi-ts` + `@hey-api/client-fetch` | [Service Rules](service-rules.md) |
| ORM / DB access | Prisma | [Service Rules](service-rules.md) |
| Runtime | Node.js 22+ LTS | — |
| Queue / async work | In-process event bus; add external queueing only when the architecture truly needs it | — |
| Auth | App-issued JWT access + refresh tokens, with social auth callback support | [Service Rules](service-rules.md) |

### Frontend — Web

| Concern | Choice | Details In |
|---|---|---|
| Framework | React 18+ TypeScript | [React UI Rules](react-ui-rules.md) |
| UI library | shadcn/ui + Radix UI + TailwindCSS | [React UI Rules](react-ui-rules.md) |
| Build tool | Vite | [React UI Rules](react-ui-rules.md) |
| Server state | TanStack Query | [React UI Rules](react-ui-rules.md) |
| Client state | Zustand | [React UI Rules](react-ui-rules.md) |
| Forms | React Hook Form | [React UI Rules](react-ui-rules.md) |
| Routing | React Router | [React UI Rules](react-ui-rules.md) |
| API access | Shared generated `hey-api` SDK | [React UI Rules](react-ui-rules.md) |

### Databases and Infrastructure

| Concern | Choice | Rationale |
|---|---|---|
| Primary relational DB | PostgreSQL | Prisma-backed primary application database |
| Cache / messaging | In-process event bus + persistent services where needed | No external dependency in MVP runtime |
| Containers | Docker | Consistent local and CI environments |
| IaC | Terraform | Reproducible infrastructure |
| CI/CD | GitHub Actions | Build, typecheck, test, deploy |
| Monitoring | Sentry + cloud metrics/logging | Operational visibility |
| Monorepo | npm workspaces + Turborepo | Shared packages and fast pipelines |

---

## 2. Contract-First API Architecture

The project is **contract-first at the API boundary**.

The source-of-truth chain is:

`Zod DTO schema → Fastify route schema → exported OpenAPI spec → generated hey-api client → web app usage`

Required implications:

- Backend routes must describe real request and response payloads.
- OpenAPI generation is part of the build contract, not optional documentation.
- Frontend code must consume the generated SDK/types instead of recreating API contracts locally.
- If the generated client is wrong, fix the backend route schema or DTO first. Do not patch around it in app code.

### OpenAPI Rules

- The live Fastify app is the source for exported OpenAPI, not a hand-written YAML file.
- `npm run api:refresh` is the standard regeneration command (export spec + regenerate client).
- `npm run api:validate` must stay green.
- Generated files are artifacts. Do not hand-edit them.

### Route Source of Truth

- A shared `api-routes.ts` file is the source of truth for canonical route constants used by backend, integration tests, smoke tests, and MSW handlers.
- For frontend runtime code, the generated SDK is the primary path source of truth.

---

## 3. No Mock Data in Application Code

This is a non-negotiable architecture rule.

- Application code must never ship mock data, fake data, seeded sample responses, or development-only fallback payloads.
- If an endpoint is missing or broken, surface loading/error/empty UI states. Do not hide the defect with fake data.
- This applies across backend services, web hooks/pages/stores, and shared runtime modules.
- Test doubles belong only in test code, fixtures, previews, or dedicated test infrastructure.

Banned patterns:

- `if (process.env.NODE_ENV === 'development') return mockData`
- `initialData: mockData` in TanStack Query
- `queryFn: async () => mockData`
- `catch { return mockData }`
- Hand-built success envelopes that do not reflect the real domain payload

---

## 3A. Provider/Adapter Registry Discipline

When a backend module dispatches to one of several pluggable providers (sport-data feeds, payment gateways, identity providers), the registry must be a true factory keyed by provider id. The registry must reject any code path that hardcodes a single allowed id — even if today the only configured provider is a mock.

Mock providers are valid when registered through the same factory pattern as real providers. The defect is not that a mock provider exists; it is when the registry rejects every other id and prevents real adapters from ever being wired.

**Production and staging environments must reject any provider id whose name starts with `mock-` unless an explicit `ALLOW_MOCK_PROVIDERS=true` env override is present and logged at startup.**

**QA and dev environments may use mock providers freely.** No env override is required for non-production runtimes — but the registry must still log the active provider id at startup so the choice is auditable.

Adapter classes that exist in the tree but cannot be reached through the registry are dead code under §3 and must be deleted, regardless of whether they are mocks or real implementations.

---

## 4. Service Topology

All backend services are TypeScript services with explicit module boundaries.

| Service | Responsibility |
|---|---|
| Core API | Auth, domain CRUD, admin, notifications, history |
| Domain modules | Specialized business logic (e.g., draft engines, scoring) |
| Ingestion worker | External data provider ingestion |
| Notification module | In-app delivery orchestration |

### Architectural Rules

- Keep domain modules isolated behind services and mappers.
- Route handlers do not return raw Prisma models.
- Database access stays behind service/repository boundaries.
- Cross-module communication uses shared events and typed contracts.
- Multi-tenancy or domain isolation must remain explicit in request context and persistence boundaries.

### Domain Event Bus

The in-process event bus is the primary mechanism for cross-module communication. It is an architectural seam, not an implementation detail.

- Every domain event type must be defined as a typed interface in a shared events package.
- Services emit events after successful state changes, not before.
- Subscribers must not assume emission order or delivery guarantees beyond "at least once, in process."
- Event payloads must be serializable (no Prisma models, no class instances, no functions).
- When adding a new event type, update the event type registry and add emission + subscriber tests.

---

## 4A. Event-Driven Mutation Discipline

Event-driven recalculations that mutate the same persisted state under concurrent emission must be:

1. **Idempotent** — implemented via upsert keyed on stable identifiers, not delete-then-recreate. A second invocation with the same input must produce the same persisted state without intermediate inconsistency.
2. **Serialized per recalc key** — concurrent emissions targeting the same key (e.g., `aggregateId`) must serialize via Postgres advisory lock or a per-key in-process queue. `Promise.all` over event handlers without isolation is forbidden for state-mutating subscribers.
3. **Atomic at the recalc boundary** — when a recalc loops over child records, the loop must run inside a single `prisma.$transaction`. Per-iteration transactions inside an unwrapped loop are forbidden — partial failure leaves the system in an inconsistent state with no rollback signal to the caller.
4. **Backpressured** — fan-out subscribers must coalesce events targeting the same recalc key within a debounce window. One event per source record should not produce N×R recalculations of the same aggregate.

### Subscriber failure policy

Each subscriber must declare an explicit failure policy:

- **Default — isolated, `allSettled`-style.** Subscriber failures are caught at the bus boundary, logged with structured context, and never abort the publish. This is the right policy for the vast majority of subscribers, especially side-effect subscribers (notifications, audit logs, analytics).
- **Fail-fast** — only when the subscriber is logically inseparable from the publisher and the publisher genuinely needs failure to surface. In that case, justify the choice in code, route the failure through a follow-up event (e.g., `<aggregate>.recalc.failed`), and never propagate as an unhandled publisher reject.

`Promise.all` over event handlers without explicit per-subscriber failure policy is forbidden — it produces accidental cascades where one subscriber's bug aborts every other subscriber's work.

---

## 5. Project Structure

```
<projectName>/
├── packages/
│   ├── core-api/                # Backend Fastify service
│   │   ├── prisma/              # Schema, migrations, seed
│   │   └── src/
│   │       ├── core/            # Cross-cutting concerns (auth, errors, permissions)
│   │       ├── plugins/         # Fastify plugins (auth guard, swagger, health)
│   │       ├── adapters/        # Repository implementations (Prisma)
│   │       ├── mappers/         # DTO transformation functions
│   │       └── modules/         # Domain modules (routes, handlers, services)
│   └── shared/                  # Shared across backend and frontend
│       ├── api-routes.ts        # Canonical route constants
│       ├── dto/                 # Zod DTO schemas
│       ├── domain/              # Domain types, enums, constants
│       ├── events/              # Event bus and typed event definitions
│       └── generated/           # OpenAPI spec + generated hey-api client
│           ├── openapi.json
│           └── hey-api/
├── clients/
│   └── <projectName>/          # React web application
│       ├── src/
│       │   ├── lib/api.ts       # SDK client configuration + re-export
│       │   ├── pages/           # Route-level page components
│       │   ├── components/      # Reusable UI components
│       │   └── hooks/           # Custom React hooks
│       └── e2e/                 # Playwright browser tests
├── tests/
│   ├── unit/                    # Service-level unit tests (Jest)
│   ├── integration/             # DB-backed integration tests (Fastify inject)
│   ├── functional/              # SDK functional API tests (full-stack)
│   └── api/                     # Deployed smoke tests
├── plans/                       # Specs, use cases, design plans, execution plans
│   └── archive/                 # Completed/superseded plans
├── rules/                       # Architecture, service, testing, workflow rules
├── scripts/                     # Build, coverage merge, dev tooling
└── infrastructure/
    ├── docker/                  # Dockerfiles, docker-compose
    └── terraform/               # IaC definitions
```

### Structural Rules

- Tests remain outside production `src/` folders.
- Generated API artifacts live under the shared package's `generated/` directory.
- The web app consumes the generated API package.
- Do not create parallel handwritten clients when the shared generated client exists.

---

## 6. App Identity and Access

Before building authenticated features, define and document:

1. **User identity model** — how users are identified, what attributes they carry, whether they are global or scoped.
2. **Roles and permissions** — what roles exist, how they are assigned, what each role can do.
3. **Authentication mechanism** — JWT, cookies/sessions, social auth, MFA requirements.
4. **Authorization boundaries** — what entity (organization, workspace, team) scopes a user's permissions.
5. **Admin vs. product separation** — whether platform administration is a separate surface or role-based within the product.

These decisions should be captured in a use-case document before implementation. The auth module and permission system are foundational — retrofitting them is expensive.

### Recommended Defaults

- One web application with role-based access (not separate admin/user apps).
- JWT access tokens (short-lived) + refresh tokens (DB-stored, revocable).
- Permissions stored per-membership within the scoping entity.
- Admin capability as an elevated role, not a separate identity system, unless platform operations genuinely require separation.

---

## 7. Documentation and Drift Prevention

Architecture rules must describe the codebase that actually exists, not an aspirational future state.

- When API-contract flow changes, update these architecture rules and the service/react/testing rules in the same change.
- When testing patterns change materially, update testing rules.
- When generated-client usage changes, update react UI rules, service rules, and model change rules.
- If a rule conflicts with the codebase after a refactor, update the rule immediately.
