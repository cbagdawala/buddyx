# Workflow — analyze

`/buddyx analyze <target>` — understand code, structure, or requirements. Read-only:
no plan gate, no mutation, but still route and report.

## Steps

1. **Scope** — what's being analyzed (a module, the whole codebase, a requirement doc,
   an architecture question).
2. **Route** — pick the relevant analyzer/domain agent. For a broad sweep, fan out
   read-only agents by area (backend / frontend / data / tests) **in parallel** and merge.
3. **Delegate read-only** — analyzers get `Read, Grep, Glob` only.
4. **Synthesize** — merge findings into one coherent picture; resolve contradictions
   between agents rather than pasting raw dumps.
5. **Report** — standard block with `Verification: N/A — read-only`. Lead with the
   conclusion, then the evidence, then recommendations.

## Good analysis

- Answers the question asked; doesn't drift into unrelated exploration.
- Distinguishes fact (found in code) from inference (likely, but verify).
- Ends with concrete, prioritized recommendations — not just observations.
