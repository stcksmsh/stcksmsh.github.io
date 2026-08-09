// Shared by every "newsreel" chip ticker (.stack tech tags, .tags devlog
// tags): repeats a short list enough times that the doubled ticker track
// (see global.css's .ticker-viewport/.ticker-track) never has visible gaps
// when translateX(-50%) loops it, even for a 1-2 item list. `null` marks a
// gap between each repetition — render it as a blank spacer (.ticker-gap)
// so the loop reads as "the same short list cycling", not one continuous
// run-on repeat of the same words.
export function padForTicker<T>(items: T[], minCount = 6): (T | null)[] {
  if (items.length === 0) return items;
  const reps = Math.max(1, Math.ceil(minCount / items.length));
  const out: (T | null)[] = [];
  for (let i = 0; i < reps; i++) out.push(...items, null);
  return out;
}
