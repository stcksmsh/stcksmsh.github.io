import { useCallback, useEffect, useRef, useState } from "react";
import { useScopeDraw, type ScopeMode } from "./useScopeDraw";
import { loadScWidgetApi, fetchEnvelope, envelopeEnergyAt, type Envelope } from "../../lib/soundcloud-sync";

interface Props {
  mode?: ScopeMode;
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
   * by real playback position from the Widget API. */
  scEmbedSrc?: string;
  envelopeSrc?: string;
}

const IDLE_HINT = "press play — the curve reacts to the sound";
const PLAYING_HINT = "reacting to audio spectrum";

/**
 * The site signature. A live scope trace — either a scrolling waveform or a
 * Lissajous figure (nods directly to Kosta's Python Lissajous visualizer and
 * music work). Retints to the current project accent, freezes to a static
 * trace under prefers-reduced-motion. Canvas drawing lives in useScopeDraw
 * (shared with GlobalPlayer's mini scope); this component just owns the
 * energy source — self-hosted AnalyserNode, SoundCloud-synced envelope, or
 * pure ambient.
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

  // ---- self-hosted: live Web Audio AnalyserNode ----
  const analyserRef = useRef<AnalyserNode | null>(null);
  const freqRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!audioSrc || !audioRef.current) return;
    connectRef.current = () => {
      if (analyserRef.current) return;
      const audioEl = audioRef.current!;
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const actx: AudioContext = new AC();
      const src = actx.createMediaElementSource(audioEl);
      const analyser = actx.createAnalyser();
      analyser.fftSize = 256;
      freqRef.current = new Uint8Array(analyser.frequencyBinCount);
      src.connect(analyser);
      analyser.connect(actx.destination);
      analyserRef.current = analyser;
    };
  }, [audioSrc]);

  // ---- SoundCloud sync: Widget API position -> precomputed envelope ----
  const envelopeRef = useRef<Envelope | null>(null);
  const lastKnownMsRef = useRef(0);
  const lastKnownAtRef = useRef(performance.now());
  const scPlayingRef = useRef(false);

  useEffect(() => {
    if (!scEmbedSrc || !envelopeSrc || !iframeRef.current) return;
    let destroyed = false;
    fetchEnvelope(envelopeSrc).then((env) => { envelopeRef.current = env; }).catch(() => {});
    loadScWidgetApi().then(() => {
      if (destroyed || !iframeRef.current) return;
      const SC = (window as any).SC;
      const widget = SC.Widget(iframeRef.current);
      widget.bind(SC.Widget.Events.PLAY, () => { scPlayingRef.current = true; setPlaying(true); });
      widget.bind(SC.Widget.Events.PAUSE, () => { scPlayingRef.current = false; setPlaying(false); });
      widget.bind(SC.Widget.Events.FINISH, () => { scPlayingRef.current = false; setPlaying(false); });
      widget.bind(SC.Widget.Events.PLAY_PROGRESS, (e: { currentPosition: number }) => {
        lastKnownMsRef.current = e.currentPosition;
        lastKnownAtRef.current = performance.now();
      });
    }).catch(() => {});
    return () => { destroyed = true; };
  }, [scEmbedSrc, envelopeSrc]);

  const getEnergy = useCallback((prev: number) => {
    const analyser = analyserRef.current, freq = freqRef.current;
    if (analyser && freq) {
      analyser.getByteFrequencyData(freq);
      let s = 0;
      for (let i = 0; i < freq.length; i++) s += freq[i];
      return s / freq.length / 255;
    }
    const envelope = envelopeRef.current;
    if (envelope) {
      const scPlaying = scPlayingRef.current;
      const estMs = scPlaying
        ? lastKnownMsRef.current + (performance.now() - lastKnownAtRef.current)
        : lastKnownMsRef.current;
      return scPlaying ? envelopeEnergyAt(envelope, estMs) : prev * 0.95;
    }
    return prev * 0.95;
  }, []);

  useScopeDraw({ canvasRef, mode, accent, ratio, reactive, getEnergy });

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
