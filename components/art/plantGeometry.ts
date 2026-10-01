export type Box = { x: number; y: number; w: number; h: number };

export type Obstacle = Box & { kind: "photo" | "block" | "frame" };

export type Frame = Box & { approach: number };

export type PlantLeaf = {
  outline: string;
  midrib: string;
  veins: string[];
  home: boolean;
};

export type PlantGeometry = {
  viewBox: string;
  wings: string[];
  join: string;
  segments: string[];
  leaves: PlantLeaf[];
};

type Point = [number, number];

function round(n: number) {
  return Math.round(n * 10) / 10;
}

function clamp(n: number, min: number, max: number) {
  if (max < min) return (min + max) / 2;
  return Math.min(max, Math.max(min, n));
}

function rightOf(box: Box) {
  return box.x + box.w;
}

function bottomOf(box: Box) {
  return box.y + box.h;
}

function push(pts: Point[], x: number, y: number) {
  const prev = pts[pts.length - 1];
  if (!prev) {
    pts.push([x, y]);
    return;
  }
  const dx = x - prev[0];
  const dy = y - prev[1];
  if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
  if (Math.abs(dx) > 0.5 && Math.abs(dy) > 0.5) pts.push([x, prev[1]]);
  const mid = pts[pts.length - 1];
  if (!mid || Math.abs(mid[0] - x) > 0.5 || Math.abs(mid[1] - y) > 0.5) pts.push([x, y]);
}

/** Quarter-circle corners on an orthogonal polyline. */
function roundedPolyline(pts: Point[], radius: number) {
  const first = pts[0];
  if (!first || pts.length < 2) return "";
  let d = `M${round(first[0])} ${round(first[1])}`;
  if (pts.length === 2) {
    const last = pts[1] ?? first;
    return `${d}L${round(last[0])} ${round(last[1])}`;
  }
  for (let i = 1; i < pts.length - 1; i += 1) {
    const prev = pts[i - 1] ?? first;
    const cur = pts[i] ?? prev;
    const next = pts[i + 1] ?? cur;
    const inLen = Math.hypot(cur[0] - prev[0], cur[1] - prev[1]);
    const outLen = Math.hypot(next[0] - cur[0], next[1] - cur[1]);
    const use = Math.min(radius, inLen / 2.05, outLen / 2.05);
    if (inLen < 1 || use < 1.5) {
      d += `L${round(cur[0])} ${round(cur[1])}`;
      continue;
    }
    const ux = (cur[0] - prev[0]) / inLen;
    const uy = (cur[1] - prev[1]) / inLen;
    const vx = (next[0] - cur[0]) / outLen;
    const vy = (next[1] - cur[1]) / outLen;
    const ax = cur[0] - ux * use;
    const ay = cur[1] - uy * use;
    const bx = cur[0] + vx * use;
    const by = cur[1] + vy * use;
    const k = use * 0.551915;
    d += `L${round(ax)} ${round(ay)}C${round(ax + ux * k)} ${round(ay + uy * k)} ${round(bx - vx * k)} ${round(by - vy * k)} ${round(bx)} ${round(by)}`;
  }
  const last = pts[pts.length - 1] ?? first;
  d += `L${round(last[0])} ${round(last[1])}`;
  return d;
}

function arcTable(points: Point[]) {
  const cum = [0];
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1] ?? points[0] ?? [0, 0];
    const cur = points[i] ?? prev;
    cum.push((cum[i - 1] ?? 0) + Math.hypot(cur[0] - prev[0], cur[1] - prev[1]));
  }
  return cum;
}

function pointAtArc(points: Point[], cum: number[], dist: number): Point {
  const first = points[0] ?? [0, 0];
  if (points.length < 2) return first;
  const total = cum[cum.length - 1] ?? 0;
  const target = Math.max(0, Math.min(total, dist));
  for (let i = 1; i < points.length; i += 1) {
    const end = cum[i] ?? 0;
    if (end + 0.01 < target) continue;
    const start = cum[i - 1] ?? 0;
    const prev = points[i - 1] ?? first;
    const cur = points[i] ?? prev;
    const span = end - start;
    const t = span <= 0 ? 0 : (target - start) / span;
    return [prev[0] + (cur[0] - prev[0]) * t, prev[1] + (cur[1] - prev[1]) * t];
  }
  return points[points.length - 1] ?? first;
}

function tangentAt(points: Point[], cum: number[], dist: number): Point {
  const total = cum[cum.length - 1] ?? 0;
  const ahead = pointAtArc(points, cum, Math.min(total, dist + 12));
  const behind = pointAtArc(points, cum, Math.max(0, dist - 12));
  const dx = ahead[0] - behind[0];
  const dy = ahead[1] - behind[1];
  const len = Math.hypot(dx, dy) || 1;
  return [dx / len, dy / len];
}

function leafOutline(cx: number, baseY: number, length: number, width: number, lean: number) {
  const tipX = cx + width * 0.18 * lean;
  const tipY = baseY - length;
  const hw = width / 2;
  return [
    `M${round(cx)} ${round(baseY)}`,
    `C${round(cx + hw * 0.35)} ${round(baseY - length * 0.08)} ${round(cx + hw * 0.95)} ${round(baseY - length * 0.34)} ${round(cx + hw * 0.62)} ${round(baseY - length * 0.62)}`,
    `C${round(cx + hw * 0.28)} ${round(baseY - length * 0.86)} ${round(tipX + width * 0.04)} ${round(tipY + length * 0.12)} ${round(tipX)} ${round(tipY)}`,
    `C${round(tipX - width * 0.06)} ${round(tipY + length * 0.14)} ${round(cx - hw * 0.42)} ${round(baseY - length * 0.8)} ${round(cx - hw * 0.7)} ${round(baseY - length * 0.46)}`,
    `C${round(cx - hw * 0.9)} ${round(baseY - length * 0.22)} ${round(cx - hw * 0.2)} ${round(baseY - length * 0.05)} ${round(cx)} ${round(baseY)}`,
  ].join("");
}

function leafParts(cx: number, baseY: number, length: number, width: number, lean: number): PlantLeaf {
  const tipX = cx + width * 0.18 * lean;
  const tipY = baseY - length;
  const midrib = `M${round(cx)} ${round(baseY)}C${round(cx + width * 0.08 * lean)} ${round(baseY - length * 0.4)} ${round(cx + width * 0.12 * lean)} ${round(baseY - length * 0.72)} ${round(tipX)} ${round(tipY)}`;
  return { outline: leafOutline(cx, baseY, length, width, lean), midrib, veins: [], home: false };
}

function includePoint(bounds: { minX: number; minY: number; maxX: number; maxY: number }, x: number, y: number) {
  bounds.minX = Math.min(bounds.minX, x);
  bounds.minY = Math.min(bounds.minY, y);
  bounds.maxX = Math.max(bounds.maxX, x);
  bounds.maxY = Math.max(bounds.maxY, y);
}

function pathBounds(d: string): Box | null {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) ?? [];
  const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  let i = 0;
  let cx = 0;
  let cy = 0;
  let cmd = "";
  const num = () => Number(tokens[i++]);
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i] ?? "")) cmd = tokens[i++] ?? cmd;
    const kind = cmd.toLowerCase();
    if (kind === "m" || kind === "l") {
      cx = num();
      cy = num();
      includePoint(bounds, cx, cy);
    } else if (kind === "c") {
      const x1 = num();
      const y1 = num();
      const x2 = num();
      const y2 = num();
      const x = num();
      const y = num();
      for (let step = 1; step <= 8; step += 1) {
        const t = step / 8;
        const u = 1 - t;
        includePoint(
          bounds,
          u * u * u * cx + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x,
          u * u * u * cy + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y,
        );
      }
      cx = x;
      cy = y;
    } else {
      break;
    }
  }
  if (!Number.isFinite(bounds.minX)) return null;
  return { x: bounds.minX, y: bounds.minY, w: bounds.maxX - bounds.minX, h: bounds.maxY - bounds.minY };
}

function boxGap(a: Box, b: Box) {
  const dx = Math.max(a.x - rightOf(b), b.x - rightOf(a));
  const dy = Math.max(a.y - bottomOf(b), b.y - bottomOf(a));
  if (dx < 0 && dy < 0) return 0;
  return Math.hypot(Math.max(0, dx), Math.max(0, dy));
}

function outerEdge(frame: Box, width: number, gap: number) {
  const side: "left" | "right" = frame.x + frame.w / 2 < width * 0.48 ? "left" : "right";
  let outer = side === "right" ? rightOf(frame) + gap : frame.x - gap;
  outer = clamp(outer, 8, width - 8);
  if (side === "right" && outer < rightOf(frame) - 1) outer = clamp(rightOf(frame) - 1, 8, width - 8);
  if (side === "left" && outer > frame.x + 1) outer = clamp(frame.x + 1, 8, width - 8);
  return { side, outer };
}

/**
 * One open line. A short horizontal stroke sits above the hero.
 * The rest turns a rounded corner around each marked block and continues
 * into the following section, switching sides instead of staying in one margin.
 */
function buildPoints({
  width,
  height,
  anchor,
  frames,
  gap,
  hook,
}: {
  width: number;
  height: number;
  anchor: Box;
  frames: Frame[];
  gap: number;
  hook: number;
}) {
  const y = anchor.y + anchor.h * 0.55;
  const x0 = clamp(anchor.x, 8, width - 64);
  const x1 = clamp(anchor.x + Math.max(64, anchor.w), x0 + 64, width * 0.42);
  const pts: Point[] = [[x0, y], [x1, y]];
  let cursor: Point = [x1, y];

  frames.forEach((frame, index) => {
    if (bottomOf(frame) < cursor[1] + 24) return;
    const { side, outer } = outerEdge(frame, width, gap);
    const top = frame.y - gap;
    const bot = Math.min(height - 24, bottomOf(frame) + gap);
    if (bot <= top + 16) return;

    if (index === 0 && cursor[1] < frame.y - gap) {
      push(pts, outer, cursor[1]);
      cursor = [outer, cursor[1]];
    } else if (Math.abs(cursor[0] - outer) > 10) {
      const yCross = clamp(frame.approach, cursor[1] + 8, Math.max(cursor[1] + 8, top - 4));
      push(pts, cursor[0], yCross);
      push(pts, outer, yCross);
      cursor = [outer, yCross];
    }

    if (cursor[1] < top) {
      push(pts, outer, top);
      cursor = [outer, top];
    }
    push(pts, outer, bot);
    const reach = Math.min(hook, Math.max(36, frame.w * 0.18));
    const hooked = clamp(side === "right" ? outer - reach : outer + reach, 8, width - 8);
    push(pts, hooked, bot);
    const backY = Math.min(height - 12, bot + Math.max(28, hook * 0.45));
    push(pts, hooked, backY);
    push(pts, outer, backY);
    cursor = [outer, backY];
  });

  push(pts, cursor[0], Math.min(height - 8, cursor[1] + Math.max(180, hook * 3)));
  return pts;
}

function placeLeaves(points: Point[], leaf: number, leafGap: number, frames: Frame[], anchor: Box) {
  const stem = points.slice(1);
  const cum = arcTable(stem);
  const total = cum[cum.length - 1] ?? 0;
  if (total < 80 || leaf < 8) return [] as PlantLeaf[];
  const length = Math.max(30, leaf * 0.92);
  const width = Math.max(18, leaf * 0.5);
  const heroFloor = anchor.y + anchor.h + leaf * 2.2;
  const placed: Array<{ box: Box; leaf: PlantLeaf }> = [];
  const targets = [0.26, 0.52, 0.78];
  for (const fraction of targets) {
    let found: { box: Box; leaf: PlantLeaf } | null = null;
    for (let dist = total * fraction; dist < Math.min(total - 8, total * fraction + leaf * 6); dist += 28) {
      const stemPoint = pointAtArc(stem, cum, dist);
      if (stemPoint[1] < heroFloor) continue;
      const tangent = tangentAt(stem, cum, dist);
      const lean = tangent[1] >= 0 ? (tangent[0] > 0 ? -1 : 1) : 1;
      const cx = stemPoint[0] + lean * Math.max(6, width * 0.08);
      const parts = leafParts(cx, stemPoint[1], length, width, lean);
      const box = pathBounds(parts.outline);
      if (!box || box.y < 0) continue;
      if (frames.some((frame) => boxGap(box, frame) < 8)) continue;
      if (placed.some((spot) => boxGap(box, spot.box) < leafGap)) continue;
      found = { box, leaf: parts };
      break;
    }
    if (found) placed.push(found);
  }
  return placed.map((spot) => spot.leaf);
}

export function buildPlant({
  width,
  height,
  anchor,
  frames,
  radius,
  gap,
  hook,
  leaf,
  leafGap,
}: {
  width: number;
  height: number;
  anchor: Box;
  frames: Frame[];
  radius: number;
  gap: number;
  hook: number;
  leaf: number;
  leafGap: number;
}): PlantGeometry {
  const points = buildPoints({ width, height, anchor, frames, gap, hook });
  const start = points[0] ?? [0, 0];
  const joinEnd = points[1] ?? start;
  const join = `M${round(start[0])} ${round(start[1])}L${round(joinEnd[0])} ${round(joinEnd[1])}`;
  const stem = roundedPolyline(points.slice(1), Math.max(12, radius));
  const leaves = placeLeaves(points, leaf, leafGap, frames, anchor);
  return {
    viewBox: `0 0 ${round(width)} ${round(height)}`,
    wings: [],
    join,
    segments: stem ? [stem] : [],
    leaves,
  };
}
