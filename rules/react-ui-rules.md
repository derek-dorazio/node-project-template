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

Treat the generated SDK/types plus documented OpenAPI behavior as the normal frontend contract source of truth. Do not read backend service code to answer routine contract questions.

### Banned Patterns

- New manual `fetch()` wrappers for endpoints in the generated client
- New OpenAPI client adapters when the generated one exists
- Local interfaces duplicating generated response types
- Treating backend service code as the normal way to answer frontend contract questions
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

### Query Defaults Must Be Intentional

- Choose `staleTime`, retry behavior, and refetch triggers intentionally for the domain instead of relying blindly on defaults.
- Be deliberate about `refetchOnWindowFocus`, `refetchOnReconnect`, and similar behaviors on screens where surprise refetching would create noisy or confusing UX.
- If a query intentionally deviates from the local default behavior in a non-obvious way, leave a short explanation in code.

### Mutation Cache Behavior Must Be Explicit

Every mutation must intentionally choose one of these outcomes:

- Invalidate the affected queries
- Update the cache from the authoritative mutation response
- Navigate away so stale client state is no longer being shown

Do not leave post-mutation cache behavior implicit.

---

## 5. State, Effect, Form, and Component Rules

### Use Effect Only For External Synchronization

- Use `useEffect` to synchronize with external systems: browser APIs, subscriptions, imperative third-party widgets, timers that are truly side effects.
- Do not use `useEffect` to derive render data from props or other local state.
- Do not use `useEffect` as the primary server-data fetching mechanism when TanStack Query or the reviewed route/data pattern should own that work.
- If a value can be computed during render from existing props/state, compute it there instead of storing derived state and syncing it with an Effect.

### State Structure Rules

- Avoid redundant, duplicate, or contradictory state.
- Do not mirror props into state unless intentionally creating a user-editable draft.
- Prefer storing stable identifiers over storing copied selected objects in component state when the source object already exists elsewhere.
- Keep state minimal and normalize or flatten nested state when updates become difficult to reason about.
- When route or entity identity changes, reset local state intentionally rather than accidentally carrying it across context changes.

### Forms

- React Hook Form for non-trivial forms.
- Validation constraints consistent with backend rules.
- Reusable form sections over giant monolithic forms.
- Keep UI state distinct from server state.
- Use Zustand for client-side state only when local component state or query state is insufficient.

### URL, Cookie, and Store Ownership

- Shareable navigation state belongs in the URL (route params, search params).
- Persistent default-context state may live in cookies when it influences app entry behavior.
- Zustand is for client-side UI/application state, not for server data already owned by TanStack Query.
- Do not put route-shaped or shareable navigation state into Zustand when the URL should be the source of truth.
- Do not duplicate the same state across URL, query cache, and Zustand unless there is a clearly documented reason.

### Pending UI Is Required

- Interactive route transitions, form submissions, and important mutations must provide immediate pending feedback.
- Do not leave navigation or submissions visually inert while async work is in flight.
- Pending UI can be subtle, but it must be intentional and visible enough to avoid double submits and dead-end uncertainty.

---

## 6. Routing and Navigation

- React Router for all navigation.
- Role-based route guards where the app has different user roles.
- Lazy-load route-level page components where practical.

---

## 7. Stable Automation Selectors

Interactive controls and page landmarks must have stable selectors for testing and automation:

- Interactive controls: `data-testid`
- Form inputs: semantic `id`
- Page landmarks: `data-testid` with domain-oriented kebab-case naming
- Reusable features: consistent prefixes (e.g., `entity-create-submit`, `list-filter-panel`)

Naming rules:
- Lowercase kebab-case
- Domain-oriented, not presentational
- No translation text encoding
- No random/runtime GUIDs
- Stable deterministic identifiers

---

## 8. Frontend Testing

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

## 9. Frontend Review Checklist

Before finishing frontend work, verify:

1. Using generated client, not new manual wrapper?
2. Local API interfaces removable?
3. Loading/error/empty states present?
4. Refactor removed stale UI/mocks?
5. Tests use MSW for request wiring?
6. Automation-critical UI has stable selectors?
