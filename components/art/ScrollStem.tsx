"use client";

import { useEffect, useRef, useState, type ReactNode, type Ref } from "react";
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

function leafAnchors(host: HTMLElement, stemTop: number, height: number) {
  const width = host.getBoundingClientRect().width;
  const spots = [...host.querySelectorAll<HTMLElement>(".media-frame")]
    .map((frame) => {
      const box = frame.getBoundingClientRect();
      return { y: box.top - stemTop + Math.min(box.height * 0.42, 140), left: box.left };
    })
    .filter((spot) => spot.y > height * 0.12 && spot.y < height * 0.9 && spot.left < width * 0.58)
    .sort((a, b) => a.y - b.y);

  const picked: number[] = [];
  for (const spot of spots) {
    if (picked.every((y) => Math.abs(y - spot.y) > height * 0.14)) picked.push(spot.y);
    if (picked.length === 3) break;
  }
  const fallback = [0.24, 0.5, 0.74].map((t) => t * height);
  for (const y of fallback) {
    if (picked.length === 3) break;
    if (picked.every((spot) => Math.abs(spot - y) > height * 0.12)) picked.push(y);
  }
  return picked.sort((a, b) => a - b).slice(0, 3);
}

function PlantPaths({
  geo,
  tone,
  wingsRef,
}: {
  geo: PlantGeometry;
  tone: "brand" | "onDark";
  wingsRef?: Ref<SVGGElement>;
}) {
  return (
    <svg className={tone === "onDark" ? "plant-svg plant-on-dark" : "plant-svg"} viewBox={geo.viewBox} preserveAspectRatio="xMinYMin meet" aria-hidden="true">
      <g ref={wingsRef} className="plant-wings">
        {geo.wings.map((d, index) => (
          <path key={`wing-${index}`} className="plant-wing" d={d} pathLength={1} />
        ))}
      </g>
      <path className="plant-spine" d={geo.spine} pathLength={1} />
      {geo.leaves.map((d, index) => (
        <path key={`leaf-${index}`} className={`plant-leaf plant-leaf-${index}`} d={d} pathLength={1} />
      ))}
    </svg>
  );
}

export function ScrollStem({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<SVGClipPathElement>(null);
  const wingsRef = useRef<SVGGElement>(null);
  const [geo, setGeo] = useState<PlantGeometry | null>(null);
  const signature = useRef("");

  useEffect(() => {
    const host = hostRef.current;
    const clip = clipRef.current;
    if (!host || !clip) return;

    const update = () => {
      const stem = host.querySelector<HTMLElement>(".scroll-stem");
      const anchor = host.querySelector<HTMLElement>(".plant-anchor");
      if (!stem || !anchor) return;
      const stemBox = stem.getBoundingClientRect();
      const anchorBox = anchor.getBoundingClientRect();
      if (stemBox.width < 2 || stemBox.height < 2 || anchorBox.width < 2) return;
      const gap = Number.parseFloat(getComputedStyle(anchor).marginBottom) || 0;
      const leaf = readPx("--line-leaf");
      const stroke = readPx("--line-stroke-stem");
      const leafYs = leafAnchors(host, stemBox.top, stemBox.height);
      const nextSignature = [
        stemBox.width.toFixed(0),
        stemBox.height.toFixed(0),
        anchorBox.left.toFixed(0),
        anchorBox.top.toFixed(0),
        anchorBox.width.toFixed(0),
        leaf.toFixed(0),
        stroke.toFixed(0),
        leafYs.map((y) => y.toFixed(0)).join("."),
      ].join(":");
      if (nextSignature !== signature.current) {
        signature.current = nextSignature;
        setGeo(
          buildPlant({
            width: stemBox.width,
            height: stemBox.height,
            anchor: {
              x: anchorBox.left - stemBox.left,
              y: anchorBox.top - stemBox.top,
              w: anchorBox.width,
              h: anchorBox.height,
            },
            gap,
            leaf,
            stroke,
            leafYs,
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

  useEffect(() => {
    const host = hostRef.current;
    const wings = wingsRef.current;
    if (!host || !geo) return;
    host.classList.add("is-planted");
    if (!wings || !document.documentElement.classList.contains("motion-ready")) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => wings.classList.add("is-drawn"));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [geo]);

  return (
    <div ref={hostRef} className="scroll-stem-host">
      {children}
      <div className="scroll-stem" aria-hidden="true">
        {geo ? <PlantPaths geo={geo} tone="brand" wingsRef={wingsRef} /> : null}
        <div className="scroll-stem-dark">
          {geo ? <PlantPaths geo={geo} tone="onDark" /> : null}
        </div>
        <svg className="scroll-stem-clip" aria-hidden="true">
          <clipPath id="page-stem-dark" clipPathUnits="objectBoundingBox" ref={clipRef} />
        </svg>
      </div>
    </div>
  );
}
