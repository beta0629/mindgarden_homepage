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
    <section className="section-defer border-t border-line py-section">
      <Container className="flex flex-col gap-12">
        <SectionHeader eyebrow={eyebrow} title={title} />
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <article key={item.title} className="flex flex-col gap-4 rounded-xl border border-line p-8">
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
