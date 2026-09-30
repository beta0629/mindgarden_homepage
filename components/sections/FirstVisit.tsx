import { Check } from "lucide-react";
import { LineArt } from "@/components/art/LineArt";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/links/ButtonLink";
import { Photo } from "@/components/media/Photo";
import { TextLines } from "@/components/sections/SectionHeader";
import type { LinkItem, Media } from "@/lib/types";

export function FirstVisit({
  eyebrow,
  title,
  lead,
  price,
  priceNote,
  includes,
  cta,
  image,
  booking,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  price: string;
  priceNote: string;
  includes: string[];
  cta: string;
  image: Media;
  booking: LinkItem;
}) {
  return (
    <section className="section-defer bg-sand py-section">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="relative">
          <LineArt kind="stem" thin className="absolute -left-2 top-0 hidden w-16 lg:block" />
          <Photo image={image} frame="portrait" sizes="(max-width: 1024px) 100vw, 42vw" className="lg:ml-12" />
        </div>
        <div className="flex flex-col gap-8">
          <p className="type-eyebrow-en">{eyebrow}</p>
          <h2 className="type-h2 text-ink">
            <TextLines text={title} />
          </h2>
          <p className="type-lead">{lead}</p>
          <p className="flex items-baseline gap-3">
            <span className="type-stat text-ink">{price}</span>
            <span className="type-sm text-ink-3">{priceNote}</span>
          </p>
          <ul className="flex flex-col gap-3">
            {includes.map((item) => (
              <li key={item} className="inline-flex items-start gap-3 type-sm text-ink-2">
                <Check className="mt-1 size-4 shrink-0 text-brand" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <ButtonLink link={booking} size="lg" className="self-start">
            {cta}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
