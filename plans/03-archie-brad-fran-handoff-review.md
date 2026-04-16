# Plan 03: Archie / Brad / Fran Handoff Review

## Summary

Plans 01 and 02 focused on the front half of the lifecycle — Pam, Abe, and the new Tom. This plan reviews the back half: what Archie, Brad, and Fran actually hand off downstream, and what's missing for the humans (engineers, architects, on-call) who will ship, operate, and extend the product.

There are three audiences for each persona's output:

- **Downstream personas** — Brad and Fran consume Archie's plans; Riley reviews everyone; Brad and Fran exchange contract questions.
- **Human team members** — architects, engineers, SREs, product owners who own the system long-term.
- **Future self** — the same codebase six months later, when the original decision context has faded.

Today's personas are strong on the first audience and weak on the second and third.

---

## 1. Archie — Current State and Gaps

### 1.1 What Archie Produces Today

- `plans/<NN>-<feature>.md` with Summary, Key Decisions, Data Model Changes, API Surface, Dependencies, Deferred, and an Action Plan task table.
- `docs/DATABASE-SCHEMA.md` updates when schema decisions change.

### 1.2 Gaps for Brad and Fran

- **No sequence or component diagrams.** Key Decisions are prose; complex flows (multi-step integrations, async jobs, webhooks) are hard to reason about without a visual.
- **No per-feature infrastructure checklist.** Does this feature need new env vars, new secrets, new cloud resources, new queue topics, new cache keys? Archie's template doesn't prompt these questions.
- **No rollback strategy.** What happens if this change misbehaves in production? Plans are silent.
- **No feature-flag strategy.** Is this shipped dark and toggled on, or direct-to-prod? Who owns the flag?
- **No observability hooks.** What logs, metrics, or traces should Brad/Fran add? What should be visible on dashboards?
- **No performance / SLO posture.** Is this a hot path? What latency budget applies?
- **No data-migration runbook detail** for non-trivial migrations (backfill, read/write transition windows, canary steps).
- **No security review trigger.** Does this feature touch auth, PII, or privileged actions? Should a human security review gate merge?

### 1.3 Gaps for Human Architects and Engineers

- **No ADR pattern.** Decisions live inline in feature plans and get archived when the plan closes — decision rationale disappears into git history.
- **No maintained current-state architecture doc.** New team members reconstruct the system by reading many plans and reading the code. There's no "this is how the system is arranged today" artifact.
- **No infrastructure inventory.** What services run where, what depends on what, what external systems are integrated?
- **No "archived plan" indexing.** Once plans move to `plans/archive/`, the institutional memory becomes a scavenger hunt.

### 1.4 Recommendations

- **Adopt lightweight ADRs** under `docs/adr/<NNNN>-<slug>.md`. One decision per file; short template (context, decision, consequences, status). Extract the "Key Decisions" block from design plans into ADRs when decisions have lifetime beyond a single feature.
- **Require a maintained `docs/ARCHITECTURE.md`** — current-state overview with a system context diagram, module boundaries, and links to active ADRs. Archie updates this in the same slice as any structural change.
- **Add these sections to the design plan template:**
  - Sequence/component diagram (Mermaid) for any flow that crosses more than two modules.
  - Infrastructure impact checklist (env vars, secrets, cloud resources, queue topics, cache).
  - Rollback strategy.
  - Feature flag strategy (or explicit "none").
  - Observability hooks expected.
  - Performance / SLO posture (or explicit "normal").
  - Security review trigger (`none` / `data-handling` / `auth-change` / `external-integration`).
- **Require an infrastructure inventory** at `docs/INFRASTRUCTURE.md`, updated whenever Archie adds or changes services, dependencies, or integrations.

---

## 2. Brad — Current State and Gaps

### 2.1 What Brad Produces Today

- Prisma schema + migrations, services, repositories, DTOs, mappers, route schemas, error envelopes.
- Regenerated OpenAPI and exported SDK.
- Unit, DB-integration, and SDK functional-API tests.
- Contract documentation inline in DTOs and route descriptions (per `service-rules.md`).
- Plan row updates.

### 2.2 Gaps as Handoff to Fran

- **No request/response examples** beyond types. Fran has to reason about "what does a realistic payload look like" from schemas alone.
- **No pagination / sorting / filter semantics documentation** beyond schema hints. If the API supports cursor vs offset, `sort` vs `order`, `null` vs `undefined`, those decisions aren't documented.
- **No rate-limit / timeout / idempotency documentation per route.** Fran can't implement retry or debounce behavior reliably.
- **No deprecation path** for retired routes. When a route disappears from the SDK, Fran learns via the TypeScript compiler.

### 2.3 Gaps as Handoff to Riley

- **No "what changed" slice summary.** Riley has to reconstruct from diff + plan row. A short summary artifact (paragraph, plus list of changed files and why) would make review faster and more reliable.
- **No impact-sweep acknowledgment.** Did this slice touch factories, mocks, fixture helpers, or other feature tests? Brad has a rule to sweep these; Riley has no evidence it happened.

### 2.4 Gaps for Human Backend Engineers

- **No migration runbook** for non-trivial migrations. Future engineers executing a re-deploy or a rollback need pre-deploy steps, backfill order, and post-deploy verification.
- **No operational runbook per new surface.** For a new endpoint or background job, what does the on-call engineer look at if it misbehaves? What alarms fire? What's the expected traffic profile?
- **No feature-flag inventory.** Flags get added inside features and disappear into code. A `docs/FEATURE-FLAGS.md` with owner, purpose, default, kill-switch plan, and retirement date would prevent flag rot.
- **No shared-service ownership info.** When Brad adds a shared utility (`lib/`, `shared/`), there's no way to know who owns it or what the expected evolution is.

### 2.5 Recommendations

- **Extend the contract documentation checklist** with request/response example requirements for non-trivial endpoints, plus explicit statements on pagination, sorting, filtering, idempotency, and rate-limit posture.
- **Require a slice summary artifact** on every Brad commit — one paragraph of "what changed and why" plus a changed-files list with one-line reasons, either in the commit body or in a per-slice note attached to the plan row.
- **Add a "migration runbook" requirement** for any migration that isn't schema-only. Template: pre-deploy steps, data backfill plan, read/write transition window, post-deploy verification, rollback steps.
- **Establish `docs/FEATURE-FLAGS.md`** and require Brad to update it whenever a flag is added, changed, or retired.
- **Establish `docs/RUNBOOKS/<endpoint-or-job>.md`** for production-visible features, with expected traffic profile, failure modes, alarms, and on-call first actions. Lightweight — one page or less.

---

## 3. Fran — Current State and Gaps

### 3.1 What Fran Produces Today

- React pages, components, hooks consuming the generated SDK.
- Loading/error/empty/success state handling on data surfaces.
- Form validation.
- Role-gated UI.
- `data-testid` selectors.
- Vitest unit tests and MSW-backed integration tests.
- Plan row updates.

### 3.2 Gaps as Handoff to Brad

- **No standard "contract gap report."** When Fran asks Brad a contract question, there's no format — it's ad hoc per conversation. A small structured artifact ("what I needed to know, what the docs said, what the proposed clarification is") would close the loop faster and force the documentation fix Brad already owes.

### 3.3 Gaps as Handoff to Riley

- **No "what changed" slice summary** (same gap as Brad's §2.3).
- **No accessibility audit artifact** per feature. Rules require keyboard + semantic + icon-name accessibility, but there's no evidence of verification.
- **No analytics event inventory** per feature. If the product emits events, they're scattered through components with no central registry.
- **No copy/content review artifact.** UI strings change over time and rules already guide against anchoring tests to marketing copy, but there's no place where product-reviewed copy lives.

### 3.4 Gaps for Human Frontend Engineers

- **No shared-component inventory.** New team members don't know what already exists; duplication grows.
- **No design-system posture doc.** Which shadcn components are adopted? Which are customized? Where do tokens live?
- **No analytics event registry.** Same gap as §3.3 but for long-term maintenance.
- **No a11y posture doc.** What level of WCAG support is the bar? What automated tools run in CI?

### 3.5 Recommendations

- **Add a "contract question" template** to the Fran persona. Structure: "I am implementing use case X. I need to know Y. The generated SDK and OpenAPI show Z. Proposed documentation addition: …". This both routes cleanly to Brad and pre-populates the documentation fix.
- **Adopt the same slice summary artifact** recommended in §2.5.
- **Establish `docs/frontend/COMPONENT-INVENTORY.md`** listing shared components with purpose and usage example; Fran updates it when adding shared components.
- **Establish `docs/frontend/ANALYTICS-EVENTS.md`** as a registry of emitted events with payload, trigger, and owner.
- **Establish `docs/frontend/ACCESSIBILITY.md`** stating the a11y bar, tooling, and manual review expectations. Fran attests against it at slice close.
- **Require a per-feature copy snapshot** (short markdown block in the feature plan row) when Fran introduces significant new UI text. Gives product review a target.

---

## 4. Cross-Cutting Gaps

These affect all three personas and belong at the project level rather than inside any single persona file.

### 4.1 ADR Discipline

Already recommended in §1.4. The ADR surface is a shared asset: Archie creates most of them, but Brad and Fran can propose ADRs when an implementation decision has cross-feature consequences (e.g., "we decided forms use `react-hook-form`'s `zodResolver`").

### 4.2 Current-State Docs

The project needs a small, maintained set of evergreen documents that survive plan archiving:

- `docs/ARCHITECTURE.md` — system context, module boundaries, links to active ADRs.
- `docs/INFRASTRUCTURE.md` — what runs where and what depends on what.
- `docs/FEATURE-FLAGS.md` — the flag inventory.
- `docs/RUNBOOKS/` — one file per production-visible surface.
- `docs/frontend/COMPONENT-INVENTORY.md`, `docs/frontend/ANALYTICS-EVENTS.md`, `docs/frontend/ACCESSIBILITY.md` — frontend-specific registries.

Rule: a plan is not `Done` if it introduces behavior that belongs in one of these docs but the doc wasn't updated in the same slice.

### 4.3 CHANGELOG Discipline

The repo already has a commit history. What's missing is a human-readable summary of meaningful product and system changes. Consider a `CHANGELOG.md` updated on release boundaries by Archie or Riley, or automate from commit messages.

### 4.4 Deployment Readiness Checklist

Before a slice is deployed (not just merged), require confirmation that:

- Environment variables / secrets are configured in target environments.
- Migrations have a verified rollback.
- Feature flags are registered and have a default value.
- Observability is wired (alarms / dashboards exist for new production-visible surfaces).
- Security review has been run if the trigger in §1.4 applies.

This can live as a `docs/DEPLOYMENT-READINESS.md` checklist referenced from design plans.

### 4.5 Handoff-Quality Review as Part of Riley's Job

Riley's current role is audit against rules, plans, and use cases. Extend Riley's scope to include **handoff completeness**: did Archie update `docs/ARCHITECTURE.md`? Did Brad add a runbook for the new job? Did Fran update the analytics registry? Make handoff gaps a reviewable finding category, not just a "nice to have."

---

## 5. Ambiguity and Escalation Routing (Updated)

Plan 02 §4.4 established this table. Extend it for handoff-time questions:

- **Product question** → Pam.
- **Technical contract question** → Tom (during spec) or Brad (during and after implementation).
- **Implementation question** → Brad / Fran / Archie depending on layer.
- **Model-impact classification** → Dom.
- **Operational question** (how does this run in prod? who's on call?) → Archie primarily; Brad or Fran if scoped to their layer.
- **Handoff gap** (doc missing, runbook missing, ADR missing) → Riley flags; originating persona fixes.

---

## 6. Rule, Persona, and Workflow Changes

### 6.1 Updated Persona Files

- `agents/architect.md` (Archie) — add the extended design plan sections (§1.4), ADR ownership, and `docs/ARCHITECTURE.md` / `docs/INFRASTRUCTURE.md` ownership.
- `agents/backend-developer.md` (Brad) — add slice summary artifact, contract examples, pagination/timeout/idempotency docs, migration runbook requirement, feature-flag and runbook update responsibilities.
- `agents/frontend-developer.md` (Fran) — add contract-question template, slice summary artifact, component-inventory / analytics-events / accessibility doc responsibilities.
- `agents/code-reviewer.md` (Riley) — extend scope to include handoff-completeness review per §4.5.

### 6.2 New Rule Files

- `rules/documentation-rules.md` — codify the maintained current-state doc set (§4.2), ADR format and location, CHANGELOG discipline, deployment readiness checklist.

### 6.3 Updated Rule Files

- `rules/workflow-rules.md` — extend the slice completion checklist with handoff-documentation items: ADR updated if applicable, current-state docs updated if applicable, runbook added/updated if applicable, feature-flag registry updated if applicable.
- `rules/service-rules.md` — extend the contract documentation checklist with example-payload requirements for non-trivial endpoints and pagination/timeout/idempotency semantics.
- `rules/react-ui-rules.md` — extend with component-inventory and analytics-event registry expectations.
- `AGENTS.md` — add `rules/documentation-rules.md` to required reading; add `docs/ARCHITECTURE.md`, `docs/INFRASTRUCTURE.md`, `docs/FEATURE-FLAGS.md`, and the `docs/frontend/` registries to the project structure summary.

### 6.4 New Scaffolding in `docs/`

Create empty-but-real scaffolding so later projects have somewhere to write to:

- `docs/ARCHITECTURE.md`
- `docs/INFRASTRUCTURE.md`
- `docs/FEATURE-FLAGS.md`
- `docs/RUNBOOKS/README.md`
- `docs/adr/README.md` + `docs/adr/0000-record-architecture-decisions.md` (the bootstrap ADR)
- `docs/frontend/COMPONENT-INVENTORY.md`
- `docs/frontend/ANALYTICS-EVENTS.md`
- `docs/frontend/ACCESSIBILITY.md`
- `docs/DEPLOYMENT-READINESS.md`

Each scaffolded file starts with a short "Purpose / When to update / Format" header so downstream projects don't reinvent the format.

---

## 7. Open Questions

- **Where do ADRs live after a plan is archived?** Proposal: ADRs live permanently under `docs/adr/`, independent of plan lifecycle. A plan can reference an ADR but doesn't own it.
- **Should handoff gaps block merge?** Current recommendation: yes for current-state docs and runbooks, no for optional polish. Needs a clear line in `rules/workflow-rules.md`.
- **CHANGELOG automation vs hand-maintained?** Defer; first try hand-maintained at release boundaries and revisit if it decays.
- **Is a separate on-call / operational persona warranted** (e.g., `Ollie` for operations), or is Archie's existing platform scope enough? Current recommendation: stay inside Archie until real usage shows the gap.
- **Revision stamps** — the same open question from Plans 01 and 02 applies here too (`Last reviewed: YYYY-MM-DD` on evergreen docs). Track as one cross-plan decision rather than per-plan.

---

## Action Plan

| ID | Phase | Task | Status | Notes |
|---|---|---|---|---|
| 03-001 | 1 | Draft `rules/documentation-rules.md` covering ADRs, current-state docs, CHANGELOG, deployment readiness | Not Started | |
| 03-002 | 1 | Extend Archie's design plan template with diagrams, infra checklist, rollback, feature flag, observability, perf, and security-review sections | Not Started | |
| 03-003 | 1 | Update `agents/architect.md` to own `docs/ARCHITECTURE.md`, `docs/INFRASTRUCTURE.md`, and ADRs | Not Started | |
| 03-004 | 2 | Update `agents/backend-developer.md` with slice summary, contract examples, migration runbook, feature-flag, and runbook responsibilities | Not Started | |
| 03-005 | 2 | Extend `rules/service-rules.md` contract documentation checklist with examples and non-functional semantics | Not Started | |
| 03-006 | 2 | Update `agents/frontend-developer.md` with contract-question template, slice summary, and frontend registry responsibilities | Not Started | |
| 03-007 | 2 | Extend `rules/react-ui-rules.md` with component-inventory and analytics-event expectations | Not Started | |
| 03-008 | 3 | Update `agents/code-reviewer.md` (Riley) with handoff-completeness review scope | Not Started | |
| 03-009 | 3 | Extend `rules/workflow-rules.md` slice completion checklist with handoff-doc items | Not Started | |
| 03-010 | 4 | Scaffold the `docs/` files listed in §6.4 with Purpose / When to update / Format headers | Not Started | |
| 03-011 | 4 | Update `AGENTS.md` with the new rule and doc references | Not Started | |
| 03-012 | 5 | Pilot the extended handoff rules on one real feature slice; capture friction before over-codifying | Not Started | Same caution as Plans 01 and 02 |
