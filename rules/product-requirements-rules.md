# Product Requirements Rules

These rules govern the product requirements artifacts that `Pam` (Product Manager) produces. Product requirements live under `requirements/product-requirements/` and serve as the canonical source of product intent for major-feature work.

For the Pam persona playbook, see `personas/pam.md`.

---

## 0. When To Write A Requirements Bundle (And When To Skip)

The Piper/Pam requirements bundle — overview + use-cases + screens + business-rules + open-questions for a feature — is high-leverage for **major new features** on a mostly-greenfield surface. It is low-leverage and often net-negative for incremental work on features that already exist.

### Write a requirements bundle when all of the following apply

- The feature is genuinely new (not already covered by an existing feature bundle).
- It introduces new actors, new domain concepts, new navigation surfaces, or substantially new product behavior.
- Product decisions benefit from shared framing *before* design/implementation begins.

### Skip the bundle when

- The work fits within an existing feature's bundle (no new actors, no new concepts, no new primary surfaces).
- The scope is a UX refinement, incremental improvement, or bug-class fix.
- Rewriting the requirements would mostly duplicate what already exists.

For skip cases, capture the product intent directly in the plan file (`plans/NN-*.md`) — just enough narrative for the slice author to do the work. Do not create a parallel requirements artifact.

### Bundles have a lifetime

When a feature has shipped and stabilized, trim the bundle to only what still describes *current* product intent. Delete exploratory open-questions that were answered by shipping. Delete entire bundles for features that are no longer active product scope.

---

## 1. Scope

Product requirements describe **what users want the product to do**, who uses it, and the rules the product enforces. They do not describe:

- Database schema or field-level types/constraints
- API endpoints, routes, or DTO definitions
- State machines at field level
- Architecture or infrastructure decisions

Lifecycle can be described at concept level ("a league becomes inactive and can later be deleted"), not at field or schema level. Technical detail belongs to Tom and Dom downstream in `tech-specs/`.

---

## 2. Required Artifacts

### Product-Level (`requirements/product-requirements/`)

Written once, updated incrementally as new features are added:

| File | Contents |
|---|---|
| `product-requirements.md` | Product purpose, primary users/personas, problems solved, explicit non-goals, success criteria, phase boundaries |
| `roles-and-actors.md` | Actor definitions and a capability matrix (who can do what) |
| `glossary.md` | Canonical terminology, UI term ↔ product-concept mappings, terms to avoid |
| `domain-concepts.md` | Real-world nouns the product manages, their relationships, and lifecycle in prose. No field definitions, types, or cardinality shorthand |
| `navigation-and-entry-points.md` | Global navigation model, how users enter the product, high-level page inventory, cross-feature routing concepts |

### Per Feature (`requirements/product-requirements/features/<feature-slug>/`)

| File | Contents |
|---|---|
| `overview.md` | Feature purpose, in-scope actors, major capabilities, dependencies on other features, deferred scope |
| `use-cases.md` | One block per use case, following the use case template (§3) |
| `screens.md` | Screen purpose, allowed roles, key actions, state expectations (loading / empty / error / success at the product level — no component detail), navigation to other screens |
| `business-rules.md` | Validation rules, uniqueness constraints, lifecycle transitions, authorization boundaries — stated as product rules, not code. Use cases reference entries by name |
| `open-questions.md` | Items classified as `Confirmed Drift`, `Needs Review`, or `Deferred` |

---

## 3. Use Case Template

Every use case must follow this structure:

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
- **Business rules referenced:** <names from business-rules.md, or "none">
```

### Rules

- Happy-path-only use cases are not accepted for handoff. Alternate flows and error paths must be present or explicitly "none."
- Every use case must have at least one testable acceptance criterion.
- Business rules must be referenced by name from `business-rules.md`, not restated inline.

---

## 4. Confidence Labels

Every use case, screen, and business rule must carry an inline label:

| Label | Meaning |
|---|---|
| `(Confirmed)` | Owner explicitly agreed |
| `(Inferred)` | Pam drafted to keep the spec coherent; owner has not yet reacted |
| `(Needs Review)` | Pam and owner identified a decision needed; must also appear in `open-questions.md` |

### Label Rules

- Default is `(Inferred)` until the owner explicitly agrees.
- Do not accept "let's figure that out later" without recording it as `(Needs Review)` in `open-questions.md` with a classification.
- No `(Inferred)` item may exist at handoff without a corresponding `open-questions.md` entry or without being upgraded to `(Confirmed)`.

### Confidence Defaults by Operating Mode

| Mode | Default on first draft | Upgrade to `(Confirmed)` when |
|---|---|---|
| Mode A (vision only) | `(Inferred)` | Owner explicitly accepts |
| Mode B (vision + visuals) — UI structure | `(Confirmed)` after owner confirms visuals are intended, not stale | Owner confirms visuals represent current product direction |
| Mode B — inferred semantics | `(Inferred)` | Owner explicitly accepts |

---

## 5. Handoff Floor — Ready for Tom

Product requirements are not ready to hand off until:

- [ ] All per-feature files exist: `overview.md`, `use-cases.md`, `screens.md`, `business-rules.md`, `open-questions.md`.
- [ ] Product-level files exist and are current in `requirements/product-requirements/`: `product-requirements.md`, `roles-and-actors.md`, `glossary.md`, `domain-concepts.md`, `navigation-and-entry-points.md`.
- [ ] Every use case follows the template (§3), including alternate flows, error paths, acceptance criteria, and business rule references.
- [ ] Every use case, screen, and business rule carries a confidence label (§4).
- [ ] No `(Inferred)` item exists without a corresponding `open-questions.md` entry or without being upgraded to `(Confirmed)`.
- [ ] `open-questions.md` has no unclassified entries.
- [ ] Owner has reviewed the bundle end-to-end at least once and signed off on `(Confirmed)` items.
- [ ] Every cross-feature reference is linked, not bare.

---

## 6. Visual-Artifact Extraction (Mode B)

When the owner provides screenshots, wireframes, or Figma frames:

1. Perform a visual-extraction pass before conversation:
   - Enumerate distinct screens/views.
   - List visible actions per screen.
   - Capture visible navigation.
   - Note visible role distinctions.
   - Capture visible state variations.
   - Transcribe visible copy that implies product rules.
2. Draft `screens.md` and `navigation-and-entry-points.md` from the extraction.
3. Run targeted conversation for gaps visuals cannot answer: business rules, authorization, lifecycle, error behavior, off-screen/async behavior.
4. Resolve conflicts between visuals and conversation explicitly. If a mock shows something the owner says is stale, mark it `(Confirmed Drift)` in `open-questions.md`.

### Pitfalls

- Mocks often lack error/empty/loading states. Ask about these explicitly.
- Visual polish can disguise unreviewed product thinking.
- Artifacts may represent early exploration rather than reviewed direction. Ask.

### Requesting Visuals

- When visuals would materially improve product-definition accuracy, ask for targeted screenshots, examples, or reference flows rather than silently inferring important UX behavior from incomplete prose.
- Keep visual requests narrow and specific so the owner knows exactly what kind of screenshot or example would help.

---

## 7. Handoff Expectations

When completing a requirements iteration, explicitly call out:

- Which fields are confirmed current source-of-truth inputs.
- Which tempting archived or broad-contract fields were intentionally excluded.
- Any contract/model/doc mismatches that need cleanup instead of being absorbed as design assumptions.
- Any `(Implementation Decision)` tags from prior implementation that were reviewed and resolved during this pass.

---

## 8. Continuous Propagation

Refined product requirements are not write-once artifacts.

- When active design discussions resolve product meaning, actor behavior, lifecycle rules, navigation assumptions, or cross-feature product goals, propagate those decisions upward into the shared product-requirement files in the same lane.
- Do not leave important product truth trapped only inside a localized feature slice if it changes the broader product model, actor definitions, or product goals.
- When a resolved feature-level decision materially changes high-level product framing, also update the matching `requirements/product-overview/` artifacts so discovery and refined requirements stay aligned.

---

## 9. What Product Requirements Must Not Do

- Describe implementation details. Describe what users do and what the system enforces.
- Use inconsistent terminology. Define terms in the glossary and use them everywhere.
- Present unreviewed content as final. Present work incrementally with owner checkpoints.
- Treat archived UI, superseded plans, or broad DTO surface area as proof that a field belongs in the current product flow.
- Confuse "backend can technically accept this" with "this is approved product scope."
