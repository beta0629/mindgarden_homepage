"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { buildPlant, type PlantGeometry } from "@/components/art/plantGeometry";

function readPx(name: string) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return 0;
  if (raw.endsWith("rem")) {
    return value * Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  }
  return value;
}

function statCells(host: HTMLElement, stemBox: DOMRect) {
  return [...host.querySelectorAll<HTMLElement>(".stat-rail .stat-cell")]
    .filter((el) => {
      const style = getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden";
    })
    .map((el) => {
      const box = el.getBoundingClientRect();
      return {
        x: box.left - stemBox.left,
        y: box.top - stemBox.top,
        w: box.width,
        h: box.height,
      };
    })
    .filter((box) => box.w > 32 && box.h > 24 && box.y < stemBox.height && box.y + box.h > 0);
}

function WrapPaths({ geo, tone }: { geo: PlantGeometry; tone: "brand" | "onDark" }) {
  return (
    <svg className={tone === "onDark" ? "plant-svg plant-on-dark" : "plant-svg"} viewBox={geo.viewBox} preserveAspectRatio="xMinYMin meet" aria-hidden="true">
      {geo.line ? <path className="wrap-line" d={geo.line} pathLength={1} /> : null}
    </svg>
  );
}

export function ScrollStem({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<SVGClipPathElement>(null);
  const [geo, setGeo] = useState<PlantGeometry | null>(null);
  const signature = useRef("");

  useEffect(() => {
    const host = hostRef.current;
    const clip = clipRef.current;
    if (!host || !clip) return;

    const update = () => {
      const stem = host.querySelector<HTMLElement>(".scroll-stem");
      if (!stem) return;
      const stemBox = stem.getBoundingClientRect();
      if (stemBox.width < 2 || stemBox.height < 2) return;
      const gap = readPx("--line-stat-gap") || 18;
      const cells = statCells(host, stemBox);
      let checksum = cells.length;
      for (const box of cells) {
        checksum = (checksum + Math.round(box.x) * 3 + Math.round(box.y) * 5 + Math.round(box.w) + Math.round(box.h) * 7) | 0;
      }
      const nextSignature = [stemBox.width.toFixed(0), stemBox.height.toFixed(0), gap.toFixed(0), String(checksum)].join(":");
      if (nextSignature !== signature.current) {
        signature.current = nextSignature;
        setGeo(
          buildPlant({
            width: stemBox.width,
            height: stemBox.height,
            cells,
            gap,
          }),
        );
      }

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

    let alive = true;
    const measure = () => {
      if (alive) update();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    host.querySelectorAll("section, img").forEach((node) => observer.observe(node));
    document.fonts?.ready.then(measure).catch(() => undefined);
    window.addEventListener("resize", measure);
    return () => {
      alive = false;
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div ref={hostRef} className="scroll-stem-host">
      {children}
      <div className="scroll-stem" aria-hidden="true">
        {geo ? <WrapPaths geo={geo} tone="brand" /> : null}
        <div className="scroll-stem-dark">
          {geo ? <WrapPaths geo={geo} tone="onDark" /> : null}
        </div>
        <svg className="scroll-stem-clip" aria-hidden="true">
          <clipPath id="page-stem-dark" clipPathUnits="objectBoundingBox" ref={clipRef} />
        </svg>
      </div>
    </div>
  );
}
