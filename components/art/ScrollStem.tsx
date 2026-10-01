"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CreatureStages, creatureMetrics } from "@/components/art/creatures";
import { buildPlant, type Box, type Obstacle, type PlantGeometry } from "@/components/art/plantGeometry";

type Point = { x: number; y: number };

type StagePoints = {
  caterpillar: Point;
  chrysalis: Point;
  partial: Point;
  open: Point;
};

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

function closest(boxes: Box[], y: number) {
  let best: Box | null = null;
  let bestDist = Infinity;
  for (const box of boxes) {
    const dist = Math.abs(box.y + box.h * 0.4 - y);
    if (dist < bestDist) {
      best = box;
      bestDist = dist;
    }
  }
  return best;
}

function sitBeside(box: Box, size: { w: number; h: number }, width: number, preferY: number): Point {
  const y = Math.max(0, Math.min(preferY, box.y + box.h * 0.2));
  if (box.x >= size.w + 28) return { x: box.x - size.w - 16, y };
  const rightGap = width - (box.x + box.w);
  if (rightGap >= size.w + 28) return { x: box.x + box.w + 16, y };
  const x = Math.min(Math.max(box.x + box.w * 0.62, 12), Math.max(12, width - size.w - 12));
  return { x, y: Math.max(0, box.y - size.h * 0.72) };
}

function stagesFor({
  anchor,
  photos,
  blocks,
  width,
  height,
  stemTop,
}: {
  anchor: Box;
  photos: Obstacle[];
  blocks: Obstacle[];
  width: number;
  height: number;
  stemTop: number;
}): StagePoints {
  const vh = window.innerHeight;
  const maxScroll = Math.max(vh, document.documentElement.scrollHeight - vh);
  const caterpillar = {
    x: anchor.x + Math.max(0, (anchor.w - creatureMetrics.caterpillar.w) / 2),
    y: anchor.y + Math.max(0, (anchor.h - creatureMetrics.caterpillar.h) / 2),
  };
  const inView = (scroll: number, viewportY: number) => scroll - stemTop + viewportY;
  const chrysalisY = Math.min(height - creatureMetrics.chrysalis.h - 24, Math.max(anchor.y + anchor.h + 64, inView(vh, vh * 0.28)));
  const partialY = Math.min(height - creatureMetrics.partial.h - 24, Math.max(chrysalisY + vh * 0.7, inView(vh * 2.15, vh * 0.3)));
  const openY = Math.min(height - creatureMetrics.open.h - 16, Math.max(partialY + vh * 0.8, inView(maxScroll, vh * 0.36)));
  const text = blocks.filter((box) => box.w < width * 0.8);
  const chrysalisBox = closest(text.length ? text : blocks, chrysalisY) ?? closest(photos, chrysalisY);
  const partialBox = closest(photos, partialY) ?? closest(blocks, partialY);
  const openBox = closest(photos, openY) ?? closest(blocks, openY);
  const chrysalis = chrysalisBox
    ? sitBeside(chrysalisBox, creatureMetrics.chrysalis, width, chrysalisY)
    : { x: Math.max(16, anchor.x), y: chrysalisY };
  const partial = partialBox
    ? sitBeside(partialBox, creatureMetrics.partial, width, partialY)
    : { x: 24, y: partialY };
  const open = openBox ? sitBeside(openBox, creatureMetrics.open, width, openY) : { x: 24, y: openY };
  chrysalis.y = Math.min(Math.max(chrysalis.y, chrysalisY - 36), chrysalisY + 48);
  partial.y = Math.min(Math.max(partial.y, partialY - 40), partialY + 80);
  open.y = Math.min(Math.max(open.y, openY - 48), Math.min(height - creatureMetrics.open.h, openY + 40));
  return { caterpillar, chrysalis, partial, open };
}

function WrapPaths({
  geo,
  stages,
  tone,
}: {
  geo: PlantGeometry;
  stages: StagePoints | null;
  tone: "brand" | "onDark";
}) {
  return (
    <svg className={tone === "onDark" ? "plant-svg plant-on-dark" : "plant-svg"} viewBox={geo.viewBox} preserveAspectRatio="xMinYMin meet" aria-hidden="true">
      {geo.line ? <path className="wrap-line" d={geo.line} pathLength={1} /> : null}
      {tone === "brand" && stages ? (
        <CreatureStages
          caterpillarAt={stages.caterpillar}
          chrysalisAt={stages.chrysalis}
          partialAt={stages.partial}
          openAt={stages.open}
        />
      ) : null}
    </svg>
  );
}

export function ScrollStem({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<SVGClipPathElement>(null);
  const [geo, setGeo] = useState<PlantGeometry | null>(null);
  const [stages, setStages] = useState<StagePoints | null>(null);
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
      const bend = readPx("--line-bend") || 28;
      const start = readPx("--wrap-start") || 112;
      const clusterGap = readPx("--line-cluster-gap") || 72;
      let checksum = photos.length * 13 + blocks.length;
      for (const box of [...photos, ...blocks]) {
        checksum = (checksum + Math.round(box.x) * 3 + Math.round(box.y) * 5 + Math.round(box.w) + Math.round(box.h) * 7) | 0;
      }
      const nextSignature = [
        stemBox.width.toFixed(0),
        stemBox.height.toFixed(0),
        anchorBox.left.toFixed(0),
        anchorBox.top.toFixed(0),
        anchorBox.width.toFixed(0),
        anchorBox.height.toFixed(0),
        radius.toFixed(0),
        pad.toFixed(0),
        bend.toFixed(0),
        start.toFixed(0),
        clusterGap.toFixed(0),
        String(checksum),
      ].join(":");
      if (nextSignature !== signature.current) {
        signature.current = nextSignature;
        const anchor = {
          x: anchorBox.left - stemBox.left,
          y: anchorBox.top - stemBox.top,
          w: anchorBox.width,
          h: anchorBox.height,
        };
        setGeo(
          buildPlant({
            width: stemBox.width,
            height: stemBox.height,
            anchor,
            photos,
            blocks,
            radius,
            pad,
            bend,
            start,
            clusterGap,
          }),
        );
        setStages(
          stagesFor({
            anchor,
            photos,
            blocks,
            width: stemBox.width,
            height: stemBox.height,
            stemTop: stemBox.top + window.scrollY,
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
        {geo ? <WrapPaths geo={geo} stages={stages} tone="brand" /> : null}
        <div className="scroll-stem-dark">
          {geo ? <WrapPaths geo={geo} stages={null} tone="onDark" /> : null}
        </div>
        <svg className="scroll-stem-clip" aria-hidden="true">
          <clipPath id="page-stem-dark" clipPathUnits="objectBoundingBox" ref={clipRef} />
        </svg>
      </div>
    </div>
  );
}
