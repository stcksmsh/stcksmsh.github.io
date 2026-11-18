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
  // Owner-authored lede from the current homepage, kept verbatim.
  intro: [
    "I write Kotlin for cars for a living.",
    "In my own time I make music, break things on purpose, and once helped a couple hundred people ride the bus for free.",
  ],
};

export async function loadProfile() {
  const cv = await getCollection("cv");
  const by = (s: string) => cv.filter((e) => e.data.section === s).sort((a, b) => a.data.order - b.data.order);

  const experience = await Promise.all(
    by("experience").map(async (e) => ({ ...e.data, Body: e.body?.trim() ? (await render(e)).Content : null })),
  );

  let projects: { slug: string; title: string; tagline: string; status: string; stack: string[]; repo: string }[] = [];
  try {
    projects = (await getCollection("projects"))
      .map((p) => p.data)
      .filter((p) => p.featured)
      .sort((a, b) => a.order - b.order);
  } catch {
    // Federation unavailable: the concepts simply omit the projects block.
  }

  return {
    experience,
    education: by("education").map((e) => e.data),
    awards: by("awards").map((e) => e.data),
    certifications: by("certifications").map((e) => e.data),
    skills: by("skills").map((e) => e.data),
    projects,
  };
}
