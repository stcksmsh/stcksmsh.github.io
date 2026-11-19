# Personal Web Presence — Implementation Brief for `stcksmsh/stcksmsh.github.io`

**Prepared:** 18 November 2026  
**Status:** Product direction established; root-site visual execution still needs to be designed and approved.  
**Purpose:** Consolidate the prior handovers, owner decisions, repository audit, design feedback, and technical direction into a practical source of truth for implementation.  
**Suggested in-repository location:** `docs/io-site-implementation-brief.md` (place this document there before asking an implementation agent to read that path).

> **Repository assumption:** “the io repo” means [`stcksmsh/stcksmsh.github.io`](https://github.com/stcksmsh/stcksmsh.github.io), the existing Astro site repository. It is the root personal-site repository, not a generic site-builder repository.

---

## 0. Executive summary

We are rebuilding the personal web presence as a **collection of independent web experiences**, not as one conventional portfolio with a shared theme.

The root domain, `kostavukicevic.com`, is the personal/professional homepage. It should work as a concise portrait and professional record: who the owner is, what they do, where they have worked and studied, significant achievements, selected software work, and how to contact them. It is likely to be the first destination for recruiters and future employers, so clarity and credibility matter. It should not become a writing-heavy personal blog or a directory of every activity.

Other parts of the web presence are separate publications or applications:

- `music.kostavukicevic.com` — music projects and releases.
- `art.kostavukicevic.com` — artworks, installations, exhibitions, and their documentation.
- `software.kostavukicevic.com` — a curated index of software projects, including projects without their own site.
- `kabl.kostavukicevic.com` — the kabl instrument/application, if deployed there.
- `plants.kostavukicevic.com` — a plant-care application if it is built and published.
- `synth.kostavukicevic.com` — only if a distinct synth application warrants its own address; it is not a generic synth-work category.

The defining principle is **independence with deliberate connections**. Shared ownership, DNS, and some infrastructure are acceptable. Shared visual identity, global navigation, framework, state, build pipeline, or deployment lifecycle are not requirements. Each experience should be able to choose the tools and presentation that suit it. Complex projects must be able to own their complete rendering and interaction model. A simple page should remain simple.

The first implementation target is the root personal/professional site in `stcksmsh/stcksmsh.github.io`. The selected homepage composition is an **editorial introduction that transitions into a structured professional profile**. The visual treatment itself is not yet approved. The first six mockups were judged competent but not memorable; they are not design sign-off. The next design pass needs a strong, specific visual idea rather than a conventional template with decoration.

The existing Astro site contains useful infrastructure and substantial old design assumptions. Preserve the useful infrastructure selectively. Do not preserve the old global “СИНТЕЗА / hacker-console / oscilloscope-grid” visual direction just because it is already implemented.

---

## 1. Product intent and governing principles

### 1.1 What this is

This is an in-house personal publishing and application ecosystem. It is not:

- a commercial website builder;
- a multi-tenant platform;
- a universal portfolio theme;
- a requirement that every project has a subdomain;
- a single large website in which every project is a page with the same shell.

It should make it possible to publish very different kinds of work under one owner's domain while preserving the character and technical freedom of each project.

Examples of experiences the ecosystem may eventually host:

- a recruiter-friendly professional profile and printable CV;
- an album microsite with a visual identity derived from the record itself;
- an institutional or bureaucratic archive for an art installation;
- a software index with an interactive map of systems and relationships;
- a full browser-based instrument interface;
- an interactive mathematical or generative-art experience;
- a live audio/visual experience;
- an application with its own persistence or backend.

### 1.2 Non-negotiable principles

1. **Independence:** changing one experience must not accidentally redesign or break another.
2. **Deliberate connections:** link experiences when there is a reason. Do not force cross-promotion or universal navigation.
3. **Project ownership:** a project's repository should own its own substantial publication and product-specific assets.
4. **Opt-in shared infrastructure:** metadata, deployment snippets, and utilities may be shared when useful. A shared frontend framework or component library is never mandatory.
5. **Escape hatches:** custom rendering, WebGL, Canvas, Web Audio, WASM, unusual interaction, and bespoke layouts must not be forced through a universal component model.
6. **No hypothetical platform engineering:** this system serves one owner. Some duplication is preferable to abstractions that reduce independence.
7. **Progressive capability loading:** do not load a visualizer, player, animation engine, worker, or application runtime on pages that do not need it.
8. **Factual content:** do not invent project status, achievements, release dates, product capabilities, or professional claims to fill a layout.

### 1.3 The mental model

Keep these three concepts distinct:

- **Project:** the underlying work or product, usually represented by a GitHub repository or a creative work.
- **Publication:** a public-facing explanation, presentation, catalogue entry, release page, documentation site, or exhibition record for that project.
- **Application:** an interactive product with its own runtime and capabilities.

One project may have more than one of these. For example, a project can have a small entry in the software index, a separately deployed publication, and an actual application. Those are different surfaces and should not be collapsed into one universal “project page”.

---

## 2. Information architecture and domain map

| Hostname | Role | Expected character | Status |
|---|---|---|---|
| `kostavukicevic.com` | Personal/professional root | Editorial portrait + structured profile | **First implementation target** |
| `music.kostavukicevic.com` | Music category/publication | Release-led, authored, potentially immersive | Planned direction |
| `art.kostavukicevic.com` | Artworks and exhibitions | Archive, exhibition, or work-specific language | Planned direction |
| `software.kostavukicevic.com` | Software index | Systems atlas / structured catalogue | Planned direction |
| `kabl.kostavukicevic.com` | kabl instrument/application | Instrument-first, product UI as the visual language | Conditional on deployment |
| `plants.kostavukicevic.com` | Plant-care application | Botanical, living reference system | Concept only; application is not verified as built |
| `synth.kostavukicevic.com` | A distinct synth application, if one exists | Determined by that application | Not a category domain |

### Domain rules

- Do not create a subdomain merely because a repository exists.
- `software.` is a category/index. It should include relevant projects that do not have their own publication or application.
- `art.` and `music.` are publication/category spaces. An individual artwork or release may eventually deserve its own address, but that should be decided per work.
- `kabl.` is for kabl itself, not a general category for every synth-related thing.
- `plants.` is conditional on the plant application actually being built and published.
- `synth.` is conditional on a separate synth application; do not create it just to hold synth-related projects.
- Separate domains can be considered later; they are not needed to start.
- No umbrella studio brand is required. Real-name ownership is sufficient, while artistic identities can remain independent.

### Connections between sites

The root site may link to selected publications or category sites, but it should not automatically advertise every project. A category index may link to standalone project sites. A project publication may provide a small owner/repository credit if it makes sense. No global navigation bar, shared footer, or common visual branding is required.

---

## 3. Root-site purpose, content, and experience

### 3.1 Audience and job

The root site should answer, quickly:

1. Who is this person?
2. What do they do professionally?
3. What is their experience and technical background?
4. What evidence supports their capabilities?
5. Where can I see selected work?
6. How do I contact them or get the CV?

The primary audience includes recruiters, engineering managers, collaborators, and people who arrive through a project link. The page should be distinctive without making those people work to find basic information.

### 3.2 Selected composition — DECIDED

**Use Concept 3: editorial introduction + structured professional profile.**

The first screen can be expressive and authored. Below it, the site becomes more systematic and scannable. It should feel like one continuous design, not an editorial landing page pasted onto a conventional CV template.

This decision approves the balance and hierarchy, not the final font, colour, imagery, exact section order, layout dimensions, motion, or copy.

### 3.3 Recommended content structure

A possible structure for the root homepage:

1. **Opening / identity** — full name, concise statement of professional identity, current role, location if still desired, and direct CV/contact actions. The first screen needs one strong visual anchor.
2. **Professional proof** — a restrained summary of current/previous engineering work, relevant technical areas, and selected measurable evidence. Use only facts that are current and verified.
3. **Experience** — readable chronology with role, organisation, dates, and short factual descriptions. The CV can contain more detail.
4. **Education and mathematics** — ETF Belgrade studies and the mathematics/competitive-programming background should be represented. Their exact prominence is still an owner/design decision; they should not be hidden or exaggerated.
5. **Selected work** — a small curated selection of software/projects with concise descriptions and clear destinations. This is not the complete repository inventory.
6. **Contact / CV** — visible and easy to reach without exploring the site.

This is a suggested hierarchy, not a mandate to make six large stacked sections. The final composition can integrate or rearrange these areas if the information remains easy to scan.

### 3.4 Content rules

- The owner dislikes writing; do not fill the page with essays or long autobiographical copy.
- Use concise descriptions, structured records, timelines, numbers where supported, and selected images.
- Make the CV available directly. A visitor should not need to discover it through a project page.
- Include mathematics achievements proportionately.
- Software projects may appear as a small curated selection.
- Music and art do not have to appear on the professional homepage just because they exist elsewhere.
- Avoid a “everything I do” narrative.
- Avoid inflated claims such as “visionary”, “world-class”, or “passionate” unless the owner explicitly wants that wording.
- Do not invent a portrait photo. Whether the root page uses a real portrait, another image, a mathematical graphic, or no portrait remains open.

### 3.5 CV route

The current repository already has a structured CV collection and a print stylesheet. Preserve that content model and improve the presentation as needed.

The CV must:

- remain readable on mobile and desktop;
- be accessible as a normal web page;
- have a reliable print / Save as PDF mode;
- omit decorative animation, backgrounds, sticky controls, and unnecessary navigation in print;
- use verified current role, dates, education, awards, and contact details;
- avoid diverging from the root site's facts.

The homepage and CV should share the same underlying factual source where practical, so role names and dates do not drift. Do not overbuild a CMS: local structured data is sufficient.

---

## 4. Visual direction and the “WOW” requirement

### 4.1 Reference families selected by the owner

These references were selected as useful visual vocabularies:

- **A4:** independent magazine / authored editorial design.
- **B2 and B4:** generative art and immersive exhibition.
- **C4:** technical manual / archival / institutional documentation.
- **D2, D3, D4:** creative coding, data visualization, and product/interface design.

They are references, not global themes. A page can borrow from one or more. The root site should primarily use the editorial/profile direction; another site may be radically different.

### 4.2 The previous mockups are not approved designs

The first pass contained six site concepts (personal, music, art, software, kabl, plants). The owner judged them acceptable but not memorable enough to justify implementation. **Do not treat those screens, colours, components, or exact compositions as approved.** Retain only the high-level separation of experiences and the conceptual art directions below.

The next visual pass must produce designs that feel authored for the actual subject, not generic templates with a different colour palette.

### 4.3 What “WOW” should mean in practice

A strong design should have:

- one recognisable central visual idea that belongs to the subject;
- a confident composition and clear typography, not just a large heading;
- real project-specific material or original graphics, not generic stock placeholders;
- a considered relationship between type, image, data, whitespace, and movement;
- an intentional first viewport and a convincing continuation below it;
- visual interest without making the content harder to understand.

Avoid using animation as a substitute for art direction. A static composition should already be memorable; motion may deepen it.

### 4.4 Explicitly rejected visual patterns for the new root site

- the current generic hacker-console / “le epic hacker room” aesthetic;
- terminal/HUD decoration without a real information purpose;
- persistent oscilloscope grids or visualizer backgrounds across every page;
- purple gradients, generic glowing orbs, glass-card dashboards, and generic AI-looking 3D decoration;
- generic portfolio card grids as the main visual idea;
- default carousels of interchangeable project cards;
- “BUILD THE SIGNAL” / “status-line dashboard” as the new identity;
- decorative animations that do not express something about the content.

This does not prohibit technical diagrams, generative visuals, or data graphics. They must be intentional and specific, not a reskin of the rejected site.

### 4.5 Conceptual art directions for the other experiences

These are starting concepts for future design, not approved finished pages.

**Music — release as a world.** The music site should feel like an authored release/publication, not a portfolio's “music” tab. For MAXIMAVELIANISM, use the actual album's visual and conceptual language when the owner is ready to publish it. A large artwork, restrained typography, track/release structure, and immersive but optional audio/visual behaviour may be appropriate. Do not invent a final cover, tracklist, release state, or audio player functionality. `MAXIMAVELIANISM` is separate from the `deaf-composition` software/research project.

**Art — institutional artifact / archive.** The archival and bureaucratic reference is particularly relevant to `ADMITTANCE PROCEDURE`: documents, numbered records, receipts, evidence, procedural language, and exhibition context can become the visual grammar. The site must still be able to present unrelated works with their own forms; do not force every artwork into the same fictional bureaucracy.

**Software — atlas of systems.** This should be more than a grid of cards. A navigable map, graph, or taxonomy can show relationships between projects, technologies, states, and categories. The graph is a way to explore, not the only way to access content: provide a normal searchable/filterable list and accessible project detail links as well.

**kabl — instrument, not SaaS marketing.** Its presentation should borrow from the instrument itself: rack/module composition, patch relationships, signal flow, parameter hierarchy, and actual UI. The page should show what it is like to use the software. Do not create a generic “features / pricing / testimonials” landing page or fake interaction with non-functional controls.

**plants — living field guide.** If the application is built, a botanical specimen/field-guide system is a suitable starting direction: plant records, care states, visual growth and seasonal change. This is provisional; there is no verified published app in the audited repositories.

**Personal — editorial portrait + structured record.** This is the only direction selected as the root composition. A mathematical or systems-oriented graphic may be a suitable visual signature, but it must be art-directed for the actual content and not become a generic tech wallpaper.

---

## 5. Technical baseline in the `io` repository

Repository: [`stcksmsh/stcksmsh.github.io`](https://github.com/stcksmsh/stcksmsh.github.io)  
Default branch: `main`  
Current architecture: Astro static output + React islands + MDX + GitHub Actions / GitHub Pages.

### 5.1 Existing useful infrastructure

Verified in the current default branch:

- `package.json` — Astro 4, React 18, MDX, TypeScript, `tsx`, Zod, Fuse.js; `npm run build` currently runs the federation script before `astro build`.
- `astro.config.mjs` — static output and integrations; current `site` is `https://stcksmsh.github.io`.
- `.github/workflows/deploy.yml` — GitHub Pages build/deploy workflow, triggered by pushes to `main` and `workflow_dispatch`.
- `src/content/config.ts` — typed collections for projects, devlogs, CV, and music.
- `src/content/cv/` — local structured CV entries.
- `projects.manifest.json` — curated list of repositories participating in the current project federation.
- `scripts/federate.ts` — fetches project metadata, devlogs, and optional project-page bundles at build time.
- `src/pages/cv.astro` — existing CV page with print handling.
- `src/pages/projects/[slug].astro` — generic project route with an optional federated custom React page.
- `AGENTS.md` — important operational notes on the existing audio player, visualizer, custom project-page contract, and testing gotchas.

These are infrastructure facts, not a requirement to preserve every route or visual decision.

### 5.2 Existing visual coupling to remove from the new root experience

`src/layouts/Base.astro` currently imports and mounts both:

- `SintezaBackground` — a persistent WebGL visualizer background;
- `GlobalPlayer` — a persistent audio-player bar.

Both are mounted by the shared layout and persisted across Astro page transitions. `src/styles/global.css` also establishes the oscilloscope-like grid, grain, and the old global substrate. `src/styles/tokens.css` documents the old “СИНТЕЗА” design language.

This is exactly the kind of global coupling the new direction is intended to avoid. The new personal root experience should not load or depend on a music visualizer or global audio player. Those features may remain available to a music publication or a project that explicitly needs them, but they should be mounted locally by that experience.

Recommended migration: introduce a clean `PersonalLayout.astro` (or similarly named root-site layout) for the new `/` and CV experience. Keep the legacy layout temporarily for old routes during migration. Once the relevant external publications or replacement routes exist, retire or redirect the legacy pages deliberately. Do not break existing links prematurely.

### 5.3 Existing project federation

The current project federation is more capable than a README scraper.

**Current input contract:**

- `projects.manifest.json` lists participating repositories, branch names, optional content paths, and whether each entry is enabled.
- A participating branch supplies `meta.json`.
- It may supply `devlogs/*.md`.
- It may supply an optional `page/` bundle; `page/entry.tsx` opts into the custom project-page presentation.

**Current build flow:**

1. `npm run build` invokes `npm run federate`.
2. `scripts/federate.ts` reads the central manifest.
3. It fetches and validates `meta.json` against a Zod schema.
4. It fetches devlog markdown and stamps the project slug into frontmatter.
5. If the branch has `page/entry.tsx`, it mirrors code into `src/generated/projects/<slug>/` and non-code assets into `public/generated/projects/<slug>/`.
6. Astro builds the resulting collections and dynamic project routes.

Generated project/devlog/page directories are gitignored and regenerated during builds.

**Current custom page limitation:** a project's `page/entry.tsx` replaces only the hero/intro area on the host's generic `/projects/[slug]` route. The root site continues to own the navigation and generic devlog stream. The project bundle is compiled as part of the root site's build. It is not an independently deployed website.

The existing implementation also has specific constraints documented in `AGENTS.md`: custom bundles cannot import this repository's private internals; static assets are copied to public paths; dynamic React mounting is manual because of Astro's static-import/hydration rules. Do not accidentally break this contract while redesigning unrelated pages.

### 5.4 Current federation inventory

The current `projects.manifest.json` lists eight repositories on `io-page` branches:

- `Mouthpiece`
- `deaf-composition`
- `aegis`
- `skilltree`
- `EmojiType`
- `Kap`
- `BeogradPlusPlus`
- `hysteresis`

`kabl` is not currently in this manifest. The manifest is a curated site list, not a complete inventory of every repository owned by the account. `BeogradPlusPlus` is marked archived in its project metadata and should not automatically be promoted to featured status. Do not automatically turn all repositories into public portfolio entries.

### 5.5 Operational notes and inconsistencies

- The existing repository's `ARCHITECTURE.md` describes the old СИНТЕЗА visual system as the design direction. Treat that visual section as **superseded** by this brief. Its technical notes about static hosting, Astro, build-time federation, and content collections may remain useful history.
- `AGENTS.md` is the more detailed operational handover for the current code. Read it before changing the old audio or project-federation mechanisms.
- The current example project workflow in `docs/project-repo-example/.github/workflows/notify-site.yml` uses `workflow_dispatch` against the site's deploy workflow. The older `ARCHITECTURE.md` refers to `repository_dispatch`; prefer the actual current workflow and verify before changing it.
- The current deploy workflow supplies `GITHUB_TOKEN` to the build, but the current `scripts/federate.ts` network calls do not attach that token as an Authorization header. Do not assume those API calls are authenticated merely because the environment variable is present. This is a contained technical cleanup to verify when federation is next touched.
- `astro.config.mjs` currently names the GitHub Pages hostname. The desired public root domain is `kostavukicevic.com`; verify GitHub Pages custom-domain settings, Cloudflare DNS, certificates, and any CNAME requirement before changing production routing. Do not make DNS changes as part of the visual redesign without explicit approval.

---

## 6. Publishing architecture: projects, publications, and applications

### 6.1 Three publication levels

Use three levels, with an optional fourth for a full application.

**Level 1 — Index entry only**  
A small project has a metadata record and a link to its repository or demo. It does not need a dedicated publication branch or subdomain.

**Level 2 — Embedded project page (`io-page`, legacy-compatible)**  
A project provides `meta.json`, optional `devlogs/`, and optionally `page/entry.tsx`. The current Astro site federates and compiles that bundle into its own project route. This is useful for projects that need a custom presentation but do not need their own independent website. It remains a special integration mode, not the default for all projects.

**Level 3 — Independent publication (`website` branch, proposed)**  
A substantial project has a self-contained website source and its own build/deployment workflow in a per-repository `website` branch. The project builds and deploys independently to its chosen hostname. The root or category index may consume a small metadata manifest, but it does not fetch or compile the independent website's source.

**Application — separate deployment from its actual source**  
An application can deploy from its main source branch or its own repository CI, using whatever stack and backend it needs. It does not have to be represented as a `website` branch if that is not a useful fit.

### 6.2 `io-page` versus `website`

**Confirmed existing state:** `io-page` already works as the central-federation branch convention. Several repositories use it.

**Proposed future state:** `website` is the convention for a complete independent website with its own CI and deployment. It should not replace `io-page` until the migration path is tested.

Recommended compatibility strategy:

- Keep all current `io-page` consumers working during transition.
- Keep `io-page` for metadata/devlogs and embedded `page/entry.tsx` bundles where that integration is still useful.
- Introduce `website` only for substantial standalone publications.
- A `website` branch may contain the complete website source, assets, build config, CI, and a small root-level publication metadata file.
- The central site may read that metadata file for a curated index, but must **not** fetch the website source tree, compile its components, or require its dependencies.
- Do not require every repository to create a `website` branch.
- Do not migrate all eight current `io-page` repositories in one batch.

### 6.3 Minimal project/publication metadata

The existing metadata schema already has `slug`, `title`, `tagline`, `status`, `stack`, `repo`, optional `demo`, optional OKLCH `accent`, `featured`, and `order`.

A future schema can add a small number of fields needed by independent publications, such as:

- `url` — canonical publication/application URL;
- `category` — `software`, `art`, `music`, or another small explicit category;
- `visibility` — whether the entry is public/discoverable;
- optional preview image and a small set of tags.

Do not turn this into a universal CMS schema. Keep the manifest small and versionable. `meta.json` remains the public-facing project metadata; source code, UI, content, and the site's design remain owned by the project repository.

The exact schema/versioning rules are still open. Before adding fields, inspect all existing `io-page/meta.json` entries and preserve backwards compatibility.

### 6.4 Independent deployment rule

A standalone website must remain buildable and deployable when the root site is unavailable.

Preferred flow:

1. The project owns its `website` branch or a dedicated application source branch.
2. A push to that branch runs the project's own CI.
3. Its CI builds and deploys its own publication.
4. Its chosen hostname points to that deployment.
5. The project exposes a small metadata file if it wants to appear in a central index.
6. The root/category index rebuilds from metadata only, not from the website source.

Do not build a central orchestration system that compiles every project's website. One project's dependency or build failure must not prevent another publication from shipping.

### 6.5 Discovery and central registry

The root site should not become an automatic directory of every repository. Discovery is opt-in and curated.

A central index can be built from:

- a small committed curated list in the category site;
- explicit project manifests;
- metadata files from participating repositories;
- or a combination, with the source of truth documented.

Do not introduce a distributed auto-discovery service or a database before a real need exists. Build-time metadata is sufficient for static catalogues.

### 6.6 Shared infrastructure boundaries

Potentially shared:

- domain and DNS conventions;
- a minimal project/publication metadata schema;
- reusable deployment examples;
- optional metadata validation;
- occasional small utilities where duplication becomes genuinely costly.

Not shared by default:

- frontend framework;
- layout or component system;
- design tokens or CSS reset;
- navigation and footer;
- router;
- state management;
- rendering and animation stack;
- runtime dependencies;
- CI pipeline;
- hosting provider.

The root site should consume data, not impose a visual or code architecture on independent sites.

---

## 7. Technical architecture for the root repository

### 7.1 Baseline stack

Keep the existing Astro static site as the starting point. It is a reasonable fit for a content-heavy personal profile and printable CV. Use React islands only for interactions that genuinely need them. Use SVG, Canvas, WebGL, Web Audio, workers, or WASM when a particular experience warrants them, not by default.

Do not do a broad framework/dependency upgrade as part of the initial redesign unless the build or a required feature makes it necessary. Keep the first implementation focused and verify the existing build before changing anything.

### 7.2 Layout boundary

Introduce a new clean layout for the personal/professional experience. It should provide only the genuinely shared page shell:

- document structure and language;
- viewport and metadata;
- title/description/canonical/OG metadata;
- basic reset and page-level typography baseline;
- optional small footer if the design requires it.

It must **not** automatically mount:

- `SintezaBackground`;
- `GlobalPlayer`;
- project-specific React islands;
- a global navigation system for all sites;
- a universal animation runtime;
- all fonts, media, or capabilities needed by unrelated projects.

Use page-specific or experience-specific layouts when necessary. Do not turn this into a complicated layout framework.

### 7.3 Content/data separation

Prefer local structured content for the root profile. A reasonable division is:

- CV/experience/education/awards: keep the existing content collection unless the audit finds a concrete flaw;
- homepage-only intro and selected project links: small typed local data file or page-local data;
- image/media: explicitly referenced assets with appropriate dimensions and alternative text;
- publication links: deliberate curated links, not an automatic full repo scrape.

Content should survive a visual redesign. Avoid putting all factual text in a React component or scattering dates and titles across unrelated pages.

### 7.4 Routing and migration

The first slice should be the root homepage and CV route. Preserve old project/music/devlog routes until there is a deliberate replacement or redirect target. Do not break inbound links in anticipation of future subdomains that are not deployed yet.

In later work:

- `/projects` may become a compatibility route to the software index;
- `/music` may redirect or link to `music.` once that publication is live;
- `/devlog` may move to the software index or be retired if it no longer serves a purpose;
- project detail routes should point to the appropriate independent publication when it exists.

Any redirect should only be made once its destination is live and tested.

### 7.5 Federation boundary during migration

Do not make the new home page depend on live project federation for its essential content. The professional profile and CV should render even if a participating repository is private, unavailable, rate-limited, or malformed.

The current federator can remain temporarily for legacy project routes. Its longer-term home is more naturally the software index or a metadata-only discovery build. If it remains in the root repo during the first slice, isolate it so an unrelated project-page integration cannot change the root homepage's content or runtime.

Avoid refactoring the existing federation and audio systems at the same time as the initial homepage redesign. Preserve compatibility first; split and improve those mechanisms in separate bounded work.

---

## 8. Site-specific future scope and known projects

This section is an audited shortlist, not a command to publish every project.

| Project/work | Known identity | Likely surface | Notes |
|---|---|---|---|
| `kabl` | Rust modular synthesizer | Independent instrument/application publication | Not in the current project manifest; substantial enough to consider its own site |
| `Mouthpiece` | Concatenative speech-collage engine; text to generated speech collage | Software index + current custom embedded page | Verified `io-page/page/entry.tsx` is already a project-owned interactive presentation |
| `hysteresis` / СИНТЕЗА | Visual/physical music-driven system; current repo direction is a Rust rewrite | Software and/or art publication | The old TypeScript visualizer is historical/frozen reference material; do not confuse it with the full current project |
| `AIW` | Vendor-neutral, Git-native AI workspace CLI | Software index + documentation | Independent publication may be useful later |
| `Recall` | Plaintext-first AI memory/recall system | Software index + documentation | Independent publication may be useful later |
| `SoundField-Studio` | Early spatial-control engine with timeline/graph/OSC routing | Software index | Audit status before presenting as an active finished product |
| `deaf-composition` | Experimental AI-directed album-generation pipeline steered by measurements | Software index / research-style project page | Separate from the `MAXIMAVELIANISM` album |
| `aegis` | Cross-platform encrypted USB backup desktop application | Software index + current metadata | Do not imply deployment status beyond evidence |
| `skilltree` | Full-stack graph/DAG explorer | Software index + current metadata | Could suit a graph/atlas presentation |
| `Kap` | Android water-intake tracker | Software index / shipped-project record | Existing metadata exists |
| `EmojiType` | Browser extension for typed keyword-to-emoji conversion | Software index | Existing metadata exists |
| `BeogradPlusPlus` | Archived Belgrade public-transit ticketing proof of concept | Optional archive/selected historical project | Metadata marks it archived; not a default featured item |
| `MAXIMAVELIANISM` | Planned music release/publication | Music site | Not the same thing as `deaf-composition`; do not invent a final tracklist or claim it is released |
| `ADMITTANCE PROCEDURE` | Conceptual art installation | Art site | Its bureaucratic/institutional visual language is a strong work-specific direction |
| Plant-care app | Planned application | Plants site if built | Conceptual only; no verified repository in this audit |

The repository audit covered the root site and selected relevant projects, not every repository in the account. Repositories with no README, empty/course-only repositories, or unclear status should not be promoted automatically. Confirm status with the owner before public presentation.

---

## 9. Implementation plan

### Phase 0 — Baseline and source-of-truth cleanup

Before large changes:

1. Read the current `AGENTS.md` and `ARCHITECTURE.md`.
2. Run the current install/build locally or in CI and capture the baseline result.
3. Record the current main-branch commit and do not mix unrelated project changes into the redesign.
4. Inventory the exact data available in `src/content/cv/` and validate role titles/dates/education/awards with the owner where uncertain.
5. Check current GitHub Pages configuration and Cloudflare DNS separately from code. Do not change production routing yet.
6. Mark the old visual design in `ARCHITECTURE.md` as legacy/superseded when the new source-of-truth document is adopted.

**Deliverable:** baseline and a short factual content inventory; no visual redesign yet.

### Phase 1 — Root personal/professional experience

1. Create the new personal layout with no persistent visualizer, no global audio player, and no universal site navigation.
2. Design the homepage around Concept 3: distinctive editorial opening + systematic profile below.
3. Build the root page using actual verified content and the selected-project shortlist.
4. Rework the CV route to share the same factual source and remain print-friendly.
5. Make the page responsive, accessible, performant, and readable with reduced motion enabled.
6. Keep legacy routes functional while this new root experience is built.

**Deliverable:** a complete new root homepage and CV, with desktop/mobile screenshots and an owner-reviewable visual system.

### Phase 2 — Root experience polish and verification

- Check mobile layouts, keyboard navigation, focus states, semantic hierarchy, colour contrast, and print output.
- Check no background canvas/audio UI is loaded on the new root/CV pages.
- Check image loading, metadata, Open Graph, canonical URLs, sitemap, and a useful 404 page.
- Verify the site still builds cleanly and legacy routes still work.
- Validate the actual public deployment only after the owner approves routing.

**Deliverable:** accepted root experience with no regressions to preserved routes.

### Phase 3 — Software index

Treat the software index as its own experience, not a large section bolted into the root homepage. Reuse project metadata where practical, but design it as a navigable atlas/taxonomy with a normal list/filter alternative.

Decide whether it initially lives at `/software` or is deployed directly at `software.kostavukicevic.com`. Do not make this decision by creating an elaborate deployment framework first. A simple independent Astro/static build is sufficient if a separate site is justified.

**Deliverable:** curated index, selected project detail pages/links, explicit status and category, metadata-only connection to independent websites.

### Phase 4 — Independent publication convention pilot

Pilot the proposed `website` branch using one substantial project (kabl is a plausible candidate, not a locked choice).

The pilot must prove:

- the project has a self-contained site source on `website`;
- that branch's own CI builds and deploys it;
- the root/category index can read only its metadata;
- the central index does not bundle or compile the site's source;
- a failed project-site build does not block the root site;
- a project can opt out of central discovery;
- the URL can remain stable if the source later moves to a directory or separate repository.

Only after the pilot works should the branch/metadata contract be standardized.

### Phase 5 — Music, art, and applications

Build each as a separate design/product task. Do not implement all future sites merely to complete an architecture diagram. Start each when there is enough real content and a clear publishing need.

---

## 10. Acceptance criteria for the first implementation

The first implementation is complete when all of the following are true:

### Product and content

- The homepage clearly identifies the owner and professional focus in the first viewport.
- CV and contact are directly accessible.
- Experience, education, mathematics background, and selected work are present using correct facts.
- Copy is concise; the site is not a long-form blog.
- No invented projects, achievements, claims, release states, or product functionality appear.

### Visual design

- The design is clearly authored for this person rather than a generic portfolio template.
- It follows the editorial-introduction/structured-profile composition.
- It has at least one strong, subject-specific visual idea.
- It does not reuse the rejected hacker-console/СИНТЕЗА system as the root identity.
- The desktop first viewport and mobile first viewport both feel intentionally designed.
- Motion is purposeful and respects `prefers-reduced-motion`.

### Architecture

- The new root/CV pages use a clean layout with no global `SintezaBackground` or `GlobalPlayer`.
- Content and factual data are separated from presentation.
- The new home does not require successful live federation from project repositories to render.
- Legacy routes remain working until their replacements/redirects are ready.
- No universal component/theme system for future sites is introduced.

### Quality

- Static build succeeds.
- No console errors or broken local links on the new pages.
- Keyboard use and visible focus work.
- Mobile layout has no horizontal overflow.
- Print/Save as PDF produces a clean CV.
- Images have dimensions and appropriate alternative text; decorative images are correctly hidden from assistive technology.

---

## 11. Risks and decisions that remain open

| Topic | Current state | Required handling |
|---|---|---|
| Root visual identity | Composition selected; exact look not selected | Produce a stronger art-directed design and get owner review |
| Portrait/photo | Open | Do not assume or invent an image |
| Mathematics prominence | Must be included; emphasis open | Show proportionately, refine after seeing the design |
| Root custom domain | `kostavukicevic.com` intended; repo currently references GitHub Pages hostname | Verify Pages settings, Cloudflare DNS, TLS, and CNAME before switching |
| `website` branch | Proposed convention | Pilot before standardizing |
| `io-page` | Existing and working | Preserve during migration |
| Metadata schema | Existing schema works for current index | Add only fields needed for a proven publication use case |
| Software index location | `software.` intended; exact first deployment path open | Start simply; do not build a platform before need |
| Central project registry | Useful but source/update mechanism open | Keep curated and lightweight |
| Shared packages | Opt-in only | Extract only after repeated real need |
| Hysteresis placement | Art/software boundary unresolved | Classify after reviewing the current work and intended audience |
| Hosting per experience | Static-first, provider not globally mandated | Choose independently; no all-sites deployment framework |
| Other visual sites | Concepts exist, no final design approval | Design each against its actual work/content |

---

## 12. Explicit non-goals and anti-patterns

Do not:

- rebuild the rejected hacker-console design with new colours;
- make the homepage a blog or a complete activity feed;
- force music and art into the professional homepage;
- add every GitHub repository to the public project index;
- use one global nav, footer, design system, component library, or framework across all sites;
- build a central CI that compiles all project websites;
- make a standalone site depend on the root site being available;
- create one subdomain per repository;
- make every project a React component on the root site;
- instantiate WebGL, Web Audio, workers, or a global runtime on pages that do not use them;
- build an admin panel, CMS, database, plugin system, or multi-tenant configuration layer without a real requirement;
- invent a tracklist, album artwork, release status, app feature, project activity, or performance metric;
- replace a working existing integration while redesigning unrelated pages.

---

## 13. Working rules for implementation agents

1. Read this brief and the repository's `AGENTS.md` before editing.
2. Treat this brief as the product direction for the new root experience. Treat the old visual section in `ARCHITECTURE.md` as historical unless the owner explicitly restores it.
3. Do not reinterpret a proposal as a locked decision. Keep `DECIDED`, `PROPOSED`, and `OPEN` distinctions explicit.
4. Work in bounded tasks and commit frequently.
5. Keep root-page changes isolated from the legacy federation/audio systems wherever possible.
6. Do not change DNS, production domain settings, repository visibility, secrets, or deployment permissions without explicit owner approval.
7. Do not migrate `io-page` branches or create `website` branches in bulk.
8. Verify the real build and inspect browser output. A clean typecheck alone is not enough for visual, media, or deployment behaviour.
9. Provide desktop and mobile screenshots for owner review.
10. Update this brief and the repository's agent notes when an owner decision changes; do not leave contradictory architecture documents.

---

## 14. Ready-to-send implementation prompt

Use this prompt for the first coding agent. First place this document at `docs/io-site-implementation-brief.md` in the implementation branch (or change the prompt to point to wherever the file is supplied). The task deliberately scopes work to the root profile and CV; it does not ask the agent to build every future subdomain.

```text
You are implementing the first slice of the personal web presence in:
https://github.com/stcksmsh/stcksmsh.github.io

Read these files first:
- docs/io-site-implementation-brief.md (the product and architecture source of truth)
- AGENTS.md (current operational constraints and existing system gotchas)
- ARCHITECTURE.md (historical technical notes; its old СИНТЕЗА visual direction is superseded for the new root site)

GOAL
Rebuild the root personal/professional homepage and CV around the approved composition:
editorial introduction + structured professional profile.
The site is a concise professional portrait, not a blog and not a generic portfolio.
It must be visually memorable and specifically art-directed. The previous mockups were not approved as final designs because they were not distinctive enough.

SCOPE
- Implement the new `/` experience.
- Implement or refine `/cv` so it shares accurate facts and prints cleanly.
- Introduce a clean root-site layout that does not mount SintezaBackground or GlobalPlayer.
- Preserve the current project federation and old routes during this first migration slice.
- Use the existing structured CV content as the starting data source; audit it for consistency before copying facts into new components.
- Use only verified professional/education/achievement/project claims. Leave uncertain details out or flag them for owner review.
- Make the site responsive, accessible, fast, and usable with reduced motion.

DO NOT
- Reuse the old terminal/hacker-console/СИНТЕЗА design as the root identity.
- Put a permanent WebGL visualizer, audio player, grid wallpaper, glass dashboard, or generic project-card carousel on the new homepage.
- Add music/art/devlog sections merely because they currently exist in the old root site.
- Build the music, art, software, kabl, or plants sites in this task.
- Create a global design system or universal layout framework for future sites.
- Change DNS, GitHub Pages custom-domain settings, secrets, permissions, or production deployment configuration without owner approval.
- Rewrite `scripts/federate.ts` or the project page bundle contract unless a specific blocker is demonstrated.

IMPLEMENTATION APPROACH
1. Inspect the current build and record its baseline.
2. Review `src/content/cv/` and identify any inconsistent or stale facts.
3. Propose a concrete visual direction for the root homepage using real content and one strong subject-specific visual idea. Do not substitute abstract design talk for a rendered implementation.
4. Implement a clean page layout and the homepage/CV.
5. Keep factual data separate from presentation.
6. Keep legacy routes operational during the migration.
7. Run the production build and inspect actual desktop/mobile browser output.
8. Verify print-to-PDF for the CV and verify that the new pages do not load the global visualizer/player.
9. Commit in small, reviewable steps and report exact commits, changed files, build output, and remaining owner decisions.

ACCEPTANCE
- The first viewport immediately explains who the owner is and what they do.
- CV and contact are obvious.
- Experience, education, mathematics background, and selected work are represented accurately.
- The design is recognisably authored, not a generic template.
- No old global visualizer or audio player appears on `/` or `/cv`.
- Responsive, keyboard-accessible, reduced-motion-friendly, no horizontal overflow.
- CV prints cleanly.
- Existing legacy routes and project federation continue to build.
- Supply screenshots at desktop and mobile widths for owner review.

Do not ask for approval on routine implementation details. Make sound local decisions, document any material assumption, and stop only at genuine owner decisions (portrait/photo choice, disputed facts, production domain routing, or a major visual-direction fork).
```

---

## 15. Source audit / documents used

The following prior and current materials informed this brief:

- Previous handover: `personal_web_presence_handover.md` (17 November 2026).
- Latest handover and decision record: `personal-web-presence-handover.md` (17 November 2026, 610 lines; includes the selected root composition, project audit, existing `io-page` federation and first six-site mockup record).
- Repository `AGENTS.md` — current build architecture, audio/visualizer integration, custom project-page contract, and sandbox/testing caveats.
- Repository `ARCHITECTURE.md` — older site architecture and old СИНТЕЗА visual direction; its technical history is useful, but the visual direction is superseded.
- `package.json`, `astro.config.mjs`, `.github/workflows/deploy.yml`.
- `src/layouts/Base.astro`, `src/styles/global.css`, `src/styles/tokens.css`.
- `src/pages/index.astro`, `src/pages/cv.astro`, `src/pages/projects/[slug].astro`, `src/pages/music.astro`, `src/pages/devlog.astro`.
- `src/content/config.ts`, `src/content/cv/`, `projects.manifest.json`, `scripts/federate.ts`.
- `docs/project-repo-example/.github/workflows/notify-site.yml` and `docs/project-repo-example/meta.json`.
- `Mouthpiece`'s live `io-page/meta.json` and `io-page/page/entry.tsx` as a concrete example of the existing embedded custom-page contract.

This was a targeted source audit of the root repo and selected projects, not a complete audit of every repository in the account. Repository status and project facts should be rechecked when a project is selected for public presentation.

---

**Bottom line:** implement the new personal/professional root experience first, using the existing Astro site as a foundation but not inheriting its old visual identity or global runtime. Keep the category sites and application sites independent. Preserve `io-page` compatibility, pilot `website` as a separate independent-publication convention later, and let each experience own its design and deployment.
