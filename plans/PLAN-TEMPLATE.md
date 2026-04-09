# Plan <NN>: <Plan Title>

> Copy this template when creating a new plan. Delete the HTML comments once you've filled in each section.

---

## Summary

<!-- 2-3 sentences: What does this plan achieve and why? What problem or use case does it address? -->

## Dependencies

<!-- Which plans must be completed or in progress before this one can start? -->
<!-- Which plans does this unblock once complete? -->

- **Blocked by:** None / Plan <NN> (<title>)
- **Unblocks:** Plan <NN> (<title>)

## Use-Case References

<!-- Which use-case companions inform this plan? List them explicitly so implementers read them. -->

- `plans/<NN>-<feature>-use-cases.md` — <brief description>

---

## Key Decisions

<!-- Numbered list of design/architectural decisions made in this plan. Include rationale. -->
<!-- These are SETTLED — agents should not re-litigate them during implementation. -->

1. **<Decision>** — <rationale>
2. **<Decision>** — <rationale>

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

## Design

<!-- Technical design details: data model changes, API surface, service logic, event flows. -->
<!-- Enough detail for a developer agent to implement without guessing. -->

### Data Model Changes

<!-- New/changed/removed entities, fields, relationships, constraints. -->

### API Surface

<!-- New/changed endpoints: method, path, auth, request/response summary. -->

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| | | | |

### Business Rules

<!-- Validation, lifecycle, uniqueness, authorization rules that the implementation must enforce. -->

---

## Action Plan

<!-- Break work into slices at layer granularity. See rules/workflow-rules.md for tracking rules. -->

| ID | Slice | Task | Status | Notes |
|---|---|---|---|---|
| <NN>-001 | A | <Schema + migration> | Not Started | |
| <NN>-002 | A | <Service + repository> | Not Started | |
| <NN>-003 | A | <DTOs (request + response)> | Not Started | |
| <NN>-004 | A | <Mappers> | Not Started | |
| <NN>-005 | A | <Route schemas> | Not Started | |
| <NN>-006 | A | <Unit tests> | Not Started | |
| <NN>-007 | A | <Integration tests> | Not Started | |
| <NN>-008 | A | <Functional API tests> | Not Started | |
| <NN>-009 | A | <OpenAPI refresh + validate> | Not Started | |

---

## Validation

<!-- How to verify this plan's work is complete. Typically the standard quality gates. -->

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] All service tests pass (`test:service:unit` + `test:service:integration` + `test:service:functional-api`)
- [ ] `npm run openapi-contract-check`
- [ ] Coverage on changed files meets threshold
- [ ] Use-case journeys covered by functional API tests
