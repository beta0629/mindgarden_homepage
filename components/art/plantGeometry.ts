export type Box = { x: number; y: number; w: number; h: number };

export type Obstacle = Box & { kind: "photo" | "block" };

export type PlantGeometry = {
  viewBox: string;
  join: string;
  rest: string;
};

type Point = { x: number; y: number };

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

function gapOf(a: Point, b: Point) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function fmt(point: Point) {
  return `${round(point.x)} ${round(point.y)}`;
}

function absorb(host: Box, box: Box) {
  const x = Math.min(host.x, box.x);
  const y = Math.min(host.y, box.y);
  const right = Math.max(rightOf(host), rightOf(box));
  const bottom = Math.max(bottomOf(host), bottomOf(box));
  host.x = x;
  host.y = y;
  host.w = right - x;
  host.h = bottom - y;
}

function overlapsX(a: Box, b: Box, ratio: number) {
  const overlap = Math.min(rightOf(a), rightOf(b)) - Math.max(a.x, b.x);
  if (overlap <= 0) return false;
  return overlap / Math.min(a.w, b.w) >= ratio;
}

function nearY(a: Box, b: Box, gap: number) {
  const space = Math.max(0, Math.max(a.y - bottomOf(b), b.y - bottomOf(a)));
  return space <= gap;
}

function clusterBoxes(boxes: Box[], gap: number) {
  const items = boxes.map((box) => ({ ...box }));
  const used = items.map(() => false);
  const groups: Box[] = [];
  for (let i = 0; i < items.length; i += 1) {
    if (used[i]) continue;
    const host = { ...items[i] };
    used[i] = true;
    let grew = true;
    while (grew) {
      grew = false;
      for (let j = 0; j < items.length; j += 1) {
        if (used[j]) continue;
        if (!nearY(host, items[j], gap) || !overlapsX(host, items[j], 0.3)) continue;
        absorb(host, items[j]);
        used[j] = true;
        grew = true;
      }
    }
    groups.push(host);
  }
  return groups;
}

function mergeBands(boxes: Box[], xGap: number) {
  const sorted = boxes.map((box) => ({ ...box })).sort((a, b) => a.y - b.y || a.x - b.x);
  const bands: Box[] = [];
  for (const box of sorted) {
    const band = bands.find((host) => {
      const overlap = Math.min(bottomOf(host), bottomOf(box)) - Math.max(host.y, box.y);
      const space = Math.max(0, Math.max(box.x - rightOf(host), host.x - rightOf(box)));
      return overlap >= Math.min(host.h, box.h) * 0.45 && space <= xGap;
    });
    if (band) absorb(band, box);
    else bands.push(box);
  }
  return bands;
}

function contained(inner: Box, outer: Box) {
  return inner.x >= outer.x - 6 && inner.y >= outer.y - 6 && rightOf(inner) <= rightOf(outer) + 6 && bottomOf(inner) <= bottomOf(outer) + 6;
}

function padBox(box: Box, pad: number, width: number, height: number): Box | null {
  const x = clamp(box.x - pad, 10, width - 48);
  const y = Math.max(0, box.y - pad);
  const right = clamp(rightOf(box) + pad, x + 36, width - 10);
  const bottom = clamp(bottomOf(box) + pad, y + 36, height - 12);
  if (right - x < 36 || bottom - y < 36) return null;
  return { x, y, w: right - x, h: bottom - y };
}

/** Quarter-circle corners. A turn around a block is a curve, not a miter. */
function roundedPolyline(points: Point[], radius: number) {
  const first = points[0];
  if (!first) return "";
  if (points.length < 2) return `M${fmt(first)}`;
  let d = `M${fmt(first)}`;
  if (points.length === 2) return `${d}L${fmt(points[1] ?? first)}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const prev = points[i - 1] ?? first;
    const cur = points[i] ?? prev;
    const next = points[i + 1] ?? cur;
    const inLen = gapOf(prev, cur);
    const outLen = gapOf(cur, next);
    const use = Math.min(radius, inLen / 2.05, outLen / 2.05);
    if (inLen < 1 || outLen < 1 || use < 1.5) {
      d += `L${fmt(cur)}`;
      continue;
    }
    const ux = (cur.x - prev.x) / inLen;
    const uy = (cur.y - prev.y) / inLen;
    const vx = (next.x - cur.x) / outLen;
    const vy = (next.y - cur.y) / outLen;
    const ax = cur.x - ux * use;
    const ay = cur.y - uy * use;
    const bx = cur.x + vx * use;
    const by = cur.y + vy * use;
    const k = use * 0.551915;
    d += `L${round(ax)} ${round(ay)}C${round(ax + ux * k)} ${round(ay + uy * k)} ${round(bx - vx * k)} ${round(by - vy * k)} ${round(bx)} ${round(by)}`;
  }
  const last = points[points.length - 1] ?? first;
  return `${d}L${fmt(last)}`;
}

function simplify(points: Point[]) {
  const out: Point[] = [];
  for (const point of points) {
    const prev = out[out.length - 1];
    if (prev && gapOf(prev, point) < 4) continue;
    const prev2 = out[out.length - 2];
    if (prev && prev2) {
      const dx1 = prev.x - prev2.x;
      const dy1 = prev.y - prev2.y;
      const dx2 = point.x - prev.x;
      const dy2 = point.y - prev.y;
      const reverse = dx1 * dx2 + dy1 * dy2 < 0 && Math.min(Math.hypot(dx1, dy1), Math.hypot(dx2, dy2)) < 16;
      if (reverse) {
        out.pop();
        const kept = out[out.length - 1];
        if (kept && gapOf(kept, point) < 4) continue;
      }
    }
    out.push(point);
  }
  return out;
}

/**
 * Edges of one block, always including a turn. Side-by-side blocks stop on the shared
 * gutter so the stroke does not run to the bottom and trace back up the same edge.
 */
function wrapBlock(box: Box, from: Point, toward: Point): Point[] {
  const tl = { x: box.x, y: box.y };
  const tr = { x: rightOf(box), y: box.y };
  const br = { x: rightOf(box), y: bottomOf(box) };
  const bl = { x: box.x, y: bottomOf(box) };
  const fromLeft = from.x <= box.x + box.w * 0.5;
  const nextRight = toward.x >= box.x + box.w * 0.45;
  const beside = toward.y > box.y + 28 && toward.y < bottomOf(box) - 28;
  if (from.x < box.x - 8 && from.y > box.y + 16 && from.y < bottomOf(box) - 16) {
    const door = { x: box.x, y: clamp(from.y, box.y + 28, bottomOf(box) - 28) };
    return [door, tl, tr, br, bl];
  }
  if (from.x > rightOf(box) + 8 && from.y > box.y + 16 && from.y < bottomOf(box) - 16) {
    const door = { x: rightOf(box), y: clamp(from.y, box.y + 28, bottomOf(box) - 28) };
    return [door, tr, tl, bl, br];
  }
  const onTop = from.y <= box.y + 28 && from.x >= box.x - 12 && from.x <= rightOf(box) + 12;
  if (onTop) {
    const start = { x: clamp(from.x, box.x, rightOf(box)), y: box.y };
    if (beside && nextRight) {
      const y = clamp(toward.y, box.y + 48, bottomOf(box) - 28);
      return [start, tr, { x: tr.x, y }];
    }
    if (beside && !nextRight) {
      const y = clamp(toward.y, box.y + 48, bottomOf(box) - 28);
      return [start, tl, { x: tl.x, y }];
    }
    if (nextRight) return [start, tr, br];
    return [start, tl, bl];
  }
  if (from.y <= box.y + 28) {
    if (beside && fromLeft && nextRight) {
      const y = clamp(toward.y, box.y + 48, bottomOf(box) - 28);
      return [tl, tr, { x: tr.x, y }];
    }
    if (beside && !fromLeft && !nextRight) {
      const y = clamp(toward.y, box.y + 48, bottomOf(box) - 28);
      return [tr, tl, { x: tl.x, y }];
    }
    if (fromLeft && nextRight) return [tl, tr, br];
    if (!fromLeft && !nextRight) return [tr, tl, bl];
    if (fromLeft) return [tl, tr, br, bl];
    return [tr, tl, bl, br];
  }
  if (from.x <= box.x + 16) return nextRight ? [tl, tr, br] : [tl, tr, br, bl];
  if (from.x >= rightOf(box) - 16) return nextRight ? [tr, br, bl] : [tr, tl, bl];
  if (fromLeft) return [tl, tr, br];
  return [tr, tl, bl];
}

function route(from: Point, to: Point): Point[] {
  if (gapOf(from, to) < 2) return [];
  if (Math.abs(from.x - to.x) < 2 || Math.abs(from.y - to.y) < 2) return [to];
  if (Math.abs(to.x - from.x) >= Math.abs(to.y - from.y)) return [{ x: to.x, y: from.y }, to];
  return [{ x: from.x, y: to.y }, to];
}

function targetsFrom(photos: Box[], blocks: Box[], clusterGap: number, width: number, height: number, pad: number) {
  const captions = new Set<Box>();
  const grownPhotos = photos.map((photo) => ({ ...photo }));
  for (const block of blocks) {
    const photo = grownPhotos.find((item) => block.y >= bottomOf(item) - 8 && block.y - bottomOf(item) < 36 && overlapsX(item, block, 0.35));
    if (!photo) continue;
    absorb(photo, block);
    captions.add(block);
  }
  const text = clusterBoxes(blocks.filter((block) => !captions.has(block)), clusterGap).filter((box) => box.w >= 96 && box.h >= 36);
  const pictures = mergeBands(grownPhotos, 96).filter((box) => box.w >= 64 && box.h >= 64);
  const merged = [...pictures, ...text].sort((a, b) => a.y - b.y || a.x - b.x);
  const kept: Box[] = [];
  for (const box of merged) {
    if (kept.some((host) => contained(box, host))) continue;
    for (let i = kept.length - 1; i >= 0; i -= 1) {
      if (contained(kept[i], box)) kept.splice(i, 1);
    }
    kept.push(box);
  }
  return kept
    .map((box) => padBox(box, pad, width, height))
    .filter((box): box is Box => box !== null)
    .sort((a, b) => a.y - b.y || a.x - b.x);
}

export function buildPlant({
  width,
  height,
  anchor,
  photos,
  blocks,
  radius,
  pad,
  bend,
  start,
  clusterGap,
}: {
  width: number;
  height: number;
  anchor: Box;
  photos: Box[];
  blocks: Box[];
  radius: number;
  pad: number;
  bend: number;
  start: number;
  clusterGap: number;
}): PlantGeometry {
  const viewBox = `0 0 ${round(width)} ${round(height)}`;
  const targets = targetsFrom(photos, blocks, clusterGap, width, height, pad);
  const y = clamp(anchor.y + anchor.h + 8, 12, Math.max(12, height - 48));
  const x0 = clamp(anchor.x + 2, 12, width - 120);
  const x1 = clamp(x0 + Math.max(72, start), x0 + 72, Math.min(width - 24, x0 + width * 0.22));
  const origin = { x: x0, y };
  const stub = { x: x1, y };
  const tail: Point[] = [stub];
  let cursor = stub;

  targets.forEach((box, index) => {
    const next = targets[index + 1];
    const toward = next
      ? { x: next.x + next.w / 2, y: next.y + Math.min(next.h * 0.35, 80) }
      : { x: box.x + box.w / 2, y: Math.min(height - 16, bottomOf(box) + 160) };
    const wrap = wrapBlock(box, cursor, toward);
    const first = wrap[0];
    if (!first) return;
    for (const point of route(cursor, first)) tail.push(point);
    for (const point of wrap) tail.push(point);
    cursor = wrap[wrap.length - 1] ?? cursor;
  });

  const tailEnd = Math.min(height - 10, cursor.y + Math.max(120, bend * 2));
  if (tailEnd > cursor.y + 24) tail.push({ x: cursor.x, y: tailEnd });

  const head = simplify([origin, stub]);
  const restPoints = simplify(tail);
  return {
    viewBox,
    join: roundedPolyline(head, radius),
    rest: roundedPolyline(restPoints, Math.max(16, radius)),
  };
}
