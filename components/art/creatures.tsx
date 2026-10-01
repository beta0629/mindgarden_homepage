import brand from "@/content/data/brand.json";

const artX = 30;
const artY = 228;
const hingeX = 301;
const hingeY = 449;

export const creatureMetrics = {
  caterpillar: { w: 108, h: 40 },
  chrysalis: { w: 56, h: 108 },
  partial: { w: 100, h: 132 },
  open: { w: 206, h: 156 },
  partialScale: 0.3,
  openScale: 0.38,
  partialWing: 0.5,
  openWing: 1,
};

const caterpillar = [
  "M8 24C8 16 16 12 24 15C30 10 40 10 46 15C54 10 66 12 72 17C80 13 90 16 92 22C94 28 86 33 78 30C70 36 58 34 50 30C40 36 28 34 22 29C14 34 6 32 8 24Z",
  "M86 18C94 12 100 11 98 6",
  "M88 20C98 16 106 17 108 10",
  "M28 31L26 38",
  "M46 32L44 39",
  "M66 31L68 38",
];

const chrysalis = [
  "M28 2L28 14",
  "M28 16C44 18 52 34 50 52C48 72 38 90 28 104C18 90 8 72 6 52C4 34 12 18 28 16Z",
  "M12 34C28 40 44 36 48 30",
  "M10 50C28 58 46 52 50 46",
  "M14 68C28 74 42 70 46 64",
  "M18 84C28 88 38 84 42 78",
];

const body = "M299 404C293 448 293 500 300 548M303 404C309 448 309 500 302 548";

function Butterfly({
  x,
  y,
  scale,
  wing,
  className,
}: {
  x: number;
  y: number;
  scale: number;
  wing: number;
  className: string;
}) {
  const place = `translate(${x} ${y}) scale(${scale}) translate(${-artX} ${-artY})`;
  const fold = `translate(${hingeX} ${hingeY}) scale(${wing} 1) translate(${-hingeX} ${-hingeY})`;
  return (
    <g className={`creature ${className}`} transform={place}>
      <g transform={fold}>
        {brand.butterfly.paths.map((d, index) => (
          <path key={`${className}-${index}`} d={d} />
        ))}
      </g>
      <path d={body} />
    </g>
  );
}

export function CreatureStages({
  caterpillarAt,
  chrysalisAt,
  partialAt,
  openAt,
}: {
  caterpillarAt: { x: number; y: number };
  chrysalisAt: { x: number; y: number };
  partialAt: { x: number; y: number };
  openAt: { x: number; y: number };
}) {
  return (
    <>
      <g className="creature stage-caterpillar" transform={`translate(${caterpillarAt.x} ${caterpillarAt.y})`}>
        {caterpillar.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g className="creature stage-chrysalis" transform={`translate(${chrysalisAt.x} ${chrysalisAt.y})`}>
        {chrysalis.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <Butterfly
        x={partialAt.x}
        y={partialAt.y}
        scale={creatureMetrics.partialScale}
        wing={creatureMetrics.partialWing}
        className="stage-butterfly-partial"
      />
      <Butterfly
        x={openAt.x}
        y={openAt.y}
        scale={creatureMetrics.openScale}
        wing={creatureMetrics.openWing}
        className="stage-butterfly-open"
      />
    </>
  );
}
