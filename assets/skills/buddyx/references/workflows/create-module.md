# Workflow — create (module / component / feature)

`/buddyx create <target> <type>` — build something new. This is the flagship
multi-agent, plan-gated, verified workflow.

## Steps

1. **Parse** — identify the target and type (module, component, service, page, agent…).
   For `create <name> agent`, switch to `../agent-spec.md` instead.
2. **Plan** — write the plan (todo tool or `BUDDYX_PLAN.md`): the pieces to build, which
   sub-agent owns each, the parallel/sequential shape, and acceptance criteria from
   `../checklists/done-criteria.md`. For large/destructive scope, present it and get a
   go-ahead.
3. **Route** — match each piece to a sub-agent (`../routing.md`). Create missing agents
   via `../agent-spec.md`.
4. **Delegate** — per `../delegation-protocol.md`:
   - Fan out **independent** pieces in parallel (e.g. backend skeleton, DB schema, test
     scaffolding).
   - Sequence **dependent** pieces (wiring depends on the pieces existing).
5. **Join** — reconcile overlapping edits; resolve any sub-agent failure via the recovery
   policy.
6. **Verify** — run the review gate (`review.md`): route the diff to a reviewer/tester
   agent. Fix or report findings before declaring done.
7. **Report** — standard block (`../report-format.md`) with the acceptance-criteria status.

## Definition of done

A `create` is not done until its `../checklists/done-criteria.md` entry is satisfied —
typically: files created **and** registered/wired **and** tested **and** documented.

## Notes

- Prefer the smallest set of agents that covers the work; don't spin up an agent per file.
- If the same file is owned by two agents, split the responsibility or sequence them.
