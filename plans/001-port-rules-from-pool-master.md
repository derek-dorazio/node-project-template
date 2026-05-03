# Plan 001: Port Rule-Enforcement Gates from PoolMaster

> Inaugural numbered plan for the template. Captures the port of the rule-enforcement hardening epic that landed in pool-master (`pool-master-1y8`) on 2026-05-03 into this template repo so future projects bootstrapped from it inherit the gates from day one.

**Parent Beads epic:** `bd-#<TBD>` — to be opened when the first slice begins.

---

## Summary

Pool-master recently landed an eight-gate rule-enforcement hardening epic that converted prose-only rules into automated CI gates, fixed five rule files to match, and added a Riley findings marker requirement for all PRs. The user has been hand-syncing rule and CI flows from pool-master to this template; this plan organizes that port as a single coordinated effort.

The result: any new project bootstrapped from this template inherits the rule-enforcement gates from day one — no discoverable drift, no copy-from-pool-master step.

## Governing Principles

1. **Templates describe durable patterns, not execution narrative.** The pool-master execution plan (`pool-master/plans/115-rule-enforcement-hardening.md`) does not port — its content was rationale for landing the work in pool-master and is preserved in pool-master's git history. The durable artifacts are the rule files, scripts, CI workflow, persona/template updates, and the CI/CD setup doc.
2. **No project-specific identifiers leak into the template.** All `poolmaster` workspace names become `<projectName>`. All `pool-master-NNN` Beads ID examples become `bd-#NNN`. All `pool-master-rop.<n>` defect references in rule comments become generic placeholders or are removed. Specific examples like `contestId` in the event-bus rule become neutral terms like `aggregateId`.
3. **Section numbering follows the template's existing scheme, not pool-master's.** This template already organized testing-rules with a §2x family for test discipline; pool-master used §1x. The port adapts to the template's structure.
4. **The template repo never runs its own CI.** Downstream projects bootstrapped from this template get a working CI workflow as data (a committed file). The template repo itself is a pure scaffold; gates that depend on a real `src/index.ts` are not exercised here.
5. **Rules first, then implementation.** Rule sections land before scripts so the discipline is articulated before the enforcement. Scripts ship as data alongside the rules.

## Use-Case References

This is an infrastructure port; no product use cases apply.

Source artifacts:

- `pool-master/rules/*.md` at the post-1y8.25 tip (`0c7b598c` on `main`)
- `pool-master/scripts/check-*.{mjs,sh}` and `scripts/rule-check-utils.mjs`
- `pool-master/.github/workflows/ci.yml` (lint-typecheck job only — deploy track is pool-master-specific)
- `pool-master/.github/pull_request_template.md`
- `pool-master/personas/riley.md`
- `pool-master/docs/CI-AND-QUALITY-GATES.md`

---

## Scope

### In Scope

- New rule sections in five rule files (architecture, service, react-ui, testing, workflow), adapted to the template's section numbering and stripped of pool-master-specific identifiers.
- Eight rule-check scripts plus the shared utility (`scripts/check-*.{mjs,sh}` + `scripts/rule-check-utils.mjs`).
- The `api:check` OpenAPI freshness gate, including alignment of the template's `api:export` script with pool-master's tsx-based pattern.
- The `.github/workflows/ci.yml` workflow file — lint-typecheck job + test/build jobs only.
- PR template update: Riley findings marker section.
- Persona update: `personas/riley.md` marker section.
- New doc: `docs/CI-AND-QUALITY-GATES.md` adapted from pool-master's, plus a new section documenting the GitHub branch-protection ruleset setup steps.
- npm script wiring in `package.json` (rules:check chain + api:check + the new export script invocation).

### Explicitly Deferred

- **The deploy track from pool-master's CI** (`publish-images`, `migrate-qa`, `poolmaster-browser-e2e`). Pool-master-specific (AWS ECS/ECR/CloudFront). Each downstream project adds its own deploy.
- **The eight thematic cleanup epics** (`pool-master-rop.68–.77`) — pool-master's own debt, not template content.
- **The 30/112/777/38/52/19 baseline counts** — pool-master's debt baselines. Each downstream project will produce its own.
- **A bootstrap script** that scaffolds new projects from the template by replacing `<projectName>` placeholders. Existing template ergonomics are out of scope here.
- **Updating downstream projects already bootstrapped from this template** — those follow their own sync cadence.
- **Updating pool-master's `docs/CI-AND-QUALITY-GATES.md`** to also include the new branch-protection setup section. Tracked as a small follow-up PR in pool-master's tracker, not part of this plan.

---

## Design / Architecture Narrative

### Slice 0 — Align OpenAPI export pattern (precursor)

Pool-master and this template currently use incompatible `api:export` patterns:

| Repo | `api:export` |
|---|---|
| pool-master | `npm run build --workspace @poolmaster/shared && node --import tsx packages/core-api/scripts/export-openapi.ts` |
| this template | `cd packages/core-api && node -e "require('./dist/index.js')" --export-openapi` |

The pool-master pattern is newer and runs source TypeScript via tsx, decoupled from the consumer's `index.ts` CLI handling. The freshness check (`scripts/check-openapi-fresh.mjs`) depends on the pool-master pattern. Slice 0 brings this template in line:

- Add `packages/core-api/scripts/export-openapi.ts` (verbatim from pool-master, with `@poolmaster/shared` → `@<projectName>/shared` substitutions).
- Update `package.json`: change `api:export` to match pool-master's invocation.
- Update `api:refresh` accordingly: `npm run api:export && npm run api:generate`.

### Slice 1 — Rule-section ports

Add the new sections to the existing rule files at the correct template-side numbering. **Do not edit unrelated content** — additions only. Where pool-master tightened existing language (e.g., the §4 mapper exemption in service-rules), apply the same tightening to the template's equivalent section.

#### Translation table — section numbers and identifiers

| Pool-master | Template |
|---|---|
| `rules/testing-rules.md §1A` Test Self-Documentation | `rules/testing-rules.md §2A` |
| `rules/testing-rules.md §1B` Forbidden Application-Code Patterns | `rules/testing-rules.md §2C` |
| `rules/testing-rules.md §1C` Test-Disable Discipline | `rules/testing-rules.md §2D` |
| `rules/testing-rules.md §3` Defect Verification Protocol | `rules/testing-rules.md §2B` |
| `rules/workflow-rules.md §1` Plans and Beads | `rules/workflow-rules.md §2` |
| `rules/workflow-rules.md §6` Branching/Review/Merge | `rules/workflow-rules.md §11` |
| `@poolmaster/shared` | `@<projectName>/shared` |
| `clients/poolmaster/src/` | `clients/<projectName>/src/` |
| `pool-master-NNN` (Beads ID example) | `bd-#NNN` |
| `pool-master-rop.<n>` (defect reference) | remove or replace with neutral wording |
| `contestId` (event-bus rule example) | `aggregateId` (neutral) |

#### New sections to add

**`rules/architecture-rules.md`:**

- **§3A Provider/Adapter Registry Discipline** — when a backend module dispatches to one of several pluggable providers, the registry must be a true factory keyed by provider id. Mock providers must be registerable from tests but not the only id the production registry accepts. Production/staging environments reject `mock-*` provider ids unless `ALLOW_MOCK_PROVIDERS=true` is set; QA/dev may use mock providers freely.
- **§4A Event-Driven Mutation Discipline** — event-driven recalculations that mutate the same persisted state under concurrent emission must be: (1) idempotent via upsert keyed on stable identifiers, not delete-then-recreate; (2) serialized per recalc key (e.g., `aggregateId`) via Postgres advisory lock or per-key in-process queue; (3) atomic at the recalc boundary (single `prisma.$transaction` around any loop); (4) backpressured (coalesce events targeting the same recalc key within a debounce window). Each subscriber declares an explicit failure policy; default is isolated `Promise.allSettled` with structured logging.

**`rules/service-rules.md`:**

- **§1A No Synthetic Lookups** — when a service receives a request for a specific entity that does not exist, it must throw a typed `*NotFoundError`. Returning a fabricated default (`{ totalScore: 0, items: [] }`, `{ id, status: 'UNKNOWN' }`) is forbidden. This rule applies even when the caller appears to handle the missing case gracefully, and even when the default value "feels safe."
- **§4A List Endpoint Discipline — No Pagination** — list endpoints return raw arrays of the response DTO: `z.array(ResponseDto)`. Pagination envelopes (`page`, `pageSize`, `total`, `cursor`, etc.) are forbidden in API contracts. When a list endpoint could return more rows than is comfortable, narrow the result set with **functional filter arguments at the API input** — date range, status filters, relationship filters, domain-specific limits like top-N. Adding pagination to a new list endpoint is a deliberate per-endpoint contract decision that requires explicit project-owner approval. **This is an opinionated default carried over from pool-master direction; project owners adopting this template inherit it but may override per-project.**
- **§6A Time and Timezone Discipline** — persisted timestamps are UTC. Wall-clock-relative computations ("X days prior at HH:MM," "the next Monday at 9am") must use a named IANA timezone — typically the league's or the user's — not UTC math. Functions that compute scheduling-relative timestamps must accept a `timezone: string` parameter and reject `undefined`.
- **§7A Typed Error Class Discipline** — every domain error class must extend a shared `AppError` base that declares readonly `code: string` and `statusCode: number`. The Fastify global error handler reads these properties; it must not switch on `Error.name` or fall back to `BAD_REQUEST` / `INTERNAL_ERROR` when the domain reason is known.
- **Tighten existing §4** mapper exemption: change "Modules exempt: `config`, `health`" to "Modules without persisted entities are exempt; any module that touches Prisma must have a mapper file before its first route ships."
- **Tighten existing §7** error-envelope language: remove "when the domain reason is known" softening.

**`rules/react-ui-rules.md`:**

- **§5A Shared-Component & Helper Adoption Gate** — before adding a new bare HTML control to a feature page, check `clients/<projectName>/src/features/shared/ui/`. Use `Button`, `LinkButton`, `Input`, `Textarea`, `FormField`, `LoadingState`, `ErrorState`, `EmptyState` instead of bare `<button>`, `<input>`, `<textarea>`, hand-coded loading/error/empty shells. Before defining a new utility, grep `clients/<projectName>/src/lib/` and the relevant feature directory for existing implementations.
- **§5B Server Data Form-State Hazard** — forms whose default values come from a TanStack Query result must seed those defaults at modal-open time (RHF `defaultValues` + key-based reset, or an `enabled`-gated query). `useEffect(() => setFormState(query.data), [query.data])` is forbidden — refetch silently overwrites in-progress edits.
- **§5C Page Decomposition Threshold** — a page component over 400 LOC or holding more than 5 mutations must be decomposed into per-section components and per-mutation hooks. The threshold is a soft gate that triggers a Riley HIGH finding.
- **Tighten existing §5** "prefer reusable" → "must compose when over threshold (§5C)."

**`rules/testing-rules.md`:**

- **Tighten existing §2A** — remove the "rule-reference" loophole for app-layer tests. The fallback (`// rule: <ref>`) is permitted only for `tests/helpers/` and pure-utility unit tests with no product-visible behavior.

**`rules/workflow-rules.md`:**

- **Extend §0 Document Lifecycle** with a "Production-Source Lifecycle" subsection: the "Delete on ship, don't archive" rule applies to production source files, not just plans and tech specs. When a slice obsoletes a file (no incoming references in production code), the slice must delete it.
- **Extend §2 Plans and Beads Tracker** with a "Periodic Cross-Stack Review" subsection: at least once per quarter, run a cross-stack review (or its template-project equivalent) producing a code-review epic. CRITICAL/HIGH findings get owners and target slices within four weeks.
- **§11 Branching, Review, and Merge Cadence** — promote the Riley findings marker text from a conditional placeholder ("once PR-only flow is confirmed") to a hard requirement. Reorder the closeout protocol so "Spawn Riley" precedes "Record findings in PR body." See the persona/template updates in slices 2 and 3 for the marker mechanics.

### Slice 2 — Persona update

Port the "Findings marker in the PR body" subsection from pool-master's `personas/riley.md` into this template's `personas/riley.md`. The expected PR-body section format is documented inline in the persona file.

### Slice 3 — PR template update

Add a "Riley findings" section to `.github/pull_request_template.md` with the literal HTML comment marker `<!-- riley:findings -->` pre-populated, plus an instruction comment. Use the bug-fix from pool-master's PR #2 (avoid embedding the literal marker string inside an outer HTML comment block — describe it instead).

### Slice 4 — Scripts + package.json wiring

Port the eight rule-check scripts plus the shared utility:

```
scripts/rule-check-utils.mjs                    (verbatim)
scripts/check-no-mocked-api.{mjs,sh}            (parameterize: clients/<projectName>)
scripts/check-route-discipline.{mjs,sh}         (verbatim)
scripts/check-test-traceability.{mjs,sh}        (accept bd-#NNN format)
scripts/check-test-disable-discipline.{mjs,sh}  (accept bd-#NNN format)
scripts/check-unsafe-casts.{mjs,sh}             (parameterize)
scripts/check-shared-ui-controls.{mjs,sh}       (parameterize)
scripts/check-form-query-mirror.{mjs,sh}        (parameterize)
scripts/check-pr-riley-marker.{mjs,sh}          (verbatim — gh CLI is generic)
scripts/check-openapi-fresh.{mjs,sh}            (parameterize export path)
```

Update `package.json` to add the npm script chain:

```json
{
  "rules:check:no-mocked-api": "node scripts/check-no-mocked-api.mjs --warn-only",
  "rules:check:route-discipline": "node scripts/check-route-discipline.mjs --warn-only",
  "rules:check:test-traceability": "node scripts/check-test-traceability.mjs --warn-only",
  "rules:check:test-disable": "node scripts/check-test-disable-discipline.mjs",
  "rules:check:unsafe-casts": "node scripts/check-unsafe-casts.mjs --warn-only",
  "rules:check:shared-ui-controls": "node scripts/check-shared-ui-controls.mjs --warn-only",
  "rules:check:form-query-mirror": "node scripts/check-form-query-mirror.mjs --warn-only",
  "rules:check:pr-riley-marker": "node scripts/check-pr-riley-marker.mjs",
  "rules:check": "npm run rules:check:no-mocked-api && npm run rules:check:route-discipline && npm run rules:check:test-traceability && npm run rules:check:test-disable && npm run rules:check:unsafe-casts && npm run rules:check:shared-ui-controls && npm run rules:check:form-query-mirror",
  "api:check": "node scripts/check-openapi-fresh.mjs"
}
```

`rules:check:pr-riley-marker` is intentionally **not** included in the `rules:check` chain — it requires PR context (only meaningful in CI on `pull_request` events).

### Slice 5 — CI workflow

Add `.github/workflows/ci.yml` to the template. The workflow is the lint-typecheck job + test/build jobs from pool-master, with:

- Pool-master deploy track (`publish-images`, `migrate-qa`, `poolmaster-browser-e2e`) **omitted** — those are pool-master-specific.
- All `<projectName>` placeholders consistent with the rest of the template.
- Riley marker step included with the `if: github.event_name == 'pull_request'` guard.

The `lint-typecheck` job structure:

```yaml
- run: npm ci
- run: npx prisma generate --schema=packages/core-api/prisma/schema.prisma
- run: npm run build --workspace @<projectName>/shared
- name: Rule enforcement checks
  run: npm run rules:check
- name: Generated API freshness
  run: npm run api:check
- name: Riley findings marker (PRs only)
  if: github.event_name == 'pull_request'
  env:
    GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    PR_NUMBER: ${{ github.event.pull_request.number }}
  run: node scripts/check-pr-riley-marker.mjs
- name: Lint full repo
  run: npm run lint
- name: Typecheck full repo
  run: npm run typecheck
```

### Slice 6 — `docs/CI-AND-QUALITY-GATES.md`

Port pool-master's doc adapted to the template's `<projectName>` scheme. Add a new **"GitHub branch protection setup"** section that does not exist in pool-master's version yet. The section covers:

1. UI navigation: `Settings → Rules → Rulesets → New ruleset`
2. The exact rule list to configure:
   - Require pull request before merging (approvals = 0 for solo, otherwise project's choice)
   - Require status checks to pass — names of all six required jobs
   - Require branches to be up to date before merging
   - Require conversation resolution before merging
   - Allow force pushes: off
   - Allow deletions: off
   - Allowed merge methods: squash only
3. The bypass-list configuration question with its trade-off: admin-bypass-allowed (solo work, escape hatch) vs strict (no exceptions).
4. Verification via `gh api repos/<org>/<repo>/rulesets/<id>` showing the expected JSON shape.
5. Note that the Riley marker gate (`rules:check:pr-riley-marker`) only becomes meaningful once branch protection is in place — without enforced PR flow, direct pushes bypass the marker requirement entirely.

The diagrams from pool-master's doc (job DAG and lint-typecheck step sequence) port unchanged — they describe the workflow shape the template ships.

---

## API Surface

No API changes. This plan affects rules, scripts, CI configuration, and documentation only.

---

## Open Questions

None remaining. All six pre-execution decisions were resolved during plan drafting (see the conversation log for the original Q1–Q6 set).

---

## Validation

Per slice:

- **Slice 0:** `npm run api:export` runs cleanly using the new pattern (will fail on the empty scaffold; that's expected — the failure mode shifts when consumers implement `src/index.ts`).
- **Slice 1:** All cross-references in the new rule sections resolve to valid section numbers within the template's existing rule files. `grep -rn "pool-master-rop\|@poolmaster\|clients/poolmaster" rules/` returns zero hits in the new sections.
- **Slice 2:** `personas/riley.md` parses; the marker section uses the exact literal `<!-- riley:findings -->` (no escape, no nesting bug).
- **Slice 3:** `.github/pull_request_template.md` renders correctly when copied into a fresh PR (the marker is outside any outer HTML comment block).
- **Slice 4:** `npm run rules:check` runs without errors against the empty scaffold (most scanners will produce zero findings; route-discipline will trip when a consumer adds routes — that's the point).
- **Slice 5:** The CI workflow file passes `actionlint` (or equivalent YAML validation). The placeholder `<projectName>` consistently used; no leftover `poolmaster` references.
- **Slice 6:** The doc renders cleanly. The branch-protection setup steps match the actual GitHub UI as of 2026-05.

Plan-level acceptance:

- [ ] All six slices closed in Beads.
- [ ] `grep -rn "poolmaster\|pool-master" rules/ scripts/ .github/ docs/CI-AND-QUALITY-GATES.md personas/riley.md package.json | grep -v "node_modules"` returns zero hits.
- [ ] A fresh project bootstrapped from the template (manual smoke test by replacing `<projectName>` with a test name) can run `npm run rules:check` and see the gates work end-to-end.
- [ ] Parent Beads epic closed.
- [ ] **This plan file deleted** (epic-close cleanup per the §0 production-source lifecycle rule that lands as part of slice 1).

## Risk and Reversibility

Low. All changes are additive within the template repo. The only existing-content edit is the `api:export` script change in Slice 0, which is a strict upgrade to a working pattern. No template consumers are tracked in this repo, so no downstream coordination needed within this plan; downstream sync is each consumer's choice.

The plan is fully reversible per slice via `git revert`. The most disruptive slice would be Slice 4 (scripts + package.json) since it adds new dependencies on the project structure; if reverted, downstream `npm run rules:check` invocations would fail.

## Sequencing summary

```
Slice 0  →  Slice 1  →  Slice 2  →  Slice 3  →  Slice 4  →  Slice 5  →  Slice 6
   ↓          ↓           ↓           ↓           ↓           ↓           ↓
 align     rule       persona     PR        scripts +      CI         CI/CD
 export    sections   marker      template  package.json  workflow    setup
 pattern                          marker                              doc
```

Slices are independent within their internal scope (no slice depends on a later slice's output) but the recommended order above maximizes review readability. Slices 1, 2, 3 are pure documentation and review independently. Slice 4 (scripts) does not depend on the rules being landed — the gates work without the rule prose — but landing rules first makes the scripts' purpose clear in review.
