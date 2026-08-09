// Shared by every "newsreel" chip ticker (.stack tech tags, .tags devlog
// tags): repeats a short list enough times that the doubled ticker track
// (see global.css's .ticker-viewport/.ticker-track) never has visible gaps
// when translateX(-50%) loops it, even for a 1-2 item list.
export function padForTicker<T>(items: T[], minCount = 6): T[] {
  if (items.length === 0) return items;
  const reps = Math.max(1, Math.ceil(minCount / items.length));
  return Array.from({ length: reps }, () => items).flat();
}
