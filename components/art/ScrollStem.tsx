"use client";

import { useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { buildPlant, type Frame, type PlantGeometry } from "@/components/art/plantGeometry";

function readPx(name: string) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return 0;
  if (raw.endsWith("rem")) {
    return value * Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  }
  return value;
}

function framesIn(host: HTMLElement, stem: HTMLElement) {
  const stemBox = stem.getBoundingClientRect();
  const visible = (el: HTMLElement) => {
    if (el.closest(".scroll-stem, .plant-anchor, .mobile-cta")) return false;
    const style = getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden";
  };
  const frames: Frame[] = [];
  host.querySelectorAll<HTMLElement>(".line-wrap").forEach((el) => {
    if (!visible(el)) return;
    const box = el.getBoundingClientRect();
    const frame = {
      x: box.left - stemBox.left,
      y: box.top - stemBox.top,
      w: box.width,
      h: box.height,
      approach: 0,
    };
    if (frame.w < 80 || frame.h < 80) return;
    const section = el.closest("section");
    const sectionTop = section ? section.getBoundingClientRect().top - stemBox.top : frame.y;
    const band = Math.max(0, frame.y - sectionTop);
    frame.approach = sectionTop + Math.max(20, Math.min(band * 0.55, Math.max(20, band - 28)));
    const previous = frames[frames.length - 1];
    if (previous && Math.abs(previous.y - frame.y) < 48) {
      if (frame.w * frame.h > previous.w * previous.h) frames[frames.length - 1] = frame;
      return;
    }
    frames.push(frame);
  });
  frames.sort((a, b) => a.y - b.y);
  return { frames, stemBox };
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
        <g
          key={`leaf-${index}`}
          className={
            leaf.home
              ? "plant-leaf-group plant-leaf-home"
              : `plant-leaf-group plant-leaf-${geo.leaves.slice(0, index).filter((item) => !item.home).length}`
          }
        >
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
      const { frames, stemBox } = framesIn(host, stem);
      const anchorBox = anchor.getBoundingClientRect();
      if (stemBox.width < 2 || stemBox.height < 2 || anchorBox.width < 2) return;
      const leaf = readPx("--line-leaf");
      const leafGap = readPx("--line-leaf-gap") || 96;
      const radius = readPx("--radius-xl") || 32;
      const gap = readPx("--line-wrap-gap") || 20;
      const hook = readPx("--line-hook") || 64;
      let checksum = frames.length;
      for (const box of frames) {
        checksum = (checksum + Math.round(box.x) * 3 + Math.round(box.y) * 5 + Math.round(box.w) + Math.round(box.h) * 7 + Math.round(box.approach)) | 0;
      }
      const nextSignature = [
        stemBox.width.toFixed(0),
        stemBox.height.toFixed(0),
        anchorBox.left.toFixed(0),
        anchorBox.top.toFixed(0),
        anchorBox.width.toFixed(0),
        anchorBox.height.toFixed(0),
        leaf.toFixed(0),
        leafGap.toFixed(0),
        radius.toFixed(0),
        gap.toFixed(0),
        hook.toFixed(0),
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
            frames,
            radius,
            gap,
            hook,
            leaf,
            leafGap,
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
