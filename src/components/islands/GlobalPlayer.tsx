import { useCallback, useEffect, useRef, useState } from "react";
import { useScopeDraw } from "./useScopeDraw";
import { loadScWidgetApi, fetchEnvelope, envelopeEnergyAt, type Envelope } from "../../lib/soundcloud-sync";
import { onRequestPlay, type PlayerTrack } from "../../lib/player-bus";

interface Props {
  /** Full SoundCloud-sourced playlist, in display order. Bandcamp tracks
   * have no control API (no Widget equivalent) so they're never part of
   * this — they stay plain embeds on /music. */
  tracks: PlayerTrack[];
}

const DEFAULT_ACCENT: [number, number, number] = [0.686, 0.205, 34];

/**
 * Persistent bottom player — transition:persist'd into every page via
 * Base.astro, so playback survives navigation (this is an MPA; without
 * View Transitions + persist, audio would stop on every link click). Owns
 * a single hidden SoundCloud iframe, swapped between tracks via the Widget
 * API's load() rather than re-mounting a new iframe per track. Other
 * islands (track cards on /music, the homepage carousel) request playback
 * via the player-bus rather than embedding their own iframes.
 */
export default function GlobalPlayer({ tracks }: Props) {
  const [index, setIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const widgetRef = useRef<any>(null);
  const envelopeRef = useRef<Envelope | null>(null);
  const lastKnownMsRef = useRef(0);
  const lastKnownAtRef = useRef(performance.now());
  const playingRef = useRef(false);
  const indexRef = useRef<number | null>(null);
  indexRef.current = index;

  const current = index !== null ? tracks[index] : null;

  // Bind the widget once, to the first track (may not play until requested).
  useEffect(() => {
    if (tracks.length === 0 || !iframeRef.current) return;
    let destroyed = false;
    loadScWidgetApi().then(() => {
      if (destroyed || !iframeRef.current) return;
      const SC = (window as any).SC;
      const widget = SC.Widget(iframeRef.current);
      widgetRef.current = widget;
      widget.bind(SC.Widget.Events.READY, () => setReady(true));
      widget.bind(SC.Widget.Events.PLAY, () => { playingRef.current = true; setPlaying(true); });
      widget.bind(SC.Widget.Events.PAUSE, () => { playingRef.current = false; setPlaying(false); });
      widget.bind(SC.Widget.Events.FINISH, () => {
        playingRef.current = false;
        setPlaying(false);
        // auto-advance the playlist
        const next = (indexRef.current ?? -1) + 1;
        if (next < tracks.length) playTrack(next);
      });
      widget.bind(SC.Widget.Events.PLAY_PROGRESS, (e: { currentPosition: number }) => {
        lastKnownMsRef.current = e.currentPosition;
        lastKnownAtRef.current = performance.now();
      });
    }).catch(() => {});
    return () => { destroyed = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks.length]);

  const playTrack = useCallback((i: number, autoPlay = true) => {
    const track = tracks[i];
    if (!track || !widgetRef.current) return;
    setIndex(i);
    envelopeRef.current = null;
    if (track.envelope) fetchEnvelope(track.envelope).then((env) => { envelopeRef.current = env; }).catch(() => {});
    widgetRef.current.load(`https://soundcloud.com/${track.embedId}`, {
      auto_play: autoPlay,
      hide_related: true,
      show_comments: false,
      show_reposts: false,
      show_teaser: false,
      visual: false,
    });
    // load() re-fires READY; position resets for the new track
    lastKnownMsRef.current = 0;
    lastKnownAtRef.current = performance.now();
  }, [tracks]);

  // Cross-island: /music and the homepage carousel request playback here.
  useEffect(() => onRequestPlay((track) => {
    const i = tracks.findIndex((t) => t.slug === track.slug);
    if (i >= 0) playTrack(i);
  }), [tracks, playTrack]);

  const togglePlay = () => {
    if (!widgetRef.current) return;
    if (index === null) { playTrack(0); return; }
    if (playing) widgetRef.current.pause();
    else widgetRef.current.play();
  };
  const prev = () => { if (index !== null) playTrack((index - 1 + tracks.length) % tracks.length); };
  const next = () => { if (index !== null) playTrack((index + 1) % tracks.length); };

  const getEnergy = useCallback((prevEnergy: number) => {
    const envelope = envelopeRef.current;
    if (!envelope || !playingRef.current) return prevEnergy * 0.95;
    const estMs = lastKnownMsRef.current + (performance.now() - lastKnownAtRef.current);
    return envelopeEnergyAt(envelope, estMs);
  }, []);

  const accent = current?.accent ?? DEFAULT_ACCENT;
  useScopeDraw({ canvasRef, mode: "wave", accent, ratio: [3, 2], reactive: true, getEnergy });

  if (tracks.length === 0) return null;

  return (
    <div className="global-player" style={accent ? ({ "--accent-l": accent[0], "--accent-c": accent[1], "--accent-h": accent[2] } as any) : undefined}>
      <div className="gp-shell shell">
        <button type="button" className="gp-btn" onClick={prev} aria-label="Previous track" disabled={tracks.length < 2}>⏮</button>
        <button type="button" className="gp-btn gp-play" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
          {playing ? "❚❚" : "▶"}
        </button>
        <button type="button" className="gp-btn" onClick={next} aria-label="Next track" disabled={tracks.length < 2}>⏭</button>
        <canvas ref={canvasRef} className="gp-scope" role="img" aria-label="Oscilloscope trace" />
        <div className="gp-title">
          {current ? <b>{current.title}</b> : <span className="gp-hint">press play — {tracks.length} track{tracks.length === 1 ? "" : "s"}</span>}
        </div>
      </div>
      <iframe
        ref={iframeRef}
        title="global player"
        allow="autoplay"
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(`https://soundcloud.com/${tracks[0].embedId}`)}&auto_play=false&hide_related=true&show_comments=false&show_reposts=false&show_teaser=false&visual=false`}
        // Off-screen at a real size, not shrunk to ~0px — SoundCloud's own
        // widget JS renders its internal waveform canvas at the iframe's
        // size and throws (their bug, not ours) if that's ~0.
        style={{ position: "fixed", left: -9999, top: -9999, width: 300, height: 166, pointerEvents: "none" }}
      />
    </div>
  );
}
