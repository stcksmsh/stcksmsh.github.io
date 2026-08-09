# AGENTS.md — stcksmsh.github.io

Working notes for future agent sessions on this repo. State/context, not spec.

## Architecture

Astro (static output, MPA) + React islands, deployed to GitHub Pages. `src/layouts/Base.astro` is the shared layout: mounts `SintezaBackground` (the persistent `sinteza-viz` WebGL canvas, site-wide fixed background) and `GlobalPlayer` (persistent bottom audio bar) once, both `transition:persist`'d so they survive Astro's View Transitions client-side navigation. Content is federated at build time from each project's own `io-page` git branch (`scripts/federate.ts`, driven by `projects.manifest.json`) — `src/content/projects/` and `src/content/devlogs/` are gitignored, regenerated on every build.

**6 real pages**: `/` (home, teasers), `/projects`, `/projects/[slug]`, `/music`, `/devlog`, `/cv`. Each currently duplicates its own nav/card CSS in a page-scoped `<style>` block (a known wart, not yet worth the risk of consolidating).

## The visualizer integration (`sinteza-viz` / `stcksmsh/hysteresis`)

SoundCloud is embedded via iframe (cross-origin, no live audio access), so the visualizer runs entirely in **position-only mode**: `GlobalPlayer` dispatches `player:transport` window events (`trackchange`/`position`/`play`/`pause`), which `sinteza-viz`'s own internal listener consumes directly (not through `SintezaBackground` — that island only handles `setAccent` on trackchange, see its own comment). A track's `sidecar` content field (schema-2 JSON, generated via `sinteza-viz`'s `scripts/analyze.ts` from the original WAV) is what actually drives real visual sync; without it the visualizer just runs its own context-free idle autopilot regardless of what's playing.

**All 5 real tracks now have real sidecars** (as of this session): SIGSEGV, 0xC000021A, Hysteresis, Sampling Drift, Triple Pendulum — published under `public/sidecars/*.sidecar.json`, referenced by each `src/content/music/*.json`'s `sidecar` field. To add a new track: get its sidecar generated in the `hysteresis` repo (needs the original WAV — ask the user, they have the masters), copy the output JSON to `public/sidecars/<slug>.sidecar.json`, add a content entry with `sidecar: "/sidecars/<slug>.sidecar.json"` and `embedId: "stcksmsh/<lowercase-slug>"` (SoundCloud permalink pattern, confirmed).

**GlobalPlayer** (`src/components/islands/GlobalPlayer.tsx`) was rebuilt this session: real seek bar (drag-to-seek via debounced `onChange`, works for mouse/touch/keyboard), looping queue (`FINISH` wraps `(index+1) % tracks.length` instead of stopping dead), a queue-toggle panel. The old oscilloscope canvas is gone — it depended on a legacy per-track `envelope` field and did nothing for tracks without one.

**⚠️ `package-lock.json` pins a resolved commit SHA for the `sinteza-viz` dependency, not just the branch.** `package.json` tracks `github:stcksmsh/hysteresis#master`, but merging a fix to that repo's `master` does **not** automatically reach this site — the lockfile needs to be re-resolved separately: `npm install sinteza-viz@github:stcksmsh/hysteresis#master`, then commit the resulting `package-lock.json` diff. Landed fixes in `hysteresis` this session (flash pacing, real energy driving the visual, resize-debounce fixing a scroll-triggered stutter, onset particle removal) each needed this as a separate follow-up PR — don't assume a merged upstream fix is live without checking/doing this.

## Design system notes

- `--bg-glass`/`--glass-blur` (glass-card treatment) + `--radius-panel`/`--panel-highlight`/`--panel-shadow` (soft-edged panel look) are the established visual language for anything sitting on top of the persistent visualizer background — nav, cards, the CV scrim, the player bar. Avoid flat opaque boxes or hard 1px borders against the canvas; they read as "old-style divs pasted on top" (a real complaint, fixed several times this session — always check new UI against this).
- `.coord` (section eyebrows, footer text, etc.) has a `text-shadow` specifically because a lot of these sit directly on the raw unscrimmed canvas outside any glass card — don't remove it without checking contrast there.
- `.ticker-viewport`/`.ticker-gap` (`global.css`) + `src/lib/ticker.ts`'s `padForTicker()` is the shared "newsreel" scrolling-chip mechanism, used by every `.stack` (tech tags) and `.tags` (devlog tags) list. `padForTicker` pads+gap-marks a short list so the `translateX(-50%)` loop never shows a blank gap or an unbroken run-on repeat. Deliberately *not* applied to the CV page's `.chips` (skills/certifications) — that page is a printable resume and a scroll animation would cut off content in print.
- **View Transitions + `transition:persist` gotcha**: even though a persisted element's DOM node/React state genuinely survives navigation (verified exhaustively — mount-count probing across link clicks and browser back/forward, on the actual production build), the browser's default View Transition crossfade still runs an opacity/`mix-blend-mode` animation on that element's own `::view-transition-old/new` pseudo-elements. Harmless for a `<canvas>` (repaints straight through it), but was disrupting `GlobalPlayer`'s embedded SoundCloud iframe audio on every navigation. Fixed globally: `::view-transition-old(sinteza-bg|global-player), ::view-transition-new(...)  { animation: none; mix-blend-mode: normal; }`. **Any future `transition:persist`'d element embedding real media should get the same treatment.**

## Fixed bugs worth knowing about

- Every page except `index.astro` had a byte-identical stale nav array pointing "PROJECTS"/"MUSIC"/"DEVLOG" at home's own `#work`/`#sound`/`#devlog` scroll-anchors instead of the real `/projects`/`/music`/`/devlog` pages — clicking "MUSIC" while already on `/music` bounced you back to home. Fixed on every page except home (home's own anchor-links are correct/intentional, same-page scroll).
- Home's "01 / WORK" section label renamed to "01 / PROJECTS" — "work" reads as the day job the CV page already covers.

## Sandbox/environment notes (for whoever's testing this next in a similarly constrained environment)

- SoundCloud (`w.soundcloud.com`), Google Drive, and plain Google domains are blocked by egress policy in Claude Code's sandboxed sessions — real playback/seeking against the live widget can't be tested there, only simulated via manually-dispatched `player:transport` CustomEvents + rendered-output diffing. `api.github.com` (the plain REST `contents` endpoint `scripts/federate.ts` uses) also 403s there even though `raw.githubusercontent.com` and normal git push/fetch work fine — federate.ts works correctly in real CI, this is sandbox-only.
- The federated content directories (`src/content/projects/`, `src/content/devlogs/`) are gitignored and regenerated by `npm run federate` — if testing locally in a sandbox where that fails (see above), it's safe to manually drop a real `<slug>.json`/`.md` into those dirs for a local `astro dev`/`astro build` test, just don't commit them.

## Outstanding / worth a real-browser check eventually

- Real audio continuity across navigation (the View Transition fix above) and real seeking — both implemented and reasoned through carefully, neither directly testable against the live SoundCloud widget in this sandbox.
- `hysteresis`'s scratch branch `sigsegv-sidecar` (used to transport the 5 sidecar JSON files into this repo) is safe to delete once confirmed unneeded — this session couldn't delete remote branches (git push --delete got a 403, likely a deliberate credential-scope restriction).
