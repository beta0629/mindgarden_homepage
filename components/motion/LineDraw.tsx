"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function LineDraw({
  mode,
  short = false,
  grow = false,
  className,
  children,
}: {
  mode: "now" | "scroll" | "static";
  short?: boolean;
  grow?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || mode === "static") return;
    if (!document.documentElement.classList.contains("motion-ready")) return;

    if (mode === "now") {
      // Two frames so the scaled dash is painted before the stroke starts.
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => node.classList.add("is-drawn"));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        node.classList.add("is-drawn");
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [mode]);

  return (
    <span
      ref={ref}
      className={cn("line-draw", short && "line-draw-short", grow && "line-draw-grow", className)}
    >
      {children}
    </span>
  );
}
