# Root homepage — three concepts for owner decision (2026-11-19)

All three render the same data (`src/pages/proto/_content.ts`: CV collection + featured federated projects, optional) in the decided composition: editorial first screen, then a structured profile. None uses `Base.astro`, so there's no visualizer, no player and no old CSS. Run them with `npm run dev` and open `/proto/a`, `/proto/b`, `/proto/c`. Screenshots are in `proto-shots/` (`<concept>-<desktop|mobile>-<fold|full>.png`).

| | **A — Route** | **B — Paper** | **C — Datasheet** |
|---|---|---|---|
| Central idea | Career drawn as a transit line; stations = roles, the current role is the big red stop. Links to Belgrade and the navigation work. | Profile typeset as a mathematics preprint: abstract, numbered theorems for roles, a results table for olympiads, projects as the bibliography. | Profile as a component datasheet: part number, features, block diagram, career as **revision history**, olympiads as characterisation data, projects as application notes. |
| Brief reference | A4 editorial + D3 data-viz | A4 editorial + mathematics | C4 technical manual + D4 interface |
| Recruiter scan | Strong. Timeline reads at a glance; long intern body stretches the page | Medium. Prose-first; dates sit in the margin; slower to skim | Strongest. Revision table gives role/org/date in one block; long text tucked into `<details>` |
| Distinctiveness | Medium-high; transit maps are a familiar trope, but the route is made from real data | High and personal; the gimmick is literary rather than visual | High; most "authored-feeling" first viewport |
| Mobile | Good; the route becomes a horizontally scrolling strip (needs a swipe hint) | Good; reads like a long article | Good; table collapses into stacked rows, only CV/Contact kept in nav |
| Maths prominence | Equal with education | Very high (the whole concept) | Proportionate (feature bullet + results table) |
| Risk | Intro + route compete for attention | Theorem/Lemma framing can read as too cute; serif-only | Can look cold or "corporate" if pushed further; joke density (part no., "in production") needs restraint |
| Build cost to production | Low | Low | Low–medium (table/print variants) |

**Recommendation (for you to decide, not decided):** go with **C**, borrowing B's results-table typography for the maths section. C answers the brief's six recruiter questions fastest and still has the strongest single visual idea. A is the safe fallback.

## Verification

- `npm run build`: passes (16 pages incl. `/proto/{a,b,c}`).
- Headless Chrome (Playwright, `/usr/bin/google-chrome`) at 1440×900 and 390×844: no horizontal overflow, no console errors, every local link returns 200.
- **Not done:** manual keyboard walkthrough (each page has a skip link and `:focus-visible` styles, but nobody has tabbed through them yet), print/PDF (CV route not touched in this milestone), and an independent review agent.

## Content caveats carried into all three

Used as-is by owner instruction; open items in `CONTENT_AUDIT.md`. The intro is the current homepage lede, verbatim. Concept C's feature bullets are condensed from the CV entries (no new claims).
