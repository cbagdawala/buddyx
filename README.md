# BuddyX (`buddyx`)

A cross-harness **Agent Skill** that turns your AI coding assistant into **BuddyX**, a
master orchestrator. Every command runs a disciplined loop — **plan → route → delegate →
verify → report**: it maps your `/buddyx` request to an action, routes it to the
best-matching specialized sub-agent in your project (invoked as a *real* sub-agent when the
harness supports it), fans independent work out **in parallel**, gates the result through a
**review/verify** step, and closes with a consistent report. It creates a new sub-agent —
with a proper frontmatter contract and least-privilege tools — when none fits. Distributed
as an npm CLI that installs the skill into **Claude Code**, **opencode**, and other
assistants.

> **v2** is a ground-up rebuild: real sub-agent delegation (not inline role-play),
> parallel fan-out, verification gates, planning + `status`, a security posture, and a thin
> `SKILL.md` router over an on-demand `references/` corpus. See
> [What's inside](#whats-inside-the-skill).

Install method mirrors [`ganesh-gyan-cli`](https://github.com/cbagdawala/ganesh-gyan): a
small CLI (`buddyx`) copies the bundled skill into each assistant's skills folder.

## Install

```bash
npm install -g buddyx
```

Then add the skill to your assistant (run inside a project for project scope, or add
`--global` for all projects):

```bash
buddyx init --ai claude          # Claude Code   → .claude/skills/buddyx/
buddyx init --ai opencode        # opencode      → .opencode/skills/buddyx/
buddyx init --ai factory         # Factory Droid → .factory/skills/buddyx/
buddyx init --ai claude --global # → ~/.claude/skills/buddyx/ (all projects)
buddyx init --ai all             # every supported assistant
buddyx init                      # auto-detect + interactive picker
```

Or without a global install:

```bash
npx buddyx init --ai claude
```

Restart the assistant, then invoke it by typing `/buddyx` or just asking, e.g.
*"buddyx create payment-gateway module"*. The skill's `description` also lets the model
trigger it automatically on matching orchestration requests.

**New project?** Run `/buddyx bootstrap` first — BuddyX scans your stack, proposes a
tailored set of specialized sub-agents (backend, frontend, db, testing, reviewer…), and on
your approval scaffolds them, so every later command has specialists to route to. (This is
the in-assistant command; don't confuse it with the terminal `buddyx init`, which installs
the skill.)

## Supported assistants

`claude` (Claude Code) · `opencode` · `cursor` · `windsurf` · `codex` · `gemini` ·
`antigravity` · `factory` (Factory Droid) — or `all`.

Each install is self-contained: `SKILL.md` plus the full `references/` corpus is copied
into `<assistant-dir>/skills/buddyx/`.

## What BuddyX does

BuddyX is an **orchestrator**, not a stack. It ships no sub-agents of its own — instead it
**discovers the specialized agents already in your project** (`.claude/agents/`,
`.opencode/agent/`, etc.), routes to the best match on their `description`, and creates a
new agent (to a frontmatter contract) when none fits.

Every command runs the same loop:

```
PARSE → PLAN → ROUTE → DELEGATE → VERIFY → REPORT
```

- **Real delegation** — invokes matching sub-agents via the harness's Agent tool
  (`subagent_type`); falls back to inline role-play only when the harness can't spawn them.
- **Parallel fan-out** — independent subtasks run concurrently; dependent ones are sequenced.
- **Verify gate** — non-trivial output is routed through a read-only reviewer/tester before
  it's called done (adversarial multi-reviewer for risky changes).
- **Planning + `status`** — multi-step work gets an explicit plan; `status` reads from it.
- **Model tiering** — each step runs on the cheapest model tier that can do it well
  (`haiku` for scans/lookups/test runs, `sonnet` for building and reviewing, `opus` for
  architecture, security review and hard debugging), escalating one tier only on failure.
  `fable` is opt-in only ("use fable" / "max mode") for problems opus can't crack.
  Agents carry a default `model:` in their frontmatter; BuddyX overrides it per call. This
  keeps sub-agents off the top model by default and stretches your usage limits.
- **Safety posture** — confirmation gates for destructive/outward-facing ops, least-privilege
  tools on created agents, faithful reporting.

### Commands

```
/buddyx <action> [target] [options]
```

| Command | Description |
|---|---|
| `bootstrap` | Scan the project and scaffold a tailored agent fleet (propose → approve → generate) |
| `create <target> <type>` | Create a module, component, or agent |
| `analyze <target>` | Analyze code, structure, or requirements |
| `refactor <target>` | Refactor existing code |
| `test <target>` | Create or run tests |
| `docs <target>` | Generate documentation |
| `review <target>` | Review code for issues |
| `agent create <name>` | Create a new specialized agent |
| `agent list` | List all available agents |
| `status` | Check project status |
| `help` | Show available commands |

## What's inside the skill

A thin `SKILL.md` router over an on-demand `references/` corpus (loaded only when the task
needs it):

- **delegation-protocol.md** — real sub-agent invocation, parallel vs sequential, recovery, degradation
- **routing.md** — capability index, task→agent matching, tie-breaks, fallback ladder
- **agent-spec.md** — the frontmatter contract, `agent create` procedure, quality bar
- **model-tiers.md** — haiku / sonnet / opus per step, opt-in fable, override precedence, escalation, per-harness support
- **report-format.md** — the standard result block
- **safety.md** — confirmation gates, least-privilege, secrets, faithful reporting
- **workflows/** — per-command playbooks (bootstrap · create · refactor · review · analyze · test · docs)
- **checklists/done-criteria.md** — acceptance criteria that define "done"

## Update

```bash
npm install -g buddyx@latest
buddyx update --ai claude       # re-copy the latest bundled skill over an existing install
```

## Uninstall

```bash
buddyx uninstall --ai claude
buddyx uninstall --global
buddyx uninstall               # detect installs in the current project and confirm
```

## CLI reference

| Command | Description |
|---|---|
| `buddyx init [--ai <type>] [--global] [--force]` | Install the skill |
| `buddyx update [--ai <type>] [--global]` | Re-copy the bundled skill over an existing install |
| `buddyx uninstall [--ai <type>] [--global]` | Remove the skill |
| `buddyx versions` | Print the CLI version |

## License

MIT © Chintan Bagdawala
