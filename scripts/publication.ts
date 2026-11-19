// scripts/publication.ts
// Level 3 ("independent publication") metadata contract. A project with its
// own website exposes publication.json at the root of its `website` branch;
// federate.ts reads ONLY that file (never the website source) and merges a
// few fields into the project's generated record. See AGENTS.md, "Project
// publication levels".
//
// Kept separate from federate.ts so it can be unit-tested without running a
// whole federation (federate.ts runs main() on import).

import { z } from "zod";

export const RAW = "https://raw.githubusercontent.com";

export const PublicationSchema = z.object({
  schemaVersion: z.literal(1),
  url: z.string().url(),
  category: z.enum(["software", "art", "music", "app"]),
  visibility: z.enum(["public", "unlisted"]),
  preview: z.string().url().optional(),
});
export type Publication = z.infer<typeof PublicationSchema>;

/** Manifest `website` flag → branch name to read, or null if not opted in. */
export function websiteBranch(flag: boolean | string | undefined): string | null {
  if (flag === true) return "website";
  if (typeof flag === "string" && flag.trim()) return flag.trim();
  return null;
}

/**
 * Fetches and validates <repo>@<branch>:publication.json. Never throws: any
 * failure (unreachable, 404, bad JSON, schema mismatch) logs a warning and
 * returns null, so the project stays at Level 1/2 and the build continues.
 */
export async function fetchPublication(
  repo: string,
  branch: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Publication | null> {
  const src = `${RAW}/${repo}/${branch}/publication.json`;
  const fallback = (why: string) => {
    console.warn(`⚠ ${repo}: ignoring publication.json on ${branch} (${why}) — staying Level 1/2`);
    return null;
  };
  try {
    const res = await fetchImpl(src);
    if (!res.ok) return fallback(`HTTP ${res.status}`);
    const parsed = PublicationSchema.safeParse(JSON.parse(await res.text()));
    if (!parsed.success) {
      return fallback(parsed.error.issues.map((i) => `${i.path.join(".") || "<root>"}: ${i.message}`).join("; "));
    }
    return parsed.data;
  } catch (e) {
    return fallback(e instanceof Error ? e.message : String(e));
  }
}

/** The subset of a publication merged into the project's collection entry. */
export function publicationFields(p: Publication) {
  return { url: p.url, category: p.category, visibility: p.visibility };
}
