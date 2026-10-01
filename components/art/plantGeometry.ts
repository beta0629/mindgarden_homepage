export type Box = { x: number; y: number; w: number; h: number };

export type PlantGeometry = {
  viewBox: string;
  line: string;
};

function round(n: number) {
  return Math.round(n * 10) / 10;
}

function rightOf(box: Box) {
  return box.x + box.w;
}

/** One horizontal stroke above the stat cells. It does not turn down a side. */
export function buildPlant({
  width,
  height,
  cells,
  gap,
}: {
  width: number;
  height: number;
  cells: Box[];
  gap: number;
}): PlantGeometry {
  const viewBox = `0 0 ${round(width)} ${round(height)}`;
  if (cells.length < 2 || width < 2 || height < 2) return { viewBox, line: "" };
  const left = Math.min(...cells.map((box) => box.x));
  const right = Math.max(...cells.map((box) => rightOf(box)));
  const y = Math.min(...cells.map((box) => box.y)) - Math.max(0, gap);
  if (right - left < 48 || y < 0 || y > height) return { viewBox, line: "" };
  return {
    viewBox,
    line: `M${round(left)} ${round(y)}L${round(right)} ${round(y)}`,
  };
}
