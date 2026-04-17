# Plan 02: Product Requirements Flow — Pam → Tom → Builders

## Summary

Scope Pam (`Product Manager`) tightly to product requirements, then introduce a new persona `Tom` (`Technical Specification Creator`) who converts Pam's output into a full technical specification by orchestrating `Dom` and other helper subagents. Tom's output feeds `Archie` (architecture), `Brad` (backend), and `Fran` (frontend).

This plan covers two starting conditions:

- **Mode A** — no previous product exists; human product manager has a vision only.
- **Mode B** — no previous product exists, but the human product manager has screenshots, wireframes, Figma frames, or other visuals to communicate use cases.

Brownfield and rebuild situations that lack structured requirements can use the dormant `Abe` persona for one-time extraction, but the active flow for all maintained projects is Pam → Tom.

---

## 1. Pam Improvements — Product Requirements

### 1.1 Scope Pam to Product Intent Only

Pam should produce what users want the product to do, who uses it, and the rules the product enforces. Pam should **not** produce:

- Database schema or field-level types/constraints
- API endpoints, routes, or DTO definitions
- State machines at field level
- Architecture decisions

Those belong downstream with Tom and Dom. Pam can describe lifecycle at a conceptual level ("a league becomes inactive and can later be deleted"), but not at a field-or-route level.

### 1.2 Required Pam Output Artifacts

Every greenfield project should exit Pam's phase with this artifact set. Folder: `requirements/`.

**Product-level files:**

- `product-requirements.md` — product purpose, primary users/personas, problems solved, explicit non-goals, success criteria, phase boundaries.
- `roles-and-actors.md` — actors, role definitions, capability matrix (who can do what).
- `glossary.md` — canonical terminology, UI term ↔ product-concept mappings, terms to avoid.
- `domain-concepts.md` — the real-world "nouns" the product manages and how they relate, at a conceptual level. Entities and relationships named, with lifecycle described in prose. No field definitions, no types, no cardinality shorthand.
- `navigation-and-entry-points.md` — global navigation model, how users enter the product, high-level page inventory.

**Per feature area (`requirements/features/<feature-slug>/`):**

- `overview.md` — feature purpose, in-scope actors, major capabilities, dependencies on other features, deferred scope.
- `use-cases.md` — one block per use case with the template in §1.3.
- `screens.md` — page/screen purposes, allowed roles, key actions, read-only information, state expectations (loading/empty/error/success — what the user should see, not how it's built), navigation to other screens. **No** component hierarchy or layout detail.
- `business-rules.md` — validation rules, uniqueness constraints, lifecycle transitions, authorization boundaries — stated as product rules, not code.
- `open-questions.md` — classified as `Confirmed`, `Needs Review`, or `Deferred`.

### 1.3 Use Case Template

Every use case must carry these subsections:

```markdown
## <FEATURE>-NNN: <Short name>

- **Actor:** <role>
- **Goal:** <what the actor is trying to achieve>
- **Confidence:** (Confirmed) | (Inferred) | (Needs Review)
- **Preconditions:** <state that must be true before the flow>
- **Normal flow:**
  1. ...
- **Alternate flows:** (or explicit "none")
  - <branch>: <steps>
- **Error paths:** (or explicit "none")
  - <failure>: <what the user sees, what the system does>
- **Postconditions:** <what is true after a successful flow>
- **Acceptance criteria:**
  - [ ] <testable statement>
  - [ ] ...
- **Business rules referenced:** <links to business-rules.md entries>
```

Happy-path-only use cases are not accepted for handoff. "None" is a valid answer but must be explicit — the absence of alternates or errors is a decision, not an oversight.

### 1.4 Confidence Labels Everywhere

Every use case, screen, business rule, and open question must carry an inline label: `(Confirmed)`, `(Inferred)`, or `(Needs Review)`.

- `(Confirmed)` — owner explicitly agreed.
- `(Inferred)` — Pam drafted to keep the spec coherent; owner has not yet reacted.
- `(Needs Review)` — owner and Pam identified a decision needed; must also appear in `open-questions.md`.

A Pam bundle is not ready for Tom if any `(Inferred)` item exists without a corresponding `open-questions.md` entry or without being upgraded to `(Confirmed)`.

### 1.5 MUST-HAVE Floor Before Pam → Tom Handoff

Pam is not done until, for the feature scope in play:

- All required files exist and follow §1.2.
- Every use case follows the §1.3 template, including alternate flows, error paths, and acceptance criteria.
- Every item carries a confidence label per §1.4.
- `open-questions.md` has zero unclassified entries.
- Owner has reviewed the full bundle end-to-end at least once and explicitly signed off on the `(Confirmed)` items.
- Every cross-feature reference is linked (no bare "see the Team page" without a path).

### 1.6 Nice-to-Have in Pam's Output

These improve the handoff but don't block it:

- `examples.md` per feature — sample user inputs, sample copy, sample email content.
- Mermaid flow diagrams when prose flows become hard to follow.
- A "competitive/reference patterns" note pointing to products that solve a similar problem, when relevant.

### 1.7 Iteration Discipline

Pam's existing rule — "never write a full document without checkpoints" — stays. Reinforcement:

- Present each file section-by-section for review.
- Use confidence labels as checkpoint markers: `(Inferred)` is a request-for-review, not a final statement.
- Push back on scope creep. When the owner describes a tempting feature, ask "is this needed for this phase?" and capture deferred-scope decisions explicitly.
- Do not accept "let's figure that out later" as an answer without recording it as `open-questions.md` with a classification.

---

## 2. Input Modes

### 2.1 Mode A — Vision Only (No Visuals)

**Input:** human product manager with an idea, nothing else.

**Flow:**

1. Pam starts with the conversation starters already in the persona file (product vision, domain, scope, identity/access).
2. Pam drafts `product-requirements.md` and `roles-and-actors.md` first, iteratively.
3. Pam drafts `glossary.md` and `domain-concepts.md` as terminology emerges. Lock naming early — renaming entities downstream is expensive.
4. Pam drafts per-feature files (`overview.md`, `use-cases.md`, `screens.md`, `business-rules.md`) for one feature area at a time.
5. Each draft passes through owner review before moving on.
6. Pam resolves or records every `(Needs Review)` before handing off.

**Default confidence on first draft:** `(Inferred)`. Upgrade to `(Confirmed)` only after explicit owner acceptance.

### 2.2 Mode B — Vision Plus Visual Artifacts (Screenshots / Wireframes / Figma)

**Input:** human product manager provides a vision plus visual artifacts — static screenshots, exported Figma frames, wireframe PDFs, or photographs of whiteboard sketches.

**Flow:**

1. Pam performs a **visual extraction pass** over the artifacts before any conversation:
   - Enumerate distinct screens/views.
   - List visible actions (buttons, links, menu items) per screen.
   - Capture visible navigation (tabs, menus, route labels).
   - Note any visible role distinctions ("this action only appears for admins").
   - Capture visible state variations (empty states, error banners, loading indicators shown in mocks).
   - Transcribe visible copy that implies product rules ("Invite expires in 7 days").
2. Pam drafts an initial `screens.md` and `navigation-and-entry-points.md` from the extraction — labeled `(Confirmed)` for what the artifacts show and `(Inferred)` for what they imply.
3. Pam then runs targeted conversation to fill the gaps the visuals cannot answer:
   - Business rules and validation.
   - Authorization and role boundaries.
   - Lifecycle semantics (what leads to this state, what exits it).
   - Error behavior (what happens when the backend fails).
   - Off-screen and async behavior (emails sent, notifications, background jobs).
   - Non-functional posture (perf, a11y, analytics, i18n).
4. Remaining files (`product-requirements.md`, `use-cases.md`, `business-rules.md`, `domain-concepts.md`, `glossary.md`) follow the Mode A pattern, anchored by what the visuals revealed.
5. Pam resolves conflicts between visuals and conversation explicitly. If a mock shows a field but the owner says "that's stale," mark it `(Confirmed Drift)` in `open-questions.md` and remove it from the active spec.

**Default confidence:**

- `(Confirmed)` for UI structure and visible actions that appear in the artifacts **and** that the owner confirms are intended.
- `(Inferred)` for anything the artifacts imply but don't state (data model, authorization, error behavior, lifecycle, off-screen behavior).
- `(Needs Review)` for artifact-to-artifact inconsistency or any owner-unresolved question.

**Pitfalls to call out in the persona:**

- Mocks often lack error/empty/loading states. Pam must ask about these explicitly rather than inheriting whatever the artifact happened to show.
- Visual polish can disguise unreviewed product thinking. Pam should not treat a beautiful mock as more authoritative than a rougher one.
- Artifacts may represent early exploration rather than reviewed direction. Ask.

### 2.3 Common Exit Criteria

Regardless of mode, Pam is done for a feature area when §1.5 is satisfied and the owner has reviewed the full bundle.

---

## 3. Tom — Technical Specification Creator (New Persona)

### 3.1 Role

Tom translates Pam's owner-confirmed requirements into a full technical specification that Archie, Brad, and Fran can act on without reverse-engineering product intent.

Tom does not make product decisions. Tom does not invent features. Tom may flag ambiguity in Pam's output and route it back to Pam + owner, but Tom does not resolve product questions unilaterally.

### 3.2 Inputs

- The complete Pam bundle from §1.5 (required).
- Any existing `rules/domain-model-conventions-rules.md` guidance.
- Owner confirmation that the Pam bundle is stable enough to begin technical specification.

If Pam's bundle has unresolved `(Inferred)` items or `(Needs Review)` entries, Tom either blocks, scopes around them explicitly, or routes specific questions back to Pam — Tom does not assume.

### 3.3 Team and Subagent Orchestration

Tom coordinates with these personas as subagents or collaborators:

- **Dom (Data Modeler)** — translates `domain-concepts.md` into a formal domain model: entities, field-level fields with types/nullability/defaults/constraints, relationships with cardinality, state machines for lifecycle fields, cascade semantics. Dom already owns convention enforcement via `rules/domain-model-conventions-rules.md`.
- **API Designer capability** — currently part of Tom; can be spun out later if complexity demands. Translates use cases into an API surface: routes, methods, request/response DTO names, authorization, domain error codes.
- **Flow Designer capability** — currently part of Tom. Produces sequence-style flow descriptions showing how screens, APIs, services, and persistence interact for each use case.

If future projects outgrow Tom's single-persona scope, additional personas (e.g., `Ava` for API design, `Flo` for flow design) can be broken out. Start with Tom-as-orchestrator.

### 3.4 Required Tom Output Artifacts

Folder: `tech-specs/` (parallel to `requirements/`, separate from `specs/` which remains Abe's rebuild-artifact territory).

**Per feature area (`tech-specs/features/<feature-slug>/`):**

- `domain-model.md` (owned by Dom, reviewed by Tom) — entities with fields table (`name | type | nullable | default | constraints`), relationships with cardinality and cascades, state machines for lifecycle fields, invariants.
- `api-surface.md` — route inventory table with method, route, purpose, request DTO name, response DTO name, allowed roles, notable domain errors.
- `flows.md` — for each use case from Pam's `use-cases.md`, a technical flow showing screen → API → service → persistence interactions, error branches, and state transitions.
- `integration-notes.md` — cross-feature technical touchpoints, shared services, external integrations, async/background work.
- `open-questions.md` — technical ambiguities that Tom could not resolve from Pam's bundle.

**Per project (`tech-specs/`):**

- `domain-model.md` — canonical combined model, merging per-feature Dom output.
- `error-envelope.md` — shared error response shape and the canonical domain error code registry.
- `auth-model.md` — how authorization works across the product, consumed by every route.

### 3.5 MUST-HAVE Floor Before Tom → Builder Handoff

Tom is not done until:

- Every Pam use case has a corresponding technical flow in `flows.md`.
- Every screen action implies at least one route in `api-surface.md`, and every route traces back to at least one use case.
- Every route has an allowed-role declaration and an explicit set of notable errors.
- Every entity in `domain-model.md` has a fields table and (if it has lifecycle) a state machine.
- `tech-specs/open-questions.md` has zero unclassified entries.
- Naming in Tom's output matches Pam's glossary — no drift.
- Owner has reviewed at least the API surface and domain model; Tom and Pam together walk the owner through anything that changes product-facing behavior.

### 3.6 Nice-to-Have in Tom's Output

- Sequence diagrams (Mermaid) for complex flows.
- Sample request/response payloads for nontrivial endpoints.
- Non-functional technical posture: rate limiting per route, cache semantics, idempotency keys, retry behavior.

---

## 4. Handoffs and Ownership

### 4.1 Pam → Tom

Pam delivers the §1.5 bundle and explicitly signals "ready for technical specification." Tom ingests and, within a first pass, produces a list of technical ambiguities for Pam + owner to clarify before Tom commits to structure.

### 4.2 Tom → Archie / Brad / Fran

Tom's bundle is the authoritative input for:

- **Archie** — consumes `tech-specs/` plus Pam's `requirements/` to make cross-cutting architecture decisions (service boundaries, deployment model, shared services) and produce design plans in `plans/`.
- **Brad** — consumes `tech-specs/features/<feature>/domain-model.md`, `api-surface.md`, and `flows.md` to implement routes, services, DTOs, mappers, and tests.
- **Fran** — consumes `tech-specs/features/<feature>/api-surface.md` and Pam's `requirements/features/<feature>/screens.md` + `use-cases.md` to implement screens and flows.

Implementation personas must not reverse-infer product intent from code when a Pam artifact exists, and must not reverse-infer technical structure from code when a Tom artifact exists. If an implementation persona finds ambiguity, they route it back to Pam (for product questions) or Tom (for technical questions).

### 4.3 Where Abe Fits

Abe is dormant in the standard lifecycle. Pam and Tom produce the canonical product and technical specifications for both greenfield and maintained projects. Abe is retained only for one-time extraction from legacy projects that were built without structured requirements -- it is not part of the active Pam → Tom → Archie → Brad/Fran flow.

### 4.4 Ambiguity Routing

- **Product question** (what should this do, who can do it, why) → Pam.
- **Technical contract question** (endpoint shape, schema, state machine) → Tom.
- **Implementation question** (how to build it in the stack) → Brad / Fran / Archie.
- **Model-impact classification** (does this change the domain model?) → Dom.

---

## 5. Rule, Persona, and Workflow Changes

### 5.1 New Rule Files

- `rules/product-requirements-rules.md` — codifies §1 of this plan: Pam's required artifacts, use case template, confidence-label rules, MUST-HAVE handoff floor. Parallel to `application-specification-rules.md` but scoped to product requirements.
- `rules/technical-specification-rules.md` — codifies §3 of this plan: Tom's required artifacts, orchestration with Dom, MUST-HAVE handoff floor.

### 5.2 Updated Rule Files

- `rules/workflow-rules.md` — replace the current Phase 1–5 framing with:
  - Phase 1: Product Requirements (Pam)
  - Phase 2: Technical Specification (Tom + Dom)
  - Phase 3: Architecture / Design Plans (Archie)
  - Phase 4: Execution Plans (Archie)
  - Phase 5: Implementation (Brad, Fran)
  - Add a Spec Refinement Loop between Phase 1 and Phase 2, and between Phase 2 and Phase 3.
- `rules/application-specification-rules.md` — now marked dormant; Abe operates only for one-time legacy extraction.
- `AGENTS.md` — add the new rule files to required reading, add Tom to the persona playbook list.

### 5.3 New Persona File

- `agents/technical-specification-creator.md` — Tom. Nickname `Tom`. Includes role, inputs, team orchestration (Dom + internal capabilities), required operating sequence, deliverables, and ownership boundaries.

### 5.4 Updated Persona Files

- `agents/product-manager.md` (Pam) —
  - Redefine deliverables to match §1.2.
  - Add Mode A / Mode B operating sequences.
  - Add use case template (§1.3) by reference.
  - Add confidence-label rule by reference.
  - Add MUST-HAVE floor checklist (§1.5) for Pam → Tom handoff.
- `agents/data-modeler.md` (Dom) — add an "Operating as Tom's subagent during greenfield" section clarifying Dom's role inside Tom's tech-spec work.
- `agents/application-specification-builder.md` (Abe) — clarify that Abe is primarily for brownfield/rebuild; for greenfield, the Pam → Tom path is preferred.

### 5.5 Nickname Table Update

Add Tom to the nickname table in `rules/workflow-rules.md`:

| Formal Persona | Nickname | Notes |
|---|---|---|
| Technical Specification Creator | Tom | Converts product requirements into technical specifications by orchestrating Dom and related subagents |

---

## 6. Open Questions

- **Naming of `tech-specs/` folder.** Alternatives: `technical-specs/`, `specs/tech/`, `design/`. Current choice is short and parallel to `requirements/`.
- **Should Dom have a standalone output directory** (`domain-model/`), or always live inside `tech-specs/` when invoked by Tom? Current choice: live inside `tech-specs/features/<feature>/domain-model.md`, with a consolidated `tech-specs/domain-model.md` as the canonical combined model.
- **When should API Designer / Flow Designer be broken out as standalone personas?** Current recommendation: only after 2–3 real projects where Tom consistently hits single-persona scope limits.
- **Does Mode B justify a dedicated visual-extraction sub-persona** (e.g., `Vera`)? Current recommendation: keep the capability inside Pam's persona until it proves too large for one persona to carry cleanly.
- **Revision stamping** — does this become required for `requirements/` and `tech-specs/` files, or stay optional? This plan defers to the broader tooling question raised in Plan 01.

---

## Action Plan

| ID | Phase | Task | Status | Notes |
|---|---|---|---|---|
| 02-001 | 1 | Draft `rules/product-requirements-rules.md` codifying §1 | Done | Dedicated rule file with artifact tables, use case template, confidence labels, handoff floor, Mode B extraction rules |
| 02-002 | 1 | Draft `rules/technical-specification-rules.md` codifying §3 | Done | Dedicated rule file with domain model, API surface, flows structure, cross-check requirements, JIT invocation |
| 02-003 | 2 | Update `agents/product-manager.md` (Pam) with §1.2 deliverables, use case template, Mode A/B operating sequences, and MUST-HAVE handoff checklist | Done | Full rewrite with scope boundary, output bundle, confidence labels, Mode A/B, handoff floor |
| 02-004 | 2 | Create `agents/technical-specification-creator.md` (Tom) per §3 | Done | Created with domain model, API surface, flows, JIT invocation, Dom orchestration, handoff floor |
| 02-005 | 2 | Update `agents/data-modeler.md` (Dom) with the "Tom's subagent during greenfield" section | Done | Added greenfield subagent operating section |
| 02-006 | 2 | ~~Update `agents/application-specification-builder.md` (Abe) with the brownfield-primary clarification~~ | Done | Abe marked dormant; Pam+Tom produce canonical specs |
| 02-007 | 3 | Update `rules/workflow-rules.md` with the revised Phase 1–5 framing and Spec Refinement Loops | Done | Phase 2 rewritten for Pam; Phase 2.5 added for Tom+Dom. Spec Refinement Loop deferred to Plan 05 |
| 02-008 | 3 | Update `AGENTS.md` required reading and persona playbook list | Done | Tom added to persona list; Pam description updated; lifecycle uses persona names; repo map updated |
| 02-009 | 3 | Add Tom to the nickname table in `rules/workflow-rules.md` | Done | |
| 02-010 | 4 | Pilot the Pam → Tom flow on one greenfield Mode A project and one Mode B project; capture lessons before codifying further | Not Started | Do not over-codify before real usage |
