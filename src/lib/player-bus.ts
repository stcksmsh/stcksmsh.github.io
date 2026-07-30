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
