import { lineArt, type LineKind } from "@/content/brand";
import { cn } from "@/lib/utils";
import { LineDraw } from "@/components/motion/LineDraw";

export function LineArt({
  kind,
  draw = "scroll",
  tone = "brand",
  thin = false,
  faint = false,
  className,
}: {
  kind: LineKind;
  draw?: "now" | "scroll" | "static";
  tone?: "brand" | "onDark";
  thin?: boolean;
  faint?: boolean;
  className?: string;
}) {
  const art = lineArt(kind);
  return (
    <LineDraw
      mode={draw}
      short={kind !== "butterfly"}
      className={cn(
        "line-art",
        tone === "onDark" && "line-art-on-dark",
        thin && "line-art-thin",
        faint && "line-art-faint",
        className,
      )}
    >
      <svg viewBox={art.viewBox} aria-hidden="true">
        {art.paths.map((d) => (
          <path key={d} d={d} pathLength={1} />
        ))}
      </svg>
    </LineDraw>
  );
}
