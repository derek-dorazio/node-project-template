<!--
This PR template mirrors the Riley spawn prompt in rules/workflow-rules.md §11.
Filling in every section is part of the slice-completion checklist —
Riley reads this body when reviewing.
-->

## Slice intent

<!-- One paragraph: what this slice does and why, in product terms. Not "I changed these files." -->

## Beads linkage

- **Parent epic:** `bd-#<EPIC>`
- **Slice story:** `bd-#<STORY>`

## Use-case / business-rule / defect IDs covered

<!-- The specific IDs the new tests reference per rules/testing-rules.md §2A. -->

- `UC-<ID>` — <one-line description>
- `BR-<ID>` — <one-line description>
- `bd-#<DEFECT-ID>` — <description>   <!-- defect-fix slices only -->

## Defect-fix observation

<!--
Defect-fix slices ONLY. Delete this section for new-behavior slices.
Per rules/testing-rules.md §2B, the slice must demonstrate the failing
test was observed to fail on the broken code BEFORE the fix landed.
-->

The failing test reproducing `bd-#<DEFECT-ID>` was observed to fail on the
broken code before the fix landed. Evidence: <commit SHA / referenced line>.

## Gates run

<!-- Required local gates per rules/testing-rules.md §3. Check each. -->

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test:service:unit`
- [ ] `npm run test:service:integration`
- [ ] `npm run test:service:functional-api`
- [ ] `npm run test:coverage:service:merged`
- [ ] `npm run test:<projectName>:unit`
- [ ] `npm run openapi-contract-check` (if API schemas changed)

## Known concerns

<!--
Anything you noticed but consciously chose not to fix in this slice
(and why), or anything you're uncertain about. Naming concerns up
front prevents Riley from "discovering" them as findings.
Write "None" if there are none.
-->

## Riley auto-merge gate

This PR will be auto-merged if Riley returns zero CRITICAL or HIGH findings.
Any blocker-severity finding pauses the merge for user review.

Special pause conditions (always require user approval, regardless of Riley):

- [ ] Slice contains a destructive migration, data backfill, or non-reversible production effect → **paused**
- [ ] Slice changes shared contracts (DTOs, OpenAPI, generated SDK exports) → **paused**
- [ ] Slice changes infrastructure, CI/CD, deployment, or auth boundaries → **paused**
- [ ] Slice deletes a plan file or retires a feature surface → **paused**
- [ ] Slice modifies `rules/`, `docs/adr/`, or `personas/` → **paused**
