# Workflow Rules

## 0. Document Lifecycle (Governing Rule)

> **One source of truth per concept. Working documents are deleted when the work ships. Durable decisions become ADRs. Git history is the archive.**

The repository uses layered artifacts. Each artifact has a clear lifetime and a single canonical purpose. Do not duplicate content across layers — reference instead.

### Durability tiers

| Tier | Artifact | Lifetime | Purpose |
|---|---|---|---|
| Permanent | `rules/*.md`, `personas/*.md`, `docs/adr/*.md`, `AGENTS.md` | Months–years | How we build here; who does what; why we chose durable patterns |
| Feature-life | `requirements/product-requirements/features/<feature>/` | Weeks–months (during active feature development) | Product intent for a *major* feature; retire/delete when the feature stabilizes |
| Slice-life | `plans/NN-*.md` | Days–weeks (a single feature reorg or major effort) | Narrative execution context paired with a Beads epic; **deleted** when the parent epic closes |
| Pre-implementation | `tech-specs/features/<feature>/` | Up to ship | Technical framing before implementation; **deleted** when the implementation lands |
| Live | `.beads/issues.jsonl` | Hours–days | Current task state, dependencies, slice list, status |

### Governing rules

1. **One canonical home per concept.** If you're writing the same thing in two files, pick one and link from the other. Business rules live in `requirements/.../business-rules.md`. Task status and task lists live in Beads. Architecture decisions live in `rules/` or `docs/adr/`. The generated SDK + domain types are the API contract. The code + tests are the behavioral spec.
2. **Short-lived artifacts reference long-lived ones, never the reverse.** Plans reference rules, not vice versa. Beads notes reference plans, not vice versa.
3. **Delete on ship, don't archive.** When a plan's parent Beads epic closes, the plan file is deleted in the same commit (or the next cleanup slice). When a tech spec's implementation lands on `main`, the spec is deleted. Git preserves history; `git show <sha>:path/to/file` retrieves any prior version. Archival directories are anti-patterns — files in the tree get read.
4. **Capture durable decisions as ADRs.** Decisions that outlast a single slice (architectural choices, cross-cutting patterns, hard boundaries) are written as Architecture Decision Records in `docs/adr/`. Once accepted, ADRs are immutable; supersede with a new ADR rather than editing.
5. **Rules absorb what plans learn.** If a plan introduces a durable pattern (a new convention, a hard boundary, a reusable approach), update `rules/` or write an ADR in the same effort. Don't leave the pattern only in the plan — it will be deleted when the epic closes.

---

## 1. Spec-Driven Development Lifecycle

All product work follows a spec-driven lifecycle. Agents must not skip phases or implement behavior that hasn't been specified.

### Phase 0: Product Discovery (Piper)

Use when starting a brand-new product, vague module, or poorly defined feature area. Piper frames the product broadly before Pam begins detailed requirements work.

Deliverables: `requirements/product-overview/` bundle per the handoff floor defined in `personas/piper.md`.

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

Deliverables: `requirements/product-requirements/` bundle per the handoff floor defined in `personas/pam.md`.

**Rule: Agents must not implement behavior that isn't covered by a documented use case. If a use case is missing, write it first.**

### Phase 2.5: Technical Specification (Tom + Dom)

Tom converts Pam's confirmed requirements into a feature-level technical specification:

1. **Domain model** (Dom) — entities with fields table, relationships, state machines, invariants.
2. **API surface** — route inventory with methods, DTOs, allowed roles, notable errors.
3. **Flows** — technical sequence per use case: screen → API → service → persistence.

Deliverables: `tech-specs/features/<feature-slug>/` per the handoff floor defined in `personas/tom.md`.

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

Deliverables: execution plan in `plans/` (narrative companion only) **paired with a Beads epic and child stories** (live task state). The plan file references the Beads epic in its header; the Beads epic owns the slice list and status. See §2 for the canonical task-state model.

### Phase 5: Implementation

Execute slices against plans with quality gates. See sections below for tracking and validation rules.

---

## 2. Plans and the Beads Tracker

### Plans are narrative; Beads is live task state

- **A plan file** (`plans/NN-*.md`), when the effort warrants one, is the narrative companion to a Beads epic: scope, rationale, architecture, site maps, tile mappings, open questions, references. Plans do **not** contain task tables.
- **The Beads epic** owns the task list as child stories, with labels, dependencies, statuses, and notes.
- When a plan exists, it carries a one-line header at the top referencing its parent Beads epic; the Beads epic links back to its plan in its description or notes.

### Pick the right shape: story / epic / plan + epic

Not every effort needs all three artifacts. Match the shape to the work.

- **One Beads story, no epic, no plan.** Single-slice work: a typo fix, a small bug fix, a one-file refactor, a routine dependency bump, a single follow-up. The story description and notes carry all the context needed.
- **One Beads epic + child stories, no plan file.** Small efforts (≈2–3 slices) with no architectural narrative: a contained CRUD addition, a small targeted refactor, a couple of related cleanup slices. The epic description carries scope and sequencing; each child story carries its own slice context.
- **Plan file + Beads epic + child stories.** Major efforts: feature reorgs, new feature areas with site maps, cross-cutting refactors, multi-persona coordination, anything that benefits from diagrams, authority models, tile-to-destination mappings, or a "settled decisions" section.

Promote a small effort to a plan file when:

- It grows past about three slices.
- A non-obvious architectural choice is being made.
- Multiple personas are coordinating (e.g., Pam confirms scope, Dom locks the model, Brad implements, Fran consumes).
- The narrative would benefit from a Mermaid diagram, site map, or structured pattern explanation.
- You catch yourself wanting to write more than a couple of paragraphs in a Beads description — that paragraph wants to be a markdown file.

When in doubt, start small (story-only or epic-only). It's cheaper to add a plan file later than to delete an empty one.

### Plan file structure

A plan file typically contains:

- **Beads epic:** link/ID to the parent epic
- **Purpose** — why this plan exists
- **Governing principles** — link to relevant rules / ADRs
- **Architecture or pattern narrative** (authority models, URL structures, etc.)
- **Site map / structural references** (where applicable)
- **Tile → destination mapping** (for reorgs; these are structural, not status)
- **Open questions** (unresolved product/contract calls)
- **Backend contract questions** (when applicable)

What a plan file does **not** contain:

- Task tables with slice numbers, status columns, or Done markers
- Duplicated rule text or persona responsibilities
- Per-slice completion notes (those live in the Beads story closing notes)

### Beads is the canonical task state

- Every active slice is a Beads story (child of a plan's epic).
- Status transitions (`open` → `in_progress` → `closed`/`deferred`) happen in Beads as work starts and completes.
- Slice context, scope changes, and closeout notes go in the Beads story's notes field.
- When a slice closes, the plan file is not edited — the Beads closeout captures the execution record. The plan file is updated only when scope, architecture, or open questions change.

### When a plan dies

- When the parent Beads epic closes (all child stories closed or deferred), the plan file is **deleted** in a cleanup commit.
- Durable patterns/decisions the plan established must be codified in `rules/` or `docs/adr/` before deletion. A plan that introduced a new convention without updating rules/ADRs is not ready to be deleted.
- Git preserves the deleted file; it can be retrieved via `git log` / `git show` if historical context is needed.
- Do **not** move completed plans to `plans/archive/`. Archive directories grow and get read; deletion is the enforcement mechanism.

### Required workflow per slice

When starting work:

1. Find or create the relevant Beads story under the plan's epic.
2. Update the Beads story status to `in_progress` and add a *starting note* per §*Story notes* below.
3. Read the plan narrative for the slice context.

When finishing work:

1. Close the Beads story with a *closing note* per §*Story notes* below.
2. Update the plan narrative only if scope, architecture, or open questions changed — not for status.
3. If the parent epic is now complete, delete the plan file in the same or next commit (after capturing any durable patterns in `rules/` or an ADR).

### Beads conventions: epics, stories, sizing, naming

**Epics vs stories.** A Beads epic represents a major effort (a feature reorg, a new feature area, a cross-cutting refactor). Each child story is a single committable, validatable slice — typically one commit. If a "story" naturally needs more than one commit, it's actually two stories.

**Sizing.** Aim for stories that close in 1–3 hours of focused work and produce one coherent commit. Layer-granularity is the default unit (schema + migration is one story; service + repo is another; DTOs are another; mappers are another; route schemas are another; each test layer is a separate story when meaningful coverage is being added). Bundle layers in one story only when the layers are trivially small (e.g., a one-field DTO change with its mapper).

**Naming.**
- Epics: short imperative noun phrase that names the effort. Examples: "Root admin elevation", "Test data hygiene", "Event feed ingestion". Avoid date prefixes, internal version numbers, or references to the plan file number — Beads IDs are stable and the plan file may be deleted later.
- Stories: short imperative phrase describing what the slice produces. Examples: "Add Resource.eventId schema field + migration", "Wire mapEventToDto into routes", "Cover invite-flow negative paths in FAPI". Each story title should make sense without reading the parent epic.

### Beads conventions: labels

Apply labels generously — they're how filtered queries (`bd list --label …`) stay useful as the issue list grows.

Standard label families:

- **Layer:** `layer/schema`, `layer/service`, `layer/dto`, `layer/mapper`, `layer/route`, `layer/test-unit`, `layer/test-integration`, `layer/test-fapi`, `layer/test-e2e`, `layer/ui`, `layer/infra`, `layer/docs`.
- **Persona:** `persona/brad`, `persona/fran`, `persona/dom`, `persona/archie`, `persona/tess`, `persona/quinn`, `persona/riley`. Indicates who is best positioned to execute or review.
- **Risk / scope:** `risk/high` (touches shared contract, schema, infra, auth), `risk/refactor` (no behavior change but broad blast radius), `risk/migration` (data migration / backfill), `cross-cutting` (effects multiple modules).
- **Workflow:** `blocked/external` (waiting on a third party), `blocked/decision` (waiting on a product call), `cleanup` (debt removal, no new behavior), `defect` (bug-fix story — see Defect Verification Protocol in `rules/testing-rules.md` §2B).

A story with 0–3 labels is normal. Don't turn labels into a taxonomy exercise; they should help future filtering, not document everything.

### Beads conventions: dependencies

Use Beads `blocks` / `blocked_by` to make execution order machine-readable rather than only narrating it in the plan.

- Declare a dependency when a story genuinely cannot start until another closes (e.g., DTO depends on schema; UI depends on regenerated SDK).
- Do **not** declare a dependency for "should be done in this order for cleanliness" — that's narrative, and belongs in the plan file or in the story description.
- Cross-epic dependencies are allowed and useful. A slice in Epic A blocked by a slice in Epic B is the right way to model genuine coupling between efforts.
- Circular dependencies are a smell. If two stories block each other, one of them is sized wrong — split it.

### Beads conventions: story notes

The Beads notes field is the slice's execution record. Two notes per story is the working norm.

**Starting note** (added when status flips to `in_progress`):

- Planned approach: which files will change, which patterns will be applied, which contract surfaces are touched.
- Risk callouts: anything the slice is being asked to be careful about.
- Validation plan: which gates will be run, which test layers will be added or updated, and which use-case / defect IDs the new tests will reference.

**Closing note** (added when status flips to `closed`):

- Files changed (paths only — diffs live in git).
- Decisions made: any non-obvious technical call that future readers should understand.
- Gates run: explicit list of validation commands and their results.
- For defect-fix slices: an explicit note that the failing test was observed to fail on the broken code before the fix landed (see `rules/testing-rules.md` §2B).
- Residual risk: anything left for follow-up, ideally with the new story ID that will own it.
- Spillover: if the slice touched files outside its declared scope, name them.

The closing note is the canonical post-ship execution record for the slice. Plan files do not capture this — they're narrative-only.

### Beads conventions: deferred, closed, reopened

- **`closed`** — work done; gates pass; commit landed.
- **`deferred`** — work was scoped but consciously dropped from this epic. Add a closing note explaining why and pointing at the future story (if any) that picks it up.
- Reopening a closed story is allowed when the closeout turns out to be wrong (e.g., a hidden regression surfaces). Add a note that says why it's being reopened and what changed in the original validation story.
- A story that is "blocked, not deferred" stays `in_progress` (or `open`) with a `blocked/*` label and a note explaining what it's waiting on.

### Beads ↔ commit and PR linkage

- Reference the Beads story ID in the commit message footer: `bd-#NNN`. This makes `git log --grep="bd-#NNN"` the canonical way to find the slice's commits.
- Reference the parent epic ID in the PR description.
- For defect-fix slices, also reference the defect ID in the failing test's traceability comment per `rules/testing-rules.md` §2A.
- Do not put commit SHAs into Beads notes — `git log --grep` is more durable than a frozen SHA list, especially after rebases or squash merges.

### Concurrent agents and JSONL conflict resolution

`.beads/issues.jsonl` is line-oriented; merge conflicts are common when multiple agents edit Beads state in parallel.

- Prefer running `bd` CLI commands rather than hand-editing `issues.jsonl`. The CLI keeps the file canonical.
- When two agents update overlapping stories, the second-to-merge resolves by re-running the equivalent `bd` command on the merged result, not by hand-merging the JSONL.
- Do not commit a partially-resolved JSONL — re-export from `bd` after resolving so the committed state matches the tracker's view.

### bd CLI quick reference

Routine operations:

- `bd list --status open` — what's available to start.
- `bd list --status in_progress` — what's currently underway (worth checking before starting a new slice, especially with multiple agents).
- `bd show bd-#NNN` — full story detail including notes.
- `bd note bd-#NNN "..."` — append a note to a story.
- `bd start bd-#NNN` / `bd close bd-#NNN` — status transitions.
- `bd dep add bd-#A blocked-by bd-#B` — declare a dependency.

See `bd help` for the full surface.

---

## 3. Slice Execution Rules

- Keep one execution slice per commit unless explicitly approved to bundle.
- Report every changed file in the final handoff for a slice.
- If slice work exposes adjacent-slice files or tasks, stop and report that spillover instead of bundling it.
- Coverage threshold changes are main-thread coordination work. Worker slices must not raise or lower thresholds on their own.
- Update Beads state only for the exact slice being worked. Do not flip unrelated stories to `in_progress` or `closed`.
- Close a Beads story only when all applicable layers are complete and validated. Partial work stays `in_progress`.
- A slice is not finished while any relevant required local test suite for that slice is still failing. "Implementation complete" without green relevant local validation stays `in_progress`, not `closed`.
- Targeted validation does not override the required repo gate set. When the rules call for full unit, functional, coverage, typecheck, or lint gates, those gates must be run even if focused nearby tests already passed.
- If a slice is pushed after only focused validation and CI then fails in a required gate that was skipped locally, treat that as a workflow miss in the slice closeout, not as an acceptable CI discovery pattern.
- If code cleanup resolves a previously logged plan finding, reconcile that plan finding in the same or immediately following slice. Do not leave active plans implying drift that no longer exists in the codebase.

### Slice Completion Checklist (Required Before Closing the Beads Story)

Before closing any backend slice's Beads story, verify each applicable item:

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
- [ ] Every new test references a use-case ID, business-rule ID, or defect ID per `rules/testing-rules.md` §2A *Test Self-Documentation*
- [ ] For defect-fix slices: a failing test reproducing the defect was written *before* the fix and observed to fail on the broken code, per `rules/testing-rules.md` §2B *Defect Verification Protocol* (record the observation in the Beads closing note)
- [ ] No application code was modified to make a test pass — no fakes, fallbacks, hardcoded responses, "test mode" branches, or synthetic defaults were added to production paths, per `rules/testing-rules.md` §2C *Forbidden Application-Code Patterns*
- [ ] No `.skip` / `.todo` / `xit` / `it.fails` / `describe.skip` markers were introduced without a `SKIP: bd-#NNN` comment and a real Beads story tracking the un-skip, per `rules/testing-rules.md` §2D *Test-Disable Discipline*
- [ ] If the slice instruments logging or branches, each identified positive and negative branch is covered by a truthful automated test at the appropriate layer
- [ ] Logging/branch slices assert branch outcomes, not log message strings
- [ ] Branches that were not testable at the start of the slice were refactored or isolated enough to make their logic testable
- [ ] Misshaped or untyped errors discovered during branch coverage work were normalized to architectural standards in the same slice
- [ ] Every required local gate for the slice was actually run; targeted checks were not used as a substitute for the broader required suite

**OpenAPI:**
- [ ] `npm run api:refresh` succeeds
- [ ] `npm run api:validate` succeeds

A slice that lands the schema and service logic but skips DTOs, mappers, or tests stays `in_progress`, not `closed`.

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

### Slice Granularity

When an effort is sliced for execution, slice at **layer granularity** as a default. Each slice becomes one Beads child story under the epic — not a row in a markdown table. Typical layer slicing for backend work:

- Schema + migration
- Service + repository
- DTOs (request + response Zod schemas)
- Mappers
- Route schemas (`zodToJsonSchema`, `operationId`, `tags`)
- Unit tests
- Integration tests (CRUD + negative paths)
- Functional API tests
- OpenAPI refresh + validate

Each story should be independently committable and validatable. Bundling layers in one story is allowed only when the layers are trivially small (e.g., a one-field DTO change with its mapper). See §2 *Beads conventions* for sizing guidance.

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

- Persona playbooks live under `personas/<name>.md` as the single authoritative source of persona content, with tool-specific thin-pointer wrappers under `.claude/skills/`, `.claude/agents/`, `.agents/skills/` (Codex), and `.codex/agents/`. The thin-pointer pattern: each wrapper carries minimal frontmatter + a "MUST Read `personas/<name>.md`" instruction; no symlinks, no build step. See `/Users/DDorazio/development/persona-library-pattern.md` (or your team's equivalent) for the full pattern reference.
- Personas scope role-specific workflows: product management, backend implementation, data modeling, frontend implementation, test planning, architecture/platform work, and code review. Piper (product discovery) and Tom (technical specification) are dormant — only invoked explicitly for greenfield / major-feature framing.
- These playbooks are execution aids, not replacement policy sources.
- `AGENTS.md` and `rules/` remain canonical.
- Formal persona names remain the canonical workflow language in plans, rules, and handoffs. Nicknames are optional shorthand for prompts, logs, and conversational references.
- When a nickname is used, it must map to exactly one formal persona and must not replace the formal responsibility definition.
- If a new persona is added later, assign a unique nickname in the persona file and add it to the table below rather than inventing ad hoc shorthand in worker prompts.

Current persona nickname map:

| Formal Persona | Nickname | Shape | Notes |
|---|---|---|---|
| Product Discovery | Piper | Dormant skill | High-level product framing, PRD shaping, discovery handoff. Greenfield only. |
| Product Manager | Pam | Active skill | Product/use-case clarification and review. |
| Technical Specification Creator | Tom | Dormant skill | Pre-implementation tech specs for major new features. |
| Application Specification Builder | Abe | Active skill (dormant in standard lifecycle) | One-time spec extraction from existing implementations without structured requirements. |
| Data Modeler | Dom | Active skill | Model and contract impact classification. |
| Test Planner | Tess | Active skill | Test case derivation from specs, test matrix, coverage audits. |
| Backend Developer | Brad | Active skill | Service, DTO, OpenAPI, and test implementation. |
| Frontend Developer | Fran | Active skill | Web UI and browser-flow delivery. |
| Architect | Archie | Active skill | Cross-cutting architecture and platform work. |
| QA/Test Engineer | Quinn | **Subagent** | Verification lane selection, test execution, failure triage, release confidence. Isolated context; produces findings reports. |
| Code Reviewer | Riley | **Subagent** | Findings-first code review and risk detection. Isolated context; produces findings reports. |

The old Project Manager (Parker) persona was retired because its responsibilities are fully subsumed by Beads (task state and dependencies), narrative-only plans (no plan rows to reconcile), the slice-completion checklist (drift detection), and the delete-on-ship rule for plans (no archival to manage).

- Cross-cutting workflow requirements remain mandatory for all personas, including:
  - Checking for active plans and Beads epics
  - Updating the Beads story state for the exact slice worked
  - Validating work before closing Beads stories
  - Updating docs and rules when the change affects them

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

## 10. Plan Deletion and Durable-Decision Capture

- Plans are execution tools, not long-lived policy documents. Durable rules belong in `rules/` or `docs/adr/`, not in active plans.
- When the parent Beads epic closes (all child stories closed or deferred), the plan file is **deleted** in the same commit or an immediately following cleanup commit.
- Before deleting a plan, verify that durable patterns, conventions, or boundaries the plan introduced have been codified in `rules/` (for patterns) or `docs/adr/` (for cross-cutting decisions). A plan that introduced durable guidance without updating those layers is not ready to delete.
- Do **not** move plans to an archive directory. Git preserves deleted files; archives just replicate the clutter problem under a different name.
- For historical context, rely on `git log` and `git show`. If a specific decision warrants permanent attention, write an ADR.
- If a plan contained temporary guidance that has become durable policy, move it into `rules/` during closeout.

---

## 11. Branching, Review, and Merge Cadence

This project uses a **branch-per-Beads-story** flow with implementing-agent self-review via Riley. Auto-merge on clean Riley findings is the default for solo work.

### Branch convention

- One branch per Beads child story. Name: `bd-NNN-<short-slug>` where `NNN` is the story ID and `<short-slug>` is a 2–5 word kebab-case description (e.g., `bd-142-resource-archive-validation`, `bd-198-fix-status-null-on-archive`).
- Branch off the current `main` HEAD at slice start. Do not stack branches unless the dependency is genuine (and modeled in Beads `blocked_by`).
- Never push directly to `main`. The branch + PR + Riley + auto-merge loop is the only path.

### Implementing-agent slice closeout protocol

When an implementing persona (Brad, Fran, Archie, Dom, etc.) finishes a slice, the closeout sequence is:

1. **Verify the slice-completion checklist** in §3 — gates run, traceability comments present, defect protocol satisfied (if applicable), no app-code fakes added.
2. **Run all required local gates** (`rules/testing-rules.md` §3). Do not push on a "likely green" assumption.
3. **Commit** with the Beads story ID in the footer: `bd-#NNN`. One slice = one commit (squash later in the PR if multiple working commits exist).
4. **Push the branch** to origin.
5. **Open a PR** with `gh pr create`. Title: short imperative summary. Body: link to the parent Beads epic, the slice's Beads story (`bd-#NNN`), one-paragraph context, and the gates that were run. For defect-fix slices, the PR body must explicitly state that the failing test was observed to fail before the fix landed.
6. **Spawn Riley** as a subagent using the canonical spawn prompt below — Riley's review quality depends on what you pass.
7. **Read Riley's findings table.** Then:
   - **Zero blocker-severity findings** (CRITICAL or HIGH) → `gh pr merge --squash --delete-branch`. Close the Beads story with a closing note per §2 *Beads conventions: story notes*. Return to the user with a summary.
   - **Any blocker-severity findings** → **do not merge**. Surface the findings to the user, await direction (fix-and-re-review, merge-anyway-with-justification, or park).

The implementing agent — not Riley — owns the merge decision. Subagents stay in the "findings only" lane.

### Riley spawn prompt

Riley runs in isolated context and sees nothing that the implementing agent has not explicitly passed. A sloppy spawn prompt produces a sloppy review and uncalibrated severities — which then defeats the auto-merge gate.

The spawn prompt must include all of the following, in this order:

1. **Slice intent (one paragraph).** What this slice was supposed to do, in product terms. Not "I changed these files" — *why*.
2. **Parent Beads epic ID and slice's Beads story ID.** Both with a link back. Riley uses these to read the epic and story descriptions and notes.
3. **Diff scope.** The exact command to read the changes: `git diff origin/main...HEAD` for a branch, or the PR URL when one exists. Mention the file count and rough size so Riley can flag "scope too large to review honestly" instead of pretending.
4. **Use-case / business-rule / defect IDs covered.** The specific IDs from `requirements/.../use-cases.md`, `requirements/.../business-rules.md`, or the defect Beads story. Riley audits coverage against these IDs, not against a vague feature name.
5. **For defect-fix slices: an explicit "failing test before fix" claim.** State that the failing test was observed to fail on the broken code before the fix landed, and point to the commit or PR-body line that proves it.
6. **Rules and specs Riley should audit against.** The relevant `rules/*.md` files, the active plan if one exists, and any tech-spec under `tech-specs/features/<feature>/` that this slice implements. Default set always includes `rules/workflow-rules.md`, `rules/testing-rules.md`, and the layer-specific rules (`rules/service-rules.md` for backend slices, `rules/react-ui-rules.md` for frontend slices).
7. **Known concerns the implementing agent already identified.** Anything you noticed but consciously chose not to fix in this slice (and why), or anything you're uncertain about. Naming concerns up front prevents Riley from "discovering" them as findings and lets it focus elsewhere.
8. **Severity calibration reminder.** A one-line pointer to `personas/riley.md §Severity Calibration` so Riley honors the auto-merge gate (zero CRITICAL/HIGH = merge).
9. **Expected output.** The findings table format, ordered by severity, with categories from `personas/riley.md`. Tell Riley to flag inability-to-evaluate explicitly rather than guessing.

Boilerplate template (copy and fill in):

```text
You are Riley. Audit this slice for merge readiness per the auto-merge gate
in rules/workflow-rules.md §11. Read personas/riley.md before starting.

Slice intent:
  <one paragraph: what this slice was supposed to do and why>

Parent epic: bd-#<EPIC>
Slice story: bd-#<STORY>

Diff scope:
  git diff origin/main...HEAD
  (~<N> files, ~<L> lines changed)

Use-case / business-rule / defect IDs covered:
  - UC-<ID> — <description>
  - BR-<ID> — <description>
  - bd-#<DEFECT-ID> — <description>   (defect-fix slices only)

Defect-fix observation (defect-fix slices only):
  The failing test reproducing bd-#<DEFECT-ID> was observed to fail on the
  broken code before the fix landed. Evidence: <commit SHA / PR body line>.

Rules to audit against:
  - rules/workflow-rules.md (slice completion checklist, §11)
  - rules/testing-rules.md (§2A traceability, §2B defect protocol, §2C
    forbidden patterns, §2D test-disable discipline)
  - rules/<layer>-rules.md
  - <plan or tech-spec path if applicable>

Known concerns I (the implementing agent) already identified:
  - <concern + why I left it / how it's bounded>

Severity calibration reminder:
  Honor personas/riley.md §Severity Calibration. The auto-merge gate is
  zero CRITICAL/HIGH = merge; padding severity defeats the gate.

Expected output:
  Findings table per personas/riley.md, ordered by severity, with
  categories. Flag inability-to-evaluate explicitly.
```

If you cannot fill in any of fields 1–6, the slice is not ready for review yet — go back and finish it, or surface the gap to the user.

### Auto-merge gate

The auto-merge rule is binary on Riley's severity output:

- **CRITICAL** or **HIGH** findings → block merge.
- **MEDIUM** or **LOW** findings → may merge; the implementing agent files follow-up Beads stories for items worth tracking and notes the deferral in the closing note.

Riley's severity calibration (per `personas/riley.md`) is what makes this gate work. If a finding is genuinely a blocker, it must be CRITICAL or HIGH — not MEDIUM with a strong recommendation.

### When the user must be paused for approval

Even on a clean Riley pass, pause and request explicit user approval before merging when:

- The slice contains a **destructive database migration**: `DROP TABLE`, `DROP COLUMN`, `RENAME COLUMN` on a column with existing data, type narrowing on a populated column, adding `NOT NULL` to an existing column without a backfilled default, or any migration that cannot be rolled back without data loss.
- The slice contains a **data backfill, data migration script, or any one-time data-modifying operation** that runs against production-shaped data.
- The slice has any other **non-reversible production effect**: deleting production records, retiring an API endpoint with active consumers, removing a feature flag that gated production behavior, deleting a published artifact, or invalidating cached state at scale.
- The slice changes shared contracts (DTOs, OpenAPI, generated SDK exports).
- The slice changes infrastructure, CI/CD, deployment, or auth boundaries.
- The slice deletes a plan file or retires a feature surface.
- The slice modifies `rules/`, `docs/adr/`, or `personas/`.
- The user has explicitly asked for a checkpoint.

Auto-merge is a frictionless default for ordinary slice work; cross-cutting, process-affecting, or non-reversible changes still warrant a human read.

For migration / backfill / non-reversible slices specifically, the pause request must include: what the operation does, what data it touches, what the rollback plan is (or "none — this is one-way"), and whether a dry-run was performed. Riley flagging a migration as "looks fine" is **not** a substitute for this pause.

### When the agent must NOT auto-merge regardless of Riley output

- The local gate set was incomplete or any required gate was skipped.
- The PR description does not include the Beads story ID.
- For defect-fix slices: the failing-test-before-fix observation is not present in the slice history or PR body.
- Riley reported any inability to evaluate (e.g., scope too large, missing context, ambiguous spec). Surface to the user instead.

### Branch lifecycle

- Open branches stay short-lived (hours to days). A branch that has been open longer than the Beads story has been `in_progress` is a sign the work has stalled — close or split it.
- After merge, `--delete-branch` removes the remote branch. The local branch can be deleted with `git branch -d bd-NNN-<slug>` once switched back to `main`.
- Reopened stories spawn a new branch with the same `bd-NNN-` prefix and a new slug; do not reuse a merged branch.
