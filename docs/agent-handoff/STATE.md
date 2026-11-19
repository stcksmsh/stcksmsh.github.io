# IO Site — Durable Overseer State

> Restart checkpoint. Update before clearing/restarting the overseer. Concise and factual. Verify against `git log` / the build before trusting it.

## Current status (2026-11-20)

- **Repo:** `stcksmsh/stcksmsh.github.io` (origin `git@github.com:stcksmsh/stcksmsh.github.io.git`, default `main`, deploys to GitHub Pages on push to `main`).
- **Work branch:** `proto/root-concepts`. **Local only, never pushed.** It branched from `main` @ `dfe539b`; all work below lives there. Merging to `main` = production deploy, which is owner-gated.
- **Untracked, not ours:** `public/demo/` (pre-existing; the owner hasn't said whether to commit it). Don't touch it.
- **Local demo:** `npx astro build && npx astro preview --port 4329 --host 127.0.0.1` gives `/`, `/cv`, `/next`.
- **Last verified:** full `npm run build` (federate + astro) OK. `npm run test:publication` 8/8. `/`, `/cv` and `/next` checked in headless Chrome at 1440/390/320px: no overflow, no console errors, no broken links, keyboard focus works, reduced motion is static.
- **Playwright** for checks: installed in `$CLAUDE_JOB_DIR/tmp` from an earlier job, which may be gone. If so, reinstall in a scratch dir (`npm i playwright@1.55.0`) and launch with `executablePath: "/usr/bin/google-chrome"`. Use `waitUntil: "load"` + `document.fonts.ready`, not `networkidle` (legacy pages never go idle because of embeds).

## What exists on the branch

| Area | State | Where |
|---|---|---|
| Handoff kit + brief | In repo | `docs/agent-handoff/` (`io-site-implementation-brief.md` is the product spec) |
| Clean layout (no visualizer/player/global CSS) | Done | `src/layouts/Profile.astro` |
| Shared facts | Done | `src/data/profile.ts` (identity, CV collection loader, `domains` pins, `projectDomains` map, `toYear`) |
| CV `/cv` | **Owner: final for now** ("perfect for a CV") | `src/pages/cv.astro`, datasheet style, A4 print = 2 pages |
| Homepage `/` | Datasheet skin, approved earlier ("C is ok"), with round-1 feedback applied | `src/pages/index.astro` |
| Homepage board skin `/next` | **Preview, awaiting owner comparison** | `src/pages/next.astro` + routing/layout in `src/lib/board.ts` |
| Skills | Grouped; optional `items` field added to the cv schema | `src/content/cv/skill-*.md` |
| Level 3 publication arch (pilot) | Merged, untested against a real deploy | `scripts/publication.ts`, `scripts/federate.ts`, `scripts/new-project-site.sh`, `docs/project-repo-example/website/`, `src/lib/listing.ts`, AGENTS.md section |
| Screenshots/videos | Committed | `docs/agent-handoff/shots-final/` (datasheet), `shots-next/` (board), `proto-shots/` (original A/B/C concepts) |

### Board skin (`/next`) details
- The profile is drawn as a PCB. The KV chip has 8 numbered pin pads (MATH, SYSTEMS, TOOLS, ANDROID | AUDIO, CREATIVE, WEB, AUTO).
- Each project or record is a part wired to its domains: J1 = work, Y1 = olympiads, U20 = ETF, U2–U7 = featured projects. The contact links are the edge-connector fingers.
- Routing is deterministic, built in `buildBoard()` (chamfered traces, nested lanes, a cross-chip band). Narrow screens use `mode: "stack"` + `maxPads: 1`.
- Interaction:
  - Hover/focus a part, a pin pad or a trace to light its net and dim the rest; the probe panel lists what's on it.
  - SMIL pulses run along the traces; `svg.pauseAnimations()` under reduced motion.
  - Name letters widen toward the pointer (Archivo `wdth`).
- Parts link to `p.url ?? /projects/<slug>`.

### Datasheet homepage (`/`) details
- An interactive pin figure: clicking a pin lists its matching records under the chip, and each one jump-links to the record. MOBILE was renamed ANDROID and all jobs are tagged android+auto.
- A timeline ruler (2018→now) with a sweeping scan head; hover/focus shows each record.
- Scroll reveals and a status LED.

### Level 3 architecture (brief §6), PROPOSED/pilot
- The manifest entry `"website": true` (or a branch name) makes federate read **only** `publication.json` (`{schemaVersion:1,url,category,visibility,preview?}`) from that branch via raw.githubusercontent.com.
- Failure never breaks the build: it warns and the project stays Level 1/2.
- `url` produces link-outs on `/projects/[slug]`, `/projects`, the homepage and `/next`. `visibility:"unlisted"` hides the project from listings.
- Opt-in steps: `scripts/new-project-site.sh <clone> [base]` (local orphan branch, never pushes), then push `website`, set Pages Source to "GitHub Actions", add `"website": true` to the manifest, and rebuild.
- **No project has opted in yet; the owner picks later.** The first one is the real pilot (an actual Pages deploy is untested).

## Decisions

### DECIDED
- Root = personal/professional profile; composition = editorial opening + structured profile.
- Root/CV never mount the old visualizer/player; legacy pages (`/projects`, `/devlog`, `/music`) stay on `Base.astro` and are reachable from the home footer.
- Datasheet visual family (paper/ink/yellow, Archivo + JetBrains Mono). The CV is final for now.
- The owner wants the homepage more artistic, dynamic and "not static", and less Kotlin/Android-centric ("I'm simply a programmer").
- Preserve `io-page` compatibility; never bulk-migrate project repos.

### PROPOSED
- Board skin `/next` replaces the datasheet at `/` (awaiting the owner).
- `website` branch / `publication.json` convention (pilot pending).

### OPEN (owner)
- Which skin goes to `/`: board (`/next`) or datasheet (current `/`), or a mix.
- Which projects get their own site (Level 3).
- Certifications: is "DeepLearning.AI TensorFlow Developer" the Coursera specialization (doesn't expire) or the discontinued Google exam cert? LinkedIn wasn't readable here (Chrome extension not connected).
- Datasheet joke labels ("Ordering information", "In production") on the CV/home.
- CV summary paragraph: dropped because the old one overstated "IOI honors"; supply one if wanted.
- 1- vs 2-page CV; `public/demo/` commit; merge/deploy timing; custom domain/DNS (owner-gated).

## Known issues (not ours, not fixed)
- `/projects/kap` overflows on phones because of a long `<code>` line in one of Kap's own devlogs.
- If web fonts fail to load, the `/next` intro text can overlap the chip (fallback metrics are wider). Low priority; consider a `size-adjust` fallback.

## Next exact action
1. Ask the owner for their verdict on `/next` vs `/`. If the board wins: move `next.astro` to `index.astro` (keep the datasheet as a fallback file or delete it, owner's call), update the AGENTS.md "6 real pages" note, and re-run the checks.
2. Apply any feedback on the board (likely: more motion/creativity, wording).
3. When the owner names a project for Level 3, run the pilot end to end with them; pushing to project repos needs their explicit OK.
4. Merge `proto/root-concepts` → `main` only when the owner says so.
