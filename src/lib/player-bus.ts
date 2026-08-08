// Cross-island communication for the global player. GlobalPlayer lives once
// in Base.astro (transition:persist, survives navigation); track cards on
// /music and the homepage are separate islands on separate pages. A window
// CustomEvent bus is the lightest way to bridge them without adding a state
// library for what's fundamentally one message type.

export interface PlayerTrack {
  slug: string;
  title: string;
  embedId: string;
  accent?: [number, number, number];
  envelope?: string;
  // sinteza-viz schema-2 sidecar path (see src/content/config.ts) — kept
  // separate from `envelope` above, a different file format for a
  // different consumer (Oscilloscope's simple position-synced energy vs.
  // sinteza-viz's full StructureSource.synthesize() input).
  sidecar?: string;
}

const REQUEST_PLAY = "player:request-play";

export function requestPlay(track: PlayerTrack) {
  window.dispatchEvent(new CustomEvent<PlayerTrack>(REQUEST_PLAY, { detail: track }));
}

export function onRequestPlay(cb: (track: PlayerTrack) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent<PlayerTrack>).detail);
  window.addEventListener(REQUEST_PLAY, handler);
  return () => window.removeEventListener(REQUEST_PLAY, handler);
}

// ---- player:transport ----
// The bus sinteza-viz's init() listens to itself (its src/index.ts, "matching
// the host's own src/lib/player-bus.ts by convention, not by import" — the
// two repos can't share types across the package boundary, so this shape is
// duplicated by agreement, not imported). GlobalPlayer is the only
// dispatcher: it owns the one shared SoundCloud widget and is the sole
// source of truth for what's actually playing.
export interface TransportTrack {
  slug: string;
  title: string;
  accent?: [number, number, number];
  // sinteza-viz's own field name for "precomputed sidecar URL" — fed from
  // PlayerTrack.sidecar above, not PlayerTrack.envelope.
  envelope?: string;
}

export type TransportEvent =
  | { type: "play" }
  | { type: "pause" }
  | { type: "seek"; positionSec: number }
  | { type: "trackchange"; track: TransportTrack }
  | { type: "position"; positionSec: number };

const TRANSPORT_EVENT = "player:transport";

export function dispatchTransport(evt: TransportEvent) {
  window.dispatchEvent(new CustomEvent<TransportEvent>(TRANSPORT_EVENT, { detail: evt }));
}
