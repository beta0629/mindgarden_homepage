import type { ReactNode } from "react";

/* The closed program-card frame is gone. The host stays so text stacking is unchanged. */
export function ScrollStem({ children }: { children: ReactNode }) {
  return <div className="scroll-stem-host">{children}</div>;
}
