// Single factual source for the personal/professional pages (root + CV).
// CV facts come from src/content/cv (owner: use as is, see docs/agent-handoff/CONTENT_AUDIT.md).
// Projects come from federation but are optional: the root must render without them.
import { getCollection, render, type CollectionEntry } from "astro:content";
import { isListed } from "../lib/listing";

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
  kabl: ["audio", "systems", "creative"],
};

type ProjectData = CollectionEntry<"projects">["data"];
export type Part = ProjectData & { ref: string; domains: string[]; logs: number; lastLog?: Date };

// Every federated project as a catalogue part. Refs (U2, U3, …) are stable across
// the homepage board and the catalogue: featured first, then manifest order.
// Includes unlisted projects (their own page still builds); filter with isListed.
export async function loadParts(): Promise<Part[]> {
  const [projects, logs] = await Promise.all([getCollection("projects"), getCollection("devlogs", (e) => !e.data.draft)]);
  return projects
    .map((p) => p.data)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order)
    .map((p, i) => {
      const mine = logs.filter((l) => l.data.project === p.slug).map((l) => l.data.date).sort((a, b) => b.valueOf() - a.valueOf());
      return { ...p, ref: `U${i + 2}`, domains: projectDomains[p.slug] ?? [], logs: mine.length, lastLog: mine[0] };
    });
}

export async function loadProfile() {
  const cv = await getCollection("cv");
  const by = (s: string) => cv.filter((e) => e.data.section === s).sort((a, b) => a.data.order - b.data.order);

  const experience = await Promise.all(
    by("experience").map(async (e) => ({ ...e.data, Body: e.body?.trim() ? (await render(e)).Content : null, long: (e.body?.length ?? 0) > 400 })),
  );

  let projects: Part[] = [];
  try {
    projects = (await loadParts()).filter((p) => p.featured && isListed(p));
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
