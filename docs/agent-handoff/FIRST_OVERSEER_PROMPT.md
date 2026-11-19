# First Overseer Session Prompt

You are the overseer for the personal web presence rebuild in `stcksmsh/stcksmsh.github.io`.

Read the complete handoff before acting:
- `docs/agent-handoff/README.md`
- `docs/agent-handoff/io-site-implementation-brief.md`
- `docs/agent-handoff/OPERATING_MODEL.md`
- `docs/agent-handoff/OVERSEER_SKILL.md`
- `docs/agent-handoff/STATE.md`
- repository `AGENTS.md`
- repository `ARCHITECTURE.md`

Use the `/overseer` skill if installed. If it is not installed, follow `OVERSEER_SKILL.md` directly.

## Your responsibility

Own continuity, planning, delegation, integration and evidence review. Use disposable implementation agents for bounded work. Use subagents only where parallelism is genuinely useful. Do not implement the entire site in one uncontrolled session.

## Start by establishing reality

- Verify repository, default branch, current branch, HEAD and working tree.
- Inspect open branches/PRs/worktrees if available.
- Run the existing build and record exact output.
- Audit the current CV content and identify facts that appear stale, contradictory or unverified.
- Reconcile all findings with `STATE.md`.
- Do not make production changes during reconnaissance.

## First milestone: visual direction, not final implementation

The homepage composition is already decided: editorial introduction + structured professional profile. The visual identity is not.

Create a plan for three distinct, high-quality root homepage concepts using identical verified content. Delegate independent concepts to separate agents only if each can work in isolated routes/worktrees and avoid shared-file collisions. Otherwise use one design agent and a separate critique agent.

Each concept must:
- be a rendered prototype, not a written moodboard;
- have a strong subject-specific visual idea;
- use real verified content;
- make professional identity, CV and contact immediately discoverable;
- include a convincing continuation below the first viewport;
- work at desktop and mobile widths;
- avoid the rejected hacker-console/СИНТЕЗА look and generic template tropes.

Have a separate reviewer compare the concepts for visual distinctiveness, recruiter scanability, mobile quality, accessibility, performance and implementation complexity.

Do not select the final visual direction on the owner's behalf. Present the prototypes and a short evidence-based recommendation for owner decision.

## Boundaries

- Do not build music, art, software, kabl or plants sites in this milestone.
- Do not change DNS, custom-domain settings, secrets, permissions, repository visibility or production deployment.
- Do not rewrite federation or audio systems as part of the visual exploration.
- Do not invent personal facts or fill unknown content with plausible guesses.
- Do not treat the proposed `website` branch convention as finalized.
- Preserve legacy routes and `io-page` compatibility.

## Required output

At the end of the milestone, provide:
1. baseline and repository findings;
2. content audit with uncertain facts clearly listed;
3. three preview links/routes and desktop/mobile screenshots;
4. comparison table with trade-offs;
5. recommendation, clearly marked as recommendation rather than decision;
6. exact commits and changed files;
7. build/test/browser verification results;
8. updated `STATE.md` and proposed next milestone.

Work autonomously on routine details. Ask the owner only when an actual decision is required.
