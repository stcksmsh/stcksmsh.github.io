// scripts/federate.ts
// Runs BEFORE `astro build`. Pulls content from each project's `io-page`
// orphan branch and stitches it into src/content/ for Astro's collections.
// No clone, no auth for public repos — just raw.githubusercontent.com.
//
// package.json: "prebuild": "tsx scripts/federate.ts", "build": "astro build"

import { mkdir, writeFile, rm } from "node:fs/promises";
import { z } from "zod";
import manifest from "../projects.manifest.json" assert { type: "json" };

const RAW = "https://raw.githubusercontent.com";

// ---- contracts every io-page branch must honor ----
const MetaSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  tagline: z.string(),
  status: z.enum(["active", "shipped", "archived"]),
  stack: z.array(z.string()),
  repo: z.string().url(),
  demo: z.string().url().optional(),
  accent: z.tuple([z.number(), z.number(), z.number()]).optional(), // OKLCH [L C H]
  featured: z.boolean().default(false),
  order: z.number().default(0),
});

const ManifestSchema = z.object({
  owner: z.string(),
  projects: z.array(
    z.object({
      repo: z.string(),                 // "stcksmsh/Kap"
      branch: z.string().default("io-page"),
      contentPath: z.string().default(""), // subdir inside branch, if any
      enabled: z.boolean().default(true),
    })
  ),
});

async function fetchText(url: string): Promise<string | null> {
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
  return res.text();
}

// GitHub API to list devlog files in a branch dir (needs no auth for public)
async function listDevlogs(repo: string, branch: string, path: string) {
  const dir = [path, "devlogs"].filter(Boolean).join("/");
  const api = `https://api.github.com/repos/${repo}/contents/${dir}?ref=${branch}`;
  const res = await fetch(api, { headers: { "Accept": "application/vnd.github+json" } });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`${res.status} listing ${api}`);
  const items = (await res.json()) as Array<{ name: string; type: string }>;
  return items.filter((i) => i.type === "file" && i.name.endsWith(".md")).map((i) => i.name);
}

async function main() {
  const { projects: all } = ManifestSchema.parse(manifest);
  const projects = all.filter((p) => p.enabled);
  const outProjects = "src/content/projects";
  const outDevlogs = "src/content/devlogs";
  await rm(outProjects, { recursive: true, force: true });
  await rm(outDevlogs, { recursive: true, force: true });
  await mkdir(outProjects, { recursive: true });

  const index: Array<Record<string, unknown>> = [];

  if (projects.length === 0) {
    console.log("No enabled projects in projects.manifest.json — writing empty federation.");
  }

  for (const p of projects) {
    const base = [p.branch, p.contentPath].filter(Boolean).join("/");
    const metaRaw = await fetchText(`${RAW}/${p.repo}/${base}/meta.json`);
    if (!metaRaw) {
      console.error(`✗ ${p.repo}: no meta.json on ${p.branch} — skipping`);
      continue;
    }
    // fail LOUD on a malformed project rather than corrupt the site
    const meta = MetaSchema.parse(JSON.parse(metaRaw));

    // write project record as a data-collection JSON entry
    await writeFile(`${outProjects}/${meta.slug}.json`, JSON.stringify(meta, null, 2));

    // pull its devlogs into a per-project folder
    const files = await listDevlogs(p.repo, p.branch, p.path);
    if (files.length) await mkdir(`${outDevlogs}/${meta.slug}`, { recursive: true });
    for (const name of files) {
      const md = await fetchText(`${RAW}/${p.repo}/${base}/devlogs/${name}`);
      if (!md) continue;
      // stamp project slug into frontmatter so the global feed can group
      const stamped = md.replace(/^---\n/, `---\nproject: ${meta.slug}\n`);
      await writeFile(`${outDevlogs}/${meta.slug}/${name}`, stamped);
      index.push({ project: meta.slug, file: name });
    }
    console.log(`✓ ${meta.slug}: ${files.length} devlog(s)`);
  }

  await writeFile("src/content/_federation.json", JSON.stringify({ builtAt: new Date().toISOString(), index }, null, 2));
  console.log(`\nFederated ${projects.length} project(s).`);
}

main().catch((e) => { console.error(e); process.exit(1); });
