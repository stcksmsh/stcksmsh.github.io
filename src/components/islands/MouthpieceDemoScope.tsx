import { useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import { useScopeDraw } from "./useScopeDraw";
import { requestDuck } from "../../lib/player-bus";

interface DemoSegment {
  id: string;
  audioFile: string;
  durationMs: number;
  label: string;
  parentWord: string | null;
  speaker: string | null;
  sourceUrl: string | null;
  /** True when this segment is >1 target unit glued as one real continuous
   * corpus span (a natural-run match) rather than an independently sourced
   * single unit — see mouthpiece/match.py:find_syllable_run(). */
  natural: boolean;
}

interface DemoEntry {
  text: string;
  slug: string;
  segments: DemoSegment[];
}

interface Props {
  /** Project slug — assets live at /demo/<slug>/manifest.json + /clips/. */
  slug: string;
  accent?: [number, number, number];
}

// Matches assemble.py's SYLL_CROSSFADE (12ms) — the tight join width between
// segments of one stitched word. Reimplemented here as a genuine linear
// crossfade (equal ramps summing to ~1 across the overlap), the same
// technique as assemble.py:_crossfade_join(), not a canned recording. This
// demo's own audio is same-origin local clips (unlike the site's SoundCloud-
// based global player), so it gets a real Web Audio graph + live scope.
const CROSSFADE_SEC = 0.012;
const LEAD_IN_SEC = 0.05;

/**
 * The MOUTHPIECE project page's headline demo: pick a curated word/phrase,
 * hear it genuinely reassembled client-side from real corpus fragments via
 * Web Audio (see scripts/federate.ts for how the fragments + provenance get
 * here, mouthpiece/export_demo.py for how they were cut). Ducks the global
 * music player for the duration (src/lib/player-bus.ts's requestDuck, which
 * GlobalPlayer fulfils by fading the SoundCloud widget's volume).
 */
export default function MouthpieceDemoScope({ slug, accent = [0.65, 0.22, 340] }: Props) {
  const [entries, setEntries] = useState<DemoEntry[] | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<DemoEntry | null>(null);
  const [playing, setPlaying] = useState(false);
  const [activeSeg, setActiveSeg] = useState(-1);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const freqRef = useRef<Uint8Array | null>(null);
  const playingRef = useRef(false);
  const bufferCache = useRef<Map<string, AudioBuffer>>(new Map());
  const stopRef = useRef<() => void>(() => {});

  useEffect(() => {
    fetch(`/demo/${slug}/manifest.json`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setEntries)
      .catch(() => setEntries([]));
  }, [slug]);

  const fuse = useMemo(
    () => (entries ? new Fuse(entries, { keys: ["text"], threshold: 0.4, ignoreLocation: true }) : null),
    [entries]
  );
  const visible = useMemo(() => {
    if (!entries) return [];
    if (!query.trim()) return entries;
    return fuse ? fuse.search(query).map((r) => r.item) : entries;
  }, [query, fuse, entries]);

  function getAudioCtx(): { ctx: AudioContext; analyser: AnalyserNode } {
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new AC();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.connect(ctx.destination);
      ctxRef.current = ctx;
      analyserRef.current = analyser;
      freqRef.current = new Uint8Array(analyser.frequencyBinCount);
    }
    return { ctx: ctxRef.current, analyser: analyserRef.current! };
  }

  async function loadBuffer(ctx: AudioContext, url: string): Promise<AudioBuffer> {
    const cached = bufferCache.current.get(url);
    if (cached) return cached;
    const res = await fetch(url);
    const arrBuf = await res.arrayBuffer();
    const buf = await ctx.decodeAudioData(arrBuf);
    bufferCache.current.set(url, buf);
    return buf;
  }

  async function play(entry: DemoEntry) {
    stopRef.current();
    setActive(entry);
    setPlaying(true);
    setActiveSeg(-1);
    requestDuck(true);

    const { ctx, analyser } = getAudioCtx();
    await ctx.resume();

    let stopped = false;
    stopRef.current = () => {
      if (stopped) return;
      stopped = true;
      setPlaying(false);
      setActiveSeg(-1);
      requestDuck(false);
    };

    let buffers: AudioBuffer[];
    try {
      buffers = await Promise.all(
        entry.segments.map((s) => loadBuffer(ctx, `/demo/${slug}/${s.audioFile}`))
      );
    } catch {
      stopRef.current();
      return;
    }
    if (stopped) return;

    const nodes: AudioBufferSourceNode[] = [];
    const segStarts: number[] = [];
    let t = ctx.currentTime + LEAD_IN_SEC;
    for (let i = 0; i < buffers.length; i++) {
      const buf = buffers[i];
      const src = ctx.createBufferSource();
      const g = ctx.createGain();
      src.buffer = buf;
      src.connect(g);
      g.connect(analyser);

      const dur = buf.duration;
      const xf = Math.min(CROSSFADE_SEC, dur / 4);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(1, t + xf);
      g.gain.setValueAtTime(1, t + dur - xf);
      g.gain.linearRampToValueAtTime(0, t + dur);

      src.start(t);
      segStarts.push(t);
      nodes.push(src);
      t += dur - xf; // next segment overlaps this one's fade-out
    }
    const totalDur = t + CROSSFADE_SEC - (ctx.currentTime + LEAD_IN_SEC);
    const startedAt = ctx.currentTime;

    stopRef.current = () => {
      if (stopped) return;
      stopped = true;
      nodes.forEach((n) => { try { n.stop(); } catch {} });
      setPlaying(false);
      setActiveSeg(-1);
      requestDuck(false);
    };

    const tick = () => {
      if (stopped) return;
      const elapsed = ctx.currentTime - startedAt;
      if (elapsed >= totalDur) { stopRef.current(); return; }
      let idx = -1;
      for (let i = 0; i < segStarts.length; i++) {
        if (elapsed >= segStarts[i] - startedAt) idx = i;
      }
      setActiveSeg(idx);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  useEffect(() => () => stopRef.current(), []);
  playingRef.current = playing;

  const getEnergy = (prev: number) => {
    const analyser = analyserRef.current, freq = freqRef.current;
    if (!analyser || !freq || !playingRef.current) return prev * 0.9;
    analyser.getByteFrequencyData(freq);
    let sum = 0;
    for (let i = 0; i < freq.length; i++) sum += freq[i];
    return sum / freq.length / 255;
  };
  useScopeDraw({ canvasRef, mode: "wave", accent, ratio: [3, 2], reactive: true, getEnergy });

  if (entries === null) {
    return <div className="mp-demo coord">// loading demo…</div>;
  }
  if (entries.length === 0) {
    return null; // demo bundle absent (e.g. local dev before federation) — hero still works without it
  }

  return (
    <div className="mp-demo">
      <input
        type="text"
        className="mp-demo-input"
        placeholder="type a word… try “concatenative”"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search demo words"
      />
      <div className="mp-demo-chips">
        {visible.map((e) => (
          <button
            key={e.slug}
            type="button"
            className={"mp-chip" + (active?.slug === e.slug ? " on" : "")}
            onClick={() => play(e)}
          >
            {e.text}
          </button>
        ))}
        {visible.length === 0 && <span className="coord mp-demo-empty">// no match — try one of the words above</span>}
      </div>

      <canvas ref={canvasRef} className="mp-demo-scope" role="img" aria-label="Oscilloscope trace of the demo playback" />

      {active && (
        <div className="mp-demo-tiles" aria-live="polite">
          {active.segments.map((s, i) => (
            <div
              key={s.id}
              className={"mp-tile" + (i === activeSeg ? " playing" : "") + (s.natural ? " natural" : "")}
              title={s.sourceUrl ?? undefined}
            >
              <div className="mp-tile-label">{s.label}</div>
              <div className="mp-tile-source coord">{s.parentWord ?? "—"}</div>
              <div className="mp-tile-speaker coord">{s.speaker ?? "unknown"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
