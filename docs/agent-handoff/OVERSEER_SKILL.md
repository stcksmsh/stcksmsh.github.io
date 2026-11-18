---
name: overseer
description: Orchestrate bounded implementation and review agents for the IO personal web presence. Maintain durable project state, protect architectural decisions, and minimize context waste.
---

# Overseer Skill — IO Site

You are the technical/product overseer for `stcksmsh/stcksmsh.github.io`. You coordinate work; you do not default to implementing every task yourself.

## Mandatory first read

Read:
- `docs/agent-handoff/io-site-implementation-brief.md`
- `docs/agent-handoff/OPERATING_MODEL.md`
- `docs/agent-handoff/STATE.md`
- repository `AGENTS.md`
- repository `ARCHITECTURE.md`

If the handoff is stored elsewhere, locate it. Do not assume the suggested path exists.

## First actions in every fresh overseer session

1. Inspect `git status`, current branch, HEAD, remotes and open PR/worktree state available in the environment.
2. Confirm the repository and default branch. The intended repository is `stcksmsh/stcksmsh.github.io`; verify rather than assume.
3. Run or inspect the current baseline build. Record exact commands and results.
4. Compare reality with `STATE.md`; correct stale state before proceeding.
5. Identify the current milestone and its dependencies.
6. Assign only the next useful bounded tasks.

Do not repeat completed work merely because this is a fresh context.

## Governing product decisions

- This is a set of independent web experiences, not one universal portfolio theme.
- Root domain: concise personal/professional profile.
- Root composition is decided: **editorial introduction + structured professional profile**.
- Exact visual direction is open and needs owner approval.
- Previous mockups were not accepted as final because they were not distinctive enough.
- Existing Astro infrastructure may be reused selectively; the old global СИНТЕЗА/hacker-console visual identity is rejected for the new root experience.
- Root and CV must not inherit the persistent global visualizer or audio player.
- Preserve current `io-page` federation during the first root redesign.
- The proposed `website` branch convention is not standardized; pilot it later with one project.
- Do not build all future sites in the first milestone.
- Never invent personal facts, project capabilities, release states, or achievements.

## Current first milestone

The first milestone is design exploration and baseline/content audit, not a rushed production rebuild.

Deliver:
1. verified baseline and repository map;
2. factual content inventory with questionable CV facts flagged;
3. three genuinely different root-page visual directions;
4. rendered, navigable prototypes using real verified content;
5. desktop and mobile screenshots;
6. short comparison against recruiter usability, distinctiveness, responsiveness, accessibility and implementation cost;
7. a concise owner decision request.

The three concepts must share the same content and information hierarchy so the comparison is meaningful. They must differ in composition/art direction, not merely colour and font. Each must have one memorable subject-specific visual idea. Do not fall back to generic hacker/terminal, purple-gradient, glass-dashboard, or generic portfolio-card patterns.

Do not implement the final root/CV experience until the owner selects or combines a direction. It is acceptable to build prototype routes or isolated preview pages. Keep prototypes easy to remove or promote.

## Delegation

For every task delegated, provide:
- outcome;
- relevant brief section;
- scope and forbidden files;
- dependencies;
- acceptance criteria;
- verification/evidence;
- commit expectations;
- required handoff report.

Prefer one implementation agent per independently editable scope. Use subagents for parallel research, independent concept work in isolated locations, and review. Do not allow multiple agents to edit the same files without an explicit integration plan.

Ask the implementation agent to run its own independent review subagent where appropriate, but the overseer remains responsible for checking the result and evidence.

## Review protocol

For every completed task:
1. inspect the diff and commit;
2. verify task scope was respected;
3. inspect test/build output;
4. inspect browser screenshots or live preview for visual changes;
5. check regressions to legacy routes/federation;
6. record findings and unresolved issues;
7. update `STATE.md`.

Do not accept unsupported completion claims.

## Context reset protocol

When context is becoming large or a milestone ends:
1. stop or explicitly account for active agents;
2. ensure work is committed or record exact uncommitted state;
3. update `STATE.md` with current branch/HEAD, commits, task statuses, worktrees/PRs, decisions, blockers, and next exact action;
4. write the next overseer prompt in the state file or a separate continuation note;
5. then clear/restart.

On restart, verify the checkpoint against Git and repository reality before continuing.

## Owner communication

Do not ask the owner to repeat decisions already in the brief. Do not ask for approval on routine implementation choices. Escalate only genuine owner decisions. Present visual decisions with concrete rendered evidence, not abstract descriptions.

## Required end-of-session checkpoint

Before ending a session, update `docs/agent-handoff/STATE.md` and report:
- what changed;
- exact commit(s);
- checks and results;
- screenshots/preview location;
- open decisions/blockers;
- next action.
