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

function programCopy(host: HTMLElement, stemBox: DOMRect) {
  const el = host.querySelector<HTMLElement>(".program-copy");
  if (!el) return null;
  const style = getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return null;
  const box = el.getBoundingClientRect();
  if (box.width < 64 || box.height < 36) return null;
  return {
    x: box.left - stemBox.left,
    y: box.top - stemBox.top,
    w: box.width,
    h: box.height,
  };
}

function programCard(host: HTMLElement, stemBox: DOMRect) {
  const copy = host.querySelector(".program-copy");
  const card = copy?.closest("section")?.querySelector<HTMLElement>(".program-cards");
  if (!card) return null;
  const style = getComputedStyle(card);
  if (style.display === "none" || style.visibility === "hidden") return null;
  const box = card.getBoundingClientRect();
  if (box.width < 32 || box.height < 32) return null;
  return {
    x: box.left - stemBox.left,
    y: box.top - stemBox.top,
    w: box.width,
    h: box.height,
  };
}

function WrapPaths({ geo, tone }: { geo: PlantGeometry; tone: "brand" | "onDark" }) {
  if (!geo.d) return null;
  return (
    <svg className={tone === "onDark" ? "plant-svg plant-on-dark" : "plant-svg"} viewBox={geo.viewBox} preserveAspectRatio="none" aria-hidden="true">
      <path className="wrap-line" d={geo.d} pathLength={1} />
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
      const pad = readPx("--line-wrap-pad") || 28;
      const under = readPx("--line-wrap-under") || 20;
      const radius = readPx("--line-wrap-radius") || 32;
      const stroke = readPx("--line-stroke-wrap") || 16;
      const text = programCopy(host, stemBox);
      const card = programCard(host, stemBox);
      const textSum = text ? [text.x, text.y, text.w, text.h].map((n) => Math.round(n)).join(",") : "none";
      const cardSum = card ? [card.x, card.y, card.w, card.h].map((n) => Math.round(n)).join(",") : "none";
      const nextSignature = [stemBox.width.toFixed(1), stemBox.height.toFixed(1), pad.toFixed(1), under.toFixed(1), radius.toFixed(1), stroke.toFixed(1), textSum, cardSum].join(":");
      if (nextSignature !== signature.current) {
        signature.current = nextSignature;
        setGeo(
          buildPlant({
            width: stemBox.width,
            height: stemBox.height,
            text,
            card,
            pad,
            under,
            radius,
            stroke,
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
