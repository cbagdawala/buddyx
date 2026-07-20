# BuddyX (`buddyx`)

A cross-harness **Agent Skill** that turns your AI coding assistant into **BuddyX**, a
master orchestrator: it parses a `/buddyx` command, routes the task to the most suitable
specialized sub-agent in your project, creates a new agent when none fits, coordinates
multi-step work, and reports progress — distributed as an npm CLI that installs the skill
into **Claude Code**, **opencode**, and other assistants.

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

## Supported assistants

`claude` (Claude Code) · `opencode` · `cursor` · `windsurf` · `codex` · `gemini` ·
`antigravity` — or `all`.

Each install is self-contained: `SKILL.md` is copied into
`<assistant-dir>/skills/buddyx/`.

## What BuddyX does

BuddyX is an **orchestrator**, not a stack. It ships no sub-agents of its own — instead it
**discovers the specialized agents already in your project** (`.claude/agents/`,
`.opencode/agent/`, etc.), delegates to the best match, and creates a new agent when none
fits.

### Commands

```
/buddyx <action> [target] [options]
```

| Command | Description |
|---|---|
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
