# Project Requirements: <projectName>

> This document is the product definition — what the product does, who it serves, and what it explicitly does not do. It is produced during Phase 1 of the spec-driven lifecycle by the Product Manager agent in collaboration with the project owner.

---

## 1. Product Vision

### One-Sentence Description
<!-- What does this product do in one sentence? -->

### Problem Statement
<!-- What problem does it solve? Why do existing tools fall short? -->

### Target Users
<!-- Who are the primary users? List distinct user types if applicable. -->

| User Type | Description | Primary Goals |
|-----------|-------------|---------------|
| | | |

---

## 2. Core Capabilities

### In Scope (Phase 1 / MVP)

<!-- List the capabilities this product must have for its first usable version. -->

| # | Capability | Description | Priority |
|---|-----------|-------------|----------|
| 1 | | | Must Have |
| 2 | | | Must Have |
| 3 | | | Should Have |

### Explicitly Out of Scope

<!-- List features that are intentionally deferred. This prevents scope creep. -->

| # | Deferred Capability | Reason | Revisit When |
|---|---------------------|--------|--------------|
| 1 | | | |

---

## 3. User Roles and Access

### Identity Model
<!-- How do users sign up and log in? Social auth? Email/password? SSO? -->

### Roles

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| | | |

### Authorization Boundaries
<!-- What entity scopes a user's permissions? (organization, workspace, team, project) -->
<!-- Can a user belong to multiple scopes? -->

### Admin Separation
<!-- Is there a separate admin surface, or is admin a role within the product? -->
<!-- What operations are truly platform-level vs. scoped to a user's organization? -->

---

## 4. Domain Overview

### Core Domain Objects

<!-- List the main "things" this product manages. These become the domain model. -->

| Object | Description | Owned By | Lifecycle States |
|--------|-------------|----------|-----------------|
| | | | |

### Key Relationships

<!-- How do domain objects relate to each other? -->

- **[Object A]** belongs to **[Object B]** (one-to-many)
- **[Object C]** links **[Object A]** and **[Object D]** (many-to-many through join)

### Key Business Rules

<!-- What constraints does the system enforce? -->

- 
- 
- 

---

## 5. External Integrations

<!-- Does the product integrate with external systems? -->

| Integration | Direction | Purpose | Phase |
|------------|-----------|---------|-------|
| | Inbound / Outbound / Both | | MVP / Deferred |

---

## 6. Non-Functional Requirements

### Performance
<!-- Any latency, throughput, or concurrency expectations? -->

### Data Retention
<!-- How long is data kept? Are there compliance requirements? -->

### Availability
<!-- Uptime expectations? Disaster recovery? -->

### Security
<!-- Authentication requirements, data encryption, compliance standards? -->

---

## 7. Open Questions

<!-- Questions that need answers before implementation can proceed. -->

| # | Question | Context | Status |
|---|----------|---------|--------|
| 1 | | | Open / Resolved |

---

## 8. Revision History

| Date | Author | Changes |
|------|--------|---------|
| | | Initial draft |
