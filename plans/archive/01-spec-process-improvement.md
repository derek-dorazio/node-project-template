# Plan 01: Requirements Gathering and Specification Process Improvement

## Summary

Strengthen the product-manager (`Pam`) persona so it reliably produces specifications that a separate builder team can act on without reverse-engineering product intent. Cover three input modes (greenfield conversation, brownfield code analysis, visual artifacts) and define clean handoff boundaries between personas.

> **Note:** The `Abe` (Application Specification Builder) persona is now dormant. Pam and Tom produce the canonical product and technical specifications for greenfield and maintained projects. Abe is retained only for one-time extraction from legacy projects that lack structured requirements.

This plan has three parts:

1. **Output improvements** — what a good spec contains, and what the MUST-HAVE floor is before a builder team can safely begin.
2. **Input modes** — how specs should be produced depending on whether the starting point is a human vision, an existing codebase, or visual artifacts.
3. **Process, agents, and boundaries** — persona/rule changes needed to support the above.

---

## 1. Output Improvements

### 1.1 What Would Improve the Specifications

Observations after reviewing real spec output (`../pool-master/specs/`) against `rules/application-specification-rules.md`:

- Use cases read cleanly but describe only the happy path. Error paths, alternate flows, and testable acceptance criteria are missing.
- Domain model files list fields by name without types, nullability, constraints, defaults, cardinality, or state machines.
- Screen specs list actions and dependent APIs but not authorized roles or the loading/empty/error/success states.
- API surface tables point at DTOs but do not declare authorization rules or expected domain errors.
- Flows are linear — no decision points, validation branches, or rollback paths.
- Confidence labels (`Confirmed` / `Inferred` / `Needs Review`) live only in `open-questions.md`; the actual spec body treats everything as equally load-bearing.
- Cross-domain references are mentioned in prose but not linked. Rebuild readers can't follow "Team page" into the team domain.
- No revision stamp. Six months from now, readers can't tell which spec is stale.

### 1.2 Minimum Required Before Builder Handoff (MUST-HAVE)

A spec set is not ready to hand off to a builder team until every item below is present for the feature area in scope:

**Per feature area (`specs/domains/<domain>/`):**

- `overview.md` — purpose, in-scope actors, major capabilities, cross-domain dependencies.
- `use-cases.md` — for each use case:
  - Actor, Goal, Preconditions, Normal flow, Postconditions.
  - **Alternate flows** and **Error paths** (or explicit "none").
  - **Acceptance Criteria** — 1–5 testable bullets the implementation must satisfy.
  - Inline confidence label: `(Confirmed)`, `(Inferred)`, or `(Needs Review)`.
- `domain-model.md` — for each entity:
  - Fields table with `name | type | nullable | default | constraints`.
  - Relationships with cardinality and cascade semantics.
  - State machine (diagram or transition table) for any lifecycle field.
  - Invariants that every implementation must preserve.
- `screens.md` — for each screen:
  - Route or entry point, purpose, allowed roles.
  - Key actions and read-only information.
  - **States:** loading, empty, error, success — what each renders.
  - Dependent APIs or query surfaces.
  - Transitions to other screens.
- `api-surface.md` — route inventory table with:
  - Method, route, purpose, request DTO, response DTO.
  - **Allowed roles.**
  - **Notable domain errors** (code + when it fires).
- `flows.md` — for each flow: trigger, main steps, state transitions, alternative/error paths (or explicit "none").
- `open-questions.md` — classified items under `Confirmed Drift`, `Needs Review`, `Deferred`.

**Per spec set (`specs/shared/`):**

- `glossary.md` with canonical terms and UI-term ↔ model-term mappings.
- `roles-and-actors.md` with role definitions and a capability matrix.
- `navigation-and-entry-points.md` with global routing and entry points.

**Per file:**

- Footer with `Last reviewed: YYYY-MM-DD against <git sha>`.

### 1.3 Nice-to-Have (Improves Quality, Not Blocking)

These raise quality but should not block a handoff:

- `examples.md` per domain — sample payloads, sample route values, sample error envelopes, sample copy for emails/notifications.
- `non-functional.md` per domain — performance targets, accessibility posture, analytics/telemetry events, i18n expectations, rate-limiting needs, offline behavior.
- Visual flow diagrams (Mermaid) when prose flows become hard to read.
- Cross-domain `See also:` links wherever a screen, flow, or use case references another domain.
- Historical context / design rationale notes when a non-obvious decision would otherwise be reverse-engineered as a bug.

---

## 2. Input Modes

Requirements gathering can begin from three distinct starting points. Each needs a different first-pass approach before the spec converges on the same target output.

### 2.1 Mode A — Greenfield (Human Vision Only)

**Inputs:** a human product owner with an idea, no existing code, no visuals.

**Flow:**

1. `Pam` (product manager persona) leads iterative discovery with the owner.
2. Owner answers, confirms, corrects; `Pam` drafts and refines.
3. `Pam` produces `requirements/` artifacts (project requirements, domain model sketch, module map, roles & permissions) and per-feature `plans/<NN>-<feature>-use-cases.md` drafts.
4. `Tom` converts those artifacts into the canonical `tech-specs/` structure with MUST-HAVE sections filled in, inline confidence labels, and acceptance criteria.
5. Owner reviews the consolidated `tech-specs/` set and confirms.

**Confidence defaults:** `(Confirmed)` for anything the owner explicitly agreed to; `(Needs Review)` for anything `Pam` or `Tom` inferred to keep the spec coherent.

**Risks to manage:**

- Owner fatigue — checkpoints must be incremental, not a single final reveal.
- Scope creep — `Pam` must push for explicit deferred-scope decisions before `Abe` begins structuring.

### 2.2 Mode B — Brownfield (Existing Application)

**Inputs:** a running or partially-built application with code, exported contracts, and/or plans.

> **Note:** The `Abe` persona is dormant. For brownfield projects that lack structured requirements, Abe can be invoked as a one-time extraction tool. For maintained projects, Pam leads requirements discovery and Tom produces technical specifications, even when existing code is present.

**Flow (standard path):**

1. `Pam` leads requirements discovery against the existing codebase, using code, exported DTOs/OpenAPI, active plans, and current routes/screens as reference material.
2. Every inferred item is labeled `(Inferred)` by default. Items that are clearly supported by reviewed plans can be upgraded to `(Confirmed)` during drafting.
3. `Pam` + the owner review the draft. They:
   - Upgrade `(Inferred)` → `(Confirmed)` where the owner endorses current behavior as the intended product.
   - Downgrade `(Inferred)` → `(Needs Review)` where current behavior does not reflect desired product direction.
   - Move items to `open-questions.md` under `Confirmed Drift` when code disagrees with intent.
4. `Tom` produces technical specifications from Pam's confirmed requirements.

**Confidence defaults:** `(Inferred)` until the owner confirms.

**Risks to manage:**

- Confusing "what the app does" with "what the product should do." The owner must explicitly bless or reject each inferred behavior.
- Treating broad DTO surface area as proof that a field belongs.

### 2.3 Mode C — Visual-First (Figma / Wireframes / Screenshots)

**Inputs:** visual artifacts describing screens, layout, and interaction — no running app, or only partial code.

**Flow:**

1. A visual-artifact pass extracts: screen inventory, visible actions per screen, state variations shown (e.g., empty states in mockups), navigation structure, copy, role distinctions implied by which actions are visible to whom.
2. `Pam` + the owner conduct targeted conversation to resolve non-visual questions: business rules, lifecycle semantics, authorization, error behavior, offline/async semantics, what happens off-screen.
3. `Pam` merges the visual extract and the conversation output into the `requirements/` structure, producing `screens.md` and use cases primarily from the visuals, and domain concepts / business rules primarily from the conversation. `Tom` then produces the technical specification.
4. Owner reviews; cycle continues until MUST-HAVE floor is cleared.

**Confidence defaults:**

- `(Confirmed)` for UI structure and visible actions that appear in the artifacts.
- `(Inferred)` for anything the artifacts imply but don't state (data model, authorization, error behavior, lifecycle).
- `(Needs Review)` for any artifact-to-artifact inconsistency or owner-unresolved question.

**Risks to manage:**

- Over-indexing on visual polish and under-specifying semantics.
- Assuming visuals represent reviewed product truth when they may be early exploration.
- Missing error/empty/loading states that the visuals don't depict.

### 2.4 Common Exit Criteria

Regardless of mode, the spec set only exits the refinement loop when:

- Every MUST-HAVE file exists with required subsections.
- Every use case, screen, flow, and API row has a confidence label.
- `open-questions.md` has no unclassified entries.
- Owner has reviewed the whole set end-to-end at least once.

---

## 3. Process, Agent, and Boundary Improvements

### 3.1 Clarify Ownership

- **`Pam` owns product intent.** Deliverables live under `requirements/`. `Pam`'s artifacts capture the owner-confirmed vision, iteratively, and are the authoritative source of product direction.
- **`Tom` owns the technical specification.** Deliverables live under `tech-specs/`. `Tom` consumes `Pam`'s artifacts and produces the canonical handoff document set for downstream builder teams.
- **`Abe` is dormant.** Abe is retained only for one-time extraction from legacy projects without structured requirements. It is not part of the active flow.

### 3.2 Mode-Aware Operating Sequences

Update `Abe`'s "Required Operating Sequence" and `Pam`'s "How You Work" to branch by input mode:

- Mode A (greenfield) — `Pam` leads; `Tom` converts after owner confirms requirements.
- Mode B (brownfield) — `Pam` leads requirements discovery against existing code; `Tom` produces technical specifications.
- Mode C (visual-first) — visual extraction first; `Pam` resolves non-visual questions; `Tom` produces technical specifications.

Make the default confidence-labeling rule per mode explicit (see §2).

### 3.3 Visual-Artifact Handling

Mode C has no owner today. Options:

- **Option 1:** Extend `Pam` with a "visual extraction" capability and require the owner to attach artifacts during the operating sequence.
- **Option 2:** Add a lightweight new persona (e.g., `Vera` — visual requirements analyzer) whose only job is extracting a structured screen/action/nav/state inventory from visuals, which then feeds `Pam`.

**Recommendation:** start with Option 1 to avoid persona proliferation. Promote to Option 2 only if visual-heavy projects routinely push `Pam` beyond what a single persona can cover.

### 3.4 Confidence-Label Rules

Add to `rules/application-specification-rules.md`:

- Every use case, screen, flow, and API row must carry an inline label: `(Confirmed)`, `(Inferred)`, or `(Needs Review)`.
- Default labels by input mode per §2.
- `(Needs Review)` items must also appear in `open-questions.md` with a specific question or decision needed.
- A spec is not ready for builder handoff if any item is still `(Inferred)` without an accompanying `Needs Review` entry justifying why inference is sufficient.

### 3.5 Required-Section Enforcement

Upgrade `rules/application-specification-rules.md` §8 (File Content Rules) from "must include" prose to a checklist structure that matches §1.2 of this plan. Specifically:

- `use-cases.md` — add `Alternate flows`, `Error paths`, `Acceptance Criteria` as required.
- `domain-model.md` — require a fields table per entity and a state-machine section for any lifecycle field.
- `screens.md` — require `Allowed roles` and explicit `States` (loading/empty/error/success) per screen.
- `api-surface.md` — require `Allowed roles` and `Notable errors` columns.
- `flows.md` — require explicit alternative/error path entries (or "none").
- Every file — require a `Last reviewed: YYYY-MM-DD against <git sha>` footer.

### 3.6 Refinement Loop

Add to `rules/workflow-rules.md` a named phase between draft and handoff:

- **Spec Refinement Loop** — while any `(Inferred)` item exists without a corresponding `Needs Review` entry, the spec cycle continues: `Pam` revises, owner re-reviews. Builder-team handoff is blocked until the MUST-HAVE floor is cleared and every item is labeled decisively.

### 3.7 Handoff Checklist

Formalize what the specification phase produces as the handoff artifact. Before handing off to builders:

- All MUST-HAVE files exist and are populated per §1.2.
- All items carry confidence labels; no unaccompanied `(Inferred)`.
- `open-questions.md` has zero unclassified entries.
- Cross-domain references are resolved and linked.
- Owner has signed off on the full spec set end-to-end.

---

## Action Plan

| ID | Phase | Task | Status | Notes |
|---|---|---|---|---|
| 01-001 | 1 | Update `rules/application-specification-rules.md` §8 to require fields table, state machines, allowed roles, screen states, alternate/error flows, acceptance criteria, and revision footer | Not Started | |
| 01-002 | 1 | Add confidence-label rule (`Confirmed` / `Inferred` / `Needs Review`) to `rules/application-specification-rules.md`, with default labels per input mode | Not Started | |
| 01-003 | 1 | Add MUST-HAVE vs NICE-TO-HAVE tiering to `rules/application-specification-rules.md` | Not Started | |
| 01-004 | 2 | Update `agents/product-manager.md` with mode-aware operating sequence (A/B/C) and deliverable boundary | Not Started | |
| 01-005 | 2 | ~~Update `agents/application-specification-builder.md` with mode-aware operating sequence and visual-extraction capability~~ | Removed | Abe is dormant; Pam+Tom produce canonical specs |
| 01-006 | 2 | Document `Pam` vs `Tom` ownership boundary in persona files and rules | Not Started | |
| 01-007 | 3 | Add Spec Refinement Loop phase to `rules/workflow-rules.md` with builder-handoff block condition | Not Started | |
| 01-008 | 3 | Add builder-handoff checklist to `rules/application-specification-rules.md` | Not Started | |
| 01-009 | 4 | Evaluate whether visual-extraction warrants a dedicated persona (Option 2) after 2–3 projects use Option 1 | Not Started | Revisit after real usage |

---

## Open Questions

- **Nice-to-haves as defaults?** Should `examples.md` and `non-functional.md` be required for any user-facing feature, or truly optional? Current plan: optional.
- **Scope of state-machine requirement.** Require for any field with `status` or `isActive`, or broader? Current plan: narrow to lifecycle fields only.
- **Revision footer automation.** Can this be stamped by a pre-commit hook instead of persona discipline? Worth a separate tooling plan.
