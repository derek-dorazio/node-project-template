# Plan <NN>: <Plan Title>

> Copy this template when creating a new plan. Plans are narrative-only companions to a Beads epic — task lists and status live in Beads, not here. Delete the HTML comments once you've filled in each section.

**Parent Beads epic:** `bd-<id>` <!-- e.g. bd-123 -->

---

## Summary

<!-- 2-3 sentences: What does this plan achieve and why? What problem or use case does it address? -->

## Governing Principles

<!-- Settled choices that must not be re-litigated during execution. Numbered list with rationale. -->

1. **<Principle>** — <rationale>
2. **<Principle>** — <rationale>

## Use-Case References

<!-- Which requirements bundles or use cases inform this plan? List them explicitly so implementers read them. -->

- `requirements/product-requirements/features/<feature>/use-cases.md` — <brief description>

---

## Scope

### In Scope

<!-- What this plan delivers. Be specific — list domain objects, endpoints, behaviors. -->

-
-

### Explicitly Deferred

<!-- What is NOT in this plan. Prevents scope creep during implementation. -->

-
-

---

## Design / Architecture Narrative

<!-- Technical design details: data model changes, API surface, service logic, event flows, screen mapping. -->
<!-- Enough detail for an execution agent to implement without guessing. -->
<!-- Do NOT duplicate generated DTO shapes or business rules already documented in requirements/ or the SDK. Reference instead. -->

### Data Model Changes

<!-- New/changed/removed entities, fields, relationships, constraints. -->

### API Surface

<!-- New/changed endpoints: method, path, auth, request/response summary. -->

| Method | Path | Auth | Description |
|--------|------|------|-------------|
|        |      |      |             |

### Site / Screen Map (if UI work)

<!-- Tile-to-destination mapping, navigation diagram, or screen-to-API matrix. -->

---

## Open Questions

<!-- Open product, contract, or architecture questions that block specific slices. -->
<!-- When resolved, either incorporate the answer above (if it changes scope/design) or move to the relevant ADR / rules / requirements file (if durable). -->

-
-

---

## Validation

<!-- How to verify this plan's work is complete. Typically the standard quality gates. -->
<!-- Slice-level work is tracked in Beads — this section is the plan-level acceptance bar. -->

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] All service tests pass (`test:service:unit` + `test:service:integration` + `test:service:functional-api`)
- [ ] `npm run openapi-contract-check`
- [ ] Coverage on changed files meets threshold
- [ ] Use-case journeys covered by functional API tests
- [ ] Parent Beads epic closed
- [ ] Durable patterns from this plan captured in `rules/` or `docs/adr/`
- [ ] **This plan file deleted** (epic-close cleanup)
