import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Media } from "@/lib/types";

export function Photo({
  image,
  sizes,
  eager = false,
  frame = "card",
  className,
}: {
  image: Media;
  sizes: string;
  eager?: boolean;
  frame?: "hero" | "card" | "portrait" | "none";
  className?: string;
}) {
  const imageNode = (
    <Image
      src={image.src}
      alt={image.alt}
      width={1050}
      height={1400}
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      className={cn("media-cover", frame === "none" && className)}
    />
  );

  if (frame === "none") return imageNode;

  return (
    <div className={cn("media-frame", frame === "hero" && "media-frame-hero", frame === "card" && "media-frame-card", frame === "portrait" && "media-frame-portrait", className)}>
      {imageNode}
    </div>
  );
}
