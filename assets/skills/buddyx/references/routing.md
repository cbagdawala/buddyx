# Routing — matching a task to a sub-agent

How BuddyX picks who does the work. Route on **capability**, not on filename guesses.

## 1. Build the capability index (once per session)

List the agents directory (see SKILL.md for the resolution order). For each agent file,
read only its frontmatter and record:

```
name · description · tools · model · has_frontmatter(bool)
```

Cache this for the session. Don't re-read every file on every request. Refresh only if the
user adds/edits agents or runs `agent list`.

`agent list` = print this index: each agent's `name`, its `model` tier, and a one-line
purpose from its `description`. Flag any without frontmatter as "role-doc only (inline)",
and any without `model:` as "inherits session model — suggest a tier".

## 2. Match the task to an agent

Match the task's intent against each agent's **`description`** (that field exists for
exactly this). Score on:
- Direct capability overlap (the description names this kind of work).
- Boundary fit (the description doesn't exclude it).
- Specificity (prefer the narrowest agent that fully covers the task).

Once matched, pick the tier for this call: the agent's `model:` unless the subtask is
clearly lighter or heavier than its usual work (`model-tiers.md`).

## 3. Tie-breaks

- **Two agents overlap** → prefer the **more specific** one; if truly equal, prefer the
  one whose `tools:` are sufficient but smaller (least privilege), then the one on the
  cheaper `model:` tier.
- **A task spans multiple agents** → don't force one agent; **decompose** and route each
  part (then parallelize per `delegation-protocol.md`).
- **Ambiguous intent** → ask the user one clarifying question rather than guessing.

## 4. Fallback ladder (no clean match)

1. **Stretch** — can an existing agent reasonably cover it within its scope? Use it.
2. **Create** — is this a recurring need? Create a new agent (`agent-spec.md`), then route.
3. **Handle inline** — one-off and no agent fits? BuddyX does it directly, and notes that
   a future agent might be worth creating.

Never invent a `subagent_type` that isn't in the index — that call will fail. Only route to
names you actually found.

## 5. Routing hygiene

- Duplicate/near-duplicate agents split the routing signal — flag them and suggest merging.
- A "does everything" agent defeats routing — suggest splitting it.
- If most requests fall through to "handle inline", the agent set is too thin — proactively
  suggest which agents to create.
