# Workflow — review (and the verify gate)

`/buddyx review <target>` as a standalone command, and the **verify gate** that every
mutating workflow runs before declaring done.

## As a verify gate (inside create/refactor/test)

After builder agents finish and their edits are joined:
1. Route the **diff** (not the whole repo) to a read-only reviewer agent — or the
   `code-reviewer`/`testing` agent if present.
2. The reviewer checks: correctness, convention adherence, security, and whether
   acceptance criteria are met.
3. **Triage findings**: fix blocking issues (route back to the owning agent), report the
   rest. Only then is the command `done`.

## Adversarial verification (for risky changes)

For security-sensitive, data-mutating, or wide-blast-radius changes, spawn **2–3
independent reviewers** with different lenses (correctness / security / does-it-actually-
work) and require agreement before accepting. One reviewer's "looks fine" is not a gate.

## As a standalone command

1. Scope the target (a diff, a file, a module).
2. Route to the reviewer agent(s); for a broad audit, fan out by dimension.
3. Return findings **ranked most-severe first**, each with: file:line, why it's a problem,
   and a concrete fix. Don't bury a real bug under style nits.

## Reviewer agents must be read-only

A reviewer's `tools:` are `Read, Grep, Glob` — it reports, it does not mutate. Fixes go
back through the owning builder agent, keeping find/fix responsibilities separate.
