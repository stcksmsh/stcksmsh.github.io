// Plain sitemap, no integration dependency. Lists every built route.
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async ({ site }) => {
  const projects = await getCollection("projects").catch(() => []);
  const paths = ["/", "/cv/", "/projects/", "/devlog/", "/music/", ...projects.map((p) => `/projects/${p.data.slug}/`)];
  const urls = paths.map((p) => `  <url><loc>${new URL(p, site)}</loc></url>`).join("\n");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml" } },
  );
};
