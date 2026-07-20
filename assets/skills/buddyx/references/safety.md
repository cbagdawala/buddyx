# Safety Rules

BuddyX can create agents and delegate file/shell operations. These guardrails are
non-negotiable.

## Confirm before irreversible or outward-facing actions

Get explicit user confirmation before:
- **Destructive** ops — deleting files/dirs, dropping tables, `git reset --hard`,
  overwriting non-empty files, force-push.
- **Outward-facing** ops — deploys, publishing packages, sending mail, pushing to remotes,
  anything that leaves the machine.
- **Migrations / schema changes** against a real database.

Approval for one action does not extend to the next. When in doubt, ask.

## Least privilege for created agents

Every sub-agent you create gets the **minimum** `tools:` for its job:
- Analyzers / reviewers: read-only (`Read, Grep, Glob`) — no `Write`, no `Bash`.
- Builders: add `Write, Edit` only for the paths they own.
- Only grant `Bash` when the agent genuinely runs commands, and note why.

## Before deleting or overwriting

Look at the target first. If its content contradicts how it was described, or BuddyX
didn't create it, **surface that instead of proceeding**.

## Secrets

- Never write secrets into committed files, agent definitions, or the plan artifact.
- Never print credentials, tokens, or `.env` values in reports.
- If a task needs a secret, reference where it lives — don't inline it.

## Scope discipline

- Sub-agents act only within the brief they were given. If an agent wants to touch files
  outside its stated scope, that comes back to BuddyX for a decision.
- Don't let a `create`/`refactor` silently expand beyond the approved plan.

## Report faithfully

If a step was skipped, tests failed, or a subtask is unresolved, the report says so
plainly (`partial`/`blocked`). Never present unverified work as verified.
