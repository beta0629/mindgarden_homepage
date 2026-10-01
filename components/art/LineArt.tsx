import { lineArt, type LineKind } from "@/content/brand";
import { cn } from "@/lib/utils";
import { LineDraw } from "@/components/motion/LineDraw";

/* Downward spine. Endpoints share an x so section stretches meet.
   Lateral swing stays inside the viewBox so a tall stretch still reads as a stem. */
const spineArt = {
  viewBox: "0 0 80 240",
  paths: ["M40 0 C 70 42, 72 78, 46 112 C 18 150, 14 190, 40 240"],
};

const stemLeafFrames = ["16 112 48 64", "54 70 48 64", "30 38 48 54"] as const;

export function LineArt({
  kind,
  draw = "scroll",
  tone = "brand",
  thin = false,
  faint = false,
  part = "all",
  leaf = 0,
  className,
}: {
  kind: LineKind;
  draw?: "now" | "scroll" | "static";
  tone?: "brand" | "onDark";
  thin?: boolean;
  faint?: boolean;
  part?: "all" | "spine" | "leaf";
  leaf?: 0 | 1 | 2;
  className?: string;
}) {
  const source = lineArt(kind);
  const leafPath = source.paths[leaf + 1];
  const art =
    part === "spine"
      ? spineArt
      : part === "leaf"
        ? { viewBox: stemLeafFrames[leaf], paths: leafPath ? [leafPath] : [] }
        : source;
  const kindClass = {
    butterfly: "line-art-butterfly",
    stem: "line-art-stem",
    sprig: "line-art-sprig",
    vine: "line-art-vine",
  } as const;
  const partClass = part === "spine" ? "line-art-spine" : part === "leaf" ? "line-art-leaf" : kindClass[kind];
  return (
    <LineDraw
      mode={draw}
      short={part !== "spine" && kind !== "butterfly"}
      grow={part === "spine"}
      className={cn(
        "line-art",
        partClass,
        tone === "onDark" && "line-art-on-dark",
        thin && "line-art-thin",
        faint && "line-art-faint",
        className,
      )}
    >
      <svg viewBox={art.viewBox} preserveAspectRatio={part === "spine" ? "none" : undefined} aria-hidden="true">
        {art.paths.map((d) => (
          <path key={d} d={d} pathLength={1} />
        ))}
      </svg>
    </LineDraw>
  );
}
