import type { ReactNode } from "react";
import { LineArt } from "@/components/art/LineArt";
import { cn } from "@/lib/utils";

export function ScrollStem({
  side = "start",
  children,
}: {
  side?: "start" | "end";
  children: ReactNode;
}) {
  return (
    <div className="scroll-stem-host">
      {children}
      <div className={cn("scroll-stem", side === "end" && "scroll-stem-mirrored")} aria-hidden="true">
        <LineArt kind="stem" part="spine" className="scroll-stem-line" />
        <LineArt kind="stem" part="leaf" leaf={0} className="scroll-leaf scroll-leaf-a" />
        <LineArt kind="stem" part="leaf" leaf={1} className="scroll-leaf scroll-leaf-b" />
        <LineArt kind="stem" part="leaf" leaf={2} className="scroll-leaf scroll-leaf-c" />
      </div>
    </div>
  );
}
