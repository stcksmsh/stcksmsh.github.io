import { useEffect, useRef, useState } from "react";

type Mode = "wave" | "lissajous";

interface Props {
  mode?: Mode;
  /** OKLCH accent as [L, C, H]; falls back to house orange */
  accent?: [number, number, number];
  height?: number;
  /** Lissajous frequency ratio a:b */
  ratio?: [number, number];
  /** When set, renders a play button + title alongside the canvas, and the
   * trace reacts in real time to this track's frequency spectrum via a
   * self-hosted <audio> + Web Audio AnalyserNode. */
  audioSrc?: string;
  trackTitle?: string;
  /** SoundCloud sync mode — mutually exclusive with audioSrc. Renders the
   * real SoundCloud iframe (scEmbedSrc) below the scope and drives the
   * trace from a precomputed audio-feature envelope (envelopeSrc), indexed
   * by real playback position from the Widget API. Not truly audio-reactive
   * (the iframe's actual audio is unreachable — cross-origin), but genuinely
   * synced to the real track instead of just idling. See ARCHITECTURE.md. */
  scEmbedSrc?: string;
  envelopeSrc?: string;
}

interface Envelope {
  hopMs: number;
  durationS: number;
  /** flat, hop-major: [rms0, low0, high0, rms1, low1, high1, ...], each 0-255 */
  data: Uint8Array;
}

const IDLE_HINT = "press play — the curve reacts to the sound";
const PLAYING_HINT = "reacting to audio spectrum";
const SC_WIDGET_API = "https://w.soundcloud.com/player/api.js";

let scApiPromise: Promise<void> | null = null;
function loadScWidgetApi(): Promise<void> {
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

async function fetchEnvelope(url: string): Promise<Envelope> {
  const res = await fetch(url);
  const json = await res.json();
  return { hopMs: json.hopMs, durationS: json.durationS, data: new Uint8Array(json.envelope) };
}

/**
 * The site signature. A live scope trace — either a scrolling waveform or a
 * Lissajous figure (nods directly to Kosta's Python Lissajous visualizer and
 * music work). Draws its own RAF loop; retints to the current project accent.
 * Freezes to a static trace under prefers-reduced-motion.
 */
export default function Oscilloscope({
  mode = "lissajous",
  accent = [0.686, 0.205, 34],
  height = 420,
  ratio = [3, 2],
  audioSrc,
  trackTitle,
  scEmbedSrc,
  envelopeSrc,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const connectRef = useRef<() => void>();
  const [playing, setPlaying] = useState(false);

  const reactive = Boolean(audioSrc) || Boolean(scEmbedSrc && envelopeSrc);

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

    // Audio-reactive graph — only wired up when a track is attached. Created
    // lazily on first play (AudioContext needs a user gesture to start).
    let analyser: AnalyserNode | null = null;
    let freq: Uint8Array | null = null;
    let energy = 0;
    if (audioSrc && audioRef.current) {
      connectRef.current = () => {
        if (analyser) return;
        const audioEl = audioRef.current!;
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        const actx: AudioContext = new AC();
        const src = actx.createMediaElementSource(audioEl);
        analyser = actx.createAnalyser();
        analyser.fftSize = 256;
        freq = new Uint8Array(analyser.frequencyBinCount);
        src.connect(analyser);
        analyser.connect(actx.destination);
      };
    }

    // SoundCloud sync — no raw audio access (cross-origin iframe), so we
    // interpolate a precomputed feature envelope against the Widget API's
    // real playback position instead of analysing live audio.
    let envelope: Envelope | null = null;
    let lastKnownMs = 0;
    let lastKnownAt = performance.now();
    let scPlaying = false;
    let destroyed = false;

    if (scEmbedSrc && envelopeSrc && iframeRef.current) {
      fetchEnvelope(envelopeSrc).then((env) => { envelope = env; }).catch(() => {});
      loadScWidgetApi().then(() => {
        if (destroyed || !iframeRef.current) return;
        const SC = (window as any).SC;
        const widget = SC.Widget(iframeRef.current);
        widget.bind(SC.Widget.Events.PLAY, () => { scPlaying = true; setPlaying(true); });
        widget.bind(SC.Widget.Events.PAUSE, () => { scPlaying = false; setPlaying(false); });
        widget.bind(SC.Widget.Events.FINISH, () => { scPlaying = false; setPlaying(false); });
        widget.bind(SC.Widget.Events.PLAY_PROGRESS, (e: { currentPosition: number }) => {
          lastKnownMs = e.currentPosition;
          lastKnownAt = performance.now();
        });
      }).catch(() => {});
    }

    let raf = 0;
    const t0 = performance.now();

    const draw = (now: number) => {
      const t = reduce ? 0.15 : (now - t0) / 1000;
      ctx.clearRect(0, 0, W, Hh);

      if (analyser && freq) {
        analyser.getByteFrequencyData(freq);
        let s = 0;
        for (let i = 0; i < freq.length; i++) s += freq[i];
        energy = s / freq.length / 255;
      } else if (envelope) {
        const estMs = scPlaying ? lastKnownMs + (now - lastKnownAt) : lastKnownMs;
        const hopIdx = Math.min(
          Math.floor(estMs / envelope.hopMs),
          envelope.data.length / 3 - 2
        );
        const frac = (estMs % envelope.hopMs) / envelope.hopMs;
        const i0 = Math.max(0, hopIdx) * 3;
        const i1 = i0 + 3;
        const rms0 = envelope.data[i0] ?? 0, rms1 = envelope.data[i1] ?? rms0;
        const rms = (rms0 + (rms1 - rms0) * frac) / 255;
        energy = scPlaying ? rms : energy * 0.95;
      } else {
        energy *= 0.95;
      }

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

    return () => { destroyed = true; cancelAnimationFrame(raf); ro.disconnect(); };
  }, [mode, accent, ratio, audioSrc, scEmbedSrc, envelopeSrc, reactive]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    connectRef.current?.();
    if (playing) audio.pause();
    else audio.play();
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Oscilloscope trace"
        style={{ width: "100%", height, display: "block" }}
      />
      {audioSrc && (
        <div className="oscilloscope-player">
          <audio
            ref={audioRef}
            src={audioSrc}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
          <button
            type="button"
            className="oscilloscope-playbtn"
            onClick={togglePlay}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? "❚❚" : "▶"}
          </button>
          <div className="oscilloscope-ptext">
            {trackTitle && <b>{trackTitle}</b>}
            <span>{playing ? PLAYING_HINT : IDLE_HINT}</span>
          </div>
        </div>
      )}
      {scEmbedSrc && (
        <iframe
          ref={iframeRef}
          loading="lazy"
          width="100%"
          height="166"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          title={trackTitle}
          src={scEmbedSrc}
          style={{ display: "block", border: 0 }}
        />
      )}
    </div>
  );
}
