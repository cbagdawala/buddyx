# Model Tiers — right-size the model for every step

Sub-agents that declare no model **inherit the session's model** — usually the most
capable (and most expensive) one. Most sub-agent work doesn't need it. BuddyX picks the
**cheapest tier that can do the step well**, and escalates only when that tier falls short.

## The three tiers

| Tier | Claude Code value | Use for |
|---|---|---|
| **light** | `haiku` | Mechanical, low-reasoning work: building the capability index / `agent list`, `status`, manifest & structure scans, file/symbol lookups, running an existing test suite and summarizing results, formatting/collating facts already gathered |
| **standard** | `sonnet` | Routine building and judgment: backend/frontend/migration builders, writing tests, docs authoring, straightforward refactors, the default verify-gate reviewer |
| **deep** | `opus` | Real reasoning: architecture & planning, cross-cutting or risky refactors, the security lens in adversarial review, debugging an unclear failure, ambiguous requirements |

**BuddyX itself** (the orchestrator — parse, plan, route, join, report) stays on the
session model. Don't spawn a sub-agent just to change BuddyX's own model.

Use the **tier aliases** (`haiku`, `sonnet`, `opus`), not pinned model IDs — aliases track
the newest model in each tier, so agents never break on a retired ID.

## Task → tier defaults

| Step | Tier |
|---|---|
| Capability index, `agent list`, `status` | light (or inline — no sub-agent needed) |
| `bootstrap` scan (manifests, dirs, existing agents) | light |
| `analyze` — fact gathering by area | light |
| `analyze` — architecture / requirements synthesis | standard → deep if the question is a design judgment |
| `create` — builder agents (API, UI, schema, wiring) | standard |
| `create` — designing a new subsystem or non-obvious data model | deep (override for that call) |
| `test` — run existing suite & report | light |
| `test` — write new tests | standard |
| `docs` — gather facts from code | light |
| `docs` — write the docs | standard |
| `refactor` — local / mechanical (rename, extract, move) | standard |
| `refactor` — cross-cutting or behavior-sensitive | deep |
| Verify gate (default reviewer) | standard |
| Adversarial review — correctness / does-it-work lenses | standard |
| Adversarial review — security lens | deep |
| Debugging a failure whose cause is unknown | deep |

## How the model is chosen (precedence, highest first)

1. **User override** in the command — "use opus", "deep mode", "cheap mode"/"light mode"
   applies to that command's sub-agents.
2. **Per-call override** — BuddyX passes `model` on the Agent/Task tool call when a
   specific subtask needs a different tier than the agent's default (e.g.
   `backend-architect` normally runs `sonnet`, but gets `opus` to design a payment flow).
3. **Agent default** — the `model:` field in the agent's frontmatter (`agent-spec.md`).
4. **Inherit** — no field → session model. Treat a missing `model:` as a gap to fix, not
   as a choice.

## Escalation (instead of starting high)

Start at the default tier. Escalate **one tier, once**, when:
- the sub-agent fails or returns an incomplete / low-confidence result,
- the verify gate rejects its output for a reasoning error (not a typo-level nit), or
- the work turns out bigger or more ambiguous than it looked when routed.

light → standard → deep. Note the escalation in the report's **Agents used** line (`sonnet → opus`) so the user can
raise the agent's default if it keeps happening. Never de-escalate a security review.

## Harness support

| Harness | How to set the model |
|---|---|
| Claude Code | `model: haiku \| sonnet \| opus \| inherit` in frontmatter; `model` param on the Agent tool for per-call overrides |
| Factory Droid | `model:` in the droid frontmatter (`inherit` or a model id the account offers) |
| opencode | `model: <provider>/<model-id>` in agent frontmatter — map tiers to the configured provider's small / mid / large models |
| Others (Cursor, Windsurf, Codex, Gemini, Antigravity) | Omit `model:` unless the harness documents it; agents inherit |

**Inline-role mode can't switch models** — the work runs on the session model. In that
mode tiers only guide *how much* effort to spend; say so in the report if it matters.

## Anti-patterns

- Every sub-agent on the top model "to be safe".
- A read-only lookup/scan agent on `opus`.
- A security reviewer on `haiku`.
- Re-running the same failing tier repeatedly instead of escalating once.
- Pinning dated model IDs in agent files.
