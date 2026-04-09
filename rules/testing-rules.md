# Testing Rules

All services and clients must follow these testing standards. This document defines the testing strategy, quality gates, and when old tests should be removed rather than preserved.

---

## 1. Testing Tools

### Backend

| Tool | Purpose |
|---|---|
| Jest | Unit and integration test runner |
| Fastify `inject` | Request/response integration testing |
| Prisma test DB / local Postgres | Persistence-backed integration tests |
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

| Layer | Scope | Real DB | Interface | Notes |
|---|---|---|---|---|
| Unit | Function/service behavior | No | Direct function calls | Mock dependencies intentionally |
| Integration | Fastify + services + persistence | Yes | `app.inject()` | Validates persistence and routing |
| Functional API | Full stack through generated SDK | Yes | hey-api SDK over HTTP | Primary behavioral test surface |
| Smoke | Deployed environment health | Deployed | Raw HTTP | Thin post-deploy verification |

### Frontend

| Layer | Scope | API |
|---|---|---|
| Unit | Presentational components, utilities | Mocked only if network irrelevant |
| Integration | Hooks/pages/user flows | MSW |
| Browser E2E | Deployed browser flows | Real deployed API |

### What Each Layer Proves

- **Unit tests** prove service logic works with controlled inputs.
- **Integration tests** prove persistence and query behavior against a real database.
- **Functional API tests** prove the entire stack works end-to-end: SDK types → HTTP → routing → validation → service → database → response → SDK deserialization. This is the **primary behavioral test surface**.
- **Smoke tests** prove a deployed environment is healthy (not behavioral coverage).
- **Browser E2E** proves the UI works as a user would experience it.

---

## 3. Required Local Quality Gates

Before pushing code:

1. `npx turbo typecheck --force`
2. `npx eslint --max-warnings 0`
3. `npx jest --config tests/jest.config.js --forceExit` (unit tests)
4. `npx jest --config tests/integration/jest.config.js --forceExit` (integration)
5. `npx jest --config tests/functional/jest.config.js --forceExit` (functional API)
6. `npm run test:coverage:backend` (merged coverage)
7. Frontend unit tests (`npx vitest run`)
8. `npm run api:refresh` and `npm run api:validate` when API schemas change

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

### File Naming

Files use `.functional.ts` suffix: `league-lifecycle.functional.ts`, `auth.functional.ts`, etc.

### Use-Case Traceability

Every functional test must trace to a documented use case. Reference the plan and use-case ID in a comment or describe block name.

### Data Strategy

- Functional tests create all data through SDK operations (not Prisma inserts).
- Use shared builder functions for repeated object-graph setup.
- Builders use SDK operations so they are themselves testing the create path.
- Use unique identifiers (timestamps, UUIDs) to avoid collisions.

### Contract Subsumption

If the SDK compiles and the typed response is correct, the contract is proven. Separate `.safeParse()` contract tests are not needed when functional API tests cover the endpoints.

---

## 5. Contract Testing Rules

For endpoints not yet covered by the functional API suite, contract tests must validate live responses against DTO Zod schemas using `.safeParse()`.

A backend slice that adds or changes an API endpoint is **not complete** until either:
- A functional API test covers the endpoint, or
- A contract test validates the response shape.

Do not defer contract or functional test coverage to a later cleanup slice.

---

## 6. Test Data Builders

Tests must create complex object graphs through shared builder functions, not copy-pasted setup blocks.

### Rules

- Shared test builders live in `tests/helpers/builders.ts` or `tests/functional/builders.ts`.
- Each builder creates a valid domain object through real service calls or SDK operations.
- Builders return the created object (with ID) so tests can reference it.
- Builders accept optional overrides; use sensible defaults for everything else.
- Builders must use unique identifiers to avoid collisions.

---

## 7. Domain Event Testing

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

## 8. Integration Test Depth Requirement

Integration test files must not be single-case stubs. Each file should include at minimum:

- **Happy path**: The primary use case succeeds.
- **Validation/negative path**: Invalid input rejected with correct status code and error shape.
- **Permission/authorization path**: Returns 401 or 403 for unauthorized callers.
- **Not-found path**: Returns 404 for non-existent resources.

Aim for 3-5 test cases per domain integration file.

---

## 9. Integration Test Isolation and Cleanup

Integration tests share a single Postgres database and run serially.

- Every test that creates data must clean up in `afterAll` or `afterEach`.
- Tests must not depend on data created by other test files.
- Tests must not depend on execution order.
- Use unique identifiers for all created records.
- Do not rely on `prisma migrate reset` between test runs.

---

## 10. Smoke and Browser E2E Rules

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

## 11. What Must Be Tested

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

## 12. What Not To Do

- Do not keep tests that verify bad architecture.
- Do not preserve tests for removed UI or endpoints.
- Do not update mocks without checking whether the real contract changed.
- Do not hand-wave broken contract tests.
- Do not skip OpenAPI validation after changing route schemas.

---

## 13. Documentation Drift Rules

If test strategy changes materially, update this file in the same work.
