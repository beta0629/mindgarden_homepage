import type { ReactNode } from "react";
import { LineArt } from "@/components/art/LineArt";

export function ScrollStem({
  side = "start",
  children,
}: {
  side?: "start" | "end";
  children: ReactNode;
}) {
  return (
    <div className="scroll-stem-host">
      <div className={side === "end" ? "scroll-stem scroll-stem-end" : "scroll-stem"}>
        <LineArt kind="stem" thin />
      </div>
      {children}
    </div>
  );
}
