# Testing Rules

All services and clients must follow these testing standards. This document defines the testing strategy, contract verification rules, functional test expectations, and when old tests should be removed rather than preserved.

---

## 1. Testing Tools

### Backend

| Tool | Purpose |
|---|---|
| Jest | Unit and integration test runner |
| Fastify `inject` | Request/response data integration testing |
| Prisma test DB / local Postgres | Persistence-backed data integration tests |
| Generated hey-api SDK | Functional API tests (full-stack through SDK) |
| `nock` / service mocks | External dependency isolation |

### Frontend

| Tool | Purpose |
|---|---|
| Vitest | Unit and integration test runner |
| React Testing Library | User-focused component and page tests |
| MSW | Request-level API mocking |
| Playwright | Browser E2E tests |

---

## 2. Test Layers

### Backend

| Suite | Scope | Real DB | Notes |
|---|---|---|---|
| Unit | Function/service behavior in isolation | No | Mock dependencies intentionally; prove business logic here |
| Data Integration | Persistence-layer behavior through real DB queries, repositories, and lower-level route/service reads/writes | Yes | Persistence-layer unit proof: CRUD, query correctness, filtering, sorting, joins, aggregations, fallback queries, and integrity constraints |
| Contract Verification | Live response/request shape vs DTO schema on representative endpoints | Yes | Thin API-boundary schema-alignment gate; implemented as integration-style suites |
| Functional API (FAPI) | Full service-stack verification through the generated SDK and real HTTP | Yes | Emulates real web/mobile SDK consumers and proves API-exposed flows, not exhaustive branch/query permutations |

### Frontend

| Layer | Scope | API |
|---|---|---|
| Unit | Presentational components, utilities | Mocked only if network irrelevant |
| Integration | Hooks/pages/user flows | MSW |
| Browser E2E | Deployed browser flows | Real deployed API |

### What Each Layer Proves

- **Unit tests** prove service logic works with controlled inputs. Exhaustive business-logic coverage should live here when the logic can be proven without the DB.
- **Data integration tests** prove persistence and query behavior against a real database. CRUD, query correctness, DB-backed edge cases, and lower-level state transitions.
- **Contract verification** proves exported DTO/OpenAPI alignment on representative endpoints. Thin schema-drift detection, not behavioral coverage.
- **Functional API tests** prove the entire stack works end-to-end from a real SDK consumer's perspective: SDK types → HTTP → routing → validation → service → database → response → SDK deserialization. This is the **primary behavioral test surface**.
- **Smoke tests** prove a deployed environment is healthy (not behavioral coverage).
- **Browser E2E** proves the UI works as a user would experience it.

---

## 3. Required Local Quality Gates

Before pushing code:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run test:service:unit` (service unit tests)
4. `npm run test:service:integration` (service data integration tests)
5. `npm run test:service:functional-api` (service SDK functional API tests)
6. `npm run test:coverage:service:merged` (merged service coverage)
7. `npm run test:<projectName>:unit` (frontend unit tests)

Contract-verification-specific commands:

8. `npm run openapi-contract-check` when API schemas change

Notes:
- Treat these as pre-push gates, not optional follow-up checks.
- Coverage threshold enforcement is part of the required gate.
- Smoke tests and browser E2E remain CI/deployment signals.

---

## 4. Functional API Test Suite

The functional API test suite is the **primary pre-merge behavioral test surface**. It exercises the entire service stack through the generated SDK client.

### Architecture

```
Test Runner (Jest)
  └── hey-api SDK (typed operations)
        └── HTTP (localhost:0, random port)
              └── Fastify (listen, real routing, validation, auth)
                    └── Service → Repository → Prisma → Postgres
                          └── Response → Fastify serialization → SDK deserialization
```

Tests start Fastify with `app.listen({ port: 0 })` and configure the SDK client to target `http://localhost:{port}`. This exercises the full request/response cycle including HTTP serialization, the SDK's type system, and real database persistence.

### What It Tests

1. **CRUD operations** — create, read, update, delete for every domain object.
2. **Use-case workflows** — multi-step journeys matching documented use cases.
3. **Business rules** — validation, uniqueness, lifecycle constraints, ownership.
4. **Authorization** — unauthenticated, wrong-role, wrong-scope rejection.
5. **Error behavior** — structured error responses for 400, 401, 403, 404, 409.
6. **Data integrity** — query results after operations, verify database state matches expectations.

### When a Backend Behavior Belongs in FAPI

- The behavior should be proven from the perspective of a real SDK client
- Real HTTP serialization or cookie/session handling matters
- The flow is a documented API use case or client journey
- The frontend or a mobile client would rely on the behavior as a product capability
- The test should verify positive flow, negative/error flow, permission behavior, or representative parameter handling at the API layer

### Do Not Use FAPI When

- The only value is proving a DTO shape on a representative endpoint
- The assertion is mainly about DB persistence internals rather than a client-visible workflow
- The goal is exhaustive logic-branch or query-permutation coverage that belongs in unit or data integration tests

### File Naming

Files use `.functional.ts` suffix: `league-lifecycle.functional.ts`, `auth.functional.ts`, etc.

### Use-Case Traceability

Every functional test must trace to a documented use case. Reference the plan and use-case ID in a comment or describe block name.

### Data Strategy

- Functional tests create all data through SDK operations (not Prisma inserts).
- Use shared builder functions for repeated object-graph setup.
- Builders use SDK operations so they are themselves testing the create path.
- Use unique identifiers (timestamps, UUIDs) to avoid collisions.
- Functional cleanup helpers must delete child records before parent records; for multi-entity flows, remove dependent entities before the owning entities.
- Functional builders and setup helpers must fail descriptively. When an SDK setup call fails, include the response status and error payload in the thrown error so review and debugging do not stop at a vague "register failed" message.

### Assertion Rules

- Assertions must be strong and intentional. Do not accept broad fallback status ranges like `200 | 400 | 500`.
- When endpoint contracts change, functional tests must change with them.
- When a slice introduces or standardizes intentional error conditions, functional API coverage must include explicit negative-path cases for those errors and assert the expected application error codes, not just the HTTP status.
- Do not stop at a single generic failure case when the route exposes multiple meaningful denial reasons; cover the distinct error conditions that the frontend or other clients need to handle differently.

### Contract Subsumption

If the SDK compiles and the typed response is correct, the contract is proven. Separate `.safeParse()` contract tests are not needed when functional API tests cover the endpoints.

---

## 5. Contract Verification Rules

API contracts are first-class test surfaces. Contract verification is an **execution gate**, not a follow-up task.

- Contract verification suites must validate live responses against DTO Zod schemas using `.safeParse()`.
- If response shape changes, update the contract-verification case in the same change.
- Do not rely on TypeScript alone to prove runtime payload shape correctness.

### Contract Verification Gate

A backend slice that adds or changes an API endpoint is **not complete** until a contract-verification case exists for that endpoint.

If the contract-verification suite files do not yet exist, the first slice that adds or changes an endpoint must create them. Subsequent slices add cases to the existing suites.

**Minimum contract-verification case per endpoint:**

```typescript
it('GET /api/v1/<resource> matches <Resource>ResponseSchema', async () => {
  const res = await app.inject({ method: 'GET', url: '/api/v1/<resource>', headers: authHeaders });
  expect(res.statusCode).toBe(200);
  const parsed = <Resource>ResponseSchema.safeParse(JSON.parse(res.payload));
  expect(parsed.success).toBe(true);
});
```

Do not defer contract verification to a "testing cleanup slice." It is part of the slice that changes the contract.

### Contract Verification Heuristics

Use contract verification when the goal is to prove exported DTO/OpenAPI alignment, not to re-run whole user journeys.

- Keep these suites small and representative.
- Validate endpoints that are new, materially changed, or especially likely to drift.
- Prefer one focused schema assertion over a second broad behavioral workflow.
- Do not turn contract verification into a duplicate FAPI suite.
- Do not keep a contract-verification case once it only repeats behavior already better proved elsewhere and adds no schema-drift signal.

---

## 6. Backend Data Integration Tests

Data integration tests live under `tests/integration/`.

Treat data integration as the persistence-layer unit suite.

Use data integration when the test needs to prove something at the persistence or lower-level runtime boundary:

- Repository and persistence correctness
- CRUD behavior
- Query correctness
- Filtering, sorting, joins/includes, and aggregation behavior
- DB-backed fallback behavior
- Lower-level state transitions that are not meaningful product journeys on their own
- Persistence-edge constraints such as uniqueness, cascade/delete behavior, recalculation persistence, or read-model materialization
- Route behavior that is still best exercised with `Fastify.inject()` and direct DB inspection

Do not keep a data integration test if:
- FAPI now proves the same workflow, error behavior, and client-visible outcome with equal or better confidence
- The test exists only because a weaker pre-SDK strategy once needed it

Prefer to keep data integration tests for:
- Scoring persistence/recalculation
- Repository-heavy ingestion persistence
- History fallback logic
- Draft/roster persistence details that are more about stored state than client workflow
- Query/read-model correctness where the main proof is "this returns the correct data from the real DB"

### Data Integration Depth Requirement

Data integration files should prove a meaningful slice of persistence or lower-level runtime behavior, not stop at a single happy-path stub.

- Prefer 3-5 substantial cases per file when the surface naturally supports it.
- Cover the relevant mix of:
  - Happy path
  - Negative validation path
  - Permission/authorization path where applicable
  - Not-found or missing-state path where applicable
- It is acceptable for a highly focused persistence file to have fewer cases when the subject is intentionally narrow, but that should be the exception rather than the default.
- Do not create placeholder data-integration files that only prove one trivial success path and leave the real persistence/query behavior untested.

---

## 7. Backend Suite Placement Heuristics

When choosing a backend suite, use this order:

### 1. Unit
- Isolated logic, no DB
- Deterministic business-rule branches
- Exhaustive business-logic coverage should live here when the logic can be proven without the DB

### 2. Data Integration
- Persistence-layer unit proof
- CRUD and query behavior
- DB-backed edge cases
- Lower-level route/service transitions that are not primary client journeys

### 3. Contract Verification
- DTO/OpenAPI alignment on representative endpoints
- Response schema drift detection
- Thin request/response shape checks

### 4. Functional API (FAPI)
- Generated SDK, real HTTP
- Real product workflows
- Auth/session behavior
- Cross-endpoint business journeys
- Client-visible error handling
- Representative parameter combinations
- Not exhaustive permutations already proven by unit/data integration

If a test could fit in both Data Integration and FAPI, prefer:
- **FAPI** for user/client workflows
- **Data Integration** for persistence edges, query correctness, and lower-level state invariants

Redundancy between suites is acceptable when each suite is true to its purpose. Do not delete a test merely because another layer also touches the same feature area. Remove a test only when it no longer serves its intended suite role.

---

## 8. Test Data Builders

Tests must create complex object graphs through shared builder functions, not copy-pasted setup blocks.

### Rules

- Shared test builders live in `tests/helpers/builders.ts` or `tests/functional/builders.ts`.
- Each builder creates a valid domain object through real service calls or SDK operations.
- Builders return the created object (with ID) so tests can reference it.
- Builders accept optional overrides; use sensible defaults for everything else.
- Builders must use unique identifiers to avoid collisions.

---

## 9. Domain Event Testing

The in-process event bus is a critical architectural seam.

### What Must Be Tested

- **Event emission**: Verify the correct event is emitted with the expected payload after a state change.
- **Subscriber behavior**: Verify the subscriber performs the expected side effect when an event is received.
- **Event contract**: Event payloads must match typed interfaces.

### Rules

- Every domain event type must have at least one emission test and one subscriber test.
- When adding a new event type, add both tests in the same slice.
- Test observable behavior, not event bus internals.

---

## 10. Integration Test Isolation and Cleanup

Integration and functional tests share a single Postgres database and run serially.

- Every test that creates data must clean up in `afterAll` or `afterEach`.
- Tests must not depend on data created by other test files.
- Tests must not depend on execution order.
- Use unique identifiers for all created records.
- Do not rely on `prisma migrate reset` between test runs. Tests must be idempotent against a persistent database.

---

## 11. Smoke and Browser E2E Rules

Smoke and E2E tests should be use-case driven and traceable to documented product journeys.

### Use-Case Traceability

Every smoke and E2E test must trace to a documented use case. Reference the plan and use-case ID.

### API Smoke Tests

- Lives under `tests/api/functional/*.smoke.ts`.
- Thin post-deploy health and connectivity verification.
- Smoke tests create their own data through real deployed API routes.
- Do not rely on seed data, fake UUIDs, or preexisting state.
- Assertions must be strong and intentional.
- Keep scope minimal: health check, auth round-trip, one core domain operation.

### Browser E2E Tests (Playwright)

- Lives under `clients/<projectName>/e2e/`.
- Uses Playwright against a running app.
- In CI, browser E2E runs only after smoke tests succeed.

**Use-case driven:**
- E2E tests prove complete user journeys, not page loads.
- Tests perform the full action: fill forms, click buttons, verify state changes.
- Assert observable outcomes, not just "page rendered."

**Data strategy:**
- Create data through real UI flows whenever possible.
- Do not hardcode seed data IDs.
- Seeded admin credentials are acceptable for admin flows.

**Selector rules:**
- Prefer stable machine selectors (`data-testid`, stable `id`) over visible text.
- Do not anchor tests to marketing copy or translated strings unless testing that copy.

**Error detection:**
- Every E2E test must assert no uncaught exceptions, no console errors, and no error boundary fallback UI.

---

## 12. MSW Rules

MSW is the default pattern for frontend tests that should exercise real request wiring.

Use MSW when testing hooks, pages, form submissions, authenticated screens, and query/mutation behavior.

### Banned Frontend Test Patterns

- `vi.mock('@/lib/api-client')` — mocking the API layer so completely that request construction never runs
- Tests that only assert copied path strings
- Preserving tests that validate retired behavior
- Broad MSW rewrites expanding scope without approval

### Allowed Cleanup

Remove tests if they are:

- Enforcing obsolete manual API wrappers
- Built around fake application fallback data that no longer exists
- Lower-signal duplicates of stronger MSW/contract verification coverage

Do not keep bad tests just because they already exist.

### Test Proof Rules

- Tests must prove the behavior they claim to cover, not just that the page renders.
- If a test claims role or permission behavior, it must assert an observable difference.

---

## 13. What Must Be Tested

### Backend

- Authentication and authorization behavior
- Route validation behavior
- DTO contract compliance
- Error response shape compliance
- Persistence for changed model fields
- Domain isolation boundaries
- Domain event emission and subscriber behavior
- Critical business flows as documented in use cases

### Frontend

- Loading, error, and empty states
- Form validation and submission
- Navigation to critical product pages
- Mutations that change server state
- Critical authenticated flows

---

## 14. What Not To Do

- Do not keep tests that verify bad architecture.
- Do not preserve tests for removed UI or endpoints.
- Do not update mocks without checking whether the real contract changed.
- Do not hand-wave broken contract verification as "just generated client issues."
- Do not skip OpenAPI validation after changing route schemas.

---

## 15. Documentation Drift Rules

If test strategy changes materially, update this file in the same work.
