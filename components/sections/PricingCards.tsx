import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/Container";
import { SiteLink } from "@/components/links/SiteLink";
import { SectionHeader } from "@/components/sections/SectionHeader";

export function PricingCards({
  eyebrow,
  title,
  items,
  note,
  cta,
}: {
  eyebrow: string;
  title: string;
  items: { name: string; price: string; unit: string; meta: string; desc: string; featured?: boolean; badge?: string }[];
  note: string;
  cta?: { label: string; href: string };
}) {
  return (
    <section className="section-defer bg-sand py-section">
      <Container className="flex flex-col gap-12 lg:gap-16">
        <SectionHeader eyebrow={eyebrow} title={title} />
        <div className="grid gap-4 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.name} className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-8">
              {item.badge ? <Badge variant="coral">{item.badge}</Badge> : null}
              <h3 className="type-h3 text-ink">{item.name}</h3>
              <p className="type-stat text-ink">
                {item.price}
                <span className="type-sm ml-2 font-medium text-ink-2">{item.unit}</span>
              </p>
              <p className="type-sm text-ink-3">{item.meta}</p>
              <p className="type-sm text-ink-2">{item.desc}</p>
            </article>
          ))}
        </div>
        <p className="type-sm max-w-3xl text-ink-3">{note}</p>
        {cta ? (
          <SiteLink link={{ ...cta, external: false }} className="type-sm font-semibold text-brand hover:underline" />
        ) : null}
      </Container>
    </section>
  );
}
