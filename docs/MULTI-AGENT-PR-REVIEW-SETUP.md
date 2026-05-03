# Multi-Agent Gated PR Review Setup

This is the operator runbook for adding a multi-pass, multi-identity PR review
flow to a project bootstrapped from this template. It exists so an agent
walking through this doc with you can stand up the setup end-to-end without
needing to figure out the GitHub App mechanics from scratch.

It is **not** a plan / story / epic. It's a one-time setup runbook. Hand it
to an agent (or follow it yourself) when you want a new project to use the
multi-agent review framework.

## What this gives you

A PR landed against `main` will have flowed through multiple review passes,
each performed by a different agent runtime under a different GitHub
identity:

- **Pass 1** — Implementer self-check. The implementing agent (e.g., Codex)
  spawns Riley as a subagent against its own diff and posts findings in the
  PR body under the `<!-- riley:findings -->` marker. CI enforces marker
  presence (gate `rules:check:pr-riley-marker`).
- **Pass 2** — Cross-model secondary review. A *different* agent runtime
  (e.g., Claude) runs Riley against the same diff and posts via
  `gh pr review` with a formal vote. Because the reviewer's GitHub identity
  is different from the PR author, this approval satisfies branch protection's
  `required_approving_review_count: 1`.
- **Pass 3** — Sage security review (conditional, when the slice touches
  auth / validation / secrets / data exposure).
- **Pass 4** — Archie architecture review (conditional, when the slice
  touches shared contracts / cross-module boundaries / infrastructure /
  active plans).

Each pass posts under a distinct `@<app-name>[bot]` identity in the PR
conversation, so you can scan the conversation tab and see at a glance
which model+persona produced which review.

The full process model — when each pass fires, what each persona checks,
the persona+pass+model header convention — is documented in
`rules/workflow-rules.md` (the section on Branching, Review, and Merge
Cadence) and in the persona files (`personas/riley.md`, `personas/sage.md`,
`personas/archie.md`).

## Prerequisites

Before running this setup, the following framework pieces should already
be in the project (they ship with the template, but verify):

- [ ] `scripts/get-app-installation-token.mjs` — the helper that mints
  installation tokens from App credentials
- [ ] `scripts/check-pr-riley-marker.mjs` — the CI gate that enforces the
  `<!-- riley:findings -->` marker in PR bodies
- [ ] `personas/riley.md` — generalist code reviewer playbook with Pass 1
  and Pass 2 sections
- [ ] `personas/sage.md` — security-focused reviewer playbook (for Pass 3)
- [ ] `personas/archie.md` — architect playbook with the "PR Architecture
  Review" section (for Pass 4)
- [ ] `rules/workflow-rules.md` — Branching/Review/Merge section describing
  the multi-pass flow
- [ ] `.github/pull_request_template.md` — template that pre-populates the
  Riley findings marker
- [ ] `.github/workflows/ci.yml` — CI workflow that runs `rules:check`
  (including `rules:check:pr-riley-marker`) and `api:check`

If any of these are missing, the multi-agent review framework hasn't been
ported into the project yet — get those in place before continuing this
runbook. They are the *content* of the framework; this runbook only
covers the *identity / credential / infrastructure* half.

## Decision: how many App identities do you need?

One App per agent runtime that will post PR reviews. Common shapes:

- **Two Apps** — one for Claude, one for Codex. Smallest viable setup that
  lets either runtime implement and the other review (cross-model property).
- **More than two** — add an App per additional runtime (e.g., a future
  GPT-5 runtime, a specialized security reviewer). Each new App is one
  more pass through this runbook.
- **One App** — works mechanically (any non-author approval satisfies
  branch protection), but loses the cross-model independence: the same
  runtime would post both implementer self-check and cross-model secondary,
  which is a degenerate case.

Default recommendation: **two Apps to start**.

---

## Setup procedure

### Step 1 — Choose App names

Pick a name per runtime. Names appear in PR conversations as
`@<name>[bot]`, so make them readable and identifiable:

- `<your-handle>-<project>-claude` — Claude runtime
- `<your-handle>-<project>-codex` — Codex runtime

App names must be globally unique across GitHub. If the name you want is
taken, suffix with the year or a discriminator.

### Step 2 — Create each App

For each runtime, while logged in as the GitHub user/org that owns the
project repo:

1. Go to <https://github.com/settings/apps/new> (for personal account) or
   `https://github.com/organizations/<org>/settings/apps/new` (for org).
2. **GitHub App name**: the name from Step 1.
3. **Description**: optional; e.g., "Claude agent runtime for PR reviews
   on `<owner>/<project>`."
4. **Homepage URL**: required field; the project repo URL works
   (`https://github.com/<owner>/<project>`).
5. **Identifying and authorizing users**: leave defaults (no callback URL).
6. **Post installation**: leave defaults.
7. **Webhook**: **uncheck "Active"**. The agent calls the API directly,
   not via webhook events.
8. **Permissions** → **Repository permissions** (only these):
   - **Contents**: Read-only
   - **Metadata**: Read-only (auto-required when any other repo permission is set)
   - **Pull requests**: Read and write
   - **Commit statuses**: Read-only
   - Everything else: No access.
9. **Subscribe to events**: none.
10. **Where can this GitHub App be installed?**: **Only on this account**
    (or "Any account" if you want broader reuse).
11. Click **Create GitHub App**.

After creation, GitHub redirects to the App's settings page. **Note the
App ID** at the top — you'll need it.

### Step 3 — Generate the private key

On the App's settings page, scroll past **Client secrets** (irrelevant for
this flow — that's for OAuth user authorization) to the **Private keys**
section.

1. Click **Generate a private key**. A `.pem` file downloads.
2. Move it to a gitignored, owner-only-readable location:

   ```bash
   mkdir -p ~/.config/github-apps
   mv ~/Downloads/<app-name>.<date>.private-key.pem \
      ~/.config/github-apps/<app-name>.private-key.pem
   chmod 600 ~/.config/github-apps/<app-name>.private-key.pem
   ```

3. Treat the private key like an SSH key. If lost, you'd have to generate
   a new one (the existing one is unrecoverable).

### Step 4 — Install the App on the project repo

Still on the App's settings page:

1. Left sidebar → **Install App**.
2. Click **Install** next to your account.
3. Select **Only select repositories** → check the project repo.
4. Click **Install**.
5. After install, GitHub's URL becomes
   `https://github.com/settings/installations/<INSTALLATION_ID>`. **Note the
   Installation ID** — it pairs with the App ID for token minting.

You now have three pieces per App:

```
GH_APP_ID                  = <numeric App ID>
GH_APP_INSTALLATION_ID     = <numeric Installation ID>
GH_APP_PRIVATE_KEY_PATH    = ~/.config/github-apps/<app-name>.private-key.pem
```

### Step 5 — Verify token minting works

The helper script `scripts/get-app-installation-token.mjs` (already in this
project) reads those three env vars and mints a fresh installation token
(~1 hour validity). Smoke-test it for each App:

```bash
GH_APP_ID=<id> \
GH_APP_INSTALLATION_ID=<id> \
GH_APP_PRIVATE_KEY_PATH=<path> \
node scripts/get-app-installation-token.mjs > /tmp/token.txt

# Verify the token works:
GH_TOKEN=$(cat /tmp/token.txt) gh api user --jq '.login'
# Expected output: <app-name>[bot]

GH_TOKEN=$(cat /tmp/token.txt) gh api /installation/repositories --jq '.repositories[].full_name'
# Expected output: the project repo
```

If `.login` returns the App's bot identity and `repositories` lists the
project repo, the App is wired correctly. If either fails, recheck:

- That the App is actually installed on the project repo (Step 4)
- That the env vars match the right App's IDs (App ID and Installation ID
  pair must be from the same App)
- That the `.pem` file is readable and uncorrupted

### Step 6 — Wire credentials into each agent runtime

Each agent runtime reads `GH_TOKEN` from environment. The runtime's
session-launch script must export the right App's credentials before
the agent runs.

Common patterns:

- **Per-runtime shell profile**: a `.envrc` (with direnv) or a per-runtime
  shell wrapper that exports the four vars (`GH_APP_ID`,
  `GH_APP_INSTALLATION_ID`, `GH_APP_PRIVATE_KEY_PATH`, `GH_TOKEN`) for that
  agent's session.
- **Harness setup script**: a shell script `bin/launch-claude.sh` that
  exports the Claude App's credentials and exec's into Claude Code; a
  parallel `bin/launch-codex.sh` for Codex.
- **Manual export at session start**: run the four exports interactively
  before invoking the agent.

The exact mechanism depends on the agent harness in use. The contract is:
when an agent calls `gh pr review`, `GH_TOKEN` must be set to a valid
installation token from the App that should post the review. The helper
script makes that one command:

```bash
export GH_TOKEN=$(node scripts/get-app-installation-token.mjs)
```

(Assumes the three `GH_APP_*` env vars are already set.)

### Step 7 — Configure branch protection

Branch protection on `main` must require non-author approvals so that
agent reviews actually gate merges.

Either via the GitHub UI or `gh api`:

1. Go to <https://github.com/<owner>/<project>/settings/rules>.
2. If a ruleset for `main` doesn't exist yet, create one — see
   `docs/CI-AND-QUALITY-GATES.md` for the full recommended ruleset
   configuration (status checks, squash-only, no force pushes, no
   deletions, etc.).
3. In the ruleset, find or add the **Require a pull request before merging**
   rule.
4. Set **Required approving review count** to `1`.
5. Save.

Verify with:

```bash
gh api repos/<owner>/<project>/rulesets --jq '.[] | select(.name=="protect-main") | .id'
gh api repos/<owner>/<project>/rulesets/<id> --jq '.rules[] | select(.type=="pull_request") | .parameters.required_approving_review_count'
# Expected: 1
```

### Step 8 — Open a test PR to validate the full flow

Pick the smallest meaningful change, open a PR, and walk it through the
multi-pass flow:

1. Implementing agent runtime opens the PR (under its App identity).
2. Implementing agent spawns Riley as a subagent in its own runtime,
   pastes findings into the PR body marker.
3. CI runs `rules:check` (including the marker presence check) and
   `api:check`. All gates must pass.
4. A *different* agent runtime (under a different App) runs Riley as
   the cross-model secondary pass and posts via
   `gh pr review --approve --body-file <findings.md>`.
5. If applicable, Sage and/or Archie post additional reviews.
6. Branch protection sees the non-author approval; merge button enables.
7. The implementing agent (or human merger) clicks merge.

If any pass fails to post, GitHub will surface the specific error
(self-review block, missing permissions, etc.). The most common cause
of an unexpected `--approve` failure is that the App identity authored
the PR — switch to the other App for the review.

---

## For the template owner: existing Apps

If you (Derek) are creating a new project from this template, you don't
need to redo Steps 1–3 above. You already have two Apps:

| App | App ID | Used by |
|---|---|---|
| `derek-dorazio-agent-claude` | 3589005 | Claude runtimes |
| `derek-dorazio-agent-codex` | 3589131 | Codex runtimes |

The private keys are stored at:

```
~/.config/github-apps/derek-dorazio-agent-claude.private-key.pem
~/.config/github-apps/derek-dorazio-agent-codex.private-key.pem
```

For a new project, you only need:

1. **Step 4** — install both Apps on the new project's repo. Same flow:
   - Go to <https://github.com/settings/apps/derek-dorazio-agent-claude>
   - Left sidebar → **Install App**
   - Select **Only select repositories** → check the new project's repo
   - Click **Install**
   - **Note the new Installation ID** (it's per-repo, so it differs from
     `pool-master`'s Installation ID).
   - Repeat for `derek-dorazio-agent-codex`.

2. **Step 5** — verify the new Installation IDs work. Use the same smoke
   test, with the new IDs.

3. **Step 6** — point each agent runtime's session-launch at the right
   App for the new project. If your harness uses per-project `.envrc` or
   similar, copy the pattern from your existing setup.

4. **Step 7** — configure branch protection on the new project's `main`
   per `docs/CI-AND-QUALITY-GATES.md`.

5. **Step 8** — open a test PR.

You can skip App creation and key generation entirely.

---

## Adding a new runtime later

If you add a third agent runtime later (e.g., a future model), it's one
more pass through Steps 1–6 with a new App per runtime. Branch protection
doesn't need to change; an additional App-identity reviewer is just
another non-author approval that satisfies the existing required-1 gate.

If the new runtime has a specialized review role rather than being a
generalist reviewer (e.g., a dedicated security-only runtime), consider
introducing a new persona in `personas/` to define its lens, similar to
how `personas/sage.md` defines the security reviewer.

## Troubleshooting

**`gh api user --jq '.login'` returns my human username, not the App's
bot name.** `GH_TOKEN` isn't set, or it's set to a user PAT instead of an
installation token. Re-run the helper script and re-export `GH_TOKEN`.

**Token exchange fails with 404.** Either the App ID or the Installation
ID is wrong, or the App isn't actually installed on the repo your token
needs to act on. Re-check Step 4.

**`gh pr review --approve` fails with "Review Can not approve your own
pull request".** The App identity authored the PR. Switch to the other
App for the review. (This is the whole reason there are two Apps.)

**`gh api` returns 403 "Resource not accessible by integration".** The
App's permissions don't include the resource being accessed. Re-check
Step 2's permission list. The minimum for PR review is **Pull requests:
Read and write**, **Contents: Read**, **Metadata: Read**, **Commit
statuses: Read**.

**Installation token expired mid-session.** Tokens are valid for ~1 hour.
Re-run the helper script to mint a fresh one and re-export `GH_TOKEN`.
For longer sessions, wrap the agent invocation in a script that refreshes
the token periodically.

**Branch protection still blocks merge despite an App approval.** Verify
the App's review actually shows as "Approved" (not "Commented") in the
PR's Files-Changed → reviews tab. The `--approve` flag must succeed at
GitHub-API level, not just locally; if the App authored the PR, GitHub
silently downgrades the review to a comment.

## Related documentation

- `docs/CI-AND-QUALITY-GATES.md` — branch protection ruleset and CI gate
  details.
- `rules/workflow-rules.md` — the multi-pass review flow and the
  persona+pass+model header convention.
- `personas/riley.md` — generalist code review playbook (Pass 1 and Pass 2).
- `personas/sage.md` — security review playbook (Pass 3).
- `personas/archie.md` — architecture review playbook (Pass 4) plus
  design-time work.
- `scripts/get-app-installation-token.mjs` — the helper script referenced
  throughout this doc.
