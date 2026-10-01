"use client";

import { useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { buildPlant, type Obstacle, type PlantGeometry } from "@/components/art/plantGeometry";

function readPx(name: string) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return 0;
  if (raw.endsWith("rem")) {
    return value * Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  }
  return value;
}

function obstaclesIn(stem: HTMLElement) {
  const stemBox = stem.getBoundingClientRect();
  const rel = (el: Element) => {
    const box = el.getBoundingClientRect();
    return {
      x: box.left - stemBox.left,
      y: box.top - stemBox.top,
      w: box.width,
      h: box.height,
    };
  };
  const visible = (el: HTMLElement) => {
    if (el.closest(".scroll-stem, .plant-anchor, .mobile-cta")) return false;
    const style = getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden";
  };
  const photos = [...document.querySelectorAll<HTMLElement>(".media-frame, .map-frame")]
    .filter(visible)
    .map((el) => ({ ...rel(el), kind: "photo" as const }))
    .filter((box) => box.w > 8 && box.h > 8);
  const blocks = [...document.querySelectorAll<HTMLElement>("main h1, main h2, main h3, main p, main li, main blockquote, main figcaption, main a, main button, main article, footer h2, footer p, footer li, footer a")]
    .filter(visible)
    .map((el) => ({ ...rel(el), kind: "block" as const }))
    .filter((box) => box.w > 8 && box.h > 8 && box.y < stemBox.height && box.y + box.h > 0);
  return { photos, blocks, stemBox };
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
        {geo.join ? <path className="plant-join" d={geo.join} pathLength={1} /> : null}
      </g>
      {geo.segments.map((d, index) => (
        <path key={`stem-${index}`} className={`plant-stem plant-stem-${index}`} d={d} pathLength={1} />
      ))}
      {geo.leaves.map((leaf, index) => (
        <g key={`leaf-${index}`} className={`plant-leaf-group plant-leaf-${index}`}>
          <path className="plant-leaf-outline" d={leaf.outline} pathLength={1} />
          <path className="plant-leaf-midrib" d={leaf.midrib} pathLength={1} />
          {leaf.veins.map((d, vein) => (
            <path key={`vein-${vein}`} className={`plant-leaf-vein plant-leaf-vein-${vein}`} d={d} pathLength={1} />
          ))}
        </g>
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
      let photos;
      let blocks;
      let stemBox;
      try {
        ({ photos, blocks, stemBox } = obstaclesIn(stem));
      } catch (error) {
        console.error("plant-measure", error);
        return;
      }
      const anchorBox = anchor.getBoundingClientRect();
      if (stemBox.width < 2 || stemBox.height < 2 || anchorBox.width < 2) return;
      const gap = Number.parseFloat(getComputedStyle(anchor).marginBottom) || 0;
      const leaf = readPx("--line-leaf");
      const stroke = readPx("--line-stroke-stem");
      const container = host.querySelector<HTMLElement>(".mx-auto");
      const containerBox = container?.getBoundingClientRect();
      const pad = container ? Number.parseFloat(getComputedStyle(container).paddingLeft) || 0 : 0;
      const contentLeft = containerBox ? containerBox.left - stemBox.left + pad : pad;
      const contentRight = containerBox ? containerBox.right - stemBox.left - pad : stemBox.width - pad;
      const obstacles: Obstacle[] = [...photos, ...blocks];
      let checksum = obstacles.length;
      for (const box of obstacles) {
        checksum = (checksum + Math.round(box.x) * 3 + Math.round(box.y) * 5 + Math.round(box.w) + Math.round(box.h) * 7) | 0;
      }
      const nextSignature = [
        stemBox.width.toFixed(0),
        stemBox.height.toFixed(0),
        anchorBox.left.toFixed(0),
        anchorBox.top.toFixed(0),
        anchorBox.width.toFixed(0),
        contentLeft.toFixed(0),
        contentRight.toFixed(0),
        leaf.toFixed(0),
        stroke.toFixed(0),
        String(checksum),
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
            contentLeft,
            contentRight,
            obstacles,
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
    host.querySelectorAll("section").forEach((section) => observer.observe(section));
    document.querySelectorAll("footer").forEach((footer) => observer.observe(footer));
    document.fonts?.ready.then(measure).catch(() => undefined);
    window.addEventListener("resize", measure);
    return () => {
      alive = false;
      observer.disconnect();
      window.removeEventListener("resize", measure);
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
