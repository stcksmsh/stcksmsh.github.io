# Agent Operating Model

## Recommendation

Use **one persistent overseer session + disposable implementation agents**. Use subagents as a tool available to the overseer, not as the default ownership structure.

The overseer is the continuity layer. Implementation agents are replaceable workers. The repository and this handoff kit are the durable memory.

## Roles

### Owner
- Owns product decisions and final visual approval.
- Approves material scope changes, factual claims, production domain/DNS changes, secrets/permissions, and deployment changes.
- Does not need to approve routine implementation details.

### Overseer
- Maintains the project plan and durable state.
- Reads the brief, inspects the current repository, and establishes the actual baseline.
- Converts the plan into small, bounded tasks.
- Assigns implementation/research/review agents.
- Prevents scope collisions and resolves agent disagreements.
- Reviews evidence, not just summaries.
- Keeps decisions and status synchronized in `STATE.md`.
- Does not silently decide owner-only questions.

### Implementation agent
- Receives one bounded task and explicit acceptance criteria.
- Inspects the relevant code before editing.
- Owns its task through implementation, tests, screenshots/evidence, and commit.
- Avoids unrelated cleanup and broad refactors.
- Reports exact commit(s), files changed, checks run, results, and remaining issues.

### Review agent
- Independently checks a specific change against the task and acceptance criteria.
- Preferably does not share the implementation agent's assumptions.
- Reports concrete findings with file/line references and severity.
- Does not rewrite the implementation unless explicitly assigned a fix task.

## When to use parallel subagents

Good parallel tasks:
- independent repository reconnaissance;
- factual CV/content audit;
- visual design critique of separate concepts;
- accessibility/performance review;
- independent review of a completed PR/commit.

Avoid parallel agents when:
- they will edit the same files;
- one task depends on decisions another agent has not made;
- they are both defining the same architecture;
- coordination cost is likely to exceed the saved time.

A useful pattern is: one agent implements, one independent agent reviews after the implementation is stable. For design exploration, separate agents may each create an isolated concept in separate routes/branches/worktrees, but one overseer must enforce a shared content brief and compare them consistently.

## Task contract

Every implementation task must contain:

1. **Objective** — one outcome, not a vague area.
2. **Context** — relevant brief sections and current state.
3. **Allowed scope** — files/directories or clear boundaries.
4. **Forbidden scope** — what must not be changed.
5. **Acceptance criteria** — observable conditions.
6. **Verification** — exact commands, browser checks, screenshots or other evidence.
7. **Commit requirement** — commit frequently; do not leave uncommitted work unless requested.
8. **Handoff format** — commit hash, files, checks/results, caveats, next dependency.

Agents must not infer permission to deploy, change DNS, alter secrets, or change repository settings from permission to edit code.

## Context and usage management

Do not clear an overseer merely because a fixed amount of time has passed. Clear it when its context is large, stale, or becoming unreliable, or when a major milestone is complete.

Before clearing:
- stop active tasks or record their exact status;
- ensure every completed task is committed;
- update `STATE.md`;
- record the current branch and HEAD commit;
- list open PRs/worktrees and who owns them;
- record decisions and unresolved owner questions;
- write the next exact action and the prompt needed to continue.

A new overseer must:
1. read this operating model and project brief;
2. read `STATE.md`;
3. inspect the actual repository and Git state;
4. verify that the recorded state matches reality;
5. continue from the next action without redoing completed work.

Never rely on chat history as the only source of project state.

## Durable state rules

`STATE.md` is a concise checkpoint, not a second copy of the whole brief. Keep:
- current objective and phase;
- current branch/commit;
- completed milestones with commit references;
- active agents/tasks and their worktrees/branches;
- decisions (DECIDED / PROPOSED / OPEN);
- blockers and owner questions;
- next action.

The full brief remains the source of product and architecture direction. If a decision changes, update the brief and state together.

## Quality bar

- A successful typecheck is not proof of a working site.
- Visual work requires actual browser inspection at desktop and mobile sizes.
- CV work requires print/PDF inspection.
- Accessibility requires keyboard/focus and reduced-motion checks, not just semantic markup.
- Do not accept “looks good” without screenshots or a live preview.
- Do not accept “tests pass” without the actual command and result.
- Keep the root homepage independent of live project federation.
- Preserve legacy routes and `io-page` federation until migration is deliberately approved.

## Escalation

Stop and ask the owner only for:
- disputed or missing personal facts;
- portrait/photo selection or other genuinely personal assets;
- major visual-direction choice after presenting evidence;
- domain/DNS/hosting changes;
- production deployment or repository permission changes;
- a scope/architecture change that contradicts the brief.

Make reasonable local decisions for routine engineering details and document them.
