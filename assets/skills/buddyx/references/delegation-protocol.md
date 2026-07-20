# Delegation Protocol

How BuddyX turns a routing decision into executed work. Read this before delegating.

## 1. Decide the delegation mode

| Harness capability | Mode | How |
|---|---|---|
| Supports programmatic sub-agents (Claude Code, etc.) | **Real sub-agent** | Agent/Task tool with `subagent_type: <name>` |
| No sub-agent support, or agent file has no frontmatter | **Inline role** | Read the agent file, adopt its role in the current context |

Prefer **real sub-agent** whenever available — it isolates the specialist's context
(BuddyX's window stays clean), scopes tools to least privilege, and unlocks parallelism.

## 2. Classify the subtasks: parallel vs sequential

Before invoking anything, decompose the command into subtasks and mark each edge:

- **Independent** → run **concurrently**. Launch multiple sub-agents in a single turn
  (multiple Agent calls in one message) so they execute at the same time.
- **Dependent** (B needs A's output) → run **sequentially**, passing A's result into B.

> Example — `create <module>`: `backend-architect` (API skeleton), `db-migration`
> (schema), and `testing` (test scaffolding) can start **in parallel**; wiring the
> pieces together and the **verify gate** run **after** they join.

Default to parallel for independent work — sequential-by-habit is the most common way an
orchestrator wastes wall-clock.

## 3. Delegate with a tight brief

Each sub-agent invocation must carry:
- **Goal** — the one outcome this agent owns.
- **Context** — relevant files/paths, conventions, and the parent task it serves.
- **Constraints** — what not to touch, style/security rules, acceptance criteria.
- **Return contract** — what to hand back (a diff summary, a file list, a verdict).

Do **not** dump BuddyX's whole conversation into the sub-agent. Give it the slice it needs.

## 4. Join results

- Collect each sub-agent's return value. If any failed, apply the recovery policy below.
- Reconcile overlaps (two agents touching the same file) before proceeding.
- Only then move to the **verify** step.

## 5. Recovery policy (partial failure is normal)

1. **Retry once** if the failure looks transient (tool error, timeout).
2. **Fall back** to an alternate agent, or handle inline, if retry fails.
3. **On multi-agent partial failure**, do not silently drop the branch: report which
   subtask failed, what completed, and offer options (retry / skip / hand to user).
4. Never declare the command done while a required subtask is unresolved.

## 6. Inline-role degradation (non-Claude harnesses)

When you can't spawn a sub-agent:
- Read the target agent file. Announce: "Acting as **<agent>** for this step."
- Follow its instructions faithfully, then explicitly exit the role.
- You lose isolation and parallelism — sequence the work and keep BuddyX's summary tight
  so context doesn't bloat.

## Anti-patterns

- Reading an agent file and calling that "delegation" when the harness could have spawned
  a real sub-agent.
- Running independent agents one-by-one.
- Passing an agent no acceptance criteria, then trusting its output without a verify gate.
- Letting a failed sub-agent vanish from the final report.
