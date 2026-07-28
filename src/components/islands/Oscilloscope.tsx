import { useEffect, useRef } from "react";

type Mode = "wave" | "lissajous";

interface Props {
  mode?: Mode;
  /** OKLCH accent as [L, C, H]; falls back to house orange */
  accent?: [number, number, number];
  height?: number;
  /** Lissajous frequency ratio a:b */
  ratio?: [number, number];
}

/**
 * The site signature. A live scope trace — either a scrolling waveform or a
 * Lissajous figure (nods directly to Kosta's Python Lissajous visualizer and
 * music work). Draws its own RAF loop; retints to the current project accent.
 * Freezes to a static trace under prefers-reduced-motion.
 */
export default function Oscilloscope({
  mode = "lissajous",
  accent = [0.72, 0.19, 45],
  height = 420,
  ratio = [3, 2],
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
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
    const t0 = performance.now();

    const draw = (now: number) => {
      const t = reduce ? 0.15 : (now - t0) / 1000;
      ctx.clearRect(0, 0, W, Hh);

      ctx.lineWidth = 2;
      ctx.strokeStyle = stroke;
      ctx.shadowColor = glow;
      ctx.shadowBlur = 12;
      ctx.beginPath();

      const cx = W / 2, cy = Hh / 2;
      const ax = W * 0.42, ay = Hh * 0.38;

      if (mode === "lissajous") {
        const [a, b] = ratio;
        const delta = t * 0.4;
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

      if (!reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [mode, accent, ratio]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="Oscilloscope trace"
      style={{ width: "100%", height, display: "block" }}
    />
  );
}
