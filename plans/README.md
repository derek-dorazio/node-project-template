# Plans

This directory contains use-case companions, design plans, and execution plans that drive implementation.

## Spec-Driven Lifecycle

Plans follow the lifecycle defined in `rules/workflow-rules.md`:

1. **Use-case companions** (Phase 2) — concrete user journeys per domain area
2. **Design plans** (Phase 3) — architectural decisions informed by use cases
3. **Execution plans** (Phase 4) — sliced, trackable work with explicit deliverables

## Naming Convention

```
01-feature-name.md                    # Design plan
01-feature-name-use-cases.md          # Use-case companion
02-another-feature.md                 # Next feature
```

## Task Tracking

Every plan with implementation work has an **Action Plan** section with a task table:

```markdown
| ID | Phase | Task | Status | Notes |
|---|---|---|---|---|
| 01-001 | 1 | Task description | Not Started | |
```

See `rules/workflow-rules.md` for status values and tracking rules.

## Archiving

Completed or superseded plans are moved to `plans/archive/` with a note explaining why.
