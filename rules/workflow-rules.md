# Workflow Rules

## 1. Spec-Driven Development Lifecycle

All product work follows a spec-driven lifecycle. Agents must not skip phases or implement behavior that hasn't been specified.

### Phase 1: Requirements and Domain Modeling

Before any design or implementation:

1. **Define requirements** — what the product does, who it serves, what problems it solves.
2. **Define the domain model** — identify domain objects, their relationships, lifecycle states, and ownership boundaries.
3. **Define modules** — group related domain objects into service modules with clear boundaries.

Deliverables: requirements document, domain model diagram or description, module map.

### Phase 2: Use Cases

For each module or feature area:

1. **Write use-case companions** — document concrete user journeys: who does what, in what order, what they see, what can go wrong.
2. **Identify roles and permissions** — which actors can perform which actions.
3. **Identify business rules** — validation, uniqueness, lifecycle constraints, authorization boundaries.
4. **Identify deferred scope** — explicitly state what is out of scope for the current phase.

Deliverables: use-case companion documents per module, stored in `plans/`.

**Rule: Agents must not implement behavior that isn't covered by a documented use case. If a use case is missing, write it first.**

### Phase 3: Design Plans

Informed by requirements and use cases:

1. **Make architectural decisions** — what to build, what to remove, what to defer, how modules interact.
2. **Define data model changes** — schema, migrations, new/removed entities.
3. **Define API surface** — endpoints, request/response shapes, authorization rules.
4. **Identify dependencies** — which plans must complete before others can start.

Deliverables: design plan documents in `plans/`, with clear decisions and rationale.

### Phase 4: Execution Plans

Break design plans into implementable work:

1. **Slice work into independent units** — each slice should be committable and validatable on its own.
2. **Track at layer granularity** — schema, service, DTOs, mappers, route schemas, tests are separate trackable items within a slice.
3. **Define deliverables per slice** — concrete files and artifacts, not vague descriptions.
4. **Define dependencies** — which slices must complete before others can start.

Deliverables: execution plan with task table in `plans/`.

### Phase 5: Implementation

Execute slices against plans with quality gates. See sections below for tracking and validation rules.

---

## 2. Plan Tracking

Every plan document in `plans/` has an **Action Plan** section with a task table.

### Task Table Format

```markdown
| ID | Phase | Task | Status | Notes |
|---|---|---|---|---|
| 01-001 | 1 | Task description | Done | Completed notes |
| 01-002 | 1 | Task description | In Progress | What's done, what remains |
| 01-003 | 1 | Task description | Not Started | |
```

### Status Values

| Status | Meaning |
|---|---|
| Not Started | Work has not begun |
| In Progress | Work has started but is not complete |
| Done | Fully implemented, tested, and validated |
| Removed | Out of scope; explain why |

### Required Workflow

When starting work:

1. Find the relevant task in the plan.
2. Mark it `In Progress`.
3. Add notes about the implementation slice you are taking.

When finishing work:

1. Mark the task `Done` or `Removed`.
2. Add notes with the relevant files and decisions.
3. Update every affected plan, not just the first one you looked at.

---

## 3. Slice Execution Rules

- Keep one execution slice per commit unless explicitly approved to bundle.
- Report every changed file in the final handoff for a slice.
- If slice work exposes adjacent-slice files or tasks, stop and report that spillover instead of bundling it.
- Update plan rows only for the exact slice being worked. Do not mark unrelated items `Done`.
- Mark a slice `Done` only when all applicable layers are complete and validated. Partial work stays `In Progress`.

### Slice Completion Checklist (Required Before Marking Done)

Before marking any backend slice task `Done`, verify each applicable item:

**Schema & Domain:**
- [ ] Prisma schema updated (if model changed)
- [ ] Migration generated (if schema changed)
- [ ] Shared domain types/enums updated

**DTOs & Mappers:**
- [ ] Zod request DTO exists for every request body
- [ ] Zod response DTO exists for every response
- [ ] Mapper file exists with named export functions
- [ ] Handlers call mapper functions — no inline transformations

**Route Schemas:**
- [ ] Every route uses `zodToJsonSchema()` — no inline JSON objects
- [ ] No route uses placeholder schemas for endpoints returning domain data
- [ ] Every route has `operationId`, `summary`, and `tags`

**Tests:**
- [ ] Unit test exists for service logic
- [ ] DB integration test covers CRUD for new/changed domain objects
- [ ] SDK functional test covers use-case journeys and error paths
- [ ] Coverage on changed files meets threshold

**OpenAPI:**
- [ ] `npm run api:refresh` succeeds
- [ ] `npm run api:validate` succeeds

A slice that lands the schema and service logic but skips DTOs, mappers, or tests is `In Progress`, not `Done`.

### Slice Deliverables

When plans break work into slices, track at layer granularity:

```markdown
| D.1 | Schema + migration | Done |
| D.2 | Service + repository | Done |
| D.3 | DTOs (request + response Zod schemas) | Not Started |
| D.4 | Mappers | Not Started |
| D.5 | Route schemas (zodToJsonSchema, operationId, tags) | Not Started |
| D.6 | Unit tests | In Progress |
| D.7 | Integration tests (CRUD + negative paths) | Not Started |
| D.8 | Functional API tests | Not Started |
```

---

## 4. Rule and Documentation Maintenance

Rules are part of the codebase contract.

When a refactor changes architecture, API usage, testing patterns, or generated-client workflow:

- Update the relevant file in `rules/` in the same change.
- Do not leave stale rules behind for a future cleanup.
- Tighten rules after a painful refactor so the same mistake is harder to repeat.

---

## 5. Required Local Validation Before Push

Before pushing code, agents must run the full local quality gate set unless explicitly approved to skip.

Required local pre-push commands:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run test:service:unit`
4. `npm run test:service:integration`
5. `npm run test:service:functional-api`
6. `npm run test:coverage:service:merged`
7. `npm run test:<projectName>:unit`
8. `npm run openapi-contract-check` when API schemas change

Rules:

- Treat these as pre-push gates, not optional follow-up checks.
- Do not rely on CI to discover failures that could have been caught locally.
- If a gate is blocked by local environment constraints, state that clearly before pushing.
- Coverage threshold enforcement is part of the required gate.

---

## 6. Do Not Preserve Bad Patterns

- Remove or replace stale tests that enforce retired code paths.
- Remove dead endpoints and unused UI instead of keeping them "for later."
- Strengthen rules when a refactor reveals a repeated failure mode.

---

## 7. Plan Closeout and Archiving

- Plans are execution tools, not long-lived policy documents. Durable rules belong in `rules/`, not in active plans.
- When all tasks in a plan are done or removed, archive it under `plans/archive/`.
- Update any active plans that reference the archived plan.
- If a plan contained temporary guidance that has become durable policy, move it into `rules/` during closeout.
