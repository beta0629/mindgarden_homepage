export type Box = { x: number; y: number; w: number; h: number };

export type PlantGeometry = {
  viewBox: string;
  x: number;
  y: number;
  w: number;
  h: number;
  radius: number;
};

function round(n: number) {
  return Math.round(n * 10) / 10;
}

/**
 * One rounded frame around the programs text block.
 * The box is the copy only, so the stroke does not enclose photos
 * and does not continue down the page.
 */
export function buildPlant({
  width,
  height,
  text,
  pad,
  radius,
}: {
  width: number;
  height: number;
  text: Box | null;
  pad: number;
  radius: number;
}): PlantGeometry {
  const viewBox = `0 0 ${round(width)} ${round(height)}`;
  const empty = { viewBox, x: 0, y: 0, w: 0, h: 0, radius: 0 };
  if (!text || width < 2 || height < 2) return empty;
  const x = text.x - pad;
  const y = text.y - pad;
  const w = text.w + pad * 2;
  const h = text.h + pad * 2;
  if (w < 64 || h < 48 || x < 0 || y < 0 || x + w > width + 1 || y + h > height + 1) return empty;
  const corner = Math.min(Math.max(0, radius), w / 2, h / 2);
  return { viewBox, x: round(x), y: round(y), w: round(w), h: round(h), radius: round(corner) };
}
