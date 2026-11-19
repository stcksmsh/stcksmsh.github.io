# Root homepage — three concepts for owner decision (2026-11-19)

All three render the same data (`src/data/profile.ts`: CV collection + featured federated projects, optional) through the new clean `src/layouts/Profile.astro`, in the decided composition: editorial first screen, then a structured profile. None uses `Base.astro`, so there's no visualizer, no player and no old CSS. Run them with `npm run dev` and open `/proto/a`, `/proto/b`, `/proto/c`. Each has a matching CV prototype at `/proto/a-cv`, `/proto/b-cv`, `/proto/c-cv`, and every homepage CV link points to it. Screenshots are in `proto-shots/` (`<concept>-<desktop|mobile>-<fold|full>.png`, `<concept>-cv-*.png`), and A4 print exports are in `<concept>-cv.pdf`.

| | **A — Route** | **B — Paper** | **C — Datasheet** |
|---|---|---|---|
| Central idea | Career drawn as a transit line; stations = roles, the current role is the big red stop. Links to Belgrade and the navigation work. | Profile typeset as a mathematics preprint: abstract, numbered theorems for roles, a results table for olympiads, projects as the bibliography. | Profile as a component datasheet: part number, features, block diagram, career as **revision history**, olympiads as characterisation data, projects as application notes. |
| Brief reference | A4 editorial + D3 data-viz | A4 editorial + mathematics | C4 technical manual + D4 interface |
| Recruiter scan | Strong. Timeline reads at a glance; long write-ups collapse | Medium. Prose-first; dates sit in the margin; slower to skim | Strongest. Revision table gives role/org/date in one block; long text tucked into `<details>` |
| Distinctiveness | Medium-high; transit maps are a familiar trope, but the route is made from real data | High and personal; the gimmick is literary rather than visual | High; most "authored-feeling" first viewport |
| Mobile | Good; the route becomes a horizontally scrolling strip with a fade + swipe hint | Good; reads like a long article | Good; table collapses into stacked rows, only CV/Contact kept in nav |
| Maths prominence | Equal with education | Very high (the whole concept) | Proportionate (feature bullet + results table) |
| Risk | Intro + route compete for attention | Theorem/Lemma framing can read as too cute; serif-only | Can look cold or "corporate" if pushed further; joke density (part no., "in production") needs restraint |
| Build cost to production | Low | Low | Low–medium (table/print variants) |

**Decision (owner, 2026-11-20): C.** Promoted to `/` and `/cv`; prototypes removed. Original recommendation: go with **C**, borrowing B's results-table typography for the maths section. C answers the brief's six recruiter questions fastest and still has the strongest single visual idea. A is the safe fallback.

## Verification (2026-11-20, production build via `astro preview`)

- `npm run build` passes. Legacy routes (`/`, `/cv`, `/projects/*`, `/music`, `/devlog`) are unchanged and still build.
- Headless Chrome at 1440×900 and 390×844, all 6 prototype pages: no horizontal page overflow, no console errors, every local link returns 200. Also checked at 320/768/960/1024/1200px with no page overflow; A's route strip scrolls inside its own container by design.
- Keyboard: tabbed through all 6 pages with reduced motion on. Each page has a skip link as the first stop, a logical order, and a visible focus outline on every stop.
- Print: all three CVs export to 2 A4 pages with no orphaned headings or split tables, and no nav/buttons/shadows. A 1-page fit would need cuts to the intern write-up, which is your call.
- Independent review (separate agent, read-only). Fixed:
  - C: details summaries now name the role for screen readers; the mobile table header is visually hidden instead of removed; education rows sit under their own "Education" separator; the part-number box comes after the name on mobile; empty-data guards added.
  - B: "Definition 2.x" now numbered; removed a sentence I had added to your abstract; reworked the proof/∎ layout; nav "Correspondence" renamed "Contact".
  - A: green status badge contrast raised to AA; long role write-ups collapse behind "More about this role"; education station uses the real organisation; mobile route strip gets a fade and swipe hint; decorative glyph hidden from screen readers.
  - Data: a federation failure is now logged instead of swallowed silently.
- Review's claim that B's fonts lacked `display=swap` was wrong (it's there), so no change.
- Review notes left for production, not fixed in prototypes: A's projects section is still a card grid (the brief rejects that as a *main* idea; here it isn't the main idea, but it's worth rethinking), C's joke labels ("Ordering information", "In production") need your OK, and C's block diagram text gets small below ~360px.
