// Single factual source for the personal/professional pages (root + CV).
// CV facts come from src/content/cv (owner: use as is, see docs/agent-handoff/CONTENT_AUDIT.md).
// Projects come from federation but are optional: the root must render without them.
import { getCollection, render } from "astro:content";

export const identity = {
  name: "Kosta Vukićević",
  role: "Android Software Engineer II",
  employer: "Rivian and Volkswagen Group Technologies",
  location: "Belgrade, Serbia",
  email: "vukicevickosta@gmail.com",
  linkedin: "https://www.linkedin.com/in/kostavukicevic",
  github: "https://github.com/stcksmsh",
  cv: "/cv",
  // Owner-authored lede; "Kotlin" → "software" per owner feedback (2026-11-20: too Kotlin/Android-centric).
  intro: [
    "I write software for cars for a living.",
    "In my own time I make music, break things on purpose, and once helped a couple hundred people ride the bus for free.",
  ],
};

// Pin configuration on the homepage: the domains the owner works across.
// "targets" are which page records light up when a pin is selected.
export const domains = [
  { id: "math", label: "MATH", desc: "Olympiad mathematics & algorithms" },
  { id: "systems", label: "SYSTEMS", desc: "Systems & backends" },
  { id: "tools", label: "TOOLS", desc: "Developer tools & CLIs" },
  { id: "android", label: "ANDROID", desc: "Android apps, at work and outside it" },
  { id: "audio", label: "AUDIO", desc: "Audio & speech" },
  { id: "creative", label: "CREATIVE", desc: "Creative coding" },
  { id: "web", label: "WEB", desc: "Web apps & extensions" },
  { id: "auto", label: "AUTO", desc: "Automotive infotainment (day job)" },
] as const;

// Which domains each federated project belongs to, judged from its own meta.json stack/tagline.
// Unknown slugs simply get no pins.
const projectDomains: Record<string, string[]> = {
  mouthpiece: ["audio", "tools", "creative"],
  "deaf-composition": ["audio", "creative"],
  aegis: ["systems", "tools"],
  skilltree: ["web", "systems"],
  emojitype: ["web", "tools"],
  kap: ["android"],
  "sinteza-viz": ["creative", "web", "audio"],
  "beograd-plus-plus": ["android"],
};

const MONTHS = ["january","february","march","april","may","june","july","august","september","october","november","december"];
/** "April 2026" → 2026.25, "2020" → 2020.5, "Present" → now. */
export function toYear(s?: string): number | null {
  if (!s) return null;
  if (/present/i.test(s)) { const d = new Date(); return d.getFullYear() + d.getMonth() / 12; }
  const y = s.match(/\d{4}/)?.[0]; if (!y) return null;
  const m = MONTHS.findIndex((n) => s.toLowerCase().includes(n));
  return Number(y) + (m >= 0 ? m / 12 : 0.5);
}

export async function loadProfile() {
  const cv = await getCollection("cv");
  const by = (s: string) => cv.filter((e) => e.data.section === s).sort((a, b) => a.data.order - b.data.order);

  const experience = await Promise.all(
    by("experience").map(async (e) => ({ ...e.data, Body: e.body?.trim() ? (await render(e)).Content : null, long: (e.body?.length ?? 0) > 400 })),
  );

  let projects: { slug: string; title: string; tagline: string; status: string; stack: string[]; repo: string; domains: string[] }[] = [];
  try {
    projects = (await getCollection("projects"))
      .map((p) => ({ ...p.data, domains: projectDomains[p.data.slug] ?? [] }))
      .filter((p) => p.featured)
      .sort((a, b) => a.order - b.order);
  } catch (err) {
    console.warn("[profile] projects collection unavailable, omitting selected work:", err);
    // Federation unavailable: the concepts simply omit the projects block.
  }

  return {
    experience,
    education: by("education").map((e) => e.data),
    awards: by("awards").map((e) => e.data),
    certifications: by("certifications").map((e) => e.data),
    skills: by("skills").map((e) => ({ ...e.data, items: e.data.items ?? [] })),
    projects,
  };
}
