import { useEffect, useRef } from "react";
import { init, type VizInstance } from "sinteza-viz";
// Vite's `?url` import, resolved and copied by OUR OWN build — not
// sinteza-viz's relative-to-import.meta.url default, which 404s once our
// bundler inlines its dist/index.js into a differently-located chunk of
// ours (confirmed; see sinteza-viz's VizOpts.renderWorkerUrl doc comment).
import renderWorkerUrl from "sinteza-viz/dist/render-worker.js?url";
import type { TransportEvent } from "../../lib/player-bus";

const DEFAULT_ACCENT: [number, number, number] = [0.686, 0.205, 34];
const TRANSPORT_EVENT = "player:transport";

/**
 * The persistent СИНТЕЗА visualizer, mounted as the hero's background layer
 * (SINTEZA_VIZ.md). Always position-only mode: GlobalPlayer is the sole
 * playback source and it's SoundCloud-embedded (cross-origin — no
 * AnalyserNode is ever reachable), so this never attaches live audio. It
 * drives entirely off the player:transport bus GlobalPlayer dispatches
 * (position/trackchange) and each track's own sidecar
 * (StructureSource.synthesize() on the package side) — idle and fully
 * alive with nothing playing (SINTEZA_VIZ.md §8), reactive once something
 * is.
 */
export default function SintezaBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const instance: VizInstance = init(canvas, { accent: DEFAULT_ACCENT, tier: "full", renderWorkerUrl });

    const onTransport = (e: Event) => {
      const evt = (e as CustomEvent<TransportEvent>).detail;
      // sinteza-viz's own transport listener handles trackchange/position
      // itself (it's what loads the sidecar and drives synthesize()) — the
      // one thing it doesn't do on its own is retint, since that's a
      // separate call on the returned instance (VizInstance.setAccent).
      if (evt.type === "trackchange") {
        instance.setAccent(evt.track.accent ?? DEFAULT_ACCENT);
      }
    };
    window.addEventListener(TRANSPORT_EVENT, onTransport);

    return () => {
      window.removeEventListener(TRANSPORT_EVENT, onTransport);
      instance.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} className="sinteza-bg" role="presentation" aria-hidden="true" />;
}
