# Workflow — test

`/buddyx test <target>` — create or run tests.

## Steps

1. **Determine intent** — write new tests, run existing ones, or both.
2. **Plan (if writing)** — identify what needs coverage: happy paths, edge cases, failure
   modes, and the acceptance criteria the tests must encode.
3. **Route** — to the `testing` agent (or the domain agent if none exists). The testing
   agent needs `Read, Write, Edit, Bash` (to run the suite).
4. **Delegate** — for a large surface, split by module and parallelize test authoring.
5. **Run & report results honestly** — execute the suite. If tests fail, the outcome is
   `partial`/`blocked` with the failing tests named and the actual output shown — never
   claim green when it's red.
6. **Report** — standard block; include pass/fail counts and coverage delta if available.

## Notes

- New tests must actually **assert behavior**, not just execute code for coverage numbers.
- When tests are added to enable a refactor, write them as characterization tests **first**
  (capturing current behavior), then refactor against them.
