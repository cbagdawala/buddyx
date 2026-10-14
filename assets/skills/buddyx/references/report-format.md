# Report Format

Every BuddyX command closes with a consistent result block. Predictable output is what
makes the orchestrator usable in a team setting.

## Standard result block

```
## BuddyX — <command> <target>

**Outcome:** <done | partial | blocked>

**Agents used:**
- <agent-a> (real sub-agent · <tier> | inline) — <what it did>
- <agent-b> (real sub-agent · sonnet → opus) — <what it did; escalated because …>

**Artifacts changed:**
- <path> — <created | modified | deleted>

**Verification:** <what gate ran and its result — tests passed / review clean / N/A>

**Next steps:**
- <actionable follow-up, or "none — ready to use">
```

## Rules

- **Always state verification.** If nothing was verified, say so explicitly (`N/A — read-only`)
  rather than implying success.
- **Be honest about partial/blocked.** If a sub-agent failed, the outcome is `partial` and
  the failed subtask is named — never round up to `done`.
- **Show the tier** each sub-agent ran on, and any escalation with its reason — that's how
  the user spots an agent whose default `model:` is set too low (or too high).
- **List real artifacts**, not intentions. If a file was planned but not written, it goes
  under Next steps, not Artifacts changed.
- **Keep it scannable.** This is a summary, not a transcript. Detail lives in the diffs.

## Progress updates (multi-step work)

Between steps of a long command, emit a one-line progress note:
`▸ <agent> done (<n> files) — starting <next>`. Don't narrate every tool call.
