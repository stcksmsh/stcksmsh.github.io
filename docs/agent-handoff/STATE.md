# IO Site — Durable Overseer State

> Restart checkpoint. Update before clearing/restarting the overseer. Concise and factual. Verify against `git log` / the build before trusting it.

## Current status (2026-11-19, session 4)

- **Repo:** `stcksmsh/stcksmsh.github.io` (origin `git@github.com:stcksmsh/stcksmsh.github.io.git`, default `main`, deploys to GitHub Pages on push to `main`).
- **Work branch:** `proto/root-concepts`. **Local only, never pushed.** It branched from `main` @ `dfe539b`; all work below lives there. Merging to `main` = production deploy, which is owner-gated.
- **Untracked, not ours:** `public/demo/` (pre-existing; the owner hasn't said whether to commit it). Don't touch it.
- **Local demo:** `npx astro build && npx astro preview --port 4329 --host 127.0.0.1` gives `/` (board) and `/cv`. `/next` no longer exists.
- **Last verified (commit `Make the board skin the homepage…`):** full `npm run build` OK, `npm run test:publication` 8/8. `/` and `/cv` in headless Chrome at 1440/390/320: no overflow, no console errors, no broken links, keyboard focus, reduced motion pauses SVG. Plus a text clip/overlap sweep at 14 widths (320–1920): SVG labels keep ≥4px inside their boxes, no HTML overlay hits a board part, no text within 8px of the viewport edge. Script pattern: `$CLAUDE_JOB_DIR/tmp/clip.mjs` (may be gone; rewrite if needed).
- **Playwright** for checks: installed in `$CLAUDE_JOB_DIR/tmp` from an earlier job, which may be gone. If so, reinstall in a scratch dir (`npm i playwright@1.55.0`) and launch with `executablePath: "/usr/bin/google-chrome"`. Use `waitUntil: "load"` + `document.fonts.ready`, not `networkidle` (legacy pages never go idle because of embeds).

## What exists on the branch

| Area | State | Where |
|---|---|---|
| Handoff kit + brief | In repo | `docs/agent-handoff/` (`io-site-implementation-brief.md` is the product spec) |
| Clean layout (no visualizer/player/global CSS) | Done | `src/layouts/Profile.astro` |
| Shared facts | Done | `src/data/profile.ts` (identity, CV collection loader, `domains` pins, `projectDomains` map, `toYear`) |
| CV `/cv` | **Owner: final for now** ("perfect for a CV") | `src/pages/cv.astro`, datasheet style, A4 print = 2 pages |
| Homepage `/` | **Board skin, owner chose it 2026-11-19.** Datasheet homepage deleted (in git history at `dd0264d`) | `src/pages/index.astro` + routing/layout in `src/lib/board.ts` |
| Skills | Grouped; optional `items` field added to the cv schema | `src/content/cv/skill-*.md` |
| Level 3 publication arch (pilot) | Merged, untested against a real deploy | `scripts/publication.ts`, `scripts/federate.ts`, `scripts/new-project-site.sh`, `docs/project-repo-example/website/`, `src/lib/listing.ts`, AGENTS.md section |
| Screenshots/videos | Committed | `docs/agent-handoff/shots-final/` (datasheet), `shots-next/` (board), `proto-shots/` (original A/B/C concepts) |

### Board skin (`/`) details
- The profile is drawn as a PCB. The KV chip has 8 numbered pin pads (MATH, SYSTEMS, TOOLS, ANDROID | AUDIO, CREATIVE, WEB, AUTO).
- Each project or record is a part wired to its domains: J1 = work, Y1 = olympiads, U20 = ETF, U2–U7 = featured projects. The contact links are the edge-connector fingers.
- Routing is deterministic, built in `buildBoard()` (chamfered traces, nested lanes, a cross-chip band). ≤1100px uses the stacked narrow board (`mode: "stack"` + `maxPads: 1`), hero column capped at 640px; the wide board's absolutely-positioned name/intro only fits above ~1100px.
- Interaction:
  - Hover/focus a part, a pin pad or a trace to light its net and dim the rest; the probe panel lists what's on it.
  - SMIL pulses run along the traces; `svg.pauseAnimations()` under reduced motion.
  - Name letters widen toward the pointer (Archivo `wdth`).
- Parts link to `p.url ?? /projects/<slug>`.


### Level 3 architecture (brief §6), PROPOSED/pilot
- The manifest entry `"website": true` (or a branch name) makes federate read **only** `publication.json` (`{schemaVersion:1,url,category,visibility,preview?}`) from that branch via raw.githubusercontent.com.
- Failure never breaks the build: it warns and the project stays Level 1/2.
- `url` produces link-outs on `/projects/[slug]`, `/projects`, and the homepage board. `visibility:"unlisted"` hides the project from listings.
- Opt-in steps: `scripts/new-project-site.sh <clone> [base]` (local orphan branch, never pushes), then push `website`, set Pages Source to "GitHub Actions", add `"website": true` to the manifest, and rebuild.
- **No project has opted in yet; the owner picks later.** The first one is the real pilot (an actual Pages deploy is untested).

## Decisions

### DECIDED
- Board skin is the homepage; datasheet homepage deleted (2026-11-19).
- Root = personal/professional profile; composition = editorial opening + structured profile.
- Root/CV never mount the old visualizer/player; legacy pages (`/projects`, `/devlog`, `/music`) stay on `Base.astro` and are reachable from the home footer.
- Datasheet visual family (paper/ink/yellow, Archivo + JetBrains Mono). The CV is final for now.
- The owner wants the homepage more artistic, dynamic and "not static", and less Kotlin/Android-centric ("I'm simply a programmer").
- Preserve `io-page` compatibility; never bulk-migrate project repos.

### PROPOSED
- `website` branch / `publication.json` convention (pilot pending).

### OPEN (owner)
- Which projects get their own site (Level 3).
- Certification links: owner wants them linked like on LinkedIn. Code done (`url` field on cv entries, `6af4b83`); **needs the two credential URLs from the owner** → set `url:` in `src/content/cv/cert-*.md`. Chrome extension still not connected, LinkedIn unreadable here.
- Datasheet joke labels ("Ordering information", "In production") on the CV/home.
- CV summary paragraph: dropped because the old one overstated "IOI honors"; supply one if wanted.
- 1- vs 2-page CV; `public/demo/` commit; merge/deploy timing; custom domain/DNS (owner-gated).

## Known issues (not ours, not fixed)
- `/projects/kap` overflows on phones because of a long `<code>` line in one of Kap's own devlogs.
- If web fonts fail to load, the homepage intro text can overlap the chip (fallback metrics are wider). Low priority; consider a `size-adjust` fallback.

## Session 4 (2026-11-19) done
- Cert links: `url` field on cv entries renders as a link (`6af4b83`); URLs still needed from the owner.
- Phase 2 polish (`4b6e048`): `/sitemap.xml` endpoint (no dependency), robots Sitemap line, `/404` (datasheet, noindex), `public/favicon.svg`, `public/og.png` (1200×630 board screenshot), OG/Twitter tags on both layouts.
- Phase 3 software index (`150e7a8`): `/projects` = parts catalogue (filter by search/pin/status, collapses to cards ≤760px), `/projects/[slug]` = part datasheet (specs, custom "front panel" screen, build log as revisions, prev/next). Both on Profile layout. `loadParts()` gives stable U-refs shared with the board. Custom heroes get legacy tokens via `src/styles/custom-page-host.css` (zero-specificity selectors). Verified in headless Chrome at 1440/390/320: no overflow (Kap's code-line overflow fixed), no console errors, filters work, Mouthpiece renders.
- Still legacy on Base.astro: `/devlog`, `/music`.

## Level 3 pilot: kabl (session 4)
- Owner chose **kabl**, OK'd pushing `website` + `io-page`, and OK'd enabling Pages via gh.
- `stcksmsh/kabl` `website` (orphan): `f27f48d` bootstrap → `9e3eda8` content → `3a4f443` URL fix. It's a rack-style instrument page from kabl's README only (README screenshots, 24 module kinds, functional cables per docs/functional-cables, crate graph from real Cargo.toml deps). Verified locally under `/kabl/` at 1440/390/320; CI build ✓.
- `stcksmsh/kabl` `io-page`: `5da00a6` (meta.json featured:false order 7 + notify-site.yml). Pushed.
- Pages enabled on kabl (`build_type=workflow`). **LIVE 2026-11-19:** owner added `website` to the environment's branches, run 44517154859 re-run ✓; https://kostavukicevic.com/kabl/ checked in headless Chrome 1440/390/320 (no overflow/errors/404s, keyboard OK). Earlier: the auto-created `github-pages` environment only allows `master`. Adding `website` was blocked by the permission classifier (protection-rule change) → **owner step:** kabl Settings → Environments → github-pages → Deployment branches → add `website`, then re-run workflow run 44517154859. Then check https://kostavukicevic.com/kabl/.
- **Interactive pass (owner asked "more interactive/animated/dynamic", 2026-11-19):** `0f751fb` on kabl `website`, live. `src/rope.js` (Verlet rope). Hero cables hang between jacks; grab a plug and drop it on another jack. Crate graph crates are draggable (arrow keys too) with swinging cables. Functional cables section is a playable diagram (A/B 16-step patterns, chance/morph/glide, scope), captioned as a diagram, not kabl's engine. Panels reveal on scroll, module LEDs light up, screenshots open in a lightbox. Reduced motion: no idle motion or autoplay. Live-checked at 1440/390/320 + reduced motion: no overflow/errors, all interactions work.
- **Sound (2026-11-19):** `d112692` on kabl `website`, live. `src/voice.js`: Web Audio saw-tone arpeggio; cable level drives VCA + filter (pattern/chance/morph/glide audible). "Sound" button (needs a gesture); auto-mutes when scrolled away or tab hidden. Verified by recording scheduled gain ramps on the live site (headless can't listen; owner should listen once).
- **Domain finding:** the root site is served at `kostavukicevic.com` (custom domain in Pages settings, no CNAME file); `stcksmsh.github.io` 301s there. Fixed `astro.config` `site`, robots, and the bootstrap's default URL (`7f3e821`). Project sites live at `kostavukicevic.com/<Repo>/`.
- Root manifest has kabl with `"website": true`; `npm run federate` → `✓ kabl: 0 devlog(s), website https://kostavukicevic.com/kabl/ (public)`. `/projects` and `/projects/kabl` link out to it.
- No GitHub release exists for kabl; the site's tarball section is worded conditionally.
- Pilot criteria still to show after the deploy: a failed project deploy doesn't block the root build (true by design: federate only reads publication.json), and opt-out via `visibility: "unlisted"` (unit-tested only).

## Session 4 end (2026-11-19, owner shut laptop down mid-task)
- kabl website: Morph now mixes per-step chance (rhythm crossfade, 'mix' row), crates clickable/pinnable with source links (`070e3cc`, live, verified). Sound live (`d112692`).
- Owner: "publish website to the root page too" → kabl `io-page` meta.json `featured: true` pushed. Wide board grew to 11 slots (h 1290, +1 left, +1 right, bottom/fingers moved down) because 10 parts silently dropped Skilltree; `buildBoard` now warns on a dropped part. Committed and visually checked (session 5).
- ~~Open bug: invisible traces~~ **Not a bug** (session 5): Playwright `fullPage` screenshots drop the traces; plain viewport/clip screenshots after ~4.5 s (the draw-in animation) show them, with and without reduced motion. **Use viewport screenshots for the board, not fullPage.** The 11-slot board was checked at 1440 and 390: all 10 parts (incl. Skilltree and kabl U8) are placed and wired, with no overflow or errors.
- `proto/root-concepts` pushed to origin (owner: "push everything"). Not merged to main.

## Next exact action
1. (done) kabl site live.
2. Cert URLs when supplied (`url:` in `src/content/cv/cert-*.md`).
3. Merge `proto/root-concepts` → `main` only when the owner says so (deploys the new home/CV/catalogue and kabl's listing).
4. Later: `/devlog` and `/music` are still legacy on Base.astro; music site is a separate Phase 5 task.
