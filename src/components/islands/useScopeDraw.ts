import { useEffect, type RefObject } from "react";

export type ScopeMode = "wave" | "lissajous";

interface Options {
  canvasRef: RefObject<HTMLCanvasElement>;
  mode: ScopeMode;
  /** OKLCH accent as [L, C, H] */
  accent: [number, number, number];
  /** Lissajous frequency ratio a:b */
  ratio: [number, number];
  /** When true, draws the multi-layer additive "reacting" treatment
   * (thicker/brighter, ratio wobble) instead of the plain ambient trace. */
  reactive: boolean;
  /** Called once per animation frame with the previous frame's energy;
   * returns this frame's energy (0..1). Callers own their own energy
   * source (live AnalyserNode, a synced envelope, or a constant 0 for
   * pure ambient) and any decay behavior when idle. */
  getEnergy: (prevEnergy: number) => number;
}

/**
 * Shared oscilloscope canvas renderer — resize, RAF loop, and the
 * Lissajous/wave drawing math. Pulled out of Oscilloscope.tsx so the
 * GlobalPlayer's mini scope can reuse the exact same visual language
 * without duplicating it.
 */
export function useScopeDraw({ canvasRef, mode, accent, ratio, reactive, getEnergy }: Options) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const [L, C, H] = accent;
    const stroke = `oklch(${L} ${C} ${H})`;
    const glow = `oklch(${L} ${C} ${H} / 0.5)`;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, Hh = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width; Hh = rect.height;
      canvas.width = W * dpr; canvas.height = Hh * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0;
    let energy = 0;
    const t0 = performance.now();

    const draw = (now: number) => {
      // Can be briefly 0x0 right after mount, before layout settles (e.g.
      // a flex sibling not yet sized) — drawing/shadow-compositing on a
      // zero-size canvas throws in some browsers, so just skip the frame.
      if (W <= 0 || Hh <= 0) {
        if (!reduce) raf = requestAnimationFrame(draw);
        return;
      }
      const t = reduce ? 0.15 : (now - t0) / 1000;
      ctx.clearRect(0, 0, W, Hh);
      energy = getEnergy(energy);

      const cx = W / 2, cy = Hh / 2;
      const energyMul = reactive ? 1 + energy * 0.9 : 1;
      const ax = W * 0.42 * energyMul, ay = Hh * 0.38 * energyMul;

      ctx.strokeStyle = stroke;
      ctx.shadowColor = glow;
      ctx.shadowBlur = 12;

      const layers = reactive && !reduce ? 3 : 1;
      if (layers > 1) ctx.globalCompositeOperation = "lighter";

      for (let l = 0; l < layers; l++) {
        ctx.globalAlpha = layers > 1 ? 0.5 - l * 0.13 : 1;
        ctx.lineWidth = 2 + energy * 2.4;
        ctx.beginPath();

        if (mode === "lissajous") {
          const [a, bBase] = ratio;
          const b = reactive ? bBase + energy * 1.5 : bBase;
          const delta = t * 0.4 + l * 0.5;
          const N = 600;
          for (let i = 0; i <= N; i++) {
            const p = (i / N) * Math.PI * 2;
            const x = cx + ax * Math.sin(a * p + delta);
            const y = cy + ay * Math.sin(b * p);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
        } else {
          const N = Math.floor(W);
          for (let i = 0; i <= N; i++) {
            const x = (i / N) * W;
            const phase = (i / N) * Math.PI * 8 - t * 3;
            const env = Math.sin((i / N) * Math.PI); // window
            const y = cy + ay * env * Math.sin(phase) * 0.7;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      if (!reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [canvasRef, mode, accent, ratio, reactive, getEnergy]);
}
