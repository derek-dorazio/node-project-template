# Plan 04: Minimal Pam → Tom Rollout

## Summary

Plans 02 and 03 describe an ambitious target state. This plan carves out the smallest slice that is worth piloting now: tighten Pam, introduce Tom with a minimum-viable output set, adjust Dom lightly, and leave Archie, Brad, Fran, and Riley alone.

Goal: be able to run one greenfield feature (Mode A or Mode B) through Pam → Tom → Dom and then hand off cleanly to the existing Archie/Brad/Fran flow, without disturbing the current developer handoff contracts.

Explicit non-goals for this plan (all deferred to Plans 02 and 03):

- No new outputs required from Archie. No ADR discipline, no `docs/ARCHITECTURE.md` / `docs/INFRASTRUCTURE.md`, no extended design plan template.
- No new outputs required from Brad or Fran. Slice summary, runbooks, registries, and contract-question template are all deferred.
- No changes to Riley's scope.
- No project-level Tom outputs (`error-envelope.md`, `auth-model.md`). Feature-level only for now.
- No formal Spec Refinement Loop phase in workflow rules. Informal iteration only.

---

## 1. Pam — MVP Changes

### 1.1 Tighten Scope

Update `agents/product-manager.md` to make explicit that Pam **does not** produce:

- Database schema or field-level types/constraints
- API endpoints, routes, or DTO definitions
- State machines at field level
- Architecture decisions

Lifecycle can be described at concept level ("a league becomes inactive and can later be deleted"), not field level.

### 1.2 MVP Output Bundle

Folder: `requirements/`. Minimum files for a feature to exit Pam:

**Product-level (project-wide, written once and updated incrementally):**

- `product-requirements.md` — product purpose, users, problems solved, non-goals, success criteria.
- `roles-and-actors.md` — actor definitions and a capability matrix.
- `glossary.md` — canonical terms and UI ↔ product-concept mappings.
- `domain-concepts.md` — real-world nouns the product manages: entities, relationships, lifecycle described in prose. No field definitions, types, or cardinality shorthand — those belong to Tom/Dom downstream.
- `navigation-and-entry-points.md` — global navigation model, how users enter the product, high-level page inventory, cross-feature routing concepts.

**Per feature (`requirements/features/<feature-slug>/`):**

- `overview.md` — feature purpose, in-scope actors, major capabilities, dependencies on other features, deferred scope.
- `use-cases.md` — one block per use case, using the template in §1.3.
- `screens.md` — screen purpose, allowed roles, key actions, state expectations (loading / empty / error / success at the product level, no component detail), navigation to other screens.
- `business-rules.md` — validation rules, uniqueness constraints, lifecycle transitions, authorization boundaries — stated as product rules, not code. Use cases reference entries in this file by name.
- `open-questions.md` — classified as `Confirmed Drift`, `Needs Review`, or `Deferred`.

### 1.3 Use Case Template (Required)

```markdown
## <FEATURE>-NNN: <Short name>

- **Actor:** <role>
- **Goal:** <what the actor is trying to achieve>
- **Confidence:** (Confirmed) | (Inferred) | (Needs Review)
- **Preconditions:** <state that must be true before the flow>
- **Normal flow:**
  1. ...
- **Alternate flows:** (or explicit "none")
- **Error paths:** (or explicit "none")
- **Postconditions:** <what is true after a successful flow>
- **Acceptance criteria:**
  - [ ] <testable statement>
- **Business rules referenced:** <names from business-rules.md, or "none">
```

Happy-path-only use cases do not clear the handoff. "None" is a valid answer but must be explicit.

### 1.4 Confidence Labels

Every use case and screen must carry an inline label: `(Confirmed)`, `(Inferred)`, or `(Needs Review)`. Default is `(Inferred)` until the owner explicitly agrees; `(Needs Review)` items must also appear in `open-questions.md`.

### 1.5 Mode A and Mode B

Add two short operating-sequence sections to Pam's persona file:

- **Mode A (vision only):** conversation-driven; drafts `product-requirements.md` → `roles-and-actors.md` → `glossary.md` → `domain-concepts.md` → `navigation-and-entry-points.md` → per-feature files (starting with `overview.md`, then `use-cases.md`, then `screens.md` and `business-rules.md`), one at a time, with owner checkpoint after each.
- **Mode B (vision + visuals):** begins with a visual-extraction pass (screen inventory, visible actions, visible navigation, visible role distinctions, visible copy that implies rules) before conversation. Visual-sourced items default to `(Confirmed)` only after the owner confirms they represent intended product, not stale exploration.

### 1.6 MUST-HAVE Floor Before Pam → Tom

Pam is ready to hand off when:

- All §1.2 files exist for the feature area: `overview.md`, `use-cases.md`, `screens.md`, `business-rules.md`, `open-questions.md`.
- Product-level files exist and are current: `product-requirements.md`, `roles-and-actors.md`, `glossary.md`, `domain-concepts.md`, `navigation-and-entry-points.md`.
- Every use case follows the §1.3 template, including alternate flows, error paths, acceptance criteria, and business rule references.
- Every use case, screen, and business rule carries a confidence label per §1.4.
- `open-questions.md` has no unclassified entries.
- Owner has reviewed the bundle end-to-end at least once and signed off on `(Confirmed)` items.
- Every cross-feature reference is linked, not bare.

---

## 2. Tom — MVP Introduction

### 2.1 Create Persona File

New file: `agents/technical-specification-creator.md`. Nickname `Tom`.

Scope the first version narrowly:

- **Role:** Convert Pam's owner-confirmed requirements into a feature-level technical specification by orchestrating Dom.
- **Inputs:** Pam's complete §1.6 bundle plus owner sign-off.
- **Outputs** (`tech-specs/features/<feature-slug>/`):
  - `domain-model.md` (owned by Dom; reviewed by Tom)
  - `api-surface.md`
  - `flows.md`
  - `open-questions.md`
- **Ambiguity handling:** If Pam's bundle has unresolved `(Inferred)` items or `(Needs Review)` entries, Tom blocks and routes specific questions back to Pam + owner. Tom does not invent product behavior.
- **Does not produce (yet):** project-level consolidated domain model, error envelope, auth model, integration notes. Those land in a later plan.

### 2.2 Output File Shapes

Keep these lean for the pilot:

- **`domain-model.md`** — per entity:
  - Fields table: `name | type | nullable | default | constraints`.
  - Relationships with cardinality.
  - State machine (diagram or transition table) for any lifecycle field.
  - Invariants.
- **`api-surface.md`** — route inventory table:
  - Columns: `method | route | purpose | request DTO | response DTO | allowed roles | notable errors`.
- **`flows.md`** — for each use case from Pam, one block:
  - Trigger
  - Screen → API → service → persistence sequence
  - Error branches
  - State transitions worth noting
- **`open-questions.md`** — same classification scheme as Pam.

### 2.3 MUST-HAVE Floor Before Tom → Downstream

Tom is ready to hand off to Archie / Brad / Fran when:

- Every Pam use case has a corresponding block in `flows.md`.
- Every route has allowed-role and notable-error declarations.
- Every entity has a fields table and (where applicable) a state machine.
- `tech-specs/features/<feature-slug>/open-questions.md` is empty.
- Naming matches Pam's glossary — no drift.

### 2.4 Keep Tom's Rules Inside the Persona File for Now

Skip creating `rules/technical-specification-rules.md` in this plan. Codify Tom's output rules as sections inside `agents/technical-specification-creator.md`. Extract to a dedicated rule file after the first real pilot reveals what's actually load-bearing.

---

## 3. Dom — MVP Changes

Add one short section to `agents/data-modeler.md`:

- **Operating as Tom's subagent during greenfield.** When Tom invokes Dom for technical-spec work, Dom produces the per-feature `domain-model.md` described in §2.2 and enforces `rules/domain-model-conventions-rules.md`. Dom's existing mid-implementation impact classification behavior is unchanged.

No other Dom changes in this plan.

---

## 4. Workflow Rules — MVP Changes

Keep the edits light:

- **Nickname table** — add one row:

  | Formal Persona | Nickname | Notes |
  |---|---|---|
  | Technical Specification Creator | Tom | Converts product requirements into feature-level technical specifications with Dom |

- **Phase framing** — one clarifying paragraph noting that, for greenfield work, Phase 2 (Use Cases) is Pam's work and produces `requirements/`; a new Phase 2.5 (Technical Specification) is Tom's work and produces `tech-specs/`; Phase 3 (Design Plans) remains Archie's work and begins after Tom's handoff. Do not restructure the existing numbered phases — just add the 2.5 clarification.

- **No new Spec Refinement Loop phase.** Iteration between Pam / Tom / owner is informal for the pilot. Revisit if it decays.

---

## 5. AGENTS.md — MVP Changes

- Add `agents/technical-specification-creator.md` to the persona playbook list with a one-line description.
- Update Pam's one-line description to reflect the tightened scope (product intent only, not schema / routes / DTOs).
- No new rule files to list in this plan.

---

## 6. Explicitly Deferred

These remain in Plans 02 and 03 and are out of scope here:

- `rules/product-requirements-rules.md` and `rules/technical-specification-rules.md` as dedicated rule files.
- Tom's project-level outputs (`error-envelope.md`, `auth-model.md`, consolidated `domain-model.md`, `integration-notes.md`).
- Archie's extended design plan template (diagrams, infra checklist, rollback, flags, observability, perf, security).
- ADR discipline, `docs/ARCHITECTURE.md`, `docs/INFRASTRUCTURE.md`, `docs/FEATURE-FLAGS.md`, `docs/RUNBOOKS/`, `docs/frontend/` registries, `docs/DEPLOYMENT-READINESS.md`, `CHANGELOG.md`.
- Brad slice summary artifact, contract examples, pagination/timeout/idempotency docs, migration runbook requirement.
- Fran contract-question template, slice summary, accessibility attestation.
- Riley handoff-completeness review scope.
- Formal Spec Refinement Loop phase.
- Revision-stamp convention on evergreen docs.

Each of these is a real improvement; the bet is that the Pam → Tom pilot will reveal which of them matter most in practice and which can wait.

---

## 7. Open Questions

- **Where does Pam's product-level content live across features?** Product-level files (`product-requirements.md`, `roles-and-actors.md`, `glossary.md`, `domain-concepts.md`, `navigation-and-entry-points.md`) are project-wide and grow incrementally. Confirm that stays workable when a second feature lands.
- **How does Tom handle a `(Confirmed)` item in Pam's output that Dom flags as inconsistent with existing conventions?** MVP: Tom routes it back to Pam + owner with Dom's objection. Revisit if this happens often enough to need a named protocol.
- **Does Mode B need any structured artifact to capture the visual extraction** (e.g., a visual-extraction note), or can it stay inline in `screens.md`? MVP: inline. Promote to structured artifact only if inline becomes hard to follow.

---

## Action Plan

| ID | Phase | Task | Status | Notes |
|---|---|---|---|---|
| 04-001 | 1 | Update `agents/product-manager.md` (Pam) per §1: tightened scope, full output bundle (product-level + per-feature including domain-concepts, navigation, business-rules, overview), use case template, confidence labels, Mode A/B operating sequences, MUST-HAVE handoff floor | Not Started | |
| 04-002 | 1 | Create `agents/technical-specification-creator.md` (Tom) per §2 — persona file with embedded output rules, not a separate rule file | Not Started | |
| 04-003 | 1 | Update `agents/data-modeler.md` (Dom) with the "Operating as Tom's subagent during greenfield" section per §3 | Not Started | |
| 04-004 | 2 | Update `rules/workflow-rules.md` with the Tom nickname row and the Phase 2.5 clarification per §4 | Not Started | |
| 04-005 | 2 | Update `AGENTS.md` persona playbook list per §5 | Not Started | |
| 04-006 | 3 | Pilot Pam → Tom on one greenfield feature (Mode A or Mode B). Capture friction points and unmet needs before adopting more of Plans 02 / 03 | Not Started | Intentional pause before codifying further |
| 04-007 | 4 | Retrospective: decide which deferred items from §6 to promote next, based on pilot findings | Not Started | Informs future plans |
