import { Calendar, Check, Phone } from "lucide-react";
import { ButtonLink } from "@/components/links/ButtonLink";
import { Container } from "@/components/layout/Container";
import { SiteLink } from "@/components/links/SiteLink";
import type { LinkItem } from "@/lib/types";

export function Hero({
  eyebrow,
  titleLines,
  lead,
  primaryCta,
  notes,
  floatCard,
  booking,
  phone,
}: {
  eyebrow: string;
  titleLines: string[];
  lead: string;
  primaryCta: string;
  notes: string[];
  floatCard: { label: string; title: string; detail: string; price: string };
  booking: LinkItem;
  phone: LinkItem;
}) {
  return (
    <section className="bg-paper pt-12 pb-16 lg:pt-24 lg:pb-section">
      <Container>
        <div className="flex max-w-3xl flex-col gap-8">
        <p className="type-sm text-ink-2">{eyebrow}</p>
        <h1 className="type-display">
          {titleLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="type-lead">{lead}</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <ButtonLink link={booking} size="lg">
            <Calendar data-icon="inline-start" aria-hidden="true" />
            {primaryCta}
          </ButtonLink>
          <SiteLink link={phone} className="inline-flex items-center gap-2 type-sm text-ink hover:text-brand">
            <Phone className="size-4 text-brand" aria-hidden="true" />
            {phone.label}
          </SiteLink>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {notes.map((note) => (
            <li key={note} className="inline-flex items-center gap-2 type-sm text-ink-2">
              <Check className="size-4 text-brand" aria-hidden="true" />
              {note}
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2">
          <span className="type-sm text-ink-2">{floatCard.label}</span>
          <span className="type-h3 text-ink">{floatCard.title}</span>
          <span className="type-sm text-ink-2">{floatCard.detail}</span>
          <span className="type-sm font-semibold text-ink">{floatCard.price}</span>
        </div>
        </div>
      </Container>
    </section>
  );
}
