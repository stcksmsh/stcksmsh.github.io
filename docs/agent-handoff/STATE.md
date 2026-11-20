# IO Site — Durable Overseer State

> Restart checkpoint. Update before clearing/restarting the overseer. Concise and factual. Verify against `git log` / the build before trusting it.

## Current status (2026-11-20, session 7)

- **Repo:** `stcksmsh/stcksmsh.github.io` (origin `git@github.com:stcksmsh/stcksmsh.github.io.git`, default `main`, deploys to GitHub Pages on push to `main`).
- **Branch:** everything is merged to `main` (`50d56e9`) and **live** at https://kostavukicevic.com. `proto/root-concepts` = `main` (kept, pushed). New work: feature branch off `main`; pushing `main` deploys, which needs the owner's OK.
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
- **A/B sounds (session 5):** `1afa15d` on kabl `website`, live. Two Web Audio voices: A = low saw arpeggio, B = brighter square an octave up; each pulse is credited by each pattern's share of its chance at the current Morph (shared steps blend). Verified per-voice gain ramps live (morph 0 → A only, 1 → B only, 0.5 → split). Owner hasn't listened yet.
- **Domain finding:** the root site is served at `kostavukicevic.com` (custom domain in Pages settings, no CNAME file); `stcksmsh.github.io` 301s there. Fixed `astro.config` `site`, robots, and the bootstrap's default URL (`7f3e821`). Project sites live at `kostavukicevic.com/<Repo>/`.
- Root manifest has kabl with `"website": true`; `npm run federate` → `✓ kabl: 0 devlog(s), website https://kostavukicevic.com/kabl/ (public)`. `/projects` and `/projects/kabl` link out to it.
- No GitHub release exists for kabl; the site's tarball section is worded conditionally.
- Pilot criteria still to show after the deploy: a failed project deploy doesn't block the root build (true by design: federate only reads publication.json), and opt-out via `visibility: "unlisted"` (unit-tested only).

## Session 4 end (2026-11-19, owner shut laptop down mid-task)
- kabl website: Morph now mixes per-step chance (rhythm crossfade, 'mix' row), crates clickable/pinnable with source links (`070e3cc`, live, verified). Sound live (`d112692`).
- Owner: "publish website to the root page too" → kabl `io-page` meta.json `featured: true` pushed. Wide board grew to 11 slots (h 1290, +1 left, +1 right, bottom/fingers moved down) because 10 parts silently dropped Skilltree; `buildBoard` now warns on a dropped part. Committed and visually checked (session 5).
- ~~Open bug: invisible traces~~ **Not a bug** (session 5): Playwright `fullPage` screenshots drop the traces; plain viewport/clip screenshots after ~4.5 s (the draw-in animation) show them, with and without reduced motion. **Use viewport screenshots for the board, not fullPage.** The 11-slot board was checked at 1440 and 390: all 10 parts (incl. Skilltree and kabl U8) are placed and wired, with no overflow or errors.
- `proto/root-concepts` pushed to origin (owner: "push everything"). Not merged to main.

## DEPLOYED (2026-11-19, session 5)
- Owner said "Merge it". `proto/root-concepts` merged into `main` as `50d56e9` (no-ff; main was an ancestor, 35 commits). Full local build + `test:publication` 8/8 before push.
- Deploy run 44561229186 ✓. CI federate: all 9 projects, `mouthpiece … custom page`, `kabl … website https://kostavukicevic.com/kabl/ (public)`.
- Live check on https://kostavukicevic.com (1440 + 390): `/` (10 parts), `/cv/`, `/projects/`, `/projects/mouthpiece/`, `/projects/kabl/`, `/devlog/`, `/music/` all 200, with no overflow or console errors. Unknown paths return the datasheet 404 (status 404). `/sitemap.xml` and `/og.png` are served.
- Work continues on `main` from here (proto branch fast-forwarded to it). Minor: `public/og.png` is a pre-kabl board screenshot (9 parts); regenerate with a viewport screenshot when convenient.

## Session 6 (2026-11-19): Level 3 sites for aegis and EmojiType (owner asked)
- Built with `scripts/new-project-site.sh`, then content commits. **Local only, nothing pushed.**
  - `stcksmsh/aegis` `website`: `f55e419` bootstrap → `3866d5e` content. Local clone `../aegis` (new clone this session), worktree `../aegis-website`. Dark page in the app's look: drag-to-port USB plug-in simulation (encrypt/copy/verify, changed-files-only re-backup, unplug mid-backup, snapshot history, "look inside the drive" = restic repo layout), a Web Crypto encryption illustration (captioned: AES-GCM/PBKDF2 here, restic uses AES-256-CTR+Poly1305/scrypt), demo.mp4 + screenshots, features/security from README + SECURITY.md, download table that fills real asset links from the GitHub releases API. **aegis has no GitHub release yet**: the page says so and points to build-from-source.
  - `stcksmsh/EmojiType` `website`: `bb742d9` bootstrap → `cec12b7` content. Worktree `../EmojiType-website`. Light page: animated hero field, playground that re-implements content.js rules (delimiter replace, Tab/arrow/Enter suggestions, Backspace → keyword, delimiter switch, emoji burst), clickable default dictionary (27) + add-your-own, popup tabs, install (load unpacked; v3.0 release has no assets), privacy + permissions from manifest.
- Verified locally (vite preview under each base path): 1440/390/320 + reduced motion, no overflow/console errors; Playwright interaction scripts pass (drag + keyboard plug-in, unplug, guess passphrase; EmojiType replace/Tab/Backspace/arrows/delimiter/chips/custom entry/tabs). Scripts: `$CLAUDE_JOB_DIR/tmp/pw/` (may be gone).
- **LIVE 2026-11-19**: owner added `website` to both github-pages environments; reruns ✓. Live-checked at 1440/390/320 + reduced motion, all interaction scripts pass. Manifest has `"website": true` for aegis and EmojiType (pushed to `main`). Owner should try both sites once by hand (drag the drive; type in the playground).
- URLs: `https://kostavukicevic.com/aegis/` and `https://kostavukicevic.com/EmojiType/` (case-sensitive path).

## Session 6b: Mouthpiece Level 3 (owner: "Next is mouthpiece")
- `stcksmsh/Mouthpiece` `website`: `e7c9eef` bootstrap → `2b52a6a` content, **pushed**; worktree `../Mouthpiece-website`. Ransom-note look: cut-out letter title (click re-cuts), "hear the name" button, demo = the 15 io-page entries with real clips (copied from io-page `page/assets/`), joined with the engine's 12 ms crossfade; tape canvas draws each fragment's real decoded waveform with cut marks + playhead; scraps (click = play one fragment alone, "cut from", source link, "natural run" badge); provenance JSON per render; tiers + corpus stats from io-page; manifest + setup from README. archive.org speaker values that are NASA uploader e-mail addresses display as "NASA audio".
- Note: Mouthpiece's master README is behind its commits (roadmap still says v0.1); the site sticks to README + io-page facts. The owner's master working tree has uncommitted changes; untouched.
- **LIVE 2026-11-19** at https://kostavukicevic.com/Mouthpiece/ (owner added the env rule; rerun ✓; live-checked 1440/390/320 + reduced motion, interactions pass). Manifest `"website": true` pushed to main. The root `/projects/mouthpiece` page still builds with its Level 2 front panel and links out.
- Pages enabled (workflow). Verified locally at 1440/390/320 + reduced motion; interaction script passes. Deploy run 44594422689 rejected: **owner adds `website` to Mouthpiece's github-pages deployment branches**, then rerun, live-check, add `"website": true` to the Mouthpiece manifest entry, push main.

## Session 6c: Mouthpiece site rewrite (owner: "too simple… should make ANY word")
- `website` `aa51ad8`, pushed + **live**. Owner chose to include every recording (Obama, Churchill, SCOTUS too) and OK'd a ~4–5 MB bank (actual: 11 MB hosted, lazy: index 120 KB gz + cmu 865 KB gz + ~115 KB chunks on demand; a sentence fetched 9 chunks).
- `tools/export_bank.py` (run with `../Mouthpiece/.venv/bin/python`, reads `../Mouthpiece/db` + `corpus/`, 40 s): 3,000 top words, 650 phrases, 3,510 syllable shapes (1 each), 39 phones (4 each), 64 Opus sprites, 33 sources (French LibriVox excluded). Offsets verified after Opus round trip.
- `src/engine.js` ports match.py/phonemes.py; `src/render.js` follows assemble.py. No whole-word lemma fallback (deliberate); web-only "sounded out" fallback for words CMUdict can't place. Node test: `$CLAUDE_JOB_DIR/tmp/eng-test.mjs`.
- Verified live 1440/390/320 + reduced motion, Playwright e2e (say, examples, unknown words, granularity, select + source link, WAV + manifest download, reroll). Owner hasn't listened yet.
- Open (owner): root `/projects/mouthpiece` still shows the old Level 2 "front panel" (15-word demo from io-page `page/`) under the link-out; the other Level 3 projects have no front panel. Remove `page/` from Mouthpiece's io-page (pushes to that repo) to match?

## Session 6d: Kap Level 3 (owner: "Make one for KAP and that's the end for now")
- `stcksmsh/Kap` `website`: `a47c2a6` bootstrap → `c5a23c7` content, **pushed**; worktree `../Kap-website`; Pages enabled (workflow). Deploy run 44600543596 rejected: **owner adds `website` to Kap's github-pages deployment branches**, then rerun, live-check, add `"website": true` to the Kap manifest entry, push main.
- **LIVE 2026-11-19** at https://kostavukicevic.com/Kap/ (owner added env rule; rerun ✓; live-checked 1440/390/320 + reduced motion, interactions pass). Manifest `"website": true` pushed to main.
- Kap has no README: content from code + io-page devlogs. Ported logic: hero = drawWavyWater startup fill, working widget (default quick-adds 100/250/500/750/1000, messages, theme colours) + glass, goal calculator = calculateOptimalWaterIntake with AppSettings units, reminder planner = NextTickCalculator (defaults 90 min, 08:00–22:00, 5-min flex). Not on Google Play: build-from-source section. Wear OS + Health Connect marked "in progress" (code: HC write/read functions exist but nothing calls them; watch round trip never worked per devlog).
- Verified locally 1440/390/320 + reduced motion, Playwright interaction script passes.
- Note for owner: Kap io-page meta.json tagline says "streaks, and Health Connect sync" — no streak code exists and HC isn't syncing. The root site card still shows that tagline.

## Session 7 (2026-11-19 → 20, overnight; owner: "Make whatever you need until morning. The libs/etc")
Read as: build Level 3 sites for the remaining manifest projects. **Built and committed locally; nothing pushed**: `git push` to the project repos was denied by the permission classifier, so pushing waits for the owner.
- **deaf-composition** `website` (`97dd38f`, worktree `../deaf-composition-website`, new clone `../deaf-composition`). Dark "steer blind" page. Blind-leaf lab: Web Audio offline render + real BS.1770 K-weighted gated LUFS, peak, crest, centroid, 24-band fingerprint vs targets; the listen button stays locked until pass or 3-fail escalation; the start patch reproduces the real pad-on-percussion failure; feedback hints. Also: pipeline tree animation, Tidewater Clock arc with clickable seams (real 2.51 / 19.57 seam fails), 8 failure cards from devlogs/memory.md with commit links, kill checks (CLAP table, batching bars from exp2b v2), setup. Solution path: Pluck C6, 90 ms, cutoff ~80, fader ~+6 dB. README's "~2.7× headless" held in run 1 only (9.01 vs 24.09 s); run 2 measured them level. The page says so.
- **skilltree** `website` (`3f635b7`, worktree `../skilltree-website`). Light graph-paper page. A semantic-zoom explorer over the real `seed.py` graph, with a JS port of `build_graph` (hub aggregation incl. membership expansion) and `build_focus_graph` (descendants + members, active impls by context, directional boundary hints grouped taxonomy-first). Double-click/Enter opens a hub, Esc goes back (focus returns to the hub), hint chips jump to that hub, path highlighting, edge toggles, portrait layout <640px. Also: Fourier variants picker, data model, build-log timeline (dates verified from git). Commit `5f2c93e` (back-nav fix) is **unpushed** in the local skilltree clone, so it's listed without a link (the io-page devlog links it and 404s).
- **hysteresis** `website` (`308d8d7`, worktree `../Hysteresis-website`, base `/hysteresis/`). The real `sinteza-viz` (pinned to the same SHA as the root lockfile, `171897b`) as a fixed background. Five SoundCloud tracks with sidecars (copied to `public/sidecars/`, 5.9 MB) in position-only mode, mirroring GlobalPlayer; "bring your own file" = live analysis via AnalyserNode (local only). Sidecar strip (real envelopes/sections/drops/downbeats, click to seek), memory illustration (captioned as such), layers, embed snippet, docs links, a "Where it's going" note (TS frozen; Rust rewrite, physical installation, single-arm dance focus, from AGENTS.md). Reduced motion: the viz doesn't start until the visitor clicks "Start it anyway". Fixed a main-thread stall: PLAY_PROGRESS fires ~70/s, so the strip now caches its background and paints the playhead once per rAF.
- All three verified locally (vite preview under their base paths) at 1440/390/320 + reduced motion: no overflow or console errors, keyboard OK, interaction scripts pass (incl. real SoundCloud playback + seek on hysteresis). Scripts in `$CLAUDE_JOB_DIR/tmp/` (`sitecheck.mjs`, `dc-int.mjs`, `st-int.mjs`, `hy-int.mjs`).
- **BeogradPlusPlus: deliberately skipped.** Its app fakes GSP's 9011 SMS ticket confirmations; a public promo/simulation page would imitate a real organization's records. It stays Level 1/2.
- Root: `og.png` regenerated (10-part board, viewport screenshot) on branch **`night/level3-sites`** (`56e962e`, not pushed, not merged).

### Owner notes found tonight
- Hysteresis io-page `meta.json` `repo` points to `github.com/stcksmsh/sinteza-viz`, which 404s; the repo is `stcksmsh/hysteresis`.
- skilltree commits `backend/.env` (`DATABASE_URL=postgres…`) and `frontend/.env.local`; probably local dev values, worth a look.

## Next exact action
**LIVE 2026-11-20** (owner: "Force on all 3"): pushed the three `website` branches, enabled Pages (hysteresis already had it), added `website` to the github-pages branch policies via `gh api` (allowed this time), reran the deploys. All three were live-checked at 1440/390/320 + reduced motion, and all interaction scripts pass live. Manifest `"website": true` for all three is committed on `night/level3-sites` (`6f7afe1`); federate confirms the URLs.

1. Merge `night/level3-sites` into main when the owner confirms (og.png + STATE + manifest; **not** night mode, which the owner first assumed it was).
2. Carried over: cert URLs → `src/content/cv/cert-*.md`; owner to listen to kabl A/B voices and Mouthpiece; Kap tagline overclaims (streaks, Health Connect); Mouthpiece Level 2 front panel question.
