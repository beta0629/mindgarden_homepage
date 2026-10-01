import { lineArt } from "@/content/brand";

export type Box = { x: number; y: number; w: number; h: number };

export type PlantGeometry = {
  viewBox: string;
  wings: string[];
  spine: string;
  leaves: string[];
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

function curvesThrough(points: Array<[number, number]>) {
  const first = points[0];
  if (!first || points.length < 2) return "";
  let d = `M${round(first[0])} ${round(first[1])}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)] ?? first;
    const p1 = points[i] ?? first;
    const p2 = points[i + 1] ?? p1;
    const p3 = points[Math.min(points.length - 1, i + 2)] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${round(c1x)} ${round(c1y)} ${round(c2x)} ${round(c2y)} ${round(p2[0])} ${round(p2[1])}`;
  }
  return d;
}

function stemXAt(y: number, exitY: number, endY: number, stemX: number, amplitude: number) {
  if (y <= exitY) return stemX;
  const span = Math.max(1, endY - exitY);
  const t = Math.min(1, (y - exitY) / span);
  return stemX + Math.sin(t * Math.PI * 2.5) * amplitude;
}

function leafPath(x: number, y: number, length: number, width: number) {
  const tipX = x + width * 0.28;
  const tipY = y - length;
  return [
    `M${round(x)} ${round(y)}`,
    `C${round(x + width * 0.55)} ${round(y - length * 0.08)} ${round(x + width)} ${round(y - length * 0.28)} ${round(x + width * 0.92)} ${round(y - length * 0.52)}`,
    `C${round(x + width * 0.78)} ${round(y - length * 0.78)} ${round(x + width * 0.48)} ${round(tipY + length * 0.08)} ${round(tipX)} ${round(tipY)}`,
    `C${round(x + width * 0.08)} ${round(tipY + length * 0.16)} ${round(x + width * 0.02)} ${round(y - length * 0.42)} ${round(x)} ${round(y - length * 0.04)}`,
    "Z",
  ].join("");
}

export function buildPlant({
  width,
  height,
  anchor,
  gap,
  leaf,
  stroke,
  leafYs,
}: {
  width: number;
  height: number;
  anchor: Box;
  gap: number;
  leaf: number;
  stroke: number;
  leafYs: number[];
}): PlantGeometry {
  const map = (x: number, y: number): [number, number] => [
    anchor.x + ((x - vb.x) / vb.w) * anchor.w,
    anchor.y + ((y - vb.y) / vb.h) * anchor.h,
  ];
  const wings = butterfly.paths.map((d) => placePath(d, map));

  const textLeft = anchor.x;
  const stemX = Math.max(stroke * 0.65 + 4, Math.min(textLeft * 0.5, textLeft - stroke - 18));
  const room = textLeft - stemX - stroke * 0.5 - 6;
  const amplitude = Math.max(4, Math.min(18, room * 0.6));
  const joinX = anchor.x + anchor.w * 0.5;
  const joinY = anchor.y + anchor.h * 0.9;
  const band = Math.max(gap, stroke + 4);
  const exitY = anchor.y + anchor.h + Math.min(band * 0.5, Math.max(stroke * 0.2, band - stroke * 0.6));
  const exitX = stemX;
  const endY = Math.max(exitY + 8, height - stroke);
  const midX = stemX + (joinX - stemX) * 0.42;
  const midY = anchor.y + anchor.h + band * 0.35;

  const wave: Array<[number, number]> = [[exitX, exitY]];
  const steps = 8;
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const y = exitY + (endY - exitY) * t;
    wave.push([stemXAt(y, exitY, endY, stemX, amplitude), y]);
  }
  const spine = [
    `M${round(joinX)} ${round(joinY)}`,
    `C${round(joinX - anchor.w * 0.16)} ${round(joinY + anchor.h * 0.08)} ${round(midX)} ${round(midY)} ${round(exitX)} ${round(exitY)}`,
    curvesThrough(wave).replace(/^M[\d.\-]+ [\d.\-]+/, ""),
  ].join("");

  const leafLength = leaf;
  const leafWidth = leaf * 0.92;
  const leaves = leafYs.map((y) => {
    const x = stemXAt(y, exitY, endY, stemX, amplitude);
    return leafPath(x, y, leafLength, leafWidth);
  });

  return {
    viewBox: `0 0 ${round(width)} ${round(height)}`,
    wings,
    spine,
    leaves,
  };
}
