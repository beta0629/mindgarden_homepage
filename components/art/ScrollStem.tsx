"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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

function boxesIn(host: HTMLElement, stem: HTMLElement) {
  const stemBox = stem.getBoundingClientRect();
  const rel = (el: HTMLElement) => {
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
  const photos: Obstacle[] = [...host.querySelectorAll<HTMLElement>(".media-frame, .map-frame")]
    .filter(visible)
    .map((el) => ({ ...rel(el), kind: "photo" as const }))
    .filter((box) => box.w > 48 && box.h > 48 && box.y < stemBox.height && box.y + box.h > 0);
  const blocks: Obstacle[] = [...host.querySelectorAll<HTMLElement>("h1, h2, h3, p, li, blockquote, figcaption, button")]
    .filter((el) => visible(el) && !el.closest(".media-frame, .map-frame"))
    .map((el) => ({ ...rel(el), kind: "block" as const }))
    .filter((box) => box.w > 32 && box.h > 14 && box.y < stemBox.height && box.y + box.h > 0);
  return { photos, blocks, stemBox };
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
      const anchor = host.querySelector<HTMLElement>(".plant-anchor");
      if (!stem || !anchor) return;
      const { photos, blocks, stemBox } = boxesIn(host, stem);
      const anchorBox = anchor.getBoundingClientRect();
      if (stemBox.width < 2 || stemBox.height < 2 || anchorBox.width < 2) return;
      const radius = readPx("--line-wrap-radius") || 24;
      const pad = readPx("--line-wrap-pad") || 18;
      const arm = readPx("--line-corner-arm") || 88;
      const clusterGap = readPx("--line-cluster-gap") || 72;
      const hero = anchor.closest("section");
      const heroBox = hero?.getBoundingClientRect();
      const focusY = heroBox ? heroBox.bottom - stemBox.top + 4 : anchorBox.bottom - stemBox.top + 4;
      let checksum = photos.length * 13 + blocks.length;
      for (const box of [...photos, ...blocks]) {
        checksum = (checksum + Math.round(box.x) * 3 + Math.round(box.y) * 5 + Math.round(box.w) + Math.round(box.h) * 7) | 0;
      }
      const nextSignature = [
        stemBox.width.toFixed(0),
        stemBox.height.toFixed(0),
        focusY.toFixed(0),
        radius.toFixed(0),
        pad.toFixed(0),
        arm.toFixed(0),
        clusterGap.toFixed(0),
        String(checksum),
      ].join(":");
      if (nextSignature !== signature.current) {
        signature.current = nextSignature;
        setGeo(
          buildPlant({
            width: stemBox.width,
            height: stemBox.height,
            focusY,
            photos,
            blocks,
            radius,
            pad,
            arm,
            clusterGap,
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
