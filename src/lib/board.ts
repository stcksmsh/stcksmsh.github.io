// Layout + routing for the "board" homepage skin: the profile drawn as a printed circuit board.
// Pure build-time geometry. No DOM, no randomness: the same data always produces the same board.

export type Side = "l" | "r" | "b";
export interface Pin { id: string; label: string; side: "l" | "r"; x: number; y: number; stubX: number }
export interface Part {
  id: string;            // DOM id suffix
  ref: string;           // designator, e.g. U2
  title: string;
  sub: string;
  href: string;
  kind: "ic" | "xtal" | "conn";
  domains: string[];
  detail: string;        // one-line readout in the probe panel
  x: number; y: number; w: number; h: number; side: Side;
  pads: { domain: string; x: number; y: number }[];
}
export interface Trace { net: string; part: string; d: string; vias: [number, number][] }
export interface Finger { label: string; href: string; x: number; y: number; w: number; h: number; d: string }
export interface Board { w: number; h: number; chip: { x: number; y: number; w: number; h: number }; pins: Pin[]; parts: Part[]; traces: Trace[]; fingers: Finger[] }

export interface PartInput { id: string; ref: string; title: string; sub: string; href: string; kind: Part["kind"]; domains: string[]; detail: string }
export interface Layout {
  w: number; h: number;
  chip: { x: number; y: number; w: number; h: number };
  slots: Record<Side, { x: number; y: number }[]>;
  part: { w: number; h: number };
  /** x range for vertical lanes on each side of the chip, nearest-to-chip first. */
  lanes: { l: [number, number]; r: [number, number] };
  /** y for the horizontal run of traces into bottom-row parts. */
  bottomLaneY: [number, number];
  fingers: { y: number; x0: number; x1: number; h: number; wire: boolean };
  /** "stack": every part sits below the chip and is fed from above (narrow screens). */
  mode?: "spread" | "stack";
  /** Cap on traces per part (narrow screens keep only each part's primary domain). */
  maxPads?: number;
}

/** Polyline → SVG path with 45° chamfered corners (the PCB look). */
export function chamfer(pts: [number, number][], r = 10): string {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i], [cx, cy] = pts[i + 1];
    const l1 = Math.hypot(bx - ax, by - ay), l2 = Math.hypot(cx - bx, cy - by);
    const k = Math.min(r, l1 / 2, l2 / 2);
    if (k < 0.5) { d += ` L${bx} ${by}`; continue; }
    d += ` L${(bx - ((bx - ax) / l1) * k).toFixed(1)} ${(by - ((by - ay) / l1) * k).toFixed(1)}`;
    d += ` L${(bx + ((cx - bx) / l2) * k).toFixed(1)} ${(by + ((cy - by) / l2) * k).toFixed(1)}`;
  }
  const [lx, ly] = pts[pts.length - 1];
  return `${d} L${lx} ${ly}`;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function buildBoard(L: Layout, domains: readonly { id: string; label: string }[], inputs: PartInput[], fingerLinks: { label: string; href: string }[]): Board {
  const { chip } = L;
  const left = domains.slice(0, 4), right = domains.slice(4);
  const pinY = (i: number) => chip.y - chip.h / 2 + (chip.h / 5) * (i + 1);
  const pins: Pin[] = [
    ...left.map((d, i) => ({ id: d.id, label: d.label, side: "l" as const, x: chip.x - chip.w / 2, y: pinY(i), stubX: chip.x - chip.w / 2 - 26 })),
    ...right.map((d, i) => ({ id: d.id, label: d.label, side: "r" as const, x: chip.x + chip.w / 2, y: pinY(i), stubX: chip.x + chip.w / 2 + 26 })),
  ];
  const pinOf = (id: string) => pins.find((p) => p.id === id)!;

  // Side preference: whichever side holds most of the part's pins; ties go to the emptier side.
  const want = inputs.map((p) => {
    const l = p.domains.filter((d) => pinOf(d)?.side === "l").length;
    const r = p.domains.filter((d) => pinOf(d)?.side === "r").length;
    return { p, pref: l > r ? "l" : r > l ? "r" : "tie" } as const;
  });
  const placed: Record<Side, PartInput[]> = { l: [], r: [], b: [] };
  for (const { p, pref } of want.filter((w) => w.pref !== "tie")) placed[pref as "l" | "r"].push(p);
  for (const { p } of want.filter((w) => w.pref === "tie")) {
    const free = (s: "l" | "r") => L.slots[s].length - placed[s].length;
    placed[free("l") >= free("r") ? "l" : "r"].push(p);
  }
  for (const s of ["l", "r"] as const) while (placed[s].length > L.slots[s].length) placed.b.push(placed[s].pop()!);
  if (L.mode === "stack") { placed.b = [...inputs]; placed.l = []; placed.r = []; }

  const parts: Part[] = [];
  for (const side of ["l", "r", "b"] as const) {
    // Keep each side's parts ordered by their mean pin height, so traces cross as little as possible.
    const meanY = (p: PartInput) => p.domains.reduce((a, d) => a + (pinOf(d)?.y ?? chip.y), 0) / Math.max(1, p.domains.length);
    const list = side === "b" ? placed.b : [...placed[side]].sort((a, b) => meanY(a) - meanY(b));
    list.forEach((p, i) => {
      const slot = L.slots[side][i];
      if (!slot) return;
      const { w, h } = L.part;
      const ds = p.domains.filter((d) => pinOf(d)).slice(0, L.maxPads ?? Infinity).sort((a, b) => (pinOf(a).side === pinOf(b).side ? pinOf(a).y - pinOf(b).y : pinOf(a).side === side ? -1 : 1));
      const pads = ds.map((domain, k) => {
        const t = (k + 1) / (ds.length + 1);
        if (side === "l") return { domain, x: slot.x + w / 2, y: lerp(slot.y - h / 2, slot.y + h / 2, t) };
        if (side === "r") return { domain, x: slot.x - w / 2, y: lerp(slot.y - h / 2, slot.y + h / 2, t) };
        return { domain, x: lerp(slot.x - w / 2, slot.x + w / 2, t), y: slot.y - h / 2 };
      });
      parts.push({ ...p, domains: ds, x: slot.x, y: slot.y, w, h, side, pads });
    });
  }

  // Lane assignment. For an L-shaped run (pin → lane → pad), traces nest without crossing when
  // upward runs take nearer lanes in order of pin height (top first) and downward runs in reverse.
  const allPads = parts.flatMap((part) => part.pads.map((pad) => ({ part, pad, pin: pinOf(pad.domain) })));
  const laneOf = new Map<object, number>();
  const laneTotal = { l: 0, r: 0 };
  for (const s of ["l", "r"] as const) {
    const mine = allPads.filter((a) => a.pin.side === s);
    const up = mine.filter((a) => a.part.side === s && a.pad.y <= a.pin.y).sort((a, b) => a.pin.y - b.pin.y || b.pad.y - a.pad.y);
    const down = mine.filter((a) => a.part.side === s && a.pad.y > a.pin.y).sort((a, b) => b.pin.y - a.pin.y || a.pad.y - b.pad.y);
    const rest = mine.filter((a) => a.part.side !== s).sort((a, b) => b.pin.y - a.pin.y);
    [...up, ...down, ...rest].forEach((a, n) => laneOf.set(a, n));
    laneTotal[s] = mine.length;
  }
  let bottomIdx = 0, crossIdx = 0;
  const bottomTotal = allPads.filter((a) => a.part.side === "b").length;
  const crossTotal = allPads.filter((a) => a.part.side !== "b" && a.part.side !== a.pin.side).length;
  const traces: Trace[] = allPads.map((a) => {
    const { part, pad, pin } = a;
    const s = pin.side;
    const [near, far] = L.lanes[s];
    const n = laneOf.get(a)!;
    const laneX = Math.round(lerp(near, far, laneTotal[s] > 1 ? n / (laneTotal[s] - 1) : 0));
    let pts: [number, number][];
    if (part.side === "b") {
      const [y0, y1] = L.bottomLaneY;
      const k = part.pads.indexOf(pad);
      const laneY = L.mode === "stack"
        ? Math.round(part.y - part.h / 2 - 12 - k * 6)
        : Math.round(lerp(y0, y1, bottomTotal > 1 ? bottomIdx++ / (bottomTotal - 1) : 0));
      pts = [[pin.x, pin.y], [laneX, pin.y], [laneX, laneY], [pad.x, laneY], [pad.x, pad.y]];
    } else if (part.side === s) {
      pts = [[pin.x, pin.y], [laneX, pin.y], [laneX, pad.y], [pad.x, pad.y]];
    } else {
      // Pin and part on opposite sides: dive under the chip in a dedicated band, climb up beside it.
      const k = crossIdx++;
      const laneY = Math.round(chip.y + chip.h / 2 + 24 + k * 10);
      const exitX = part.side === "r" ? chip.x + chip.w / 2 + 34 + (crossTotal - 1 - k) * 10 : chip.x - chip.w / 2 - 34 - (crossTotal - 1 - k) * 10;
      pts = [[pin.x, pin.y], [laneX, pin.y], [laneX, laneY], [exitX, laneY], [exitX, pad.y], [pad.x, pad.y]];
    }
    const vias = part.side !== "b" && part.side !== s ? [pts[2], pts[4]] : [];
    return { net: pad.domain, part: part.id, d: chamfer(pts), vias };
  });

  // Edge connector: contact fingers on the bottom board edge, wired to the chip's underside.
  const { y, x0, x1, h } = L.fingers;
  const fw = (x1 - x0) / fingerLinks.length;
  const fingers: Finger[] = fingerLinks.map((f, i) => {
    const fx = x0 + fw * i + fw * 0.12, fwid = fw * 0.76;
    const cx = fx + fwid / 2;
    const sx = lerp(chip.x - chip.w / 3, chip.x + chip.w / 3, fingerLinks.length > 1 ? i / (fingerLinks.length - 1) : 0.5);
    const midY = Math.round(lerp(chip.y + chip.h / 2, y, 0.55) + i * 6);
    const d = L.fingers.wire ? chamfer([[sx, chip.y + chip.h / 2], [sx, midY], [cx, midY], [cx, y]]) : `M${cx} ${y - 28} L${cx} ${y}`;
    return { ...f, x: fx, y, w: fwid, h, d };
  });

  return { w: L.w, h: L.h, chip, pins, parts, traces, fingers };
}
