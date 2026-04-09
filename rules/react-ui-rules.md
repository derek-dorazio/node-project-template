# React UI Rules

These rules govern the web application built with React, TypeScript, Vite, and the generated API client.

---

## 1. Core Standards

- Functional React components only.
- Focused, composable components — keep files small and single-purpose.
- Explicit loading, error, and empty states on every data-fetching surface.
- Avoid `any`.
- Use shared/generated types over local copies.
- No comments unless explaining non-obvious behavior.

---

## 2. No Mock Data in Application Code

Banned in hooks, pages, components, and stores:

- `queryFn: async () => mockData`
- `initialData: mockData`
- `catch { return mockData }`
- Local `MOCK_*` arrays used as live data
- Conditional development-only fake branches

Call real API, let errors propagate, render honest loading/error/empty states.

---

## 3. API Integration

### Primary Rule

The web app must use the shared generated `hey-api` client as its API layer.

```typescript
import { client, listLeagues } from '@/lib/api';
const { data, error } = await listLeagues({ client });
```

The `@/lib/api` module configures the SDK client (base URL, auth interceptor) and re-exports all generated operations.

### Banned Patterns

- New manual `fetch()` wrappers for endpoints in the generated client
- New OpenAPI client adapters when the generated one exists
- Local interfaces duplicating generated response types
- `as any` / `as unknown as` / manual shape rewriting to force generated types
- Legacy manual-client helpers alongside the generated SDK

### Generated Client Rules

- Import through the app-local `@/lib/api` module.
- Never edit generated files.
- Expect method names/types to change with backend — that's the contract working.
- Remove legacy workarounds as the contract improves.

---

## 4. TanStack Query

- Use TanStack Query for all server state.
- Query functions must call real generated SDK operations.
- Use stable query key arrays.
- Invalidate intentionally after mutations.
- Handle loading, error, empty, and success states.

---

## 5. State Management

- **Server state**: TanStack Query (the default for anything from the API).
- **Client state**: Zustand, only when necessary for UI state that doesn't belong on the server.
- Keep server state and UI state clearly separated.

---

## 6. Forms

- React Hook Form for non-trivial forms.
- Validation constraints consistent with backend rules.
- Reusable form sections over giant monolithic forms.

---

## 7. Routing and Navigation

- React Router for all navigation.
- Role-based route guards where the app has different user roles.
- Lazy-load route-level page components where practical.

---

## 8. Stable Automation Selectors

Interactive controls and page landmarks must have stable selectors for testing and automation:

- Interactive controls: `data-testid`
- Form inputs: semantic `id`
- Page landmarks: `data-testid` with domain-oriented kebab-case naming
- Reusable features: consistent prefixes (e.g., `league-create-submit`, `contest-entry-list`)

Naming rules:
- Lowercase kebab-case
- Domain-oriented, not presentational
- No translation text encoding
- No random/runtime GUIDs
- Stable deterministic identifiers

---

## 9. Frontend Testing

### Tools

| Tool | Purpose |
|---|---|
| Vitest | Unit and integration test runner |
| React Testing Library | User-focused component testing |
| MSW | Request-level API mocking |
| Playwright | Browser E2E tests |

### MSW Rules

Use MSW when testing hooks, pages, form submissions, authenticated screens, and query/mutation behavior.

Why:
- The real API layer executes
- The real URL/method/body gets constructed
- Path and request-shape drift is caught

### Banned Frontend Test Patterns

- `vi.mock('@/lib/api-client')` — mocking the API layer so completely that request construction never runs
- Tests that only assert copied path strings
- Preserving tests that validate retired behavior
- Broad MSW rewrites expanding scope without approval

### Test Proof Rules

- Tests must prove the behavior they claim to cover, not just that the page renders.
- If a test claims role or permission behavior, it must assert an observable difference.
- Add DB-backed integration only when the real backend boundary materially increases confidence.

### React Testing Library Selector Rule

- Prefer `getByTestId`, stable field `id`s, and machine-oriented selectors.
- Use visible text assertions only when intentionally validating copy, localization, or accessibility.

---

## 10. Frontend Review Checklist

Before finishing frontend work, verify:

1. Using generated client, not new manual wrapper?
2. Local API interfaces removable?
3. Loading/error/empty states present?
4. Refactor removed stale UI/mocks?
5. Tests use MSW for request wiring?
6. Automation-critical UI has stable selectors?
