# kostavukicevic.github.io — architecture & direction

Personal site: CV + project showcase + music + per-project devlogs.
Static (GitHub Pages, no DB, no backend). Astro + React islands.

---

## 1. The hard constraint

GitHub Pages serves static files only. Every "dynamic" behavior is either:

- **build-time** — resolved before deploy (content federation, search index,
  fitment tables), or
- **client-side** — JS in the browser (audio player, canvas, fuzzy filter).

Nothing runs on a server. This shapes every decision below.

## 2. Stack

| Concern            | Choice                          | Why |
|--------------------|---------------------------------|-----|
| Generator          | **Astro**                       | Zero-JS by default, islands for the interactive bits, type-safe content collections. Fits your React muscle without site-wide hydration cost. |
| Interactivity      | **React islands** (`client:*`)  | Oscilloscope, audio player, devlog filter — only these ship JS. |
| Content federation | **build-time fetch**            | Devlogs live in each project's `io-page` branch; pulled + stitched before build. |
| Music              | **embeds** (SoundCloud/Bandcamp)| No self-hosted audio; embed IDs in a `music` data collection. |
| Search/filter      | **Fuse.js** on a build-time JSON| Client-side fuzzy filter, no backend. |
| Deploy             | **GitHub Actions**              | `withastro/action` → Pages. Not Jekyll's free build, but worth it. |

## 3. Content federation — the distributed devlog model

Devlogs live **next to the code they describe**, on an orphan `io-page`
branch in each project repo. The site assembles them at build time.

```
PROJECT REPO (e.g. Kap)
  └── io-page (orphan branch — zero code history, just content)
        ├── meta.json          ← project card + accent + status
        └── devlogs/*.md        ← per-project entries

SITE REPO
  projects.manifest.json        ← single source of truth: which repos are on the site
  scripts/federate.ts           ← prebuild: fetch meta + devlogs, validate, write
  src/content/projects/*.json   ← generated (gitignored)
  src/content/devlogs/<slug>/   ← generated (gitignored)
```

**Flow** (`npm run federate`, runs before every build):

1. Read `projects.manifest.json`.
2. For each enabled repo, fetch `meta.json` from `raw.githubusercontent.com`
   (no clone, no auth for public repos).
3. **Validate against Zod — a malformed `meta.json` fails the build loudly.**
   The manifest is a contract; a broken project shouldn't silently corrupt
   the site.
4. List + fetch `devlogs/*.md` via the GitHub Contents API.
5. Stamp the project slug into each devlog's frontmatter, write into
   `src/content/`. Astro's collections take over from there.

**Cross-repo rebuild**: each project repo has a tiny workflow
(`docs/project-repo-example/.github/workflows/notify-site.yml`) that fires
`repository_dispatch` at the site repo on push to `io-page`. Push a devlog →
site rebuilds. No manual step.

**Two devlog surfaces**:
- per-project stream on `/projects/[slug]`
- a global reverse-chron feed on `/devlog` — the "what Kosta's building" pulse.

## 4. Design language — СИНТЕЗА

Lane: **expressive-maximalist on a terminal/synth substrate.** Brutalist
bones (grid, mono, monolith), maximalist skin (scale, color, motion). The
Justice register: discipline underneath, excess on top.

**Through-line: everything references the oscilloscope.** The Lissajous
work, Web Audio, color-theory math aren't features bolted on — they're the
visual grammar. Grid = time axis. Accent = wavelength. Motion = periodic
(sine), never eased decoration.

- **Substrate**: blue-black `oklch(0.15 0.02 260)` — not pure black, so
  accents glow.
- **Per-project accent**: each `meta.json` carries `accent` as an OKLCH
  triple `[L, C, H]`. The whole project page retints — borders, links, scope,
  glow. Maximalism *and* organizing logic in one move. OKLCH (you know
  CIE LAB/LCh) keeps chroma perceptually equal so no project accidentally
  shouts louder than another.
- **House triad**: orange, cyan, magenta.
- **Type**: Chakra Petch display + JetBrains Mono body (devlogs read like
  a terminal log). Hero
  runs to ~14vw — maximalism lives at the top of the scale.
- **Motion**: one shared sine clock (`useAudioClock`) so the whole site
  breathes at one frequency. Coherence separates maximalist from cluttered.
  `prefers-reduced-motion` freezes the sine to a static trace —
  non-negotiable for a site this motion-heavy.
- **"A lot, not everywhere"**: canvas concentrated in hero + music page +
  a thin per-project accent line. Everywhere else, restraint.

**Signature element**: the live oscilloscope (`Oscilloscope.tsx`) — Lissajous
or waveform, accent-reactive. It's the one memorable thing; everything around
it stays quiet.

## 5. Routes

```
/                     hero scope + featured projects
/cv                   print-optimized CV (native content, not federated)
/projects/[slug]      project page + its devlog stream, retinted to accent
/devlog               global cross-project reverse-chron feed + Fuse filter
/music                embeds + full-page visualizer
```

## 6. What's built vs. what's next

**Built (this scaffold):**
- Federation script + manifest + Zod contracts
- Content collections (projects, devlogs, cv, music)
- Token system (СИНТЕЗА), global styles, oscilloscope grid
- `Oscilloscope` island + shared `useAudioClock`
- Homepage (hero + accent-tinted project cards)
- Deploy workflow + cross-repo dispatch example

**Next (in priority order):**
1. `/projects/[slug]` — dynamic route, accent retint, devlog stream.
2. `/devlog` — global feed + Fuse.js filter island.
3. `/music` — embed collection + full visualizer island (your Web Audio work).
4. `/cv` — native CV content + print stylesheet.
5. Fix hero lede contrast (currently dim-on-dark below AA).
6. `giscus` for devlog comments (optional — needs GitHub Discussions).

## 7. Gotchas

- Repo size: GitHub soft-caps ~1GB, 100MB/file. Embeds (not self-hosted
  audio) keep you clear.
- API rate limit: `federate.ts`'s Contents API calls are unauthenticated
  (60/hr). Pass `GITHUB_TOKEN` in CI to raise it (already wired in deploy.yml).
- `src/content/projects` and `src/content/devlogs` are **generated** — add
  them to `.gitignore` so you never hand-edit federated content.
