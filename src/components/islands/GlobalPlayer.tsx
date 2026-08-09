import { useCallback, useEffect, useRef, useState } from "react";
import { loadScWidgetApi } from "../../lib/soundcloud-sync";
import { onRequestPlay, dispatchTransport, type PlayerTrack } from "../../lib/player-bus";

interface Props {
  /** Full SoundCloud-sourced playlist, in display order. Bandcamp tracks
   * have no control API (no Widget equivalent) so they're never part of
   * this — they stay plain embeds on /music. */
  tracks: PlayerTrack[];
}

const DEFAULT_ACCENT: [number, number, number] = [0.686, 0.205, 34];
const POSITION_POLL_MS = 200;
const SEEK_COMMIT_DEBOUNCE_MS = 150;

function formatTime(ms: number): string {
  if (!isFinite(ms) || ms < 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Persistent bottom player — transition:persist'd into every page via
 * Base.astro, so playback survives navigation (this is an MPA; without
 * View Transitions + persist, audio would stop on every link click). Owns
 * a single hidden SoundCloud iframe, swapped between tracks via the Widget
 * API's load() rather than re-mounting a new iframe per track. Other
 * islands (track cards on /music, the homepage carousel) request playback
 * via the player-bus rather than embedding their own iframes.
 *
 * The playlist loops: FINISH always advances to (index + 1) % tracks.length,
 * so it wraps back to the first track rather than stopping dead at the end.
 */
export default function GlobalPlayer({ tracks }: Props) {
  const [index, setIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [dragMs, setDragMs] = useState(0);
  const [queueOpen, setQueueOpen] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<any>(null);
  const lastKnownMsRef = useRef(0);
  const lastKnownAtRef = useRef(performance.now());
  const playingRef = useRef(false);
  const indexRef = useRef<number | null>(null);
  const seekDebounceRef = useRef<number | null>(null);
  indexRef.current = index;

  const current = index !== null ? tracks[index] : null;

  // getDuration() can briefly return 0 right after a sound becomes ready —
  // retry a few times before trusting the value.
  const fetchDuration = useCallback((attempt = 0) => {
    const widget = widgetRef.current;
    if (!widget) return;
    widget.getDuration((ms: number) => {
      if (ms > 0) { setDurationMs(ms); return; }
      if (attempt < 5) window.setTimeout(() => fetchDuration(attempt + 1), 200);
    });
  }, []);

  // Bind the widget once, to the first track (may not play until requested).
  useEffect(() => {
    if (tracks.length === 0 || !iframeRef.current) return;
    let destroyed = false;
    loadScWidgetApi().then(() => {
      if (destroyed || !iframeRef.current) return;
      const SC = (window as any).SC;
      const widget = SC.Widget(iframeRef.current);
      widgetRef.current = widget;
      // READY only reliably fires for the iframe's initial load — subsequent
      // track switches go through playTrack()'s load() callback instead.
      widget.bind(SC.Widget.Events.READY, () => fetchDuration());
      widget.bind(SC.Widget.Events.PLAY, () => {
        playingRef.current = true;
        setPlaying(true);
        dispatchTransport({ type: "play" });
        // Belt-and-braces: guarantees duration is populated by the time
        // playback is actually audible, even if load()'s callback didn't fire.
        fetchDuration();
      });
      widget.bind(SC.Widget.Events.PAUSE, () => { playingRef.current = false; setPlaying(false); dispatchTransport({ type: "pause" }); });
      widget.bind(SC.Widget.Events.FINISH, () => {
        playingRef.current = false;
        setPlaying(false);
        dispatchTransport({ type: "pause" });
        // Loop the queue — wraps back to the first track after the last.
        const next = ((indexRef.current ?? -1) + 1) % tracks.length;
        playTrack(next);
      });
      widget.bind(SC.Widget.Events.PLAY_PROGRESS, (e: { currentPosition: number }) => {
        lastKnownMsRef.current = e.currentPosition;
        lastKnownAtRef.current = performance.now();
        dispatchTransport({ type: "position", positionSec: e.currentPosition / 1000 });
      });
    }).catch(() => {});
    return () => { destroyed = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks.length]);

  // Smooth-ish position display between PLAY_PROGRESS ticks — paused while
  // the user is actively dragging the seek bar so it doesn't fight them.
  useEffect(() => {
    if (!playing || seeking) return;
    const id = window.setInterval(() => {
      setPositionMs(lastKnownMsRef.current + (performance.now() - lastKnownAtRef.current));
    }, POSITION_POLL_MS);
    return () => window.clearInterval(id);
  }, [playing, seeking]);

  const playTrack = useCallback((i: number, autoPlay = true) => {
    const track = tracks[i];
    if (!track || !widgetRef.current) return;
    setIndex(i);
    setQueueOpen(false);
    setDurationMs(0);
    setPositionMs(0);
    dispatchTransport({
      type: "trackchange",
      track: { slug: track.slug, title: track.title, accent: track.accent, envelope: track.sidecar },
    });
    widgetRef.current.load(`https://soundcloud.com/${track.embedId}`, {
      auto_play: autoPlay,
      hide_related: true,
      show_comments: false,
      show_reposts: false,
      show_teaser: false,
      visual: false,
      // The reliable per-track-switch hook — READY is not guaranteed to
      // refire on a later load(), but this callback always does once the
      // new sound is ready.
      callback: () => fetchDuration(),
    });
    lastKnownMsRef.current = 0;
    lastKnownAtRef.current = performance.now();
  }, [tracks, fetchDuration]);

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

  const onSeekInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ms = Number(e.target.value);
    setSeeking(true);
    setDragMs(ms);
    if (seekDebounceRef.current) window.clearTimeout(seekDebounceRef.current);
    seekDebounceRef.current = window.setTimeout(() => {
      widgetRef.current?.seekTo(ms);
      lastKnownMsRef.current = ms;
      lastKnownAtRef.current = performance.now();
      setPositionMs(ms);
      setSeeking(false);
    }, SEEK_COMMIT_DEBOUNCE_MS);
  };

  const accent = current?.accent ?? DEFAULT_ACCENT;
  const shownPositionMs = seeking ? dragMs : positionMs;

  if (tracks.length === 0) return null;

  return (
    <div className="global-player" style={accent ? ({ "--accent-l": accent[0], "--accent-c": accent[1], "--accent-h": accent[2] } as any) : undefined}>
      {queueOpen && (
        <div className="gp-queue shell">
          <ul>
            {tracks.map((t, i) => (
              <li key={t.slug}>
                <button type="button" className={i === index ? "gp-queue-active" : ""} onClick={() => playTrack(i)}>
                  <span className="gp-queue-index">{i === index && playing ? "▶" : String(i + 1).padStart(2, "0")}</span>
                  <span className="gp-queue-title">{t.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="gp-shell shell">
        <button type="button" className="gp-btn" onClick={prev} aria-label="Previous track" disabled={tracks.length < 2}>⏮</button>
        <button type="button" className="gp-btn gp-play" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
          {playing ? "❚❚" : "▶"}
        </button>
        <button type="button" className="gp-btn" onClick={next} aria-label="Next track" disabled={tracks.length < 2}>⏭</button>

        <div className="gp-main">
          <div className="gp-title">
            {current ? <b>{current.title}</b> : <span className="gp-hint">press play — {tracks.length} track{tracks.length === 1 ? "" : "s"}</span>}
          </div>
          <div className="gp-seekrow">
            <span className="gp-time">{formatTime(shownPositionMs)}</span>
            <input
              type="range"
              className="gp-seek"
              min={0}
              max={durationMs || 0}
              value={Math.min(shownPositionMs, durationMs || 0)}
              onChange={onSeekInput}
              disabled={!current || !durationMs}
              aria-label="Seek"
              style={{ "--gp-seek-pct": `${durationMs ? (Math.min(shownPositionMs, durationMs) / durationMs) * 100 : 0}%` } as any}
            />
            <span className="gp-time">{formatTime(durationMs)}</span>
          </div>
        </div>

        <button
          type="button"
          className={"gp-btn" + (queueOpen ? " gp-btn-active" : "")}
          onClick={() => setQueueOpen((v) => !v)}
          aria-label={queueOpen ? "Hide queue" : "Show queue"}
          aria-expanded={queueOpen}
          disabled={tracks.length < 2}
        >
          ≡
        </button>
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
