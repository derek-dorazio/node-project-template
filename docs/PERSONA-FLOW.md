# Persona Flow and Handoffs

This document describes the end-to-end flow through the agent personas, from a product idea to shipped code.

Pam and Tom personas have been implemented. Items marked *(future)* are proposed in `plans/02-pam-to-tom-requirements-flow.md` and `plans/03-archie-brad-fran-handoff-review.md`. Plan 05 (`plans/05-engineer-driven-jit-workflow.md`) describes an alternative entry point for engineer-driven work.

---

## 1. Persona Roster

| Persona | Nickname | Status | Scope |
|---|---|---|---|
| Product Manager | `Pam` | Active | Product intent: requirements, use cases, roles, glossary, screens, business rules |
| Technical Specification Creator | `Tom` | Active | Feature-level tech spec: domain model, API surface, flows; orchestrates `Dom` |
| Data Modeler | `Dom` | Active | Domain model: entities, fields, constraints, state machines, convention enforcement |
| Architect | `Archie` | Active | Cross-cutting architecture, design plans, infra |
| Project Manager | `Parker` | Active | Slicing, sequencing, plan reconciliation |
| Backend Developer | `Brad` | Active | Service, DTOs, mappers, routes, backend tests |
| Frontend Developer | `Fran` | Active | React pages, hooks, components, frontend tests |
| Test Planner | `Tess` | Active | Test case derivation from specs, test matrix, coverage audits |
| QA/Test Engineer | `Quinn` | Active | Verification lane selection, test execution, failure triage, release confidence |
| Code Reviewer | `Riley` | Active | Code quality, rule compliance, architectural correctness |

Formal names remain canonical in plans and rules. Nicknames are shorthand only.

---

## 2. Flow Diagrams

### 2.1 Mode A — Vision Only

```mermaid
flowchart TD
    Owner([Human Product Owner])
    Pam[Pam — Product Manager]
    Tom[Tom — Tech Spec Creator]
    Dom[Dom — Data Modeler]
    Archie[Archie — Architect]
    Parker[Parker — Project Manager]
    Brad[Brad — Backend Developer]
    Fran[Fran — Frontend Developer]
    Tess[Tess — Test Planner]
    Quinn[Quinn — QA Engineer]
    Riley[Riley — Code Reviewer]

    Owner -- vision, questions, sign-off --> Pam
    Pam -- requirements/ bundle --> Tom
    Tom <-- domain model iteration --> Dom
    Tom -- tech-specs/ bundle --> Tess
    Tom -- tech-specs/ bundle --> Archie
    Pam -- requirements/ bundle --> Archie
    Tess -- test matrix --> Brad
    Tess -- test matrix --> Fran
    Archie -- plans/ --> Parker
    Parker -- sliced plan rows --> Brad
    Parker -- sliced plan rows --> Fran
    Brad -- regenerated SDK + contract docs --> Fran
    Brad -- code --> Quinn
    Fran -- code --> Quinn
    Quinn -- verification results --> Tess
    Tess -- coverage audit --> Riley
    Brad -- code for review --> Riley
    Fran -- code for review --> Riley
    Riley -. findings .-> Brad
    Riley -. findings .-> Fran
    Fran -. contract questions .-> Brad
    Fran -. model-impact questions .-> Dom
```

### 2.2 Mode B — Vision Plus Visual Artifacts

Identical to Mode A except Pam performs a visual-extraction pass first, using the artifacts as anchors for `screens.md` and `navigation-and-entry-points.md` before targeted conversation.

```mermaid
flowchart TD
    Owner([Human Product Owner])
    Visuals[/Screenshots / Figma / Wireframes/]
    Pam[Pam — Product Manager]
    Downstream[... Tom, Dom, Archie, Parker, Brad, Fran, Riley ...]

    Owner --> Pam
    Visuals -- visual extraction pass --> Pam
    Pam -- targeted questions --> Owner
    Pam -- requirements/ bundle --> Downstream
```

The rest of the flow is identical to Mode A.

### 2.3 Engineer-Driven JIT Flow (Plan 05)

A Principal Software Engineer (PSE) has requirements in hand and wants to go straight to building. Agents auto-sequence the missing phases.

```mermaid
flowchart TD
    PSE([Principal Software Engineer])
    Check{requirements/<br/>exist?}
    TechCheck{tech-specs/<br/>exist?}
    ArchieCheck{Archie<br/>required?}
    Pam[Pam — requirements first]
    Tom[Tom — JIT tech spec]
    Dom[Dom — domain model]
    Archie[Archie — design plan]
    Brad[Brad — backend]
    Fran[Fran — frontend]
    Riley[Riley — review]

    PSE -- build feature X --> Check
    Check -- No --> Pam
    Pam --> Check
    Check -- Yes --> TechCheck
    TechCheck -- No --> Tom
    Tom <--> Dom
    Tom --> TechCheck
    TechCheck -- Yes --> ArchieCheck
    ArchieCheck -- Yes: cross-cutting change --> Archie
    Archie --> Brad
    ArchieCheck -- No: in-boundary feature --> Brad
    Brad --> Fran
    Brad --> Riley
    Fran --> Riley
```

See `plans/05-engineer-driven-jit-workflow.md` for the Archie gate criteria and specs-track-code rules.

---

## 3. Folder Structure

```
project-root/
├── requirements/                              # Pam's output
│   ├── product-requirements.md                # Product purpose, users, non-goals
│   ├── roles-and-actors.md                    # Actor definitions, capability matrix
│   ├── glossary.md                            # Canonical terms, UI ↔ model mappings
│   ├── domain-concepts.md                     # Entities, relationships, lifecycle (prose)
│   ├── navigation-and-entry-points.md         # Global nav, entry points, page inventory
│   └── features/
│       └── <feature-slug>/
│           ├── overview.md                    # Purpose, actors, capabilities, deferred scope
│           ├── use-cases.md                   # Structured use cases with alt/error/acceptance
│           ├── screens.md                     # Screen purposes, roles, actions, states
│           ├── business-rules.md              # Validation, uniqueness, lifecycle, auth rules
│           └── open-questions.md              # Confirmed Drift / Needs Review / Deferred
│
├── tech-specs/                                # Tom's output
│   └── features/
│       └── <feature-slug>/
│           ├── domain-model.md                # Dom: fields table, relationships, state machines
│           ├── api-surface.md                 # Route inventory with roles and errors
│           ├── flows.md                       # Per use case: screen → API → service → DB
│           └── open-questions.md              # Technical ambiguities
│
├── plans/                                     # Archie + Parker
│   ├── <NN>-<feature-area>.md                 # Design plans with task tables
│   └── archive/
│
├── docs/                                      # Evergreen reference docs
│   ├── PERSONA-FLOW.md                        # This document
│   ├── DATABASE-SCHEMA.md                     # Archie: target schema reference
│   ├── PROJECT-SETUP.md                       # Developer setup guide
│   └── ...
│
├── agents/                                    # Persona playbooks
│   ├── product-manager.md                     # Pam
│   ├── technical-specification-creator.md     # Tom
│   ├── data-modeler.md                        # Dom
│   ├── architect.md                           # Archie
│   ├── project-manager.md                     # Parker
│   ├── backend-developer.md                   # Brad
│   ├── frontend-developer.md                  # Fran
│   └── code-reviewer.md                       # Riley
│
├── rules/                                     # Canonical rules
│   ├── workflow-rules.md
│   ├── architecture-rules.md
│   ├── service-rules.md
│   ├── react-ui-rules.md
│   ├── ux-rules.md
│   ├── testing-rules.md
│   ├── model-change-rules.md
│   └── domain-model-conventions-rules.md
│
├── packages/                                  # Backend implementation
├── clients/                                   # Frontend implementation
├── tests/                                     # Test suites
└── infrastructure/                            # Docker, Terraform, CI/CD
```

---

## 4. Per-Persona Role, Inputs, Outputs

### 4.1 Pam — Product Manager

- **Role:** Iteratively define product intent with the human owner.
- **Inputs:**
  - Owner's vision and domain knowledge.
  - (Mode B) visual artifacts — screenshots, wireframes, Figma frames.
- **Outputs** (`requirements/`):
  - Product-level: `product-requirements.md`, `roles-and-actors.md`, `glossary.md`, `domain-concepts.md`, `navigation-and-entry-points.md`.
  - Per feature: `overview.md`, `use-cases.md`, `screens.md`, `business-rules.md`, `open-questions.md`.
- **Use case template:** Actor, Goal, Confidence label, Preconditions, Normal flow, Alternate flows, Error paths, Postconditions, Acceptance criteria, Business rules referenced.
- **Confidence labels:** `(Confirmed)` / `(Inferred)` / `(Needs Review)` on every use case, screen, and business rule.
- **Handoff criteria:** all files exist; every item labeled; no unclassified open questions; owner signed off end-to-end; cross-feature references linked.
- **Does not produce:** schema, routes, DTOs, field-level types/constraints, state machines, architecture decisions.

### 4.2 Tom — Technical Specification Creator

- **Role:** Convert Pam's owner-confirmed requirements into a feature-level technical specification by orchestrating Dom.
- **Inputs:**
  - Pam's complete `requirements/` bundle with owner sign-off.
  - `rules/domain-model-conventions-rules.md`.
- **Outputs** (`tech-specs/features/<feature-slug>/`):
  - `domain-model.md` (owned by Dom, reviewed by Tom) — fields table, relationships, state machines, invariants.
  - `api-surface.md` — route inventory with method, route, purpose, request/response DTOs, allowed roles, notable errors.
  - `flows.md` — per use case: trigger, screen → API → service → persistence sequence, error branches, state transitions.
  - `open-questions.md`.
- **JIT invocation:** triggered automatically when requirements exist but tech-specs don't.
- **Handoff criteria:** every Pam use case has a corresponding flow; every route has roles + errors; every entity has a fields table; `open-questions.md` is empty; naming matches Pam's glossary.
- **Does not produce:** product decisions, architecture decisions, implementation code.

### 4.3 Dom — Data Modeler

- **Role:** Formalize the domain model and enforce conventions from `rules/domain-model-conventions-rules.md`.
- **Inputs:**
  - Pam's `domain-concepts.md` and `business-rules.md`.
  - Tom's request for a technical domain model.
- **Outputs:**
  - `tech-specs/features/<feature>/domain-model.md` (as Tom's subagent during greenfield).
  - Mid-implementation impact classification (UI-only / contract-only / real model change).
- **Handoff criteria:** every entity has a fields table (`name | type | nullable | default | constraints`), relationships with cardinality and cascades, and state machines for lifecycle fields.

### 4.4 Archie — Architect

- **Role:** Cross-cutting architecture decisions, design plans, execution planning, CI/CD, deployment, infrastructure.
- **Inputs:**
  - Pam's `requirements/`.
  - Tom's `tech-specs/`.
- **Outputs:**
  - `plans/<NN>-<feature>.md` — design plans with Key Decisions, Data Model Changes, API Surface, Dependencies, Deferred, and Action Plan task table.
  - `docs/DATABASE-SCHEMA.md` — target schema reference.
  - *(future)* `docs/adr/`, `docs/ARCHITECTURE.md`, `docs/INFRASTRUCTURE.md`, extended plan template.
- **Conditional in JIT flow:** required for cross-cutting changes (new service, infra, auth, breaking migration); optional for in-boundary features.
- **Handoff criteria:** every plan has a task table; design plans reference the use cases they implement.

### 4.5 Parker — Project Manager

- **Role:** Shape plans into executable slices, sequence work, reconcile progress.
- **Inputs:**
  - Archie's design plans and plan task tables.
- **Outputs:**
  - Sliced plan rows ready for Brad and Fran.
  - Sequencing guidance and dependency declarations.
  - Reconciliation between implementation reality and plan rows.
- **Handoff criteria:** each slice independently committable and validatable; dependencies explicit; task rows current.

### 4.6 Brad — Backend Developer

- **Role:** Implement service-layer code against design plans and use cases.
- **Inputs:**
  - Assigned plan row.
  - Tom's `tech-specs/features/<feature>/` files.
  - Rules: service, testing, model-change, workflow.
- **Outputs:**
  - Prisma schema + migration; service/repo logic; Zod DTOs; mappers; Fastify route schemas; regenerated OpenAPI/SDK.
  - Unit, DB-integration, and SDK functional-API tests.
  - Contract documentation inline in DTOs and route descriptions.
  - Plan row update.
  - *(future)* Slice summary, contract examples, migration runbooks, feature-flag and runbook updates.
- **Handoff criteria:** slice-completion checklist and contract-documentation checklist satisfied; SDK regenerated and exported before Fran consumes it.

### 4.7 Fran — Frontend Developer

- **Role:** Build the web application against the generated SDK and the reviewed plans/use cases.
- **Inputs:**
  - Assigned plan row.
  - Generated SDK and types from Brad.
  - Pam's `use-cases.md` and `screens.md`.
  - Rules: react-ui, ux, testing.
- **Outputs:**
  - React pages, components, and hooks.
  - Vitest unit tests and MSW-backed integration tests.
  - Loading/error/empty/success state handling.
  - Stable `data-testid` selectors.
  - Plan row update.
  - *(future)* Slice summary, contract-question artifacts, frontend registry updates.
- **Handoff criteria:** does not begin until the SDK/types for the slice actually exist; frontend review checklist satisfied.

### 4.8 Tess — Test Planner

- **Role:** Derive test cases from product requirements and technical specifications. Produce a test matrix. Audit coverage after implementation.
- **Inputs:**
  - Pam's `use-cases.md`, `screens.md`, `business-rules.md`.
  - Tom's `api-surface.md`, `flows.md`.
- **Outputs:**
  - `tech-specs/features/<feature>/test-matrix.md` — derived test cases with layer, scenario, positive/negative, and coverage status.
  - Coverage audit findings table after implementation (uses Quinn's verification results to update matrix).
- **Handoff criteria:** test matrix derived before or alongside implementation; coverage audit completed before Riley's code review.
- **Does not produce:** tests, test execution, production code, product decisions.

### 4.9 Quinn — QA/Test Engineer

- **Role:** Verification strategy, test execution, failure triage, test infrastructure health, release confidence.
- **Inputs:**
  - Tess's test matrix (when available).
  - Implemented code from Brad and Fran.
  - Slice risk profile.
- **Outputs:**
  - Verification results: what ran, what passed, what was blocked.
  - Failure triage: product regression vs stale test vs environment issue.
  - Test infrastructure health findings (stale factories, mocks, helpers).
  - Release confidence report with residual risk.
- **Handoff criteria:** verification lanes selected based on slice risk; failures triaged; residual risk surfaced; test infrastructure swept after model/contract changes.
- **Does not produce:** test cases from specs (Tess does that), production code, code quality review.

### 4.10 Riley — Code Reviewer

- **Role:** Audit implementation against rules, plans, and use cases.
- **Inputs:**
  - Slice under review.
  - Corresponding plan row and use cases.
  - Rules applicable to the changed modules.
- **Outputs:**
  - Findings table with severity, category, and file references.
  - Explicit merge recommendation or block.
  - *(future)* Handoff-completeness review.
- **Handoff criteria:** every finding is either resolved or explicitly accepted with rationale.

---

## 5. Handoff Criteria Summary Table

| From | To | Bundle | Gate |
|---|---|---|---|
| Owner | Pam | Vision, visuals (Mode B) | Conversation started |
| Pam | Tom | `requirements/` bundle | All items labeled; owner signed off; `open-questions.md` classified |
| Tom | Archie | `tech-specs/` bundle | Every use case mapped to flows; every route has roles + errors; domain model complete |
| Tom | Brad / Fran | `tech-specs/features/<feature>/*` | Same gate as Tom → Archie, scoped to the feature |
| Archie | Parker | `plans/` | Task table present; design decisions documented |
| Parker | Brad / Fran | Sliced plan rows | Slices independently committable; dependencies declared |
| Brad | Fran | Regenerated SDK + contract docs | SDK exported; contract-documentation checklist satisfied |
| Fran | Brad | Contract question | Cites what docs say; proposes doc addition |
| Tom | Tess | `tech-specs/` bundle | Tech spec complete; Tess derives test matrix |
| Tess | Brad / Fran | Test matrix | Test cases derived from specs; developers know what to test |
| Brad / Fran | Quinn | Code + tests for verification | Quinn selects lanes, runs, triages failures |
| Quinn | Tess | Verification results | Tess updates matrix coverage status |
| Tess | Riley | Coverage audit | Test gaps flagged; coverage verified |
| Brad / Fran | Riley | Code for review | Slice-completion checklist satisfied |
| Riley | Brad / Fran | Findings table | Each finding resolved or explicitly accepted |

---

## 6. Escalation and Ambiguity Routing

- **Product question** (what should this do, who can do it, why) → `Pam`.
- **Technical contract question** (endpoint shape, schema, state machine) → `Tom` during spec; `Brad` during and after implementation.
- **Implementation question** (how to build in the stack) → `Brad` / `Fran` / `Archie` by layer.
- **Model-impact classification** (does this change the domain model?) → `Dom`.
- **Test planning question** (what test cases does this use case need?) → `Tess`.
- **Test execution question** (which lanes to run, is this failure real or stale?) → `Quinn`.
- *(future)* **Operational question** (how does this run in prod) → `Archie` primarily.
- *(future)* **Handoff gap** (doc missing, runbook missing) → `Riley` flags; originating persona fixes.

---

## 7. Cross-Cutting Artifacts

| Artifact | Owner | Status |
|---|---|---|
| `requirements/` | Pam | Active — canonical product requirements |
| `tech-specs/` | Tom + Dom | Active — canonical technical specifications |
| `plans/` | Archie + Parker | Active — design plans and task tables |
| `docs/DATABASE-SCHEMA.md` | Archie | Active |
| `docs/ARCHITECTURE.md` | Archie | *(future — Plan 03)* |
| `docs/INFRASTRUCTURE.md` | Archie | *(future — Plan 03)* |
| `docs/adr/` | Archie | *(future — Plan 03)* |
| `docs/FEATURE-FLAGS.md` | Brad | *(future — Plan 03)* |
| `docs/RUNBOOKS/` | Brad | *(future — Plan 03)* |
| `docs/frontend/COMPONENT-INVENTORY.md` | Fran | *(future — Plan 03)* |
| `docs/frontend/ANALYTICS-EVENTS.md` | Fran | *(future — Plan 03)* |
| `docs/frontend/ACCESSIBILITY.md` | Fran | *(future — Plan 03)* |
| `docs/DEPLOYMENT-READINESS.md` | Archie | *(future — Plan 03)* |
| `CHANGELOG.md` | Archie or Riley | *(future — Plan 03)* |

---

## 8. What's Active Now vs What's Next

**Active:**

- Pam produces the full requirements bundle with confidence labels, use-case template, Mode A/B, and handoff floor.
- Tom converts requirements into per-feature tech specs (`domain-model.md`, `api-surface.md`, `flows.md`), orchestrating Dom. Supports JIT invocation.
- Dom operates as Tom's subagent during greenfield; existing mid-implementation impact classification is unchanged.
- Archie, Parker, Brad, Fran, and Riley continue using their current persona files with no new output requirements.

**Next (Plans 02, 03, and 05 — after pilot):**

- Plan 02: Tom project-level outputs (consolidated domain model, error envelope, auth model, integration notes). Dedicated rule files for product requirements and technical specifications.
- Plan 03: Archie ADRs and current-state docs. Brad slice summaries, contract examples, migration runbooks, feature-flag inventory, operational runbooks. Fran contract-question format, slice summary, frontend registries. Riley handoff-completeness scope.
- Plan 05: JIT specification trigger, Archie gate, specs-track-code rule, post-implementation reconciliation. Formal workflow-rules additions.
