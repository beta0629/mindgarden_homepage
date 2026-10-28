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
    <section className="section-defer py-section">
      <Container>
        <div className="flex max-w-3xl flex-col gap-12 lg:gap-16">
        <SectionHeader eyebrow={eyebrow} title={title} />
        <ul className="flex flex-col gap-12">
          {items.map((item) => (
            <li key={item.name} className="flex flex-col gap-3">
              {item.badge ? <p className="type-sm text-ink-2">{item.badge}</p> : null}
              <h3 className="type-h3 text-ink">{item.name}</h3>
              <p className="type-stat text-ink">
                {item.price}
                <span className="type-sm ml-2 font-medium text-ink-2">{item.unit}</span>
              </p>
              <p className="type-sm text-ink-2">{item.meta}</p>
              <p className="type-sm text-ink-2">{item.desc}</p>
            </li>
          ))}
        </ul>
        <p className="type-sm text-ink-2">{note}</p>
        {cta ? (
          <SiteLink link={{ ...cta, external: false }} className="type-sm font-semibold text-brand hover:underline" />
        ) : null}
        </div>
      </Container>
    </section>
  );
}
