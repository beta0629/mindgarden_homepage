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
 * One open stroke: above the programs heading, down its left side,
 * then a single rounded turn under the first photo. It does not close
 * around the title and does not continue down the page.
 */
export function buildPlant({
  width,
  height,
  text,
  card,
  pad,
  under,
  radius,
}: {
  width: number;
  height: number;
  text: Box | null;
  card: Box | null;
  pad: number;
  under: number;
  radius: number;
}): PlantGeometry {
  const viewBox = `0 0 ${width} ${height}`;
  const empty = { viewBox, d: "" };
  if (!text || !card || width < 2 || height < 2) return empty;
  if (card.y < text.y || card.h < 32 || card.w < 32) return empty;

  const left = Math.max(8, Math.min(text.x, card.x) - pad);
  const top = Math.max(0, text.y - pad);
  const bottom = card.y + card.h + Math.max(0, under);
  const end = card.x + card.w;
  if (bottom <= text.y + text.h) return empty;
  if (top < 0 || left < 0 || bottom > height || end > width) return empty;

  const rise = bottom - top;
  const span = end - left;
  const r = Math.min(Math.max(0, radius), rise * 0.45, span * 0.45);
  if (r < 12 || span < r + 16 || rise < r + 24) return empty;

  const yArc = bottom - r;
  const handle = r * (1 - KAPPA);
  const d = [
    `M ${round(left)} ${round(top)}`,
    `L ${round(left)} ${round(yArc)}`,
    `C ${round(left)} ${round(bottom - handle)} ${round(left + handle)} ${round(bottom)} ${round(left + r)} ${round(bottom)}`,
    `L ${round(end)} ${round(bottom)}`,
  ].join(" ");
  return { viewBox, d };
}
