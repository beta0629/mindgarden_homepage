import { Container } from "@/components/layout/Container";
import { SiteLink } from "@/components/links/SiteLink";
import { SectionHeader } from "@/components/sections/SectionHeader";
import type { LinkItem } from "@/lib/types";

export function Channels({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: { title: string; desc: string; cta: string; link: LinkItem }[];
}) {
  return (
    <section className="section-defer py-section">
      <Container className="flex flex-col gap-12 lg:gap-16">
        <SectionHeader eyebrow={eyebrow} title={title} />
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {items.map((item) => (
            <article key={item.title} className="flex max-w-measure flex-col gap-4">
              <h3 className="type-h3 text-ink">{item.title}</h3>
              <p className="type-sm text-ink-2">{item.desc}</p>
              <SiteLink link={item.link} className="type-sm font-semibold text-brand hover:underline">
                {item.cta}
              </SiteLink>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
