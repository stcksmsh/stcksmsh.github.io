import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { padForTicker } from "../../lib/ticker";

export interface DevlogFeedEntry {
  id: string;
  title: string;
  date: string; // ISO
  tags: string[];
  excerpt: string;
  href: string;
  project: { slug: string; title: string; accent?: [number, number, number] };
}

interface Props {
  entries: DevlogFeedEntry[];
}

/**
 * Global reverse-chron devlog feed with a client-side fuzzy filter. All
 * entries are federated at build time (see scripts/federate.ts) — this
 * island only narrows what's already on the page, no fetching.
 */
export default function DevlogFeed({ entries }: Props) {
  const [query, setQuery] = useState("");

  const fuse = useMemo(
    () =>
      new Fuse(entries, {
        keys: ["title", "excerpt", "tags", "project.title"],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [entries]
  );

  const visible = useMemo(
    () => (query.trim() ? fuse.search(query).map((r) => r.item) : entries),
    [query, fuse, entries]
  );

  return (
    <div className="devlog-feed">
      <div className="devlog-search">
        <input
          type="search"
          placeholder="filter by title, project, tag…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Filter devlog entries"
        />
        <span className="devlog-count coord">
          {visible.length} / {entries.length}
        </span>
      </div>

      {visible.length === 0 ? (
        <p className="empty coord">// no entries match "{query}"</p>
      ) : (
        <ul className="stream">
          {visible.map((entry) => (
            <li
              key={entry.id}
              className="entry"
              style={
                entry.project.accent
                  ? ({
                      "--accent-l": entry.project.accent[0],
                      "--accent-c": entry.project.accent[1],
                      "--accent-h": entry.project.accent[2],
                    } as React.CSSProperties)
                  : undefined
              }
            >
              <div className="entry-meta coord">
                <time dateTime={entry.date}>{entry.date.slice(0, 10)}</time>
                <a className="project-chip" href={`/projects/${entry.project.slug}`}>
                  {entry.project.title}
                </a>
                {entry.tags.length > 0 && (
                  // Decorative — a constantly-scrolling duplicated list has
                  // nothing useful to announce; the tags are already present
                  // as real (searchable) data on this entry.
                  <div className="ticker-viewport" aria-hidden="true">
                    {/* Padded (with a gap marker between each rep) then doubled,
                        so the ticker loop (translateX -50%) is seamless even
                        for 1-2 tags. */}
                    <ul className="tags">
                      {[...padForTicker(entry.tags), ...padForTicker(entry.tags)].map((t, i) =>
                        t === null ? (
                          <li key={`gap-${i}`} className="ticker-gap" />
                        ) : (
                          <li key={`${t}-${i}`}>{t}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
              <h3>
                <a href={entry.href}>{entry.title}</a>
              </h3>
              <p className="entry-excerpt">{entry.excerpt}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
