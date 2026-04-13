# Service Rules

These rules govern backend services, especially Fastify modules, Prisma-backed services, DTOs, mappers, and OpenAPI generation.

---

## 1. Core Standards

- Use TypeScript strict mode.
- Use English for code and documentation.
- Avoid `any`.
- Prefer explicit return types on exported functions and public methods.
- Use descriptive names and small, focused functions.
- Prefer immutable data and `readonly` where practical.
- Use shared enums/constants instead of bare string literals.

### Banned Backend Patterns

- Returning hardcoded sample JSON from handlers
- Returning raw Prisma entities directly from handlers
- Defining a route without a real `schema.response`
- Shipping mock data or development-only fallbacks in application code
- Hand-editing generated OpenAPI/client output
- Fixing generated-client problems with frontend casts instead of repairing backend schemas

---

## 2. No Mock Data in Application Code

- Never include mock data, fake data, stub responses, or hardcoded sample records in backend application code.
- Handlers must return real service results backed by real repositories/data access.
- If a dependency is missing, implement it or surface a real error. Do not fake the response.

---

## 3. Fastify Module Structure

Organize backend code by domain module.

Typical module layout:

```
modules/<domain>/
  routes.ts      # Fastify schemas, handler wiring
  handler.ts     # HTTP → service translation
  service.ts     # Business logic
```

Rules:

- Keep one domain area per module.
- Route files define Fastify schemas and wire handlers.
- Handlers translate HTTP concerns to service calls.
- Services own business logic.
- Mappers translate domain/service results to DTOs.

---

## 4. DTOs, Mappers, and OpenAPI

The project uses DTO-driven API contracts.

### Required Backend Flow

For every API endpoint:

1. Define or update the DTO Zod schema in the shared `dto/` package.
2. Map domain/service results to that DTO in the `mappers/` directory.
3. Use `zodToJsonSchema()` in the Fastify route schema for request/response payloads.
4. Provide `tags`, `summary`, descriptive endpoint documentation, and unique `operationId`.
5. Regenerate and validate the shared OpenAPI/client artifacts.

### Mapper File Requirement

Every module that registers Fastify routes **must** have a corresponding mapper file. The mapper file must export named functions (e.g., `mapContestToDto`, `mapLeagueToListItem`) that handlers call to transform service/domain results into DTO shapes.

- Inline `.map()` transformations in route handlers or handler files are not acceptable.
- The mapper is the single place where persistence/domain shapes are translated to API response shapes.
- Modules exempt from this rule: `config` (static data only), `health` (no domain objects).

### Required Route Schema Fields

Every route must include:

- `tags`
- `summary`
- `description` when the endpoint behavior, audience, or lifecycle context is not obvious from the path and summary alone
- `operationId`
- Request schema where applicable (`body`, `params`, `querystring`)
- `response` schema for every supported status returned by the handler

### Contract Documentation Requirement

Backend-owned API contracts must be documented well enough that frontend implementation can normally work from the generated SDK/types and OpenAPI docs without reading backend service code.

That means:

- Add meaningful route summaries, descriptions, and tags.
- Document DTO/object purpose when the type name alone is insufficient.
- Document field meaning when a consumer could plausibly misread semantics.
- Document enums/status values when names alone do not explain lifecycle or behavior.

If a frontend question reveals that the contract meaning was not clear from the documented API surface, treat that as a backend documentation defect and fix it in the contract source.

### Contract Documentation Checklist

Before finishing backend/shared contract work, explicitly verify:

1. Every changed route still has:
   - `tags`
   - `summary`
   - `operationId`
   - `description` when behavior, audience, lifecycle, or permissions are not obvious from the path and summary alone
2. Every changed request and response schema in the shared `dto/` package has:
   - An object-level description when the schema represents a meaningful payload or DTO
   - Field descriptions for any property whose semantics are not unmistakable from its name alone
3. Any changed enum, status, lifecycle value, or role exposed to clients is documented when the value names alone do not explain how the client should interpret them.
4. Any frontend question that required backend explanation is either:
   - Now answered by the documented contract source, or
   - Escalated as a product ambiguity rather than left as tribal knowledge.
5. `npm run api:refresh` has been rerun after contract changes, and the generated artifacts still reflect the improved descriptions.

Do not treat contract documentation as optional polish after the code is correct. For backend/shared API work, documentation completeness is part of the definition of done.

### Response Rules

- Always describe the real response envelope.
- If the response is `{ league: ... }`, schema must say `{ league: ... }`.
- Dates over the wire must be ISO 8601 strings, not `Date` objects.

### Generated Artifacts Rules

- Run `npm run api:refresh` after DTO/route changes that affect the contract.
- Run `npm run api:validate` after regeneration.
- Never hand-edit generated OpenAPI or client files.

### What Not To Do

- Do not leave placeholder response schemas on endpoints that return real domain data.
- Do not omit response schemas because "the frontend already knows."
- Do not add local frontend interfaces to paper over backend schema gaps.

---

## 5. Prisma and Persistence

- Use Prisma for database access.
- Keep persistence concerns out of handlers.
- Keep Prisma row shapes from leaking directly into API responses.
- When Prisma models change, update DTOs, mappers, route schemas, and tests in the same work.
- Prefer explicit mapping from persistence models to domain/DTO models.

---

## 6. Enums, Constants, and Paths

### Enums and Status Values

- Never compare important state with ad hoc bare strings if a shared enum/constant exists.
- Use shared domain constants/enums.
- Route schema enums must derive from shared values, not copied literal arrays.

### Route Constants

- A shared `api-routes.ts` is the canonical route constant registry.
- Use it for backend registration prefixes, integration tests, smoke tests, and MSW handlers.

### Frontend Boundary

- Frontend runtime app code should prefer the generated SDK over manual path constants.
- Backend work must still keep route constants current for non-generated consumers.

---

## 7. Error Handling

- Catch exceptions only to add context, translate domain errors, or handle expected failures.
- Do not swallow backend errors to preserve a fake success path.
- Prefer clear typed/domain errors over ambiguous generic errors.
- Let global Fastify error handling deal with unhandled failures.

### Error Response Shape Consistency

All error responses must follow a consistent envelope:

```typescript
{
  error: {
    code: string;         // machine-readable (e.g., "LEAGUE_NOT_FOUND", "VALIDATION_ERROR")
    message: string;      // human-readable description
    details?: unknown;    // optional structured details (validation field errors, etc.)
  }
}
```

Rules:
- Every 4xx and 5xx response must return this envelope.
- Validation errors (400) should include `details` with per-field errors when available.
- Not-found errors (404) should use domain-specific codes (e.g., `CONTEST_NOT_FOUND`).
- Permission errors (403) should use codes that distinguish the denial reason (e.g., `INSUFFICIENT_PERMISSION`, `NOT_MEMBER`).
- Intentional application errors must use stable, descriptive, domain-specific codes rather than transport-only placeholders such as `BAD_REQUEST`, `FORBIDDEN`, or `NOT_FOUND` when the domain reason is known.
- Error codes must be specific enough for clients and tests to distinguish materially different failures that share the same HTTP status.
- Human-readable messages must explain the real failure clearly without exposing unsafe internals.
- When useful, `details` should carry structured machine-readable context rather than ad hoc string blobs.
- Define a shared Zod schema for the error envelope in the shared `dto/` package.
- Fastify's global error handler should format unhandled errors into this envelope where practical, and new route work should not bypass that standard.
- Route schemas must declare error response shapes for the most relevant statuses such as 400, 401, 403, and 404.

---

## 8. Testing Expectations for Backend Work

- Unit-test service logic.
- Integration-test request/response behavior with Fastify `inject`.
- Add SDK functional tests for use-case workflows, CRUD, auth, and error paths.
- When API schema changes, verify: functional tests, `api:refresh`, `api:validate`.

### Do Not Preserve Bad Tests

- Do not keep tests that only lock in outdated behavior.
- Replace stale tests with stronger coverage where that provides better signal.

---

## 9. Backend Review Checklist

Before finishing backend API work, verify:

1. Does every changed route have real request/response schemas?
2. Do handlers return mapped DTOs instead of raw Prisma rows?
3. Is `operationId` present and unique?
4. Does `npm run api:refresh` succeed?
5. Does `npm run api:validate` succeed?
6. Did generated files update as expected?
7. Do SDK functional tests cover the changed endpoints?
8. Did changed routes and DTOs pass the Contract Documentation Checklist above?

---

## 10. Pre-Commit Self-Review

Before committing backend code, scan changed files for anti-patterns:

| Pattern to find | What it means | Fix |
|---|---|---|
| `additionalProperties: true` in route schemas | Passthrough/generic response schema | Replace with Zod DTO |
| Placeholder schema on a route returning domain data | Not a real contract | Create domain-specific response DTO |
| `{ type: 'object', properties:` in route files | Inline JSON schema instead of Zod | Move to shared `dto/` package |
| `prisma.*.find` in handler or route files | Raw Prisma access outside service layer | Move to service; return through mapper |
| `.map((` in route or handler files | Inline transformation | Extract to mapper file |

If any of these patterns appear in changed files, fix them before committing.
