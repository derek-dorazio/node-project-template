# Plans

Plan files in this directory are **narrative-only companions** to a Beads epic. They are not the live task tracker.

## What lives here vs. elsewhere

| Concern | Home |
|---|---|
| Task list, status, dependencies | **Beads** (`.beads/issues.jsonl`, `bd` CLI) |
| Narrative purpose, scope, rationale | This plan file |
| Architecture/site map, navigation, design notes | This plan file |
| Open product/contract questions for the slice | This plan file |
| Durable patterns, hard boundaries, cross-cutting choices | `rules/` or `docs/adr/` |
| Settled product behavior (post-ship) | `requirements/` (during feature life) and code/tests/generated SDK (after) |

See `docs/adr/0001-beads-as-live-task-tracker.md` and `docs/adr/0002-plans-as-narrative-delete-after-epic-closes.md` for the governing decisions.

## Lifetime

A plan file lives only as long as its parent Beads epic is open.

- When the parent epic closes (all child stories resolved), the plan file is **deleted** in the same commit or an immediately following cleanup commit.
- Before deletion, verify that any durable patterns or decisions the plan established have been captured as ADRs (`docs/adr/`) or rules (`rules/`). A plan that introduced a new convention without updating those layers is not ready for deletion.
- Git history preserves the deleted file. `git log -- plans/NN-*.md` and `git show <sha>:plans/NN-*.md` retrieve any prior version.

**Archives are not used.** Old plan files are deleted, not moved to `plans/archive/`. Archive directories accumulate the same problem under a different path, and agents read files they can see regardless of "don't read this" rules.

## Naming Convention

```
NN-feature-name.md         # narrative-only plan paired with a Beads epic
```

Numbering is monotonically increasing. Once a plan is deleted, its number is not reused.

## What a plan file contains

Use `PLAN-TEMPLATE.md` as the starting point. Every plan should carry:

- The **parent Beads epic ID** (e.g., `Epic: bd-#123`) in the header
- **Summary** — 2–3 sentences on what this plan achieves and why
- **Governing principles** — settled choices that must not be re-litigated during execution
- **Scope** — in-scope and explicitly deferred items
- **Architecture / site map / pattern narrative** — enough technical context for execution agents to act without guessing
- **Open questions** — open product or contract questions that block specific slices

Plans **must not** contain:

- Task tables, status columns, slice IDs, or "Not Started / In Progress / Done" markers — that lives in Beads
- Duplicates of business rules already in `requirements/.../business-rules.md`
- Duplicates of contract details already exposed in the generated SDK / DTOs / OpenAPI
- Persona content that belongs in `personas/<name>.md`
