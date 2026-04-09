# Model Change Rules

## Definition of Done for Backend Slices

A backend slice that changes a domain model must update ALL applicable layers. Do not mark a slice done if any applicable layer is intentionally stale.

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

- [ ] Update backend unit/integration tests
- [ ] Update or add SDK functional API tests
- [ ] Update smoke tests if changed field is on the critical deployment path
- [ ] Update browser E2E if applicable
- [ ] Remove/replace stale tests enforcing old architecture
- [ ] Add DB CRUD coverage for new/redesigned domain objects (create, update, delete/inactivate, findById)
- [ ] Add use-case-driven functional tests proving backend supports documented workflows

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
