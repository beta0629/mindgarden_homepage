export type Box = { x: number; y: number; w: number; h: number };

export type PlantGeometry = {
  viewBox: string;
  d: string;
};

function round(n: number) {
  return Math.round(n * 10) / 10;
}

/** Quarter-circle cubic from straight down into a rightward run. */
const KAPPA = 0.5522847498;

/**
 * One stroke around the program cards. It starts above the heading, runs
 * down the left, under every card, up the right side, and back across the
 * top. Quarter-circle corners. It does not continue down the page.
 */
export function buildPlant({
  width,
  height,
  text,
  card,
  pad,
  under,
  radius,
  stroke = 16,
}: {
  width: number;
  height: number;
  text: Box | null;
  card: Box | null;
  pad: number;
  under: number;
  radius: number;
  stroke?: number;
}): PlantGeometry {
  const viewBox = `0 0 ${width} ${height}`;
  const empty = { viewBox, d: "" };
  if (!text || !card || width < 2 || height < 2) return empty;
  if (card.y < text.y + text.h || card.h < 32 || card.w < 32) return empty;

  const half = Math.max(0, stroke) / 2;
  const xL = Math.max(half + 1, Math.min(text.x, card.x) - pad);
  const xR = Math.min(width - half - 1, card.x + card.w + pad);
  const y0 = Math.max(half, text.y - pad);
  const yB = Math.min(height - half - 1, card.y + card.h + Math.max(under, half + 4));
  const belowCopy = text.y + text.h + half + 8;
  const aboveCards = card.y - half - 6;
  let yT = card.y - pad;
  if (yT < belowCopy) yT = belowCopy;
  if (yT > aboveCards) yT = aboveCards;

  if (xR <= card.x + card.w || yB <= card.y + card.h) return empty;
  if (yT >= card.y || y0 >= yT || xL < 0 || y0 < 0 || xR > width || yB > height) return empty;

  const span = xR - xL;
  const loopH = yB - yT;
  const r = Math.min(Math.max(0, radius), loopH * 0.45, span * 0.45);
  if (r < 12 || span < r * 2 + 16 || loopH < r * 2 + 16 || yB - r <= yT + r) return empty;

  const k = r * KAPPA;
  const d = [
    `M ${round(xL)} ${round(y0)}`,
    `L ${round(xL)} ${round(yB - r)}`,
    `C ${round(xL)} ${round(yB - r + k)} ${round(xL + r - k)} ${round(yB)} ${round(xL + r)} ${round(yB)}`,
    `L ${round(xR - r)} ${round(yB)}`,
    `C ${round(xR - r + k)} ${round(yB)} ${round(xR)} ${round(yB - r + k)} ${round(xR)} ${round(yB - r)}`,
    `L ${round(xR)} ${round(yT + r)}`,
    `C ${round(xR)} ${round(yT + r - k)} ${round(xR - r + k)} ${round(yT)} ${round(xR - r)} ${round(yT)}`,
    `L ${round(xL + r)} ${round(yT)}`,
    `C ${round(xL + r - k)} ${round(yT)} ${round(xL)} ${round(yT + r - k)} ${round(xL)} ${round(yT + r)}`,
  ].join(" ");
  return { viewBox, d };
}
