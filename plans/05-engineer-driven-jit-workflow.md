# Plan 05: Engineer-Driven Just-in-Time Specification Workflow

## Summary

Plans 02–04 assume a formal phase-by-phase handoff: Pam → Tom → Archie → Parker → Brad/Fran, each driven by a human product manager or technical lead who orchestrates the transitions. This plan adds a parallel workflow for a different operator profile: a Principal Software Engineer (PSE) who has Pam's requirements in hand and wants to go straight to building.

In this mode, the PSE says "build feature X" and the system handles the spec → plan → code sequence automatically, with tech-specs generated just-in-time and kept in sync with code as implementation evolves.

This plan depends on Plan 04 landing first (Pam's full output bundle and Tom's MVP persona must exist). It does not replace the formal flow — it adds an alternative entry point for engineer-driven work.

---

## 1. The Scenario

- Pam has already produced a `requirements/features/<feature>/` bundle and the PSE (or owner) has signed off.
- The PSE is a hands-on engineer, not a project manager. They don't want to manually invoke Tom, then Archie, then Parker, then Brad/Fran in sequence.
- The PSE prompts: "build the league management feature" or "implement use case LM-001."
- The system should figure out what's missing (tech specs? design plan?) and produce it before code starts, then keep specs and code in sync as implementation proceeds.

---

## 2. JIT Specification Trigger

When an implementation request arrives for a feature area, the agent evaluates readiness in order:

### Step 1: Requirements check

Does `requirements/features/<feature>/` exist with a signed-off bundle (per Plan 04 §1.6)?

- **No** → Stop. Pam must produce requirements first. Do not proceed to tech-spec or implementation.
- **Yes** → Continue.

### Step 2: Tech-spec check

Does `tech-specs/features/<feature>/` exist with `domain-model.md`, `api-surface.md`, and `flows.md`?

- **No** → Tom + Dom produce the tech-spec bundle before any code is written. This is automatic, not a manual orchestration step. The PSE does not need to explicitly invoke Tom — the system recognizes the gap and fills it.
- **Partial** (some files exist but others are missing or incomplete) → Tom completes the missing pieces.
- **Yes** → Continue.

### Step 3: Design plan check (conditional)

Does this feature require a design plan from Archie?

Apply the Archie gate (§3). If Archie is required, produce the plan before implementation. If Archie is not required, Tom's tech spec serves as the design reference and implementation proceeds directly.

### Step 4: Implementation

Brad and/or Fran pick up the work. If no formal plan exists (Archie was skipped), Brad/Fran implement against Tom's tech-spec files directly, treating `api-surface.md` as the route blueprint, `domain-model.md` as the schema blueprint, and `flows.md` as the behavioral blueprint.

---

## 3. Archie Gate — Required vs Optional

Not every feature needs a formal design plan. The gate criteria:

**Archie required when any of these are true:**

- New service or new package boundary.
- New infrastructure (cloud resources, queue topics, cache layers, new environment variables or secrets).
- New external integration (third-party API, webhook, OAuth provider).
- Auth model change (new role, new permission boundary, new token scope).
- Breaking migration (data backfill, read/write transition window, multi-step rollout).
- Cross-feature dependency (this feature changes behavior that another feature relies on).

**Archie optional (Tom's tech spec is sufficient) when all of these are true:**

- Feature fits within an existing service and module structure.
- No new infrastructure.
- No auth model changes.
- Migration is schema-only (additive columns, new tables, no backfill).
- No cross-feature side effects.

When Archie is skipped, the PSE or the implementing agent should still create a lightweight plan row in an existing plan or a new minimal plan file so progress is trackable. This is Parker's job if Parker is involved, or the implementing agent's job if working solo.

---

## 4. Specs-Track-Code Rule

During implementation, tech-specs and requirements are living documents — not write-once artifacts that drift silently.

### 4.1 What Implementation Agents Must Update

- **Brad adds a route not in `api-surface.md`** → Brad updates `api-surface.md` in the same commit.
- **Brad changes the domain model** (field add/remove/rename, relationship change, new entity) → Brad or Dom updates `domain-model.md` in the same commit.
- **Brad changes a flow** (different error behavior, different state transition, new async step) → Brad updates `flows.md` in the same commit.
- **Fran discovers a screen not in Pam's `screens.md`** → Fran adds it to `requirements/features/<feature>/screens.md` tagged `(Implementation Update)` and flags it in `open-questions.md` if it represents a product decision that Pam/owner hasn't reviewed.
- **Fran discovers a use case gap** (an interaction the user needs but no use case covers) → Fran adds a stub to `requirements/features/<feature>/use-cases.md` tagged `(Implementation Update — Needs Review)` and continues implementing against best judgment.
- **Any agent makes a product-level decision during implementation** (edge case behavior, error UX, authorization boundary) → the decision is recorded in the relevant requirements or tech-spec file tagged `(Implementation Decision)`, not left as tribal knowledge in code.

### 4.2 Tagging Convention

Implementation-time spec updates use inline tags to distinguish them from Pam/Tom authored content:

- `(Implementation Update)` — the spec was updated to reflect what was actually built; no product decision was made.
- `(Implementation Decision)` — the implementing agent made a product or technical judgment call that should be reviewed by the PSE or owner.
- `(Implementation Update — Needs Review)` — the spec was updated and the change needs explicit confirmation before it becomes canonical.

These tags make the post-implementation reconciliation pass (§5) faster — the reviewer can filter to tagged items instead of diffing the whole spec.

### 4.3 What NOT to Do

- Do not silently build behavior that contradicts the tech spec. If the spec says one thing and the right answer is different, update the spec first (or in the same commit), then build.
- Do not defer spec updates to "after the feature is done." The same-commit rule exists because deferred updates become forgotten updates.
- Do not treat spec updates as optional polish. A slice is not `Done` if tech-specs or requirements are stale for the work that slice delivered.

---

## 5. Post-Implementation Reconciliation

After a feature is complete (all slices `Done`), a lightweight reconciliation pass catches any remaining drift:

### 5.1 What the Pass Covers

1. **Tech-spec accuracy** — does `api-surface.md` match the actual routes? Does `domain-model.md` match the actual schema? Does `flows.md` match the actual behavior?
2. **Requirements accuracy** — did implementation reveal product decisions that aren't in `use-cases.md`, `screens.md`, or `business-rules.md`? Are any `(Implementation Decision)` items still unreviewed?
3. **Tag cleanup** — upgrade `(Implementation Update)` items to unmarked (they're now canonical). Resolve `(Implementation Decision)` and `(Needs Review)` items with the PSE or owner.
4. **Open-questions reconciliation** — close resolved questions, add newly discovered ones.

### 5.2 Who Runs It

- The PSE can do it themselves as a quick review pass.
- Or Tom can be invoked to audit tech-specs against the implemented code and flag discrepancies.
- Or Riley can include spec-accuracy in the final review for the feature.

This is a single pass, not a multi-day cycle. For a well-disciplined feature where specs were updated alongside code (§4), reconciliation should find little to fix.

### 5.3 When to Skip It

If the feature was small (1–2 slices), the specs-track-code rule was followed, and no `(Implementation Decision)` tags exist, the reconciliation pass can be skipped. The PSE makes this call.

---

## 6. Coexistence with the Formal Flow

This JIT workflow and the formal Pam → Tom → Archie → Parker → Brad/Fran flow coexist. They share the same artifacts and the same rules — the difference is who orchestrates:

| Aspect | Formal Flow | JIT Flow |
|---|---|---|
| Orchestrator | Human TPM or product owner drives each phase transition | PSE says "build it" and agents auto-sequence |
| Tom invocation | Explicit, after Pam signs off | Automatic, when requirements exist but tech-specs don't |
| Archie invocation | Always | Conditional (§3 gate) |
| Parker invocation | Always | Optional — PSE or implementing agent tracks progress |
| Spec ownership during impl | Tom owns; Brad/Fran read-only | Tom authored; Brad/Fran update in-place with tags |
| Post-feature reconciliation | Implicit (specs were final before code started) | Explicit lightweight pass (§5) |

A project can use both flows for different features. A complex feature with cross-cutting concerns uses the formal flow. A straightforward feature within existing boundaries uses the JIT flow. The artifacts are identical either way.

---

## 7. Rule and Persona Changes

### 7.1 New Rule Additions

Add to `rules/workflow-rules.md`:

- **JIT Specification Trigger** — the readiness evaluation sequence from §2, so any agent receiving a "build feature X" prompt knows to check requirements → tech-specs → Archie gate before coding.
- **Specs-Track-Code** — the same-commit update rule from §4, the tagging convention, and the "not Done if specs are stale" gate.
- **Archie Gate Criteria** — the required-vs-optional checklist from §3.
- **Post-Implementation Reconciliation** — the lightweight pass from §5.

### 7.2 Persona Updates

- **Brad** — add responsibility: "Update `tech-specs/` files in the same commit when implementation diverges from the spec. Tag updates per the specs-track-code convention."
- **Fran** — add responsibility: "Update `requirements/` and `tech-specs/` files in the same commit when implementation reveals gaps. Tag updates per the specs-track-code convention."
- **Tom** — add a "JIT invocation" section: Tom can be triggered automatically when requirements exist but tech-specs don't, without requiring a human to explicitly start a tech-spec phase.
- **Archie** — add a note that Archie is conditional in JIT mode per the gate criteria.
- **Riley** — *(future, Plan 03)* add spec-accuracy as a review dimension.

### 7.3 No New Personas

This plan does not introduce new personas. The JIT flow uses the same agents with different triggering and a living-document discipline added to Brad and Fran.

---

## 8. Open Questions

- **Should the JIT trigger be a formal skill or hook**, or is a rule in `workflow-rules.md` sufficient for now? Recommendation: start with a rule. Automate only if agents consistently miss the readiness check.
- **How does the PSE signal "I've reviewed the reconciliation pass"?** Recommendation: a simple note in the feature's `open-questions.md` or plan row: "Reconciliation complete, all tags resolved." No new artifact.
- **Should `(Implementation Decision)` items block merge?** Recommendation: no — they should be flagged in Riley's review but not block. The PSE resolves them before marking the feature fully `Done`, not before each slice merges.
- **What if the PSE disagrees with Tom's JIT spec and wants to change it before coding?** That's fine — the PSE edits `tech-specs/` directly. Tom's output is a draft, not a locked contract. The PSE is the technical authority in this flow.

---

## 9. Dependencies

- **Plan 04** must land first (Pam's full output bundle, Tom's MVP persona, Dom's subagent section, workflow-rules Phase 2.5 clarification).
- **Plans 02 and 03** are not required. The JIT flow works with Plan 04's minimal agent set. Plans 02/03 enhancements (slice summaries, runbooks, ADRs, Riley's expanded scope) improve the JIT flow but don't gate it.

---

## Action Plan

| ID | Phase | Task | Status | Notes |
|---|---|---|---|---|
| 05-001 | 1 | Add JIT Specification Trigger rule to `rules/workflow-rules.md` per §2 | Not Started | Depends on Plan 04 landing |
| 05-002 | 1 | Add Archie Gate criteria to `rules/workflow-rules.md` per §3 | Not Started | |
| 05-003 | 1 | Add Specs-Track-Code rule and tagging convention to `rules/workflow-rules.md` per §4 | Not Started | |
| 05-004 | 1 | Add Post-Implementation Reconciliation guidance to `rules/workflow-rules.md` per §5 | Not Started | |
| 05-005 | 2 | Update `agents/backend-developer.md` (Brad) with spec-update responsibility | Not Started | |
| 05-006 | 2 | Update `agents/frontend-developer.md` (Fran) with spec-update responsibility | Not Started | |
| 05-007 | 2 | Update `agents/technical-specification-creator.md` (Tom) with JIT invocation section | Not Started | |
| 05-008 | 2 | Update `agents/architect.md` (Archie) with conditional-invocation note | Not Started | |
| 05-009 | 3 | Pilot JIT flow on one straightforward feature (Archie-optional) with a PSE operator | Not Started | Capture friction before codifying further |
| 05-010 | 3 | Pilot JIT flow on one cross-cutting feature (Archie-required) with a PSE operator | Not Started | Validate the gate criteria |
| 05-011 | 4 | Retrospective: evaluate whether specs-track-code discipline held, reconciliation pass was useful, and Archie gate was clear enough | Not Started | Informs whether to tighten or relax rules |
