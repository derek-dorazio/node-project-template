# Workflow Rules

## 1. Spec-Driven Development Lifecycle

All product work follows a spec-driven lifecycle. Agents must not skip phases or implement behavior that hasn't been specified.

### Phase 0: Product Discovery (Piper)

Use when starting a brand-new product, vague module, or poorly defined feature area. Piper frames the product broadly before Pam begins detailed requirements work.

Deliverables: `requirements/product-overview/` bundle per the handoff floor defined in `agents/product-discovery.md`.

Skip this phase when the product shape is already clear and `requirements/product-overview/` artifacts already exist.

### Phase 1: Requirements and Domain Modeling

Before any design or implementation:

1. **Define requirements** — what the product does, who it serves, what problems it solves.
2. **Define the domain model** — identify domain objects, their relationships, lifecycle states, and ownership boundaries.
3. **Define modules** — group related domain objects into service modules with clear boundaries.

Deliverables: requirements document, domain model diagram or description, module map.

### Phase 2: Product Requirements and Use Cases (Pam)

Pam iterates with the project owner to produce the `requirements/product-requirements/` bundle:

1. **Product-level:** `product-requirements.md`, `roles-and-actors.md`, `glossary.md`, `domain-concepts.md`, `navigation-and-entry-points.md`.
2. **Per feature (`features/<feature-slug>/`):** `overview.md`, `use-cases.md`, `screens.md`, `business-rules.md`, `open-questions.md`.
3. Every use case follows the structured template with alternate flows, error paths, acceptance criteria, and confidence labels.

Deliverables: `requirements/product-requirements/` bundle per the handoff floor defined in `agents/product-manager.md`.

**Rule: Agents must not implement behavior that isn't covered by a documented use case. If a use case is missing, write it first.**

### Phase 2.5: Technical Specification (Tom + Dom)

Tom converts Pam's confirmed requirements into a feature-level technical specification:

1. **Domain model** (Dom) — entities with fields table, relationships, state machines, invariants.
2. **API surface** — route inventory with methods, DTOs, allowed roles, notable errors.
3. **Flows** — technical sequence per use case: screen → API → service → persistence.

Deliverables: `tech-specs/features/<feature-slug>/` per the handoff floor defined in `agents/technical-specification-creator.md`.

Tom is invoked automatically (JIT) when requirements exist but tech-specs don't — the human does not need to explicitly trigger this phase.

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
- Coverage threshold changes are main-thread coordination work. Worker slices must not raise or lower thresholds on their own.
- Update plan rows only for the exact slice being worked. Do not mark unrelated items `Done`.
- Mark a slice `Done` only when all applicable layers are complete and validated. Partial work stays `In Progress`.
- A slice is not finished while any relevant required local test suite for that slice is still failing. "Implementation complete" without green relevant local validation is still `In Progress`, not `Done`.
- Targeted validation does not override the required repo gate set. When the rules call for full unit, functional, coverage, typecheck, or lint gates, those gates must be run even if focused nearby tests already passed.
- If a slice is pushed after only focused validation and CI then fails in a required gate that was skipped locally, treat that as a workflow miss in the slice closeout, not as an acceptable CI discovery pattern.
- If code cleanup resolves a previously logged plan finding, reconcile that plan finding in the same or immediately following slice. Do not leave active plans implying drift that no longer exists in the codebase.

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
- [ ] Changed backend/shared contract work also satisfies the contract-documentation checklist from `rules/service-rules.md`

**Tests:**
- [ ] Unit test exists for service logic
- [ ] DB integration test covers CRUD for new/changed domain objects
- [ ] SDK functional test covers use-case journeys and error paths
- [ ] Coverage on changed files meets threshold
- [ ] Positive documented use cases affected by the slice are covered at an appropriate automated layer
- [ ] Negative/error/permission use cases affected by the slice are covered at an appropriate automated layer
- [ ] If the slice instruments logging or branches, each identified positive and negative branch is covered by a truthful automated test at the appropriate layer
- [ ] Logging/branch slices assert branch outcomes, not log message strings
- [ ] Branches that were not testable at the start of the slice were refactored or isolated enough to make their logic testable
- [ ] Misshaped or untyped errors discovered during branch coverage work were normalized to architectural standards in the same slice
- [ ] Every required local gate for the slice was actually run; targeted checks were not used as a substitute for the broader required suite

**OpenAPI:**
- [ ] `npm run api:refresh` succeeds
- [ ] `npm run api:validate` succeeds

A slice that lands the schema and service logic but skips DTOs, mappers, or tests is `In Progress`, not `Done`.

For user-facing or workflow-heavy slices, "tests" also means the team can explain where the end-to-end use case is proven:

- Unit/data integration/contract coverage may prove sub-layers.
- Functional API should prove the API-facing user journey.
- Browser E2E should prove at least one truthful connected UI workflow when the released feature is intended to be browser-usable.

If no automated layer currently proves the documented positive and negative use cases for the released behavior, the slice is not complete enough to deploy.

For backend/shared contract slices, "complete" also means the documentation surface is complete enough for frontend consumption:

- Route descriptions are updated where behavior is not obvious.
- DTO/object descriptions exist for changed payloads.
- Field semantics are described where names alone are not enough.
- Any backend explanation that frontend needed has been pushed back into the contract source instead of left as one-off tribal knowledge.
- Stale or retired request/response fields have been removed or explicitly justified, not merely re-described.

For model-change slices, "tests" includes not only production-facing test files but also the support code that makes those suites truthful:

- Factories
- Builders
- Repository mocks
- Seeded test fixtures
- Route/setup helpers
- SDK/client test helpers

If CI or local validation shows those layers still encode the retired model shape, treat that as an incomplete implementation slice rather than unrelated test cleanup.

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

### CI/CD Baseline Check

Before starting a new feature or implementation slice, confirm the current CI/CD baseline first.

The goal is to avoid inheriting unrelated red builds or stale failures and then mistaking them for regressions introduced by the new slice.

Required behavior:

- Check the current relevant CI/CD status before new implementation work begins.
- Do not start stacking new feature slices on top of a red `main` baseline unless the active work is explicitly to fix that red baseline.
- If existing failures are already present, call that out explicitly before coding starts.
- Distinguish clearly between pre-existing failures and failures introduced by the new slice.
- Do not let builders or follow-on implementers assume inherited failures came from their work unless the new slice actually caused them.

### Slice Retrospective

After each completed feature slice, do a brief retrospective before moving on to deeper adjacent work.

The retrospective should:

- Identify any workflow friction, coordination overhead, or avoidable rework.
- Recommend any process or tooling change that would make future slices more efficient.
- Record durable workflow changes in `rules/` or `docs/` when the team agrees they should persist beyond the current session.

Keep it short and high signal. The goal is to improve the workflow steadily without turning every slice closeout into a long ceremony.

---

## 4. Source-Of-Truth Priority

- `rules/` and active `plans/` / use-case companions are the authoritative implementation guidance.
- Treat `docs/` as reference material only unless an active rule or active plan explicitly promotes a doc as current source of truth.
- If `docs/` conflicts with active plans or rules, follow the active plans/rules and treat the doc as stale.

---

## 5. Rule and Documentation Maintenance

Rules are part of the codebase contract.

When a refactor changes architecture, API usage, testing patterns, or generated-client workflow:

- Update the relevant file in `rules/` in the same change.
- Do not leave stale rules behind for a future cleanup.
- Tighten rules after a painful refactor so the same mistake is harder to repeat.

---

## 6. Required Local Validation Before Push

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
- Do not push backend changes on a "likely green" assumption. The local gate must actually pass first.
- Do not intentionally skip required backend gates and defer that validation to CI.
- Coverage threshold enforcement is part of the required gate.
- Focused or nearby test runs are useful for iteration speed, but they are additive only. They never replace the required local gate set before commit or push.
- "I ran the tests closest to the code I changed" is not sufficient when the repo rules require broader gates. Shared-model, shared-contract, or shared service changes must still clear the full required local suites because stale assertions often live outside the immediately touched files.
- Failing automated tests indicate either a real defect that must be fixed immediately, or a test that is no longer truthful and must be corrected or removed in the same slice.
- Do not knowingly deploy broken or half-implemented code behind a green-ish test story. If the released behavior is still broken, the fixing slice is not done and deployment should stop.
- Do not classify a slice as "frontend only" if it changes any shared or backend-owned contract layer (shared domain types, shared DTOs, generated OpenAPI/client outputs, backend mappers, backend route schemas, or backend services that shape client-facing payloads). Those slices are backend-impacting and must satisfy the full backend gate before push.
- When a slice changes the backend model, rerun and repair every impacted suite in the local gate set as part of that slice. Stale mocks, factories, builders, or setup helpers are not separate cleanup work; they are part of the slice.
- If a gate is blocked by local environment constraints, state that clearly before pushing.
- For backend/service changes, the default is simple: no push until lint, typecheck, unit, data integration, FAPI, and merged service coverage have passed locally. If API contracts changed, `openapi-contract-check` must also pass first.
- If a DB-backed backend gate fails only because the sandbox cannot reach the local database, rerun that exact command outside the sandbox before pushing. Do not treat the sandbox failure as permission to skip the gate.

---

## 7. Do Not Preserve Bad Patterns

- Remove or replace stale tests that enforce retired code paths.
- Remove dead endpoints and unused UI instead of keeping them "for later."
- Strengthen rules when a refactor reveals a repeated failure mode.

---

## 8. Use-Case Design Must Surface Backend Implications

When designing new webapp features or product flows, the design review must explicitly surface any implied backend or model changes required by the proposed behavior, including:

- Prisma/model changes
- Migrations or backfills
- New DTOs or API routes
- Backend auth/session or invitation-flow changes

Confirm those backend implications with the project owner before implementation begins.

When those implications suggest a true model change, route them through the data-modeler and have the review explicitly check [domain-model-conventions-rules.md](domain-model-conventions-rules.md) before backend implementation begins.

Do not assume that an early scaffold or placeholder page defines the final product flow. Plans should be use-case driven and confirmed with the project owner before implementation expands.

For browser-E2E planning, prefer real user/role lifecycle flows over root-admin or test-only shortcuts. If cleanup or setup appears to need privileged APIs, first ask whether the real product lifecycle should own that behavior instead.

---

## 9. Persona Playbooks

- Persona playbooks may live under `agents/` to scope role-specific workflows such as product management, technical specification, data modeling, project management, backend implementation, frontend implementation, architecture/platform work, and code review.
- These playbooks are execution aids, not replacement policy sources.
- `AGENTS.md` and `rules/` remain canonical.
- Formal persona names remain the canonical workflow language in plans, rules, and handoffs. Nicknames are optional shorthand for prompts, logs, worker updates, and conversational references.
- When a nickname is used, it must map to exactly one formal persona and must not replace the formal responsibility definition.
- If a new persona is added later, assign a unique nickname in the persona file and add it to the table below rather than inventing ad hoc shorthand in worker prompts.

Current persona nickname map:

| Formal Persona | Nickname | Notes |
|---|---|---|
| Product Discovery | Piper | High-level product framing, PRD shaping, and discovery handoff |
| Product Manager | Pam | Product/use-case clarification and review |
| Technical Specification Creator | Tom | Converts product requirements into feature-level technical specifications with Dom |
| Data Modeler | Dom | Model and contract impact classification |
| Backend Developer | Brad | Service, DTO, OpenAPI, and test implementation |
| Frontend Developer | Fran | Web UI and browser-flow delivery |
| Project Manager | Parker | Plan shaping, sequencing, and reconciliation |
| Architect | Archie | Cross-cutting architecture and platform work |
| Test Planner | Tess | Test case derivation from specs, test matrix, coverage audits |
| QA/Test Engineer | Quinn | Verification lane selection, test execution, failure triage, release confidence |
| Code Reviewer | Riley | Findings-first code review and risk detection |

- Cross-cutting workflow requirements remain mandatory for all personas, including:
  - Checking for active plans
  - Updating task rows for the exact slice worked
  - Validating work before marking slices done
  - Updating docs and rules when the change affects them
- The `project-manager` persona may help with plan shaping, sequencing, and progress reconciliation, but it is not the sole owner of task tracking. Agents doing implementation work must still update plans themselves.

### Frontend / Data Model / Backend Handoff Rules

- Frontend implementation should normally work from:
  - reviewed plans and use-case companions
  - generated SDK operations
  - generated request/response types
  - documented OpenAPI summaries/descriptions
- Frontend agents must not answer contract ambiguity by treating backend implementation code as the working spec.
- If frontend work reveals a possible shared-contract, DTO, or model change, stop and route that question through the `data-modeler` persona first unless the change is already explicitly reviewed and obviously backend-owned.
- The `data-modeler` persona classifies whether the request is:
  - UI-only
  - contract-only
  - a real model/domain/persistence change
- The data-modeler review must happen before backend implementation begins on any feature where model, DTO, contract, or persistence impact is plausible. Do not skip directly from frontend/product discovery to backend coding when that classification step is still unresolved.
- If the change is not obvious and clear from the reviewed plan, confirm the backend/model implication with the user before implementation continues.
- Backend/shared changes discovered during frontend work must be implemented by the backend developer persona, not by the frontend developer persona.
- If the frontend developer has a contract question, ask the backend developer persona for the answer instead of reading backend code directly.
- When such a question reveals a contract documentation gap, the backend developer must fix that documentation gap as part of the handoff, not merely answer the question once.
- Backend slices that change API contracts must include that documentation-gap repair in the same slice rather than leaving it as follow-up cleanup.
- When a feature needs backend/shared contract changes, the frontend persona must wait until the backend persona has completed the contract work, run the required backend validation gates, and regenerated/exported the SDK and types before starting frontend implementation against that new contract. Do not begin frontend implementation against an intended contract change before the updated exported SDK/types actually exist.
- Product work must perform a current-truth review — active plans, current domain model, current DTO/OpenAPI contract, and currently implemented routes and role behavior — before proposing fields or flow steps. Archived UI, superseded plans, or broad DTO surface area are not evidence that a field belongs in the current product flow.
- Product ambiguity belongs with the user. Contract ambiguity belongs with the backend developer. Model-impact classification belongs with the data-modeler.

---

## 10. Plan Closeout and Archiving

- Plans are execution tools, not long-lived policy documents. Durable rules belong in `rules/`, not in active plans.
- When all tasks in a plan are done or removed, archive it under `plans/archive/`.
- Update any active plans that reference the archived plan.
- If a plan contained temporary guidance that has become durable policy, move it into `rules/` during closeout.
