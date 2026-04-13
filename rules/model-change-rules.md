# Model Change Rules

## Definition of Done for Backend Slices

A backend slice that changes the domain model is not done until all applicable layers are updated:

- Schema, migration, ORM/entity mapping, DTOs, route schemas
- OpenAPI refresh/validate
- Unit tests
- DB data integration tests
- Contract-verification tests
- Functional API tests
- Browser E2E or MSW-backed frontend tests when the changed model is on an active client flow

Do not mark a backend slice done if any of those applicable layers are still intentionally stale.

Model-change slices must also update the supporting test infrastructure that depends on the model shape, including:

- Factories and builders
- Repository mocks
- Fixture creators
- Route setup helpers
- SDK/client setup helpers

If a model change leaves any affected suite failing because those test-support layers are still shaped like the old model, the slice remains `In Progress`.

## Ownership and Handoff Rules

- Frontend agents must not directly implement backend-owned model or shared contract changes as a convenience while doing UI work.
- When frontend work reveals a possible model or shared-contract change, route the question through the `data-modeler` persona first so the impact is classified before implementation continues.
- Backend developers own the implementation of approved model/shared changes, including regeneration of the exported SDK/types used by frontend.
- Contract documentation gaps exposed by frontend questions are backend-owned defects. The backend developer must fix the documented contract, not merely explain the answer out-of-band.

---

## Checklist

### 1. Persistence and Domain

- [ ] Update Prisma schema
- [ ] Generate migration if required
- [ ] Update shared domain types/enums/constants
- [ ] Update repository/service logic
- [ ] Rename files/types/functions/modules for new domain model
- [ ] Remove retired associations/legacy fields
- [ ] No mixed old/new terminology

### 2. DTO and API Contract

- [ ] Update/add DTO Zod schema in the shared `dto/` package
- [ ] Update backend mapper
- [ ] Update route schemas using `zodToJsonSchema()`
- [ ] Ensure `operationId`, `summary`, `tags` are correct
- [ ] Add or refresh descriptions where field/object/endpoint meaning is not obvious from names alone
- [ ] Run `npm run api:refresh`
- [ ] Run `npm run api:validate`

### 3. Generated Client Consumers

- [ ] Update web app code for regenerated contract
- [ ] Remove local API-shape interfaces/casts now unnecessary
- [ ] Do not patch generated-client issues with local fake types

### 4. Frontend Surfaces

- [ ] Update React hooks/pages/components reading/writing changed fields
- [ ] Ensure loading/error/empty states behave correctly
- [ ] Remove dead UI for removed endpoints

### 5. Tests

- [ ] Update backend unit/data-integration tests
- [ ] Update contract-verification suites
- [ ] Update functional API tests if the changed field/shape is on a critical path
- [ ] Update browser E2E or MSW handlers if request/response shape changed and those layers are active for the affected flow
- [ ] Update factories, repository mocks, builders, fixture setup, and other test-support code that still assumes the retired model shape
- [ ] Remove or replace stale tests that were enforcing old architecture
- [ ] Add DB-backed CRUD coverage for new or materially redesigned domain objects, including `findById`
- [ ] Add use-case-driven tests that prove the backend supports the documented workflows for the changed domain area

### 5A. Test-Impact Rule for Model Changes

- Any persisted field addition, removal, rename, or semantics change must trigger an impact sweep across unit, data integration, contract verification, FAPI, and active browser/MSW tests.
- Treat failing test suites caused by stale model assumptions as part of the production slice, not post-merge cleanup.
- Do not push a model change while knowingly leaving broken mocks, factories, or DB-backed tests that still reflect the old model.
- If the affected suite list is not obvious, document the expected impacted files in the plan notes before marking the task `Done`.

---

## Migration Rules

- Prefer clean target schema over preserving obsolete tables.
- When rebuilding a domain model from first principles, do not preserve legacy naming.
- Keep migrations, ORM models, DTOs, and route contracts consistent.

---

## Seed Data Rules

- Do not preserve broad seed catalogs during refactors.
- Only acceptable seed: minimal bootstrap data required for the application to start (e.g., default admin user, required configuration).
- Tests must create/destroy their own data or use dedicated test infrastructure.

---

## Contract Integrity Rules

- Every API-facing model change is also an OpenAPI change unless proven otherwise.
- Different handler envelope = contract change.
- Fix the source contract, not just the consumer.

---

## Common Mistakes to Avoid

| Mistake | Consequence |
|---|---|
| Updating Prisma but not DTOs | Backend/frontend drift |
| Updating DTOs but not route schemas | Exported OpenAPI is wrong |
| Updating backend contract without regenerating | Stale generated client |
| Keeping local frontend response types | Frontend silently diverges |
| Preserving tests for deleted wrappers | Bad architecture becomes sticky |
| Leaving dead UI after endpoint removal | Broken UX, stale browser tests |
