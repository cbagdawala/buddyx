# Workflow — docs

`/buddyx docs <target>` — generate or update documentation.

## Steps

1. **Scope** — API reference, module README, setup guide, architecture note, changelog.
2. **Analyze the source of truth** — read the actual code/config first. Docs describe what
   *is*, not what was intended. Route to a read-only analyzer to gather facts.
3. **Route** — to a docs/domain agent; the writer needs `Read, Write, Edit`.
4. **Delegate** — for multi-section docs, split by section and parallelize.
5. **Verify** — check the docs against the code (do the endpoints/params/commands actually
   exist and match?). Stale or wrong docs are worse than none.
6. **Report** — standard block listing the doc files written/updated.

## Notes

- Match the project's existing doc style and location.
- Never document a flag, endpoint, or file you haven't confirmed exists.
- Keep examples runnable — copy real signatures, not plausible-looking ones.
