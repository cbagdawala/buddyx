# Workflow — bootstrap (scan the project, scaffold an agent fleet)

`/buddyx bootstrap` — onboard a project by detecting its stack and standing up a tailored
set of specialized sub-agents up front, so later commands have specialists to route to.

This is **plan-gated**: BuddyX proposes the fleet and waits for approval before writing.

> Not to be confused with the terminal command `buddyx init`, which installs this skill.
> `/buddyx bootstrap` runs *inside* the assistant and creates project sub-agents.

## Flow: scan → propose → approve → generate → report

### 1. Scan (read-only, fanned out)
Detect the stack from **manifests and structure first** — don't read every file. Delegate
to read-only analyzers (parallel by area) when the repo is large.

Signals to gather:
- **Language / runtime** — `package.json`, `composer.json`, `pyproject.toml`/`requirements.txt`,
  `go.mod`, `Cargo.toml`, `*.csproj`, `Gemfile`.
- **Backend framework** — Laravel (`artisan`), Django/Flask/FastAPI, Express/Nest, Rails,
  Spring, .NET.
- **Frontend / UI** — Vue/`vite.config`, React/Next, Svelte, Angular; component libraries
  (PrimeVue, MUI, Tailwind, shadcn) from deps.
- **Data** — migrations dir, ORM (Eloquent, Prisma, TypeORM, SQLAlchemy), DB from config.
- **Tests** — Pest/PHPUnit, Vitest/Jest, Pytest, Playwright/Cypress.
- **Ops** — Dockerfile/compose, CI config, deploy scripts, IaC.
- **Existing agents** — read the agents dir; record names, descriptions, and which lack
  frontmatter.

### 2. Propose (detection-driven, not a template)
Map the detected signals to a **minimal, non-overlapping** fleet. Only propose an agent
the project actually needs — no `primevue-ui` without PrimeVue, no `devops` without an
ops surface. For each proposed agent, state: name, one-line scope, least-privilege `tools:`,
and the signal that justifies it.

Typical mappings (illustrative):

| Detected | Proposed agent |
|---|---|
| Laravel / Django / Express backend | `backend-architect` |
| Migrations + ORM | `db-migration` |
| Vue / React frontend | `<framework>-frontend` |
| PrimeVue / MUI / component lib | `<lib>-ui` |
| Test framework present | `testing` |
| Dockerfile / CI / deploy | `devops` |
| Any codebase | `code-reviewer` (read-only, for the verify gate) |

Always include a read-only **`code-reviewer`** so the verify gate has a home.

### 3. Approve (mandatory gate)
Present the proposed fleet with rationale and the diff-to-be (which files will be created,
which existing agents will be kept/upgraded). **Wait for the user's go-ahead.** Offer:
approve all · edit the list · skip specific agents.

### 4. Generate (reconcile, don't clobber)
For each approved agent, follow `../agent-spec.md`:
- **Exists with frontmatter** → skip (or update only if the user asked).
- **Exists without frontmatter** → offer to upgrade it to the contract; never silently
  overwrite.
- **Missing** → create it, least-privilege `tools:`, routing-quality `description`,
  scope + return contract in the body.

Idempotent: re-running `bootstrap` adds only what's missing and re-offers upgrades.

### 5. Report
Standard block (`../report-format.md`): agents created / upgraded / skipped, plus a short
fleet index (name → purpose). Refresh the session capability index so the new agents route
immediately.

## Guardrails
- Bulk file creation → the approval gate is **not** optional (`../safety.md`).
- Prefer the **smallest** fleet that covers the stack; sprawl degrades routing.
- Base every agent on a **real detected signal**, not assumption.
- Don't overwrite or delete existing agents without explicit confirmation.
