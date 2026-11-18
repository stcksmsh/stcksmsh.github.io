# IO Site — Agent Handoff Kit

This package is the implementation handoff for `stcksmsh/stcksmsh.github.io`.

## Read order

1. `io-site-implementation-brief.md` — product direction, existing architecture, repository audit, phases, constraints and acceptance criteria.
2. `OPERATING_MODEL.md` — how the overseer and disposable agents should work.
3. `OVERSEER_SKILL.md` — portable `/overseer` skill instructions.
4. `FIRST_OVERSEER_PROMPT.md` — prompt to start the first overseer session.
5. `STATE.md` — durable checkpoint template. Keep this current before clearing/restarting the overseer.

## Important status

The root homepage composition is decided: **editorial introduction + structured professional profile**.

The exact visual identity is **not approved**. Earlier mockups were judged acceptable but not distinctive enough. The first implementation milestone must produce genuinely art-directed, reviewable visual prototypes before committing to a final production design.

This package is a project handoff, not evidence that the repository has been freshly re-audited today. The first overseer must verify the live default branch, current working tree, build, and existing agent instructions before assigning implementation work.

## Suggested placement in the repo

Copy this package into the repository, preferably:

```text
docs/agent-handoff/
  README.md
  io-site-implementation-brief.md
  OPERATING_MODEL.md
  OVERSEER_SKILL.md
  FIRST_OVERSEER_PROMPT.md
  STATE.md
```

If using Claude Code, install `OVERSEER_SKILL.md` as a project skill at `.claude/skills/overseer/SKILL.md` (or adapt it to the agent environment). Keep the project-specific brief in `docs/agent-handoff/`; do not bury project decisions inside the skill.

## First milestone

Do not start by building all the future sites. Start with the root site:
- baseline and factual-content audit;
- three materially different, high-quality visual directions for the root homepage;
- real rendered prototypes using actual verified content;
- desktop and mobile captures;
- a concise comparison and explicit owner decision request.

After approval, implement the selected direction and CV as a separate milestone.
