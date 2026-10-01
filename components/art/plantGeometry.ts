import { lineArt } from "@/content/brand";

export type Box = { x: number; y: number; w: number; h: number };

export type Obstacle = Box & { kind: "photo" | "block" };

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
  const bowY = Math.min(height - stroke, tail + Math.max(4, Math.min(gap * 0.28, bend * 0.4)));
  const heroPhoto = photos.find((photo) => bottomOf(photo) > joinY && photo.y < joinY + 900);
  let bowX = joinX;
  if (heroPhoto && heroPhoto.x > joinX + 48) bowX = heroPhoto.x - Math.max(36, stroke + 16);
  else if (heroPhoto && rightOf(heroPhoto) < joinX - 48) bowX = rightOf(heroPhoto) + Math.max(36, stroke + 16);
  bowX = clamp(bowX, stroke + 8, width - stroke - 8);
  const points: Point[] = [
    [joinX, joinY],
    [joinX, bowY],
    [bowX, bowY],
  ];
  const used: Portal[] = [];
  let x = bowX;
  let y = bowY;
  let lastBow = -1000;
  const endY = Math.max(bowY + 8, height - stroke);
  const step = 48;

  while (y < endY - 1) {
    const yNext = Math.min(endY, y + step);
    const row = rows.find((item) => item.y1 > y + 8 && item.y0 < yNext + 360);
    const portal = row && row.portals.length ? pickPortal(row.portals, x, contentLeft, contentRight, pads) : null;
    const approaching = Boolean(portal && row && y < row.y0 && row.y0 - y < 720);
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

function leafOutline(cx: number, baseY: number, length: number, width: number, lean: number) {
  const tipX = cx + width * 0.22 * lean;
  const tipY = baseY - length;
  const hw = width / 2;
  const bend = width * 0.16 * lean;
  return [
    `M${round(cx)} ${round(baseY)}`,
    `C${round(cx + hw * 0.28 + bend)} ${round(baseY - length * 0.07)} ${round(cx + hw * 0.98 + bend * 0.35)} ${round(baseY - length * 0.3)} ${round(cx + hw * 0.7 + bend)} ${round(baseY - length * 0.56)}`,
    `C${round(cx + hw * 0.36 + bend)} ${round(baseY - length * 0.82)} ${round(tipX + width * 0.05)} ${round(tipY + length * 0.1)} ${round(tipX)} ${round(tipY)}`,
    `C${round(tipX - width * 0.07)} ${round(tipY + length * 0.12)} ${round(cx - hw * 0.5)} ${round(baseY - length * 0.78)} ${round(cx - hw * 0.76)} ${round(baseY - length * 0.48)}`,
    `C${round(cx - hw * 0.96)} ${round(baseY - length * 0.24)} ${round(cx - hw * 0.16)} ${round(baseY - length * 0.05)} ${round(cx)} ${round(baseY - length * 0.02)}`,
    "Z",
  ].join("");
}

function leafParts(cx: number, baseY: number, length: number, width: number, lean: number, home = false): PlantLeaf {
  const tipX = cx + width * 0.22 * lean;
  const tipY = baseY - length;
  const midrib = [
    `M${round(cx)} ${round(baseY)}`,
    `C${round(cx + width * 0.1 * lean)} ${round(baseY - length * 0.34)} ${round(cx + width * 0.16 * lean)} ${round(baseY - length * 0.68)} ${round(tipX)} ${round(tipY)}`,
  ].join("");
  const veins = [0.32, 0.46, 0.6, 0.74].map((t, index) => {
    const side = index % 2 === 0 ? 1 : -1;
    const y = baseY - length * t;
    const along = cx + width * 0.1 * lean * t;
    const reach = (width / 2) * Math.sin(Math.PI * t) * 0.74 * side;
    const ex = along + reach;
    const ey = y - length * 0.012;
    return `M${round(along)} ${round(y)}C${round(along + reach * 0.38)} ${round(y - length * 0.035)} ${round(along + reach * 0.74)} ${round(y + length * 0.018)} ${round(ex)} ${round(ey)}`;
  });
  return { outline: leafOutline(cx, baseY, length, width, lean), midrib, veins, home };
}

type LeafTarget = { y: number; scale: number; lean: number; reach: number };

type PlacedLeaf = { y: number; leaf: PlantLeaf; box: Box };

function leafBlocked(box: Box, placed: PlacedLeaf[], butterfly: Box, leafGap: number, butterflyGap: number) {
  if (boxGap(box, butterfly) < butterflyGap) return true;
  return placed.some((spot) => boxGap(box, spot.box) < leafGap);
}

function channelAt(x: number, y: number, obstacles: Obstacle[], pageWidth: number) {
  let left = 8;
  let right = pageWidth - 8;
  for (const box of obstacles) {
    if (y < box.y + 1 || y > bottomOf(box) - 1) continue;
    if (x >= box.x && x <= rightOf(box)) return null;
    if (rightOf(box) <= x) left = Math.max(left, rightOf(box) + 6);
    else right = Math.min(right, box.x - 6);
  }
  if (right - left < 40) return null;
  return { left, right };
}

function fitLeaf(
  points: Point[],
  obstacles: Obstacle[],
  placed: PlacedLeaf[],
  target: LeafTarget,
  leaf: number,
  pageWidth: number,
  height: number,
  butterfly: Box,
  leafGap: number,
  butterflyGap: number,
) {
  for (let delta = 0; delta <= target.reach; delta += 22) {
    const signs = delta === 0 ? [0] : [1, -1];
    for (const sign of signs) {
      const y = target.y + sign * delta;
      const stem = pointAtY(points, y);
      if (stem[1] < 48 || stem[1] > height - 12) continue;
      const length = leaf * target.scale;
      const samples = [0.22, 0.5, 0.78].map((t) => stem[1] - length * t);
      let left = 8;
      let right = pageWidth - 8;
      let blocked = false;
      for (const sample of samples) {
        const channel = channelAt(stem[0], sample, obstacles, pageWidth);
        if (!channel) {
          blocked = true;
          break;
        }
        left = Math.max(left, channel.left);
        right = Math.min(right, channel.right);
      }
      if (blocked || right - left < 40) continue;
      const half = Math.min(stem[0] - left, right - stem[0]);
      const width = Math.min(leaf * 0.78, half * 2);
      if (width < Math.max(42, leaf * 0.46)) continue;
      const parts = leafParts(stem[0], stem[1], length, width, target.lean);
      const box = leafBounds(parts);
      if (box.y < 0 || bottomOf(box) > height + 4) continue;
      if (leafBlocked(box, placed, butterfly, leafGap, butterflyGap)) continue;
      if (obstacles.some((obstacle) => boxGap(box, obstacle) < 2)) continue;
      return { y: stem[1], leaf: parts, box };
    }
  }
  return null;
}

function forcedLeaf(
  points: Point[],
  placed: PlacedLeaf[],
  target: LeafTarget,
  leaf: number,
  pageWidth: number,
  height: number,
  butterfly: Box,
  leafGap: number,
  butterflyGap: number,
) {
  const gap = Math.max(leafGap + leaf * 0.85, leaf * 0.92);
  let y = target.y;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (y > height - 16) return null;
    const stem = pointAtY(points, y);
    const length = Math.min(140, Math.max(72, leaf * target.scale));
    const width = Math.min(90, Math.max(48, leaf * 0.56));
    const half = width / 2;
    const cx = Math.min(pageWidth - half - 14, Math.max(half + 14, stem[0]));
    const parts = leafParts(cx, stem[1], length, width, target.lean, false);
    const box = leafBounds(parts);
    if (!leafBlocked(box, placed, butterfly, leafGap, butterflyGap)) {
      return { y: stem[1], leaf: parts, box };
    }
    y = Math.max(stem[1], y) + gap;
  }
  return null;
}

/** Two leaves through the middle, five packed at the footer so one lower screen is lusher. */
function spreadLeaves(
  points: Point[],
  obstacles: Obstacle[],
  leaf: number,
  pageWidth: number,
  height: number,
  butterfly: Box,
  leafGap: number,
  butterflyGap: number,
  already: PlacedLeaf[],
) {
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return [] as PlacedLeaf[];
  const span = Math.max(1, last[1] - first[1]);
  const pitch = Math.max(leafGap + leaf, leaf * 1.15);
  const lowerEnd = last[1] - leaf * 0.3;
  const targets: LeafTarget[] = [
    { y: first[1] + span * 0.3, scale: 0.92, lean: 0.75, reach: 280 },
    { y: first[1] + span * 0.5, scale: 0.96, lean: -0.7, reach: 240 },
    ...[4, 3, 2, 1, 0].map((step, index) => ({
      y: lowerEnd - pitch * step,
      scale: 0.9 + (index % 3) * 0.04,
      lean: index % 2 === 0 ? 0.72 : -0.6,
      reach: 140,
    })),
  ];
  const placed: PlacedLeaf[] = [...already];
  const photos = obstacles.filter((obstacle) => obstacle.kind === "photo");
  for (const target of targets) {
    const spot = fitLeaf(points, obstacles, placed, target, leaf, pageWidth, height, butterfly, leafGap, butterflyGap)
      ?? fitLeaf(points, photos, placed, target, leaf, pageWidth, height, butterfly, leafGap, butterflyGap)
      ?? forcedLeaf(points, placed, target, leaf, pageWidth, height, butterfly, leafGap, butterflyGap);
    if (spot) placed.push(spot);
  }
  return placed.slice(already.length);
}

function calmRoute(points: Point[], pageWidth: number, stroke: number) {
  const forward = dedupe(points).filter((point, index, all) => index === 0 || point[1] >= (all[index - 1]?.[1] ?? 0) - 0.5);
  const first = forward[0];
  const last = forward[forward.length - 1];
  if (!first || !last || forward.length < 2) return forward;
  const step = 56;
  const minX = stroke + 16;
  const maxX = Math.max(minX, pageWidth - stroke - 16);
  const out: Point[] = [[Math.min(maxX, Math.max(minX, first[0])), first[1]]];
  for (let y = first[1] + step; y < last[1] - 8; y += step) {
    const near = forward.filter((point) => Math.abs(point[1] - y) <= step);
    const pool = near.length > 0 ? near : [pointAtY(forward, y)];
    const xs = pool.map((point) => point[0]).sort((a, b) => a - b);
    const mid = xs[Math.floor(xs.length / 2)] ?? first[0];
    const sway = Math.sin((y - first[1]) / 220) * Math.min(64, pageWidth * 0.05);
    const target = Math.min(maxX, Math.max(minX, mid + sway));
    const prev = out[out.length - 1] ?? first;
    const heroCross = y - first[1] < 180 && Math.abs(target - prev[0]) > 140;
    const maxDx = heroCross ? Math.abs(target - prev[0]) : step * 1.15;
    const x = prev[0] + Math.max(-maxDx, Math.min(maxDx, target - prev[0]));
    out.push([Math.min(maxX, Math.max(minX, x)), y]);
  }
  const prev = out[out.length - 1] ?? first;
  out.push([Math.min(maxX, Math.max(minX, prev[0] + Math.max(-80, Math.min(80, last[0] - prev[0])))), last[1]]);
  return out;
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

function includePoint(bounds: { minX: number; minY: number; maxX: number; maxY: number }, x: number, y: number) {
  bounds.minX = Math.min(bounds.minX, x);
  bounds.minY = Math.min(bounds.minY, y);
  bounds.maxX = Math.max(bounds.maxX, x);
  bounds.maxY = Math.max(bounds.maxY, y);
}

/** Tight bounds of the drawn curve, matching the on-screen leaf box. */
function pathBounds(d: string): Box | null {
  const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  let cx = 0;
  let cy = 0;
  for (const command of toAbsolute(d)) {
    if (command.t === "M" || command.t === "L") {
      cx = command.p[0] ?? cx;
      cy = command.p[1] ?? cy;
      includePoint(bounds, cx, cy);
    } else if (command.t === "C") {
      const x1 = command.p[0] ?? cx;
      const y1 = command.p[1] ?? cy;
      const x2 = command.p[2] ?? cx;
      const y2 = command.p[3] ?? cy;
      const x = command.p[4] ?? cx;
      const y = command.p[5] ?? cy;
      const steps = 12;
      for (let i = 1; i <= steps; i += 1) {
        const t = i / steps;
        const u = 1 - t;
        includePoint(
          bounds,
          u * u * u * cx + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x,
          u * u * u * cy + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y,
        );
      }
      cx = x;
      cy = y;
    }
  }
  if (!Number.isFinite(bounds.minX)) return null;
  return { x: bounds.minX, y: bounds.minY, w: bounds.maxX - bounds.minX, h: bounds.maxY - bounds.minY };
}

function unionBox(boxes: Array<Box | null>): Box {
  const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (const box of boxes) {
    if (!box || box.w <= 0 || box.h <= 0) continue;
    includePoint(bounds, box.x, box.y);
    includePoint(bounds, box.x + box.w, box.y + box.h);
  }
  if (!Number.isFinite(bounds.minX)) return { x: 0, y: 0, w: 0, h: 0 };
  return { x: bounds.minX, y: bounds.minY, w: bounds.maxX - bounds.minX, h: bounds.maxY - bounds.minY };
}

function leafBounds(leaf: PlantLeaf): Box {
  return unionBox([pathBounds(leaf.outline), pathBounds(leaf.midrib), ...leaf.veins.map((vein) => pathBounds(vein))]);
}

/** Distance between two boxes. Zero when they intersect or touch. */
function boxGap(a: Box, b: Box) {
  const dx = Math.max(a.x - rightOf(b), b.x - rightOf(a));
  const dy = Math.max(a.y - bottomOf(b), b.y - bottomOf(a));
  if (dx < 0 && dy < 0) return 0;
  return Math.hypot(Math.max(0, dx), Math.max(0, dy));
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


/** A few leaves on the open stem of the first screen, each clear of the butterfly and of each other. */
function heroSprig(
  points: Point[],
  anchor: Box,
  leaf: number,
  pageWidth: number,
  butterfly: Box,
  photos: Box[],
  leafGap: number,
  butterflyGap: number,
) {
  const cum = arcTable(points);
  const total = cum[cum.length - 1] ?? 0;
  const sign = anchor.x + anchor.w * 0.5 < pageWidth * 0.5 ? 1 : -1;
  const leans = [sign * 0.95, sign * 0.15, sign * -0.8];
  const placed: PlacedLeaf[] = [];
  const limitY = butterfly.y + butterfly.h + leaf * 4.5;
  let cursor = 0;
  for (let index = 0; index < 3; index += 1) {
    let found: (PlacedLeaf & { dist: number }) | null = null;
    for (let dist = cursor; dist <= total; dist += 8) {
      const stem = pointAtArc(points, cum, dist);
      if (stem[1] > limitY) break;
      const length = Math.min(120, Math.max(64, leaf * (0.94 + index * 0.03)));
      const width = Math.min(96, Math.max(52, leaf * 0.62));
      const half = width / 2;
      const cx = Math.min(pageWidth - half - 16, Math.max(half + 16, stem[0]));
      const parts = leafParts(cx, stem[1], length, width, leans[index] ?? sign, true);
      const box = leafBounds(parts);
      if (box.y < 0 || box.h < 8) continue;
      if (leafBlocked(box, placed, butterfly, leafGap, butterflyGap)) continue;
      if (photos.some((photo) => boxGap(box, photo) < 2)) continue;
      found = { y: stem[1], leaf: parts, box, dist };
      break;
    }
    if (!found) break;
    placed.push(found);
    cursor = found.dist + 8;
  }
  return placed;
}

export function buildPlant({
  width,
  height,
  anchor,
  gap,
  leaf,
  leafGap,
  butterflyGap,
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
  leafGap: number;
  butterflyGap: number;
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
  const butterflyBox = unionBox(wings.map((d) => pathBounds(d)));
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
  const calmed = calmRoute(routed.points, width, stroke);
  const joined = takeJoin(calmed, Math.max(240, leaf * 1.8));
  const curve = (segment: Point[]) => curvesThrough(segment, minX, maxX);
  const spine = curve(joined.rest);
  const hero = heroSprig(calmed, anchor, leaf, width, butterflyBox, photos, leafGap, butterflyGap);
  const lower = spreadLeaves(
    joined.rest,
    obstacles,
    leaf,
    width,
    height,
    butterflyBox,
    leafGap,
    butterflyGap,
    hero,
  ).filter((spot) => spot.y > butterflyBox.y + butterflyBox.h + leaf * 0.35 && boxGap(spot.box, butterflyBox) >= butterflyGap);
  const leaves = [...hero, ...lower];

  return {
    viewBox: `0 0 ${round(width)} ${round(height)}`,
    wings,
    join: curve(joined.join),
    segments: spine ? [spine] : [],
    leaves: leaves.map((spot) => spot.leaf),
  };
}

