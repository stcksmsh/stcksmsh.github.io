# IO Site — Durable Overseer State

> This file is the restart checkpoint. Update it before clearing/restarting the overseer. Keep it concise and factual.

## Current status

- **Phase:** Milestone 1 — concepts delivered, awaiting owner visual decision
- **Current milestone:** Baseline + factual content audit + three visual prototypes
- **Repository:** `stcksmsh/stcksmsh.github.io` — verified (origin `git@github.com:stcksmsh/stcksmsh.github.io.git`, default `main`)
- **Branch:** `main`, in sync with `origin/main`
- **HEAD:** `dfe539b` Pin sinteza-viz to hysteresis#ts-final
- **Working tree:** untracked `docs/agent-handoff/` (this kit) and `public/demo/mouthpiece/` (pre-existing, not from this kit — owner to say whether it's meant to be committed)
- **Worktrees / PRs:** single worktree; ~18 stale `origin/claude/*` branches; no open PRs checked (gh output empty)
- **Last verified build:** 2026-11-19, `npm run build` → federate OK, 13 pages built, Complete (local machine, not sandbox)
- Brief delivered 2026-11-19 → `io-site-implementation-brief.md`.
- Owner: CV facts "use as is" for now (audit items stay open, not blocking).

## Decisions

### DECIDED
- Root is a personal/professional profile, not a long-form blog or directory of every activity.
- Root composition: editorial introduction + structured professional profile.
- Independent web experiences should retain independent design and technical freedom.
- Preserve existing `io-page` compatibility during the first root redesign.
- Root/CV must not mount the old persistent global visualizer/audio player.
- The previous visual mockups are not approved final designs.

### PROPOSED
- `website` branch convention for self-contained independently deployed project sites; pilot before standardizing.
- Use three comparable rendered root concepts as the next visual-design gate.

### OPEN
- Exact root visual identity.
- Portrait/photo or alternative visual anchor.
- Exact prominence and presentation of mathematics background.
- Any disputed/stale CV facts.
- Production domain routing and DNS verification.

## Milestones

| Milestone | Status | Evidence / commit |
|---|---|---|
| Consolidated implementation brief | Complete | `io-site-implementation-brief.md` |
| Agent operating model and overseer skill | Complete | This package |
| Repository baseline audit | Complete 2026-11-19 | See "Current status" |
| CV/content factual audit | Draft complete; owner: use as is for now | `CONTENT_AUDIT.md` |
| Three rendered root concepts | Complete | `CONCEPTS.md`, `src/pages/proto/`, `proto-shots/` |
| Owner visual decision | Not started | — |
| Root + CV implementation | Not started | — |

## Active tasks / agents

None yet.

For each active task record:
- agent/session:
- task:
- branch/worktree:
- expected output:
- status/blocker:

## Known architectural constraints

- Existing repo uses Astro + React islands + MDX + GitHub Actions/Pages (reverify current state).
- Existing federation uses `projects.manifest.json`, `scripts/federate.ts`, `io-page` branches and optional `page/entry.tsx`.
- The root homepage must not depend on successful live project federation.
- Do not refactor federation and global audio/visualizer systems during the first visual milestone.
- No shared design system/framework across all future sites by default.

## Last session checkpoint

- 2026-11-19: kit placed in `docs/agent-handoff/`; baseline verified; `CONTENT_AUDIT.md` written. No site code changed.
- Skill not installed: name `overseer` collides with the user's global Hysteresis `overseer` skill.

## Next exact action

1. Owner picks A / B / C (or a combination) from `CONCEPTS.md`.
2. Then milestone 2: new clean layout (no Base.astro), promote the chosen concept to `/`, restyle `/cv` to match + print check, delete `src/pages/proto/`. Before that, do a keyboard walkthrough and get an independent review.
