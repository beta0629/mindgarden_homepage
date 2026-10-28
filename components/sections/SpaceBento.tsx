import { Container } from "@/components/layout/Container";
import { Photo } from "@/components/media/Photo";
import { SectionHeader } from "@/components/sections/SectionHeader";
import type { Media } from "@/lib/types";

export function SpaceBento({
  eyebrow,
  title,
  lead,
  items,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  items: (Media & { caption: string; size: "tall" | "base" })[];
}) {
  return (
    <section className="section-defer py-section">
      <Container className="flex flex-col gap-12 lg:gap-16">
        <SectionHeader eyebrow={eyebrow} title={title} lead={lead} />
        <div className="bento">
          {items.map((item) => (
            <figure key={item.caption} className={item.size === "tall" ? "bento-tall flex flex-col gap-3" : "flex flex-col gap-3"}>
              <Photo
                image={item}
                frame={item.size === "tall" ? "portrait" : "card"}
                sizes="(max-width: 1024px) 100vw, 30vw"
                className={item.size === "tall" ? "h-full" : undefined}
              />
              <figcaption className="type-xs text-ink-3">{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
