# Agent Instructions

This is the canonical instruction file for coding agents working on `<projectName>`.

All agents working in this repo should:

1. Read this file first.
2. Treat the files in `rules/` as the detailed source of truth for architecture, implementation, testing, and workflow requirements.
3. Treat persona playbooks in `personas/` as role-specific execution guides layered on top of the shared rules, not as competing policy sources. Tool-specific wrappers in `.claude/skills/`, `.claude/agents/`, `.agents/skills/`, and `.codex/agents/` are thin pointers to the corresponding `personas/<name>.md` file — the `personas/` file is authoritative.
4. Keep `CLAUDE.md` as a thin pointer to this file rather than maintaining duplicate policy text elsewhere.
5. Track live task state in **Beads** (`.beads/issues.jsonl`, `bd` CLI). Plan files in `plans/` are narrative-only companions to a Beads epic; they do not contain task tables. See `docs/adr/0001-beads-as-live-task-tracker.md` and `docs/adr/0002-plans-as-narrative-delete-after-epic-closes.md`.

## Non-Negotiables

- **Never modify application code to make a test pass or fail predictably.** No mock data, fake data, hardcoded sample responses, synthetic fallbacks, "test mode" branches, swallowed errors, or test-only code paths in production source. Mocks/fakes/fixtures live exclusively in test code. See `rules/testing-rules.md` §2C *Forbidden Application-Code Patterns*. Riley flags any instance as a CRITICAL finding and blocks merge.
- **Defect-fix slices must include a failing test before the fix.** The slice must demonstrate that a test reproducing the defect fails on the broken code, then passes on the fixed code. See `rules/testing-rules.md` §2B *Defect Verification Protocol*.
- **Every test references a use-case, business-rule, or defect ID.** Describe block, test name, or leading comment — see `rules/testing-rules.md` §2A *Test Self-Documentation*.
- Fix real architecture and contract problems before adjusting tests around them.
- Keep the API contract chain in sync: Zod DTOs, route schemas, OpenAPI spec, generated clients, and frontend consumers.
- Update plans and rules when architecture changes — in the same work, not later.

## Required Reading

Before implementing any work, read and follow:

1. **[Workflow Rules](workflow-rules.md)** — spec-driven lifecycle, plan tracking, slice execution, and quality gates
2. **[Architecture Rules](architecture-rules.md)** — tech stack, contract-first API design, service topology, project structure
3. **[Service Rules](service-rules.md)** — backend TypeScript, Fastify, Prisma, DTOs, mappers, OpenAPI, error handling
4. **[React UI Rules](react-ui-rules.md)** — React app technology, generated API client usage, state management, frontend testing
5. **[UX Rules](ux-rules.md)** — first-draft UX conventions, action hierarchy, state communication, accessibility
6. **[Testing Rules](testing-rules.md)** — unit, integration, functional API, smoke, E2E, and contract testing strategy
7. **[Model Change Rules](model-change-rules.md)** — definition of done when domain models change
8. **[Domain Model Conventions Rules](domain-model-conventions-rules.md)** — lifecycle naming, `status` vs `isActive`, soft-delete vs hard-delete semantics
9. **[Product Discovery Rules](product-discovery-rules.md)** — Piper's discovery scope, output artifacts, and handoff floor before requirements work begins
10. **[Product Requirements Rules](product-requirements-rules.md)** — Pam's output structure, use case template, confidence labels, handoff floor
11. **[Technical Specification Rules](technical-specification-rules.md)** — Tom's output structure, domain model, API surface, flows, handoff floor
## Persona Playbooks

Authoritative persona playbooks live in `personas/`. Tool-specific wrappers in `.claude/skills/<name>/SKILL.md`, `.claude/agents/<name>.md`, `.agents/skills/<name>/SKILL.md`, and `.codex/agents/<name>.toml` are thin pointers — they each instruct the model to Read the matching `personas/<name>.md` before acting. **Do not edit persona content in the wrappers; edit `personas/<name>.md`.**

### Active personas (auto-routable skills)

- `personas/pam.md` — product requirements, use cases, screens, business rules, glossary
- `personas/dom.md` — domain model derivation, fields/constraints, state machines, convention enforcement
- `personas/archie.md` — design plans, execution slices, cross-cutting architectural decisions
- `personas/brad.md` — backend service implementation, DTOs, mappers, backend tests
- `personas/fran.md` — frontend implementation, generated SDK consumption, UI tests
- `personas/tess.md` — test case derivation from specs, test matrix, coverage audits

### Dormant personas (invoke explicitly)

- `personas/piper.md` — broad product framing for greenfield products / new modules
- `personas/tom.md` — pre-implementation technical specs for major new features (deleted after ship; see ADR-0003)
- `personas/abe.md` — one-time application-spec extraction from existing implementations

### Subagents (isolated context, findings reports)

- `personas/quinn.md` — verification lane selection, test execution, failure triage, release confidence
- `personas/riley.md` — findings-first code review

### Default Responsibility Split

- `Piper` / product discovery: broad product framing, goals, actors, major modules (dormant)
- `Pam` / product manager: refined product requirements, use cases, business rules, screen purpose
- `Tom` / technical specification: pre-implementation technical design, domain/API/flow specification (dormant)
- `Dom` / data modeler: model/contract impact classification, field-level modeling
- `Archie` / architect: execution slicing, sequencing, infrastructure/cross-cutting architecture, ADRs
- `Fran` / frontend developer: frontend UX realization and web implementation
- `Brad` / backend developer: backend/domain/API implementation
- `Tess` / test planner: test case derivation, coverage matrix authorship
- `Quinn` / QA test analyst: verification lane selection, test execution, failure triage, release confidence (subagent)
- `Riley` / code reviewer: findings-first review and risk detection (subagent)
- `Abe` / application specification builder: one-time spec extraction (dormant)

If a role is misassigned during discussion or execution, agents should correct it proactively and update the relevant persona/rules if the boundary was not clear enough. The user should not need to police persona ownership in real time.

Important:

- `AGENTS.md` and `rules/` remain the canonical shared contract.
- `personas/` files must not redefine or contradict repo-wide policy.
- Cross-cutting workflow requirements such as updating Beads state and validating slices remain required for all agents, not just one persona.
- Frontend implementation should be driven by reviewed plans, generated SDK/types, and documented API contracts rather than backend implementation details.
- Contract meaning, API documentation quality, and model-change implementation remain backend-owned responsibilities.

## Workflow Expectations

- Follow the spec-driven lifecycle: Product Discovery (Piper, optional) → Requirements (Pam) → Technical Specification (Tom + Dom, optional for incremental work) → Design / Execution Slicing (Archie) → Implementation (Brad, Fran).
- Track work in **Beads**. Every active feature or major effort maps to a Beads epic; every slice is a Beads child story. Status transitions (`open` → `in_progress` → `closed` / `deferred`) happen in Beads at the moment work starts or finishes. Plan files are narrative-only and do not contain task tables.
- Do not implement behavior that isn't covered by a documented use case. If a use case is missing, write it first.
- When closing a Beads epic, delete the corresponding plan file in the same or an immediately following commit; capture any durable patterns or decisions as ADRs (`docs/adr/`) or rules (`rules/`) before deletion.
- Do not maintain competing instruction sets across `AGENTS.md`, `CLAUDE.md`, `rules/`, and `personas/`.
- At the start of a resumed session, re-read `rules/working-style.md` to restore the expected collaboration style and continuity defaults before implementing.
- When a prior session intentionally paused work, check `docs/SESSION-HANDOFF.md` for the current "resume here" note before choosing the next slice.
- When closing out a session where work is paused or context is about to change, create or update `docs/SESSION-HANDOFF.md` with a brief "resume here" note covering what was just completed, what's next, and any open decisions.

## Quality Gates

Before pushing code, agents must pass the required local validation set:

1. `npm run typecheck`
2. `npm run lint`
3. `npm run test:service:unit`
4. `npm run test:service:integration`
5. `npm run test:service:functional-api`
6. `npm run test:coverage:service:merged`
7. `npm run openapi-contract-check` when API schemas change

CI-only follow-up signals (not required pre-push):
- Deployed smoke tests
- Browser E2E tests
- Image/publish workflows

## Repo Map

```
<projectName>/
├── packages/
│   ├── core-api/          # Backend Fastify service
│   └── shared/            # Shared DTOs, domain types, events, generated SDK
├── clients/
│   └── <projectName>/     # React web application
├── tests/
│   ├── unit/              # Service-level unit tests
│   ├── integration/       # DB-backed integration tests (Fastify inject)
│   ├── functional/        # SDK functional API tests (full-stack through generated client)
│   └── api/               # Deployed smoke tests (thin health/auth verification)
├── requirements/
│   ├── reference/         # Seed discovery materials
│   ├── product-overview/  # Piper's discovery artifacts
│   └── product-requirements/ # Pam's refined product requirements
├── tech-specs/            # Tom's technical specifications (pre-implementation; deleted after ship)
├── plans/                 # Narrative-only execution plans (companions to Beads epics; deleted on epic close)
├── rules/                 # Architecture, service, testing, workflow rules
├── personas/              # Authoritative persona playbooks (Pam, Tom, Dom, Archie, etc.)
├── docs/adr/              # Architecture Decision Records (cross-cutting, immutable)
├── .claude/               # Claude Code wrappers: skills (active personas) + agents (subagents)
├── .agents/               # Codex skills (active personas + dormant openai.yaml sidecars)
├── .codex/                # Codex subagents (TOML)
├── .beads/                # Beads task tracker (issues.jsonl, exported state)
└── infrastructure/        # Docker, Terraform, CI/CD configuration
```
