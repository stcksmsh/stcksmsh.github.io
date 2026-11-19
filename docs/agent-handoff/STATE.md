# IO Site — Durable Overseer State

> This file is the restart checkpoint. Update it before clearing/restarting the overseer. Keep it concise and factual.

## Current status

- **Phase:** Milestone 2: concept C promoted to `/` and `/cv` on the branch; awaiting owner review + merge
- **Current milestone:** Baseline + factual content audit + three visual prototypes
- **Repository:** `stcksmsh/stcksmsh.github.io` — verified (origin `git@github.com:stcksmsh/stcksmsh.github.io.git`, default `main`)
- **Branch:** `proto/root-concepts` (local, not pushed), branched from `main` @ `dfe539b`
- **HEAD:** see `git log -1` on `proto/root-concepts`
- **Working tree:** clean apart from `public/demo/mouthpiece/` (pre-existing, not from this kit — owner to say whether it's meant to be committed)
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
| Three rendered root concepts | Complete + reviewed + fixed | `CONCEPTS.md`, `src/pages/proto/`, `proto-shots/` |
| Clean layout + shared profile data | Complete (used by prototypes) | `src/layouts/Profile.astro`, `src/data/profile.ts` |
| CV prototypes per concept + print check | Complete | `/proto/{a,b,c}-cv`, `proto-shots/*-cv.pdf` |
| Owner visual decision | **C — Datasheet** (2026-11-20, "C is ok") | — |
| Root + CV implementation | Done on branch, not merged/deployed | `src/pages/index.astro`, `src/pages/cv.astro`, `shots-final/` |

## Active tasks / agents

None. (One read-only review agent ran 2026-11-20 and finished; its findings are summarised in CONCEPTS.md.)

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

- 2026-11-20 (overnight): Profile layout + data module, CV prototypes, independent review + fixes, keyboard/print/overflow checks. Branch `proto/root-concepts`, local only, not pushed.
- 2026-11-19: kit placed in `docs/agent-handoff/`; baseline verified; `CONTENT_AUDIT.md` written. Prototype routes added under `src/pages/proto/` only; no existing page touched.
- Skill not installed: name `overseer` collides with the user's global Hysteresis `overseer` skill.

## Next exact action

1. Owner reviews `/` and `/cv` locally (`npm run dev`) or via `shots-final/`, then approves merge of `proto/root-concepts` → `main` (merging deploys via Pages).
2. Still-open owner questions: C's joke labels ("Ordering information", "In production"); 2-page vs 1-page CV; `public/demo/` commit; the old CV summary paragraph was dropped (it contained the overstated "IOI honors"). Supply a corrected one if wanted.
3. Afterwards (brief Phase 2): polish, OG image, custom domain (owner-gated); later phases per brief §9.
