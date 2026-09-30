import brandData from "./data/brand.json";

export const brand = brandData;

export type LineKind = "butterfly" | "stem" | "sprig" | "vine";

export function lineArt(kind: LineKind) {
  if (kind === "butterfly") return brand.butterfly;
  return brand.ornaments[kind];
}
