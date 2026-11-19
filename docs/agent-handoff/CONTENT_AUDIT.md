# Content audit — root + CV (2026-11-19)

Sources: `src/content/cv/*.md`, `src/pages/cv.astro` (header/summary), `src/pages/index.astro` (hero), federated `src/content/projects/*.json`.
Status key: **OK** = consistent internally, no reason to doubt · **VERIFY** = owner must confirm · **FIX** = internally contradictory or overstated as written.

## Identity / contact

| Fact | Source | Status |
|---|---|---|
| Name: Kosta Vukićević | cv.astro | OK |
| Location: Belgrade, Serbia | cv.astro, index.astro | OK |
| Email (in cv.astro) | cv.astro | OK |
| LinkedIn `linkedin.com/in/kostavukicevic` | cv.astro | OK |
| GitHub `github.com/stcksmsh` | repo owner | OK — not currently linked on CV |
| Current title: Android Software Engineer II @ Rivian and Volkswagen Group Technologies | cv.astro, experience-1 | VERIFY (promotion April 2026) |

## CV summary (`cv.astro`)

| Claim | Status | Why |
|---|---|---|
| "automotive industry (Rivian, Volkswagen Group Technologies)" | FIX | Reads as two employers; the employer is the joint venture *Rivian and Volkswagen Group Technologies* (plus Rivian before it). |
| "IMO, IOI honors" | FIX | CV lists IMO 2020 Honorable Mention, but IOI 2018/2019 as *Participation*. "IOI honors" overstates. The two BMO bronzes are the stronger claim and aren't mentioned. |
| "specializing in Kotlin and systems-level app development" | VERIFY | "systems-level" is vague and not backed by any entry. |

## Experience

| Entry | Status | Notes |
|---|---|---|
| Android SWE II, RV Tech, Apr 2026 – Present | VERIFY | No description. |
| Android SWE, RV Tech, Feb 2025 – Apr 2026 | VERIFY | No description. |
| Android SWE, Rivian, Dec 2024 – Feb 2025 | VERIFY | Body says "Junior software engineer" while title says "Android Software Engineer". Pick one. |
| SWE Intern, Rivian, Jul – Dec 2024 | VERIFY | Specific claims to confirm: unit tests became mandatory for all MRs in Infotainment CI; sole vehicle-side dev on per-profile saved destinations + live trip status, now in the mobile app. |

## Education

| Entry | Status | Notes |
|---|---|---|
| BSc Software Engineering, ETF Belgrade, Oct 2021 – Present | VERIFY | 5+ years "Present" for a bachelor's. Still enrolled / expected graduation date / completed? |

## Awards

| Entry | Status | Notes |
|---|---|---|
| IMO 2020 Honorable Mention | VERIFY | |
| BMO 2020 Bronze | FIX (wording) | "Bronze" vs 2019 "Bronze Medal" — normalise. |
| BMO 2019 Bronze Medal | VERIFY | |
| IOI 2019 / 2018 Participation | VERIFY | Representing which country (Serbia)? Worth stating. |

## Certifications / skills

| Entry | Status | Notes |
|---|---|---|
| DeepLearning.AI TensorFlow Developer Specialization | VERIFY | No issuer field / year. |
| Deep Learning Specialization | VERIFY | Issuer (DeepLearning.AI) and year missing. |
| Skills: Mobile App Dev, Problem Solving, Kotlin | FIX (weak) | Very thin; "Problem Solving" isn't a skill a recruiter can scan. Real stack evidence from projects: Kotlin/Android, Rust+Tauri, TypeScript/React, Python/FastAPI, Web Audio/WebGL. |

## Current homepage hero (`index.astro`) — reference only, root is being redesigned

| Claim | Status | Notes |
|---|---|---|
| "STACK: KOTLIN / GO / REACT" | FIX | No federated project uses Go. |
| "{n} PROJECTS ACTIVE" | FIX (bug) | Counts all 8 projects; only 6 are `active` (kap = shipped, beograd-plus-plus = archived). |
| "helped a couple hundred people ride the bus for free" | VERIFY | Number unverified; also a recruiter-facing risk on a professional root page — owner's call whether it stays. |

## Projects (federated `meta.json`, status as published)

aegis (active) · beograd-plus-plus (archived) · deaf-composition (active) · emojitype (active) · kap (shipped) · mouthpiece (active) · sinteza-viz (active) · skilltree (active). Taglines come from each project's own repo and are treated as owner-authored — not re-audited here.
