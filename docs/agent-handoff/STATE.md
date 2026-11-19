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

## Level 3 pilot: kabl (session 4, in progress)
- Owner chose **kabl** and OK'd pushing its `website` branch.
- `website` (orphan) pushed to `stcksmsh/kabl`: bootstrap commit `f27f48d` + content `9e3eda8`. It's a rack-style instrument page from kabl's README only: README screenshots, the 24 module kinds, functional cables (per docs/functional-cables), and a crate graph from the real Cargo.toml deps with transitive edges removed. Verified locally under `/kabl/` at 1440/390/320.
- CI run 44516754380: build ✓; deploy ✗ "Ensure GitHub Pages has been enabled". **Owner step:** kabl Settings → Pages → Source "GitHub Actions" (or OK me to `gh api -X POST repos/stcksmsh/kabl/pages -f build_type=workflow`), then re-run the workflow.
- `io-page` branch created **locally only** in the kabl clone (`5da00a6`: meta.json featured:false order 7 + notify-site.yml). **Needs owner OK to push.**
- Then: add `{ "repo": "stcksmsh/kabl", "branch": "io-page", "contentPath": "", "enabled": true, "website": true }` to `projects.manifest.json`, run `npm run federate`, expect `✓ kabl: 0 devlog(s), website https://stcksmsh.github.io/kabl/ (public)`.
- No GitHub release exists for kabl; the site words the tarball section conditionally.
- Worktree `$CLAUDE_JOB_DIR/tmp/kabl-website` is attached to the kabl clone; remove it with `git -C …/kabl worktree remove` when done.

## Next exact action
1. **Phase 4 pilot (owner-gated):** owner picks the project. Local clones exist in `/secondary/Programming/Github/` (kabl, Mouthpiece, Kap, skilltree, EmojiType, Recall…). kabl is not in the manifest (needs an io-page/meta.json or manifest entry too). Steps: `scripts/new-project-site.sh <clone>` (local only) → owner OKs push of `website` → owner sets Pages Source = GitHub Actions → add `"website": true` to the manifest → rebuild and check federate's console line.
2. Cert URLs when supplied.
3. Merge `proto/root-concepts` → `main` only when the owner says so (deploys).
