# Agent Specification & Contract

The contract every BuddyX sub-agent must satisfy to be a *real, invocable* sub-agent —
and the template to use for `agent create`.

## The frontmatter contract (required)

A sub-agent is a Markdown file in the project's agents directory that **begins with YAML
frontmatter**. Without it, the file is only a role document (inline use), not an invocable
sub-agent.

```yaml
---
name: backend-architect          # kebab-case; MUST equal the filename (backend-architect.md)
description: >-                   # when to use this agent — this is what routing matches on
  Use for Laravel API architecture: endpoints, service layer, form requests,
  resources, middleware, and REST design. Not for frontend or DB migrations.
tools: Read, Grep, Glob, Edit, Write, Bash   # least privilege — list only what it needs
model: sonnet                    # right-sized tier: haiku | sonnet | opus (see model-tiers.md)
---
```

Rules:
- `name` is kebab-case and **matches the filename**.
- `description` is written for **routing** — say precisely when to use it and, ideally,
  when *not* to. Vague descriptions cause mis-routing.
- `tools` follows **least privilege**. A read-only analyzer gets no `Write`/`Bash`. A
  reviewer gets `Read, Grep, Glob` — nothing that mutates.
- `model` is the agent's **default tier** — the cheapest that does its typical task well
  (`model-tiers.md`): `haiku` for scanners/lookups/test-runners, `sonnet` for builders,
  writers and the default reviewer, `opus` only for architecture, risky-refactor or
  security work — never `fable` (opt-in per call only). Use tier aliases, never dated model IDs. On harnesses without model
  support, omit the field.

## Body structure (recommended)

```markdown
# <Agent Name>

You are the **<Agent Name>**, responsible for <one-sentence scope>.

## Scope
- In scope: ...
- Out of scope (hand back to BuddyX): ...

## Operating rules
- Conventions to follow, patterns to match, things never to do.

## Return contract
- What you hand back to BuddyX (e.g. "a summary of files changed + how to verify").
```

Keep each agent **narrow**. One clear specialization beats a broad agent that overlaps
others — narrow scopes make routing unambiguous.

## `agent create` procedure

1. **Clarify the specialization** — what tasks it owns, and its boundaries.
2. **Check for overlap** — if an existing agent already covers it, extend that one instead
   of creating a near-duplicate (duplicates poison routing).
3. **Author the file** to the contract above — pick the **minimum** `tools:` set and the
   **cheapest adequate** `model:` tier (state the reason in one line to the user).
4. **Write** it to the harness agents dir as `<name>.md`.
5. **Validate**: frontmatter present, `name` matches filename, `tools` least-privilege,
   `model` right-sized, description is routing-quality.
6. **Register** it in the session capability index and confirm to the user with a
   one-line capability summary.

If an `agent-creator` sub-agent already exists in the project, delegate steps 1–4 to it,
then validate.

## Upgrading legacy agents

Many existing agent files (e.g. hand-written role docs) have **no frontmatter**. When you
encounter one, offer to upgrade it: infer `name` from the filename, synthesize a
routing-quality `description` from its body, assign a least-privilege `tools:` set and a
right-sized `model:` tier. Agents that have frontmatter but **no `model:`** silently run on
the session's top model — offer to add a tier to them too.
Until upgraded, it can only be used **inline**, never as a real sub-agent.

## Quality bar (reject an agent that fails these)

- [ ] Frontmatter present; `name` == filename; kebab-case.
- [ ] `description` states when to use AND when not to.
- [ ] `tools:` is least-privilege (no mutation tools for read-only agents).
- [ ] `model:` is the cheapest adequate tier (no `opus` on a lookup agent, no `haiku` on a
      security reviewer).
- [ ] Scope does not substantially overlap an existing agent.
- [ ] Body defines scope boundaries and a return contract.
