import { lineArt } from "@/content/brand";

export type Box = { x: number; y: number; w: number; h: number };

export type Obstacle = Box & { kind: "photo" | "block" };

export type PlantLeaf = {
  outline: string;
  midrib: string;
  veins: string[];
};

export type PlantGeometry = {
  viewBox: string;
  wings: string[];
  join: string;
  segments: string[];
  leaves: PlantLeaf[];
};

type Command = { t: "M" | "L" | "C" | "Z"; p: number[] };

const butterfly = lineArt("butterfly");
const viewBoxParts = butterfly.viewBox.split(/[\s,]+/).map(Number);
const vb = {
  x: viewBoxParts[0] ?? 0,
  y: viewBoxParts[1] ?? 0,
  w: viewBoxParts[2] ?? 1,
  h: viewBoxParts[3] ?? 1,
};

function tokensOf(d: string) {
  return d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) ?? [];
}

/** Absolute M/L/C/Z so a later scale-and-place does not break smooth curves. */
export function toAbsolute(d: string): Command[] {
  const tokens = tokensOf(d);
  let i = 0;
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;
  let cmd = "";
  let prevControl: [number, number] | null = null;
  const out: Command[] = [];
  const num = () => Number(tokens[i++]);

  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i] ?? "")) cmd = tokens[i++] ?? cmd;
    const rel = cmd === cmd.toLowerCase();
    const kind = cmd.toLowerCase();
    if (kind === "m") {
      const x = num();
      const y = num();
      cx = rel ? cx + x : x;
      cy = rel ? cy + y : y;
      sx = cx;
      sy = cy;
      out.push({ t: "M", p: [cx, cy] });
      prevControl = null;
      cmd = rel ? "l" : "L";
    } else if (kind === "l") {
      const x = num();
      const y = num();
      cx = rel ? cx + x : x;
      cy = rel ? cy + y : y;
      out.push({ t: "L", p: [cx, cy] });
      prevControl = null;
    } else if (kind === "c") {
      let x1 = num();
      let y1 = num();
      let x2 = num();
      let y2 = num();
      let x = num();
      let y = num();
      if (rel) {
        x1 += cx;
        y1 += cy;
        x2 += cx;
        y2 += cy;
        x += cx;
        y += cy;
      }
      out.push({ t: "C", p: [x1, y1, x2, y2, x, y] });
      prevControl = [x2, y2];
      cx = x;
      cy = y;
    } else if (kind === "s") {
      let x2 = num();
      let y2 = num();
      let x = num();
      let y = num();
      if (rel) {
        x2 += cx;
        y2 += cy;
        x += cx;
        y += cy;
      }
      const x1 = prevControl ? cx * 2 - prevControl[0] : cx;
      const y1 = prevControl ? cy * 2 - prevControl[1] : cy;
      out.push({ t: "C", p: [x1, y1, x2, y2, x, y] });
      prevControl = [x2, y2];
      cx = x;
      cy = y;
    } else if (kind === "h") {
      const x = num();
      cx = rel ? cx + x : x;
      out.push({ t: "L", p: [cx, cy] });
      prevControl = null;
    } else if (kind === "v") {
      const y = num();
      cy = rel ? cy + y : y;
      out.push({ t: "L", p: [cx, cy] });
      prevControl = null;
    } else if (kind === "z") {
      out.push({ t: "Z", p: [] });
      cx = sx;
      cy = sy;
      prevControl = null;
    } else {
      break;
    }
  }
  return out;
}

function placePath(d: string, map: (x: number, y: number) => [number, number]) {
  return toAbsolute(d)
    .map((command) => {
      if (command.t === "Z") return "Z";
      const placed: string[] = [];
      for (let i = 0; i < command.p.length; i += 2) {
        const [x, y] = map(command.p[i] ?? 0, command.p[i + 1] ?? 0);
        placed.push(x.toFixed(2), y.toFixed(2));
      }
      return `${command.t}${placed.join(" ")}`;
    })
    .join("");
}

function round(n: number) {
  return Math.round(n * 10) / 10;
}

function clamp(n: number, min: number, max: number) {
  if (max < min) return (min + max) / 2;
  return Math.min(max, Math.max(min, n));
}

function curvesThrough(points: Array<[number, number]>, minX: number, maxX: number) {
  const first = points[0];
  if (!first || points.length < 2) return "";
  let d = `M${round(first[0])} ${round(first[1])}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)] ?? first;
    const p1 = points[i] ?? first;
    const p2 = points[i + 1] ?? p1;
    const p3 = points[Math.min(points.length - 1, i + 2)] ?? p2;
    const c1x = clamp(p1[0] + (p2[0] - p0[0]) / 6, minX, maxX);
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = clamp(p2[0] - (p3[0] - p1[0]) / 6, minX, maxX);
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${round(c1x)} ${round(c1y)} ${round(c2x)} ${round(c2y)} ${round(p2[0])} ${round(p2[1])}`;
  }
  return d;
}

type Point = [number, number];

type Portal = {
  x: number;
  y0: number;
  y1: number;
  gap: number;
  kind: "between" | "beside";
};

function rightOf(box: Box) {
  return box.x + box.w;
}

function bottomOf(box: Box) {
  return box.y + box.h;
}

function overlapsY(a: Box, y0: number, y1: number) {
  return bottomOf(a) > y0 && a.y < y1;
}

function intersects(a: Box, b: Box) {
  return a.x < rightOf(b) && rightOf(a) > b.x && a.y < bottomOf(b) && bottomOf(a) > b.y;
}

function inflate(box: Box, pad: number): Box {
  return { x: box.x - pad, y: box.y - pad, w: box.w + pad * 2, h: box.h + pad * 2 };
}

function segmentHits(x1: number, y1: number, x2: number, y2: number, box: Box) {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  if (maxX < box.x || minX > rightOf(box) || maxY < box.y || minY > bottomOf(box)) return false;
  if (Math.abs(y1 - y2) <= 0.5) return y1 >= box.y && y1 <= bottomOf(box);
  if (Math.abs(x1 - x2) <= 0.5) return x1 >= box.x && x1 <= rightOf(box);
  const steps = 10;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    if (x >= box.x && x <= rightOf(box) && y >= box.y && y <= bottomOf(box)) return true;
  }
  return false;
}

function blocked(x1: number, y1: number, x2: number, y2: number, pads: Box[]) {
  return pads.some((box) => segmentHits(x1, y1, x2, y2, box));
}

function firstHitY(x: number, y0: number, y1: number, pads: Box[]) {
  const lo = Math.min(y0, y1);
  const hi = Math.max(y0, y1);
  let hit = hi;
  for (const box of pads) {
    if (x < box.x || x > rightOf(box)) continue;
    if (bottomOf(box) <= lo || box.y >= hi) continue;
    hit = Math.min(hit, Math.max(lo, box.y));
  }
  return hit;
}

function clusterRows(photos: Box[]) {
  const sorted = [...photos].sort((a, b) => a.y - b.y || a.x - b.x);
  const rows: Box[][] = [];
  for (const photo of sorted) {
    const row = rows.find((group) => group.some((item) => overlapsY(item, photo.y + 8, bottomOf(photo) - 8)));
    if (row) row.push(photo);
    else rows.push([photo]);
  }
  return rows
    .map((row) => row.sort((a, b) => a.x - b.x))
    .map((row) => ({
      photos: row,
      y0: Math.min(...row.map((photo) => photo.y)),
      y1: Math.max(...row.map((photo) => bottomOf(photo))),
    }));
}

function interiorX(edge: number, photoEdge: number, stroke: number, towardContent: boolean) {
  const gap = Math.abs(photoEdge - edge);
  if (!towardContent || gap < stroke + 10) return null;
  return (edge + photoEdge) / 2;
}

function portalsFor(
  row: { photos: Box[]; y0: number; y1: number },
  blocks: Box[],
  contentLeft: number,
  contentRight: number,
  width: number,
  stroke: number,
) {
  const portals: Portal[] = [];
  const { photos } = row;
  for (let i = 0; i < photos.length - 1; i += 1) {
    const left = photos[i];
    const right = photos[i + 1];
    if (!left || !right) continue;
    const gap = right.x - rightOf(left);
    const y0 = Math.max(left.y, right.y);
    const y1 = Math.min(bottomOf(left), bottomOf(right));
    if (gap >= stroke + 1 && y1 - y0 > 36) {
      portals.push({ x: rightOf(left) + gap / 2, y0, y1, gap, kind: "between" });
    }
  }

  const first = photos[0];
  const last = photos[photos.length - 1];
  if (!first || !last) return portals;

  let leftEdge = -1;
  let rightEdge = Number.POSITIVE_INFINITY;
  for (const block of blocks) {
    if (!overlapsY(block, row.y0, row.y1)) continue;
    if (rightOf(block) <= first.x + 2) leftEdge = Math.max(leftEdge, rightOf(block));
    if (block.x >= rightOf(last) - 2) rightEdge = Math.min(rightEdge, block.x);
  }
  const besideLeft = interiorX(leftEdge, first.x, stroke, leftEdge >= contentLeft - 8);
  if (besideLeft != null) {
    portals.push({ x: besideLeft, y0: first.y, y1: bottomOf(first), gap: first.x - leftEdge, kind: "beside" });
  }
  const besideRight = Number.isFinite(rightEdge)
    ? interiorX(rightEdge, rightOf(last), stroke, rightEdge <= contentRight + 8)
    : null;
  if (besideRight != null) {
    portals.push({
      x: besideRight,
      y0: last.y,
      y1: bottomOf(last),
      gap: rightEdge - rightOf(last),
      kind: "beside",
    });
  }

  const lane = stroke / 2 + 5;
  const leftLane = first.x - lane;
  const rightLane = rightOf(last) + lane;
  if (leftLane > stroke && leftLane < first.x - stroke / 2) {
    portals.push({ x: leftLane, y0: row.y0, y1: row.y1, gap: lane, kind: "beside" });
  }
  if (rightLane < width - stroke / 2 && rightLane > rightOf(last) + stroke / 2) {
    portals.push({
      x: Math.min(width - stroke / 2 - 1, rightLane),
      y0: row.y0,
      y1: row.y1,
      gap: lane,
      kind: "beside",
    });
  }
  return portals;
}

function portalScore(portal: Portal, prevX: number, contentLeft: number, contentRight: number) {
  let score = portal.kind === "between" ? 320 : portal.gap > 28 ? 220 : 70;
  if (portal.x < contentLeft) score -= 140;
  else if (portal.x > contentRight) score -= 36;
  score -= Math.min(160, Math.abs(portal.x - prevX) * 0.22);
  return score;
}

function pickPortal(
  portals: Portal[],
  prevX: number,
  contentLeft: number,
  contentRight: number,
  pads: Box[],
) {
  const open = portals.filter((portal) => !blocked(portal.x, portal.y0 + 2, portal.x, portal.y1 - 2, pads));
  const pool = open.length ? open : portals;
  return pool.reduce<Portal | null>((best, portal) => {
    if (!best) return portal;
    const score = portalScore(portal, prevX, contentLeft, contentRight);
    const bestScore = portalScore(best, prevX, contentLeft, contentRight);
    return score > bestScore ? portal : best;
  }, null);
}

function slideX(x0: number, x1: number, y: number, yLimit: number, pads: Box[]) {
  const end = Math.max(y, yLimit);
  for (let channel = y; channel <= end; channel += 4) {
    if (blocked(x0, y, x0, channel, pads)) break;
    if (blocked(x0, channel, x1, channel, pads)) continue;
    const points: Point[] = [];
    if (channel > y + 1) points.push([x0, channel]);
    points.push([x1, channel]);
    return { points, y: channel };
  }
  return null;
}

function escapeX(
  x: number,
  y: number,
  pads: Box[],
  contentLeft: number,
  contentRight: number,
  width: number,
  stroke: number,
  prefer: number,
) {
  let best = x;
  let bestScore = Number.NEGATIVE_INFINITY;
  const minX = stroke;
  const maxX = width - stroke;
  for (let candidate = minX; candidate <= maxX; candidate += 12) {
    if (blocked(candidate, y, candidate, y + 48, pads)) continue;
    let score = 80 - Math.abs(candidate - prefer) * 0.2 - Math.abs(candidate - x) * 0.05;
    if (candidate < contentLeft) score -= 90;
    else if (candidate > contentRight) score -= 24;
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }
  return best;
}

function dedupe(points: Point[]) {
  const out: Point[] = [];
  for (const point of points) {
    const prev = out[out.length - 1];
    if (!prev || Math.abs(prev[0] - point[0]) > 0.5 || Math.abs(prev[1] - point[1]) > 0.5) out.push(point);
  }
  return out;
}

function resample(points: Point[]) {
  const source = dedupe(points);
  if (source.length < 2) return source;
  const out: Point[] = [source[0] ?? [0, 0]];
  for (let i = 1; i < source.length; i += 1) {
    const prev = source[i - 1] ?? out[0] ?? [0, 0];
    const next = source[i] ?? prev;
    const dist = Math.hypot(next[0] - prev[0], next[1] - prev[1]);
    const steps = Math.max(1, Math.round(dist / 28));
    for (let step = 1; step <= steps; step += 1) {
      const t = step / steps;
      out.push([prev[0] + (next[0] - prev[0]) * t, prev[1] + (next[1] - prev[1]) * t]);
    }
  }
  return dedupe(out);
}

function routeStem({
  anchor,
  gap,
  stroke,
  bend,
  width,
  height,
  contentLeft,
  contentRight,
  photos,
  blocks,
  pads,
}: {
  anchor: Box;
  gap: number;
  stroke: number;
  bend: number;
  width: number;
  height: number;
  contentLeft: number;
  contentRight: number;
  photos: Box[];
  blocks: Box[];
  pads: Box[];
}) {
  const rows = clusterRows(photos).map((row) => ({
    ...row,
    portals: portalsFor(row, blocks, contentLeft, contentRight, width, stroke),
  }));
  const tail = bottomOf(anchor);
  const joinX = anchor.x + anchor.w * 0.5;
  const joinY = tail - Math.min(8, stroke * 0.35);
  const dropY = Math.min(height - stroke, tail + Math.max(4, Math.min(gap * 0.28, 12)));
  const points: Point[] = [
    [joinX, joinY],
    [joinX, dropY],
  ];
  const used: Portal[] = [];
  let x = joinX;
  let y = dropY;
  let lastBow = -1000;
  const endY = Math.max(dropY + 8, height - stroke);
  const step = 48;

  while (y < endY - 1) {
    const yNext = Math.min(endY, y + step);
    const row = rows.find((item) => item.y1 > y + 8 && item.y0 < yNext + 360);
    const portal = row && row.portals.length ? pickPortal(row.portals, x, contentLeft, contentRight, pads) : null;
    const approaching = Boolean(portal && row && y < row.y0 && row.y0 - y < 360);
    const beside = Boolean(portal && row && yNext >= row.y0 && y <= row.y1);
    const want = portal && (approaching || beside) ? portal.x : x;

    if (Math.abs(want - x) > 8 && !blocked(x, y, want, y, pads)) {
      points.push([want, y]);
      x = want;
    }

    if (portal && Math.abs(x - portal.x) < 14 && y >= portal.y0 - 20 && y <= portal.y1 && !used.includes(portal)) {
      used.push(portal);
    }

    if (!blocked(x, y, x, yNext, pads)) {
      const outside = x < contentLeft || x > contentRight;
      const upcoming = rows.find((item) => item.y0 > y + 140);
      if (outside && upcoming && upcoming.y0 - y > 220 && y - lastBow > 420) {
        const reach = Math.min(bend, (contentRight - contentLeft) * 0.34);
        const inward = x > contentRight ? contentRight - reach : contentLeft + reach;
        const mid = y + Math.min(90, (upcoming.y0 - y) * 0.34);
        const back = y + Math.min(170, (upcoming.y0 - y) * 0.68);
        if (
          inward > stroke &&
          inward < width - stroke &&
          back > mid + 24 &&
          back < upcoming.y0 - 8 &&
          !blocked(x, mid, inward, mid, pads) &&
          !blocked(inward, mid, inward, back, pads) &&
          !blocked(inward, back, x, back, pads)
        ) {
          points.push([x, mid], [inward, mid], [inward, back], [x, back]);
          lastBow = y;
        }
      }
      y = yNext;
      points.push([x, y]);
      continue;
    }

    const escape = escapeX(x, y, pads, contentLeft, contentRight, width, stroke, want);
    if (Math.abs(escape - x) > 1 && !blocked(x, y, escape, y, pads)) {
      points.push([escape, y]);
      x = escape;
    }
    y = yNext;
    points.push([x, y]);
  }

  if ((points[points.length - 1]?.[1] ?? 0) < endY) points.push([x, endY]);
  return { points: resample(points), portals: used };
}

function leafOutline(cx: number, baseY: number, length: number, width: number) {
  const tipY = baseY - length;
  const hw = width / 2;
  return [
    `M${round(cx)} ${round(baseY)}`,
    `C${round(cx + hw * 0.2)} ${round(baseY - length * 0.08)} ${round(cx + hw)} ${round(baseY - length * 0.32)} ${round(cx + hw * 0.7)} ${round(baseY - length * 0.58)}`,
    `C${round(cx + hw * 0.38)} ${round(baseY - length * 0.84)} ${round(cx + hw * 0.1)} ${round(tipY + length * 0.06)} ${round(cx)} ${round(tipY)}`,
    `C${round(cx - hw * 0.1)} ${round(tipY + length * 0.06)} ${round(cx - hw * 0.38)} ${round(baseY - length * 0.84)} ${round(cx - hw * 0.7)} ${round(baseY - length * 0.58)}`,
    `C${round(cx - hw)} ${round(baseY - length * 0.32)} ${round(cx - hw * 0.2)} ${round(baseY - length * 0.08)} ${round(cx)} ${round(baseY)}`,
    "Z",
  ].join("");
}

function leafParts(cx: number, baseY: number, length: number, width: number): PlantLeaf {
  const hw = width / 2;
  const tipY = baseY - length;
  const midrib = [
    `M${round(cx)} ${round(baseY)}`,
    `C${round(cx + hw * 0.08)} ${round(baseY - length * 0.34)} ${round(cx - hw * 0.04)} ${round(baseY - length * 0.68)} ${round(cx)} ${round(tipY)}`,
  ].join("");
  const veins = [0.38, 0.52, 0.66, 0.8].map((t, index) => {
    const side = index % 2 === 0 ? 1 : -1;
    const y = baseY - length * t;
    const reach = hw * Math.sin(Math.PI * t) * 0.72;
    const ex = cx + side * reach;
    return `M${round(cx)} ${round(y)}C${round(cx + side * reach * 0.35)} ${round(y - length * 0.04)} ${round(cx + side * reach * 0.72)} ${round(y + length * 0.01)} ${round(ex)} ${round(y - length * 0.015)}`;
  });
  return { outline: leafOutline(cx, baseY, length, width), midrib, veins };
}

function placeLeaves(
  portals: Portal[],
  points: Point[],
  obstacles: Obstacle[],
  leaf: number,
  stroke: number,
  height: number,
) {
  const spots: { y: number; leaf: PlantLeaf }[] = [];
  const ordered = [...portals].sort((a, b) => a.y0 - b.y0);
  for (const portal of ordered) {
    if (spots.length === 3) break;
    const room = portal.gap - stroke - 8;
    if (room < 36 || portal.y1 - portal.y0 < 72) continue;
    const width = Math.min(leaf * 0.78, room);
    const length = Math.min(leaf, (portal.y1 - portal.y0) * 0.55);
    if (width < 36 || length < 48) continue;
    const baseY = Math.min(portal.y1 - 6, portal.y0 + length + (portal.y1 - portal.y0) * 0.12);
    const box = inflate({ x: portal.x - width / 2, y: baseY - length, w: width, h: length }, stroke / 2);
    if (box.y < 0 || bottomOf(box) > height) continue;
    if (obstacles.some((obstacle) => intersects(box, obstacle))) continue;
    if (spots.some((spot) => Math.abs(spot.y - baseY) < height * 0.14)) continue;
    const onStem = points.some((point) => Math.abs(point[0] - portal.x) < 22 && Math.abs(point[1] - baseY) < 80);
    if (!onStem) continue;
    spots.push({ y: baseY, leaf: leafParts(portal.x, baseY, length, width) });
  }
  return spots;
}

function pointAtY(points: Point[], y: number) {
  let best = points[0] ?? [0, y];
  let bestDist = Infinity;
  for (const point of points) {
    const dist = Math.abs(point[1] - y);
    if (dist < bestDist) {
      bestDist = dist;
      best = point;
    }
  }
  return best;
}

function takeJoin(points: Point[], length: number) {
  const first = points[0];
  if (!first || points.length < 2) return { join: points, rest: points };
  const join: Point[] = [first];
  let walked = 0;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1] ?? first;
    const cur = points[i] ?? prev;
    const step = Math.hypot(cur[0] - prev[0], cur[1] - prev[1]);
    if (walked + step >= length && join.length >= 2) {
      const t = step === 0 ? 1 : (length - walked) / step;
      const cut: Point = [prev[0] + (cur[0] - prev[0]) * t, prev[1] + (cur[1] - prev[1]) * t];
      join.push(cut);
      return { join, rest: [cut, ...points.slice(i)] };
    }
    walked += step;
    join.push(cur);
  }
  const mid = Math.max(1, Math.min(points.length - 1, 3));
  return { join: points.slice(0, mid + 1), rest: points.slice(mid) };
}

function splitAt(points: Point[], cuts: number[]) {
  const segments: Point[][] = [];
  let start = 0;
  for (const y of [...cuts].sort((a, b) => a - b)) {
    if (start >= points.length - 1) break;
    let idx = start + 1;
    let best = Infinity;
    for (let i = start + 1; i < points.length - 1; i += 1) {
      const dist = Math.abs((points[i]?.[1] ?? 0) - y);
      if (dist < best) {
        best = dist;
        idx = i;
      }
    }
    if (idx <= start) continue;
    const slice = points.slice(start, idx + 1);
    if (slice.length >= 2) segments.push(slice);
    start = idx;
  }
  const tail = points.slice(start);
  if (tail.length >= 2) segments.push(tail);
  return segments;
}

function extraLeaves(
  points: Point[],
  photos: Box[],
  leaf: number,
  stroke: number,
  pageWidth: number,
  taken: number[],
) {
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return [] as { y: number; leaf: PlantLeaf }[];
  const span = Math.max(1, last[1] - first[1]);
  const added: { y: number; leaf: PlantLeaf }[] = [];
  for (const t of [0.18, 0.42, 0.8]) {
    if (taken.length + added.length >= 3) break;
    const y = first[1] + span * t;
    if (taken.some((spot) => Math.abs(spot - y) < span * 0.14)) continue;
    const stem = pointAtY(points, y);
    const available = Math.min(stem[0], pageWidth - stem[0]) * 2 - stroke;
    const width = Math.min(leaf * 0.9, available);
    if (width < leaf * 0.62) continue;
    const box = inflate({ x: stem[0] - width / 2, y: stem[1] - leaf, w: width, h: leaf }, 2);
    if (photos.some((photo) => intersects(box, photo))) continue;
    added.push({ y: stem[1], leaf: leafParts(stem[0], stem[1], leaf, width) });
  }
  return added;
}

export function buildPlant({
  width,
  height,
  anchor,
  gap,
  leaf,
  stroke,
  bend,
  contentLeft,
  contentRight,
  obstacles,
}: {
  width: number;
  height: number;
  anchor: Box;
  gap: number;
  leaf: number;
  stroke: number;
  bend: number;
  contentLeft: number;
  contentRight: number;
  obstacles: Obstacle[];
}): PlantGeometry {
  const map = (x: number, y: number): [number, number] => [
    anchor.x + ((x - vb.x) / vb.w) * anchor.w,
    anchor.y + ((y - vb.y) / vb.h) * anchor.h,
  ];
  const wings = butterfly.paths.map((d) => placePath(d, map));
  const photos = obstacles.filter((obstacle) => obstacle.kind === "photo");
  const blocks = obstacles.filter((obstacle) => obstacle.kind === "block");
  const pads = [
    ...photos.map((photo) => inflate(photo, stroke * 0.46)),
    ...blocks.map((block) => inflate(block, stroke / 2 + 4)),
  ];
  const routed = routeStem({
    anchor,
    gap,
    stroke,
    bend,
    width,
    height,
    contentLeft,
    contentRight,
    photos,
    blocks,
    pads,
  });
  const minX = stroke;
  const maxX = Math.max(minX, width - stroke);
  const joined = takeJoin(routed.points, Math.min(120, Math.max(84, leaf * 0.75)));
  const leafSpots = placeLeaves(routed.portals, routed.points, obstacles, leaf, stroke, height);
  const leaves = [...leafSpots, ...extraLeaves(joined.rest, photos, leaf, stroke, width, leafSpots.map((spot) => spot.y))]
    .sort((a, b) => a.y - b.y)
    .slice(0, 3);
  const curve = (segment: Point[]) => curvesThrough(segment, minX, maxX);
  const segments = splitAt(
    joined.rest,
    leaves.map((spot) => spot.y),
  )
    .map((segment) => curve(segment))
    .filter((d) => d.length > 0);

  return {
    viewBox: `0 0 ${round(width)} ${round(height)}`,
    wings,
    join: curve(joined.join),
    segments: segments.length > 0 ? segments : [curve(joined.rest)].filter((d) => d.length > 0),
    leaves: leaves.map((spot) => spot.leaf),
  };
}

