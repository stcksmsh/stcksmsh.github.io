#!/usr/bin/env python3
"""
analyze-track.py — precompute a compact audio-feature envelope for a track.

Why: the SoundCloud/Bandcamp embeds are iframes — their audio is completely
unreachable from the parent page (cross-origin, no exception). The Widget
API gives real playback position but zero audio data. So instead of live
analysis, we analyse the source file itself, once, offline, and let the
Oscilloscope island look up this envelope by real playback position at
runtime. Genuinely audio-driven, no live dependency, nothing that can break.

Usage:
    pip install soundfile numpy
    python3 scripts/analyze-track.py <input.wav> <output.json>

Output JSON: {"hopMs": 100, "durationS": 217.3, "envelope": [r,l,h, r,l,h, ...]}
Flat, hop-major, each value quantized to 0-255. ~15KB/minute of audio.
"""
import sys
import json
import numpy as np
import soundfile as sf

HOP_MS = 100   # 10 samples/sec — plenty for a canvas interpolating at 60fps
LOW_HZ = 250   # low band: kick/bass energy
HIGH_HZ = 4000 # high band: presence/air


def main(path: str, out_path: str) -> None:
    audio, sr = sf.read(path, always_2d=True)
    mono = audio.mean(axis=1)

    hop = int(sr * HOP_MS / 1000)
    n_frames = len(mono) // hop

    window = np.hanning(hop)
    freqs = np.fft.rfftfreq(hop, d=1 / sr)
    low_mask = freqs <= LOW_HZ
    high_mask = freqs >= HIGH_HZ

    rms = np.zeros(n_frames)
    low = np.zeros(n_frames)
    high = np.zeros(n_frames)

    for i in range(n_frames):
        frame = mono[i * hop:(i + 1) * hop]
        rms[i] = np.sqrt(np.mean(frame ** 2))
        spec = np.abs(np.fft.rfft(frame * window))
        low[i] = spec[low_mask].mean() if low_mask.any() else 0
        high[i] = spec[high_mask].mean() if high_mask.any() else 0

    def quantize(x: np.ndarray) -> np.ndarray:
        peak = x.max()
        norm = (x / peak) if peak > 0 else x
        return np.clip(np.round(norm * 255), 0, 255).astype(int)

    rq, lq, hq = quantize(rms), quantize(low), quantize(high)
    envelope = [int(v) for triple in zip(rq, lq, hq) for v in triple]

    out = {"hopMs": HOP_MS, "durationS": round(len(mono) / sr, 2), "envelope": envelope}
    with open(out_path, "w") as f:
        json.dump(out, f, separators=(",", ":"))

    size = len(json.dumps(out))
    print(f"{n_frames} frames, {size} bytes -> {out_path}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])
