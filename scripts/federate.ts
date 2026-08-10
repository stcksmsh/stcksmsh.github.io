// scripts/federate.ts
// Runs BEFORE `astro build`. Pulls content from each project's `io-page`
// orphan branch and stitches it into src/content/ for Astro's collections.
// No clone, no auth for public repos — just raw.githubusercontent.com.
//
// package.json: "prebuild": "tsx scripts/federate.ts", "build": "astro build"

import { mkdir, writeFile, rm } from "node:fs/promises";
import { dirname, extname } from "node:path";
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

// A project's optional page/ bundle is split by extension: code the site's
// own Vite build needs to compile/bundle goes under src/generated/ (picked
// up by [slug].astro, see that file's frontmatter comment); everything else
// (audio, images, data files) is served as-is from public/generated/ and
// referenced by the code via absolute URL (`/generated/projects/<slug>/
// <path>`) — see AGENTS.md's "custom project pages" section for the full
// contract.
const CODE_EXTENSIONS = new Set([".tsx", ".ts", ".jsx", ".js", ".css"]);

async function fetchText(url: string): Promise<string | null> {
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
  return res.text();
}

async function fetchBinary(url: string): Promise<Buffer | null> {
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
  return Buffer.from(await res.arrayBuffer());
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

// Full recursive listing of a branch, for federating a project's freeform
// page/ bundle (unknown file names/nesting up front, unlike devlogs/*.md).
async function listTree(repo: string, branch: string) {
  const api = `https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`;
  const res = await fetch(api, { headers: { "Accept": "application/vnd.github+json" } });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`${res.status} listing tree ${api}`);
  const data = (await res.json()) as { tree: Array<{ path: string; type: string }>; truncated?: boolean };
  if (data.truncated) {
    console.warn(`⚠ ${repo}@${branch}: tree listing truncated by GitHub — some page/ files may be missing`);
  }
  return data.tree;
}

// Mirrors <branch>/<base>/page/** (if present) into src/generated/projects/
// <slug>/ (code) and public/generated/projects/<slug>/ (everything else).
// Returns true if a page/entry.tsx was found — the site only switches a
// project to full-custom-page mode when that exact file exists.
async function federateCustomPage(repo: string, branch: string, base: string, slug: string) {
  const prefix = [base, "page"].filter(Boolean).join("/") + "/";
  const tree = await listTree(repo, branch);
  const files = tree.filter((n) => n.type === "blob" && n.path.startsWith(prefix));
  let entryFound = false;
  for (const f of files) {
    const rel = f.path.slice(prefix.length);
    const isCode = CODE_EXTENSIONS.has(extname(rel));
    const dest = `${isCode ? "src" : "public"}/generated/projects/${slug}/${rel}`;
    const buf = await fetchBinary(`${RAW}/${repo}/${f.path}`);
    if (!buf) continue;
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, buf);
    if (isCode && rel === "entry.tsx") entryFound = true;
  }
  if (files.length > 0 && !entryFound) {
    console.warn(`⚠ ${slug}: page/ bundle present but no page/entry.tsx — falling back to the standard template`);
  }
  return entryFound;
}

async function main() {
  const { projects: all } = ManifestSchema.parse(manifest);
  const projects = all.filter((p) => p.enabled);
  const outProjects = "src/content/projects";
  const outDevlogs = "src/content/devlogs";
  await rm(outProjects, { recursive: true, force: true });
  await rm(outDevlogs, { recursive: true, force: true });
  await rm("src/generated/projects", { recursive: true, force: true });
  await rm("public/generated/projects", { recursive: true, force: true });
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
    const files = await listDevlogs(p.repo, p.branch, p.contentPath);
    if (files.length) await mkdir(`${outDevlogs}/${meta.slug}`, { recursive: true });
    for (const name of files) {
      const md = await fetchText(`${RAW}/${p.repo}/${base}/devlogs/${name}`);
      if (!md) continue;
      // stamp project slug into frontmatter so the global feed can group
      const stamped = md.replace(/^---\n/, `---\nproject: ${meta.slug}\n`);
      await writeFile(`${outDevlogs}/${meta.slug}/${name}`, stamped);
      index.push({ project: meta.slug, file: name });
    }

    const hasCustomPage = await federateCustomPage(p.repo, p.branch, base, meta.slug);
    console.log(`✓ ${meta.slug}: ${files.length} devlog(s)${hasCustomPage ? ", custom page" : ""}`);
  }

  await writeFile("src/content/_federation.json", JSON.stringify({ builtAt: new Date().toISOString(), index }, null, 2));
  console.log(`\nFederated ${projects.length} project(s).`);
}

main().catch((e) => { console.error(e); process.exit(1); });
