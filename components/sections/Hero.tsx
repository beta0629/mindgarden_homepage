import { Calendar, Check, Phone } from "lucide-react";
import { HeroStillLife } from "@/components/art/HeroStillLife";
import { ButtonLink } from "@/components/links/ButtonLink";
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
    <section className="hero-stage">
      <HeroStillLife />
      <div className="hero-copy">
        <p className="type-eyebrow">{eyebrow}</p>
        <h1 className="type-display mt-4 lg:mt-6">
          {titleLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="type-lead mt-5 max-w-measure lg:mt-8">{lead}</p>
        <div className="mt-6 flex flex-wrap items-center gap-6 lg:mt-12">
          <ButtonLink link={booking} size="lg">
            <Calendar data-icon="inline-start" aria-hidden="true" />
            {primaryCta}
          </ButtonLink>
          <SiteLink link={phone} className="inline-flex items-center gap-2 type-sm text-ink hover:text-brand">
            <Phone className="size-4 text-brand" aria-hidden="true" />
            {phone.label}
          </SiteLink>
        </div>
        <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 lg:mt-8">
          {notes.map((note) => (
            <li key={note} className="inline-flex items-center gap-2 type-sm text-ink-2">
              <Check className="size-4 text-brand" aria-hidden="true" />
              {note}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col items-start gap-1">
          <span className="type-xs font-semibold text-coral">{floatCard.label}</span>
          <span className="type-h3 text-ink">{floatCard.title}</span>
          <span className="type-sm text-ink-2">{floatCard.detail}</span>
          <span className="type-sm font-semibold text-brand">{floatCard.price}</span>
        </div>
      </div>
    </section>
  );
}
