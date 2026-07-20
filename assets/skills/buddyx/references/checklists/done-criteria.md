# Acceptance Criteria — "done" per command

BuddyX does not declare a command `done` until its criteria are met. Use this as the
verify checklist.

## create (module / feature)
- [ ] All planned files created.
- [ ] Wired/registered where the framework requires (routes, providers, exports, DI).
- [ ] Follows existing project conventions and structure.
- [ ] Tests written and passing for the new behavior.
- [ ] Minimal docs updated (README/API entry) if the feature is user-facing.
- [ ] Review gate clean (or findings reported).

## create (component)
- [ ] Component created and importable.
- [ ] Props/inputs and events/outputs match the design/request.
- [ ] Matches the project's UI conventions.
- [ ] Rendered/used in at least one place, or a usage example provided.
- [ ] Review gate clean.

## refactor
- [ ] Behavior preserved (existing tests pass).
- [ ] No unrelated feature changes mixed in.
- [ ] Conventions matched; complexity reduced or clarity improved.
- [ ] Review gate confirms no unintended behavior change.

## test
- [ ] Tests assert real behavior (not coverage padding).
- [ ] Suite runs; results reported honestly (pass/fail counts).
- [ ] Edge cases and failure modes covered, not just happy path.

## docs
- [ ] Content verified against the actual code.
- [ ] Matches project doc style and location.
- [ ] Examples are runnable / signatures are real.

## analyze / review
- [ ] Answers the question asked.
- [ ] Findings ranked by severity with concrete, actionable fixes.
- [ ] Fact vs inference distinguished.

## agent create
- [ ] Meets the quality bar in `../agent-spec.md` (frontmatter, least-privilege tools,
      routing-quality description, no overlap).
- [ ] Registered in the session capability index.
