// Shared helpers for syncing the oscilloscope to a SoundCloud embed's real
// playback position. See ARCHITECTURE.md — the embed's audio is completely
// unreachable (cross-origin iframe), so there's no live analysis; instead we
// precompute a feature envelope offline (scripts/analyze-track.py) and index
// into it using the Widget API's real PLAY_PROGRESS position.

const SC_WIDGET_API = "https://w.soundcloud.com/player/api.js";

let scApiPromise: Promise<void> | null = null;
export function loadScWidgetApi(): Promise<void> {
  if ((window as any).SC?.Widget) return Promise.resolve();
  if (scApiPromise) return scApiPromise;
  scApiPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SC_WIDGET_API;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("failed to load SoundCloud widget API"));
    document.head.appendChild(script);
  });
  return scApiPromise;
}

export interface Envelope {
  hopMs: number;
  durationS: number;
  /** flat, hop-major: [rms0, low0, high0, rms1, low1, high1, ...], each 0-255 */
  data: Uint8Array;
}

export async function fetchEnvelope(url: string): Promise<Envelope> {
  const res = await fetch(url);
  const json = await res.json();
  return { hopMs: json.hopMs, durationS: json.durationS, data: new Uint8Array(json.envelope) };
}

/** Look up + interpolate the rms channel at a given playback position (ms). */
export function envelopeEnergyAt(envelope: Envelope, ms: number): number {
  const hopIdx = Math.min(Math.floor(ms / envelope.hopMs), envelope.data.length / 3 - 2);
  const frac = (ms % envelope.hopMs) / envelope.hopMs;
  const i0 = Math.max(0, hopIdx) * 3;
  const i1 = i0 + 3;
  const rms0 = envelope.data[i0] ?? 0, rms1 = envelope.data[i1] ?? rms0;
  const rms = (rms0 + (rms1 - rms0) * frac) / 255;
  // A track spends most of its time well under its own peak RMS, so raw rms
  // reads as barely-there most of the time. Perceptual boost (sqrt curve
  // lifts the mid-low range) so the sync actually reads as "reacting."
  return Math.min(1, Math.sqrt(rms) * 1.15);
}
