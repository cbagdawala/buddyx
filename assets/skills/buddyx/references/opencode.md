# opencode — harness rules

Read this whenever BuddyX runs inside **opencode** (the skill was loaded from
`.opencode/skills/` or `~/.config/opencode/skills/`, or the project's agents live in
`.opencode/agents/`). Where it disagrees with the Claude Code defaults in the other
references, **this file wins**.

opencode differs from Claude Code in three ways that matter to BuddyX:
1. `model:` must be a real `provider/model-id` — there are no `haiku`/`sonnet`/`opus` aliases.
2. Its task tool **cannot override the model per call**. A sub-agent runs on its own
   `model:` or, without one, on the model of the agent that invoked it.
3. It is often pointed at a **local model server** (Ollama, LM Studio…) with one or two
   models, where switching models means unloading and reloading weights and concurrent
   requests queue on the same GPU.

## Where agents live

- Project: `.opencode/agents/` — also read the legacy `.opencode/agent/` if it exists.
- Global: `~/.config/opencode/agents/`
- Create new agents in `.opencode/agents/` (project) unless the user asks for global.
- The **filename is the agent name** (`code-reviewer.md` → `code-reviewer`). That name is
  the `subagent_type` you pass to the task tool.

## The tier map — `buddyx.json`

Read it once per session, project first, then global:
`.opencode/buddyx.json` → `~/.config/opencode/buddyx.json`. Missing file = all defaults.

```json
{
  "tiers": { "light": null, "standard": null, "deep": null },
  "parallel": false
}
```

- `tiers.<tier>` — a `provider/model-id` (e.g. `ollama/qwen3-coder:30b`) or `null`.
  **`null` means inherit**: write no `model:` line; the sub-agent runs on the calling
  agent's model.
- `parallel` — whether to fan independent sub-agents out concurrently. Default `false`.
- The user sets this with `buddyx init --ai opencode --tiers` or by editing the file.
  **Don't edit it yourself** unless the user asks.
- There is no `max` tier on opencode — `fable` is a Claude Code per-call override only.

Two modes fall out of it:

| Mode | When | What it means |
|---|---|---|
| **Inherit** (default) | every tier is `null` | One model does everything. No `model:` lines; no escalation ladder; tiers only guide how much effort and context a step gets. |
| **Tiered** | at least one tier is set | An agent's default tier maps to that model id. Unset tiers inherit. |

## Agent frontmatter on opencode

This replaces the Claude Code contract in `agent-spec.md` (the body structure, scope rules
and quality bar still apply):

```yaml
---
description: >-
  Use for Laravel API work: endpoints, service layer, form requests, resources.
  Not for frontend or DB migrations.
mode: subagent                 # required — otherwise it also appears as a primary agent
model: ollama/qwen3-coder:30b  # ONLY if the agent's tier is set in buddyx.json; else omit
permission:                    # least privilege — replaces Claude's `tools:` list
  edit: allow
  bash: ask
  webfetch: deny
---
```

- **No `name:`** — the filename is the name. Keep it kebab-case.
- **`model:`** — look up the agent's default tier (`model-tiers.md` task → tier table) in
  `buddyx.json`. Set → write that exact id. `null` → **omit the line**; that is correct
  here, not a gap. Never write `haiku`/`sonnet`/`opus`/`fable` on opencode.
- Put the tier in a comment after the description block, e.g. `# buddyx-tier: standard`,
  so a later `bootstrap` can re-sync `model:` when the tier map changes.
- **`permission:`** — map least privilege like this:

| Agent kind | `edit` | `bash` | `webfetch` |
|---|---|---|---|
| Reviewer / security reviewer / analyzer / explorer (read-only) | `deny` | `deny` | `deny` |
| Test runner (runs the suite, doesn't edit) | `deny` | `ask` | `deny` |
| Builder / test writer / docs writer | `allow` | `ask` | `deny` |
| DevOps | `allow` | `ask` | `ask` |

  Don't write the deprecated `tools:` field, and never a Claude-style `tools: Read, Grep`
  string — opencode doesn't enforce it.

### Legacy and Claude-format agents

When indexing, flag agents that carry Claude-only frontmatter on opencode — `model:
sonnet`-style aliases, a `tools:` string, or no `mode:` — and offer to convert them:
drop `name:`, add `mode: subagent`, turn `tools:` into `permission:`, and set or remove
`model:` per the tier map. Don't flag a missing `model:` in inherit mode.

## Choosing and escalating models

There is no per-call `model` parameter. The agent's frontmatter decides.

**Inherit mode** — nothing to escalate to. When a sub-agent returns a wrong or
incomplete result:
1. Retry **once** with a tighter brief: name the exact files, paste the failing output or
   error, narrow the goal to the part that failed.
2. Still failing → do the step inline yourself, or hand it to the user with what you
   found. Don't loop.

**Tiered mode** — escalate by **editing the agent's default**, never silently:
1. Find the next tier up whose model id is set **and differs** from the current one. If
   none exists, use the inherit-mode recovery above.
2. Offer it in one line: *"`backend-architect` (standard → deep: `ollama/…`) failed on X —
   raise its default model and retry?"* On yes, edit its `model:` and re-run.
3. Say in the report that the default changed, so the user can keep or revert it.

A subtask that is clearly heavier than its agent's tier from the start (e.g. designing a
payment flow) follows the same rule: offer to raise the default, or route to an agent
that already sits on the deep tier.

On a local server, every model change costs a load. Don't propose a tier switch for a
small step, and prefer routing a whole phase to agents on the same model.

## Fan-out

- `parallel: false` (default) → run sub-agents **one at a time**, even when they're
  independent. Keep the dependency order from `delegation-protocol.md` and still
  decompose the work the same way; only the scheduling changes. On a single local
  model, concurrent calls queue anyway and can thrash the context cache.
- `parallel: true` → follow `delegation-protocol.md` (launch independent sub-agents in
  one turn).
- Adversarial review (2–3 reviewers) still runs on opencode — sequentially when
  `parallel` is false. With one model, the lenses come from different briefs, not
  different models; say so in the report.

## Report

In **Agents used**, show the model the agent actually ran on, not a Claude tier:
`backend-architect (sub-agent · inherit)` or `security-reviewer (sub-agent · deep:
ollama/qwen3-coder:30b)`. Note any retry or raised default.
