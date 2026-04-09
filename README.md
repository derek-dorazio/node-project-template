# <projectName>

## Quick Start

```bash
# Start local infrastructure
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d

# Install dependencies
npm install

# Generate Prisma client and run migrations
cd packages/core-api && npx prisma generate && npx prisma migrate dev && cd ../..

# Seed the database
npm run db:seed

# Start all services in development mode
npm run dev
```

## Project Structure

```
<projectName>/
├── AGENTS.md                    # Agent instruction entry point
├── CLAUDE.md                    # Claude Code configuration
├── rules/                       # Architecture, service, testing, workflow rules
├── requirements/                # Product requirements and domain model
├── plans/                       # Use cases, design plans, execution plans
├── docs/                        # Reference documentation
├── packages/
│   ├── core-api/                # Backend Fastify service
│   └── shared/                  # Shared DTOs, domain types, events, generated SDK
├── clients/
│   └── <projectName>/           # React web application
├── tests/
│   ├── unit/                    # Service-level unit tests
│   ├── integration/             # DB-backed integration tests
│   ├── functional/              # SDK functional API tests (full-stack)
│   └── api/                     # Deployed smoke tests
├── scripts/                     # Build and dev tooling
└── infrastructure/              # Docker, Terraform, CI/CD
```

## Development Workflow

This project follows a **spec-driven development lifecycle**:

1. **Requirements** → Define what the product does and model the domain
2. **Use Cases** → Document concrete user journeys per feature area
3. **Design Plans** → Make architectural decisions informed by use cases
4. **Execution Plans** → Break designs into sliced, trackable work
5. **Implementation** → Execute slices with quality gates

See `rules/workflow-rules.md` for the full lifecycle.

## Quality Gates

Before pushing code:

```bash
npx turbo typecheck --force           # Type checking
npx eslint --max-warnings 0           # Linting
npm run test:unit                      # Unit tests
npm run test:integration               # DB integration tests
npm run test:functional                # SDK functional API tests
npm run test:coverage:backend          # Merged coverage report
npm run api:refresh                    # Regenerate API client (if schemas changed)
npm run api:validate                   # Validate OpenAPI spec
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | TypeScript, Fastify, Prisma, Zod, OpenAPI 3.1 |
| **Frontend** | React, TypeScript, Vite, Tailwind, shadcn/ui, TanStack Query |
| **Database** | PostgreSQL |
| **API Contract** | Generated hey-api client from OpenAPI spec |
| **Testing** | Jest (backend), Vitest (frontend), Playwright (E2E) |
| **CI/CD** | GitHub Actions |
| **Infrastructure** | Docker, Terraform |
