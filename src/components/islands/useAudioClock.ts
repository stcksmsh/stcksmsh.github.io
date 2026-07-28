import { useEffect, useRef, useState } from "react";

/**
 * A single shared periodic clock. Every canvas island reads from the same
 * phase so the whole site breathes at one frequency — coherence is what
 * separates maximalist from cluttered.
 *
 * Respects prefers-reduced-motion by freezing phase at 0 (a static waveform).
 */
export function useAudioClock(periodSeconds = 4) {
  const [phase, setPhase] = useState(0); // 0..1
  const raf = useRef<number>();
  const start = useRef<number>();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setPhase(0); return; }

    const tick = (t: number) => {
      if (start.current === undefined) start.current = t;
      const elapsed = (t - start.current) / 1000;
      setPhase((elapsed / periodSeconds) % 1);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [periodSeconds]);

  return phase;
}
