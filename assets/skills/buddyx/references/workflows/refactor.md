# Workflow — refactor

`/buddyx refactor <target>` — improve existing code without changing behavior.

## Steps

1. **Analyze first** — run `analyze.md` on the target to map what it does and its
   dependents. Never refactor blind.
2. **Plan** — state the refactor's goal, the invariants that must hold (behavior, public
   API), and the acceptance criteria. Present the plan for anything beyond a local change;
   refactors are behavior-preserving by contract, so scope creep is the main risk.
3. **Route** — pick the domain agent for the code being touched. For cross-cutting
   changes, decompose and route per area.
4. **Delegate** — sequence changes that share files; parallelize independent areas.
   Instruct each agent: **preserve behavior**, match existing conventions, no scope creep.
5. **Verify (mandatory)** — the review gate is not optional for refactors:
   - Run the existing tests; they must still pass.
   - Route the diff to a reviewer for behavior-change detection.
   - If coverage is thin, have the `testing` agent add characterization tests first.
6. **Report** — standard block; explicitly confirm "behavior preserved" or flag any
   intentional/unintentional change.

## Guardrails

- A refactor that changes behavior is a **bug** unless the user asked for it — surface it.
- Don't mix refactor + feature work in one pass; separate the concerns.
- Prefer many small, verified steps over one large rewrite.
