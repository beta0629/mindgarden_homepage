"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { LineArt } from "@/components/art/LineArt";

function StemMarks({ tone = "brand" }: { tone?: "brand" | "onDark" }) {
  return (
    <>
      <LineArt kind="stem" part="spine" tone={tone} className="scroll-stem-line" />
      <LineArt kind="stem" part="leaf" leaf={0} tone={tone} className="scroll-leaf scroll-leaf-a" />
      <LineArt kind="stem" part="leaf" leaf={1} tone={tone} className="scroll-leaf scroll-leaf-b" />
      <LineArt kind="stem" part="leaf" leaf={2} tone={tone} className="scroll-leaf scroll-leaf-c" />
    </>
  );
}

export function ScrollStem({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<SVGClipPathElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const clip = clipRef.current;
    if (!host || !clip) return;

    const update = () => {
      const stem = host.querySelector(".scroll-stem");
      if (!stem) return;
      const stemBox = stem.getBoundingClientRect();
      const bands = host.querySelectorAll(".page-stem-band");
      const next = document.createDocumentFragment();
      if (stemBox.height > 0) {
        bands.forEach((band) => {
          const bandBox = band.getBoundingClientRect();
          const rect = clip.ownerDocument.createElementNS(clip.namespaceURI, "rect");
          rect.setAttribute("x", "0");
          rect.setAttribute("y", String((bandBox.top - stemBox.top) / stemBox.height));
          rect.setAttribute("width", "1");
          rect.setAttribute("height", String(bandBox.height / stemBox.height));
          next.appendChild(rect);
        });
      }
      clip.replaceChildren(next);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    host.querySelectorAll(".page-stem-band").forEach((band) => observer.observe(band));
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div ref={hostRef} className="scroll-stem-host">
      {children}
      <div className="scroll-stem" aria-hidden="true">
        <StemMarks />
        <div className="scroll-stem-dark">
          <StemMarks tone="onDark" />
        </div>
        <svg className="scroll-stem-clip" aria-hidden="true">
          <clipPath id="page-stem-dark" clipPathUnits="objectBoundingBox" ref={clipRef} />
        </svg>
      </div>
    </div>
  );
}
