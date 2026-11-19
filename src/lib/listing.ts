// A project whose publication.json says `visibility: "unlisted"` keeps its
// own /projects/<slug> page but stays out of every listing (/projects,
// homepage selected work). Absent visibility = public.
export const isListed = (p: { visibility?: string }) => p.visibility !== "unlisted";
