import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/links/ButtonLink";
import { SiteLink } from "@/components/links/SiteLink";
import { Photo } from "@/components/media/Photo";
import { SectionHeader } from "@/components/sections/SectionHeader";
import type { LinkItem, Media } from "@/lib/types";

export function ProgramGrid({
  eyebrow,
  title,
  lead,
  items,
  more,
  booking,
  bookingLabel,
  heading = "h2",
}: {
  eyebrow: string;
  title: string;
  lead: string;
  items: { tag: string; title: string; desc: string; href: string; image: Media }[];
  more?: { label: string; href: string };
  booking?: LinkItem;
  bookingLabel?: string;
  heading?: "h1" | "h2";
}) {
  return (
    <section className="section-defer py-section">
      <Container className="flex flex-col gap-16 lg:gap-20">
        <SectionHeader eyebrow={eyebrow} title={title} lead={lead} as={heading} />
        <div className="flex flex-col gap-16 lg:gap-20">
          {items.map((item) => (
            <SiteLink
              key={item.href}
              link={{ label: item.title, href: item.href, external: false }}
              className="grid items-start gap-6 lg:grid-cols-2 lg:gap-16"
            >
              <div className="flex flex-col gap-4">
                <p className="type-sm text-ink-2">{item.tag}</p>
                <h3 className="type-h3 text-ink">{item.title}</h3>
                <p className="type-sm text-ink-2">{item.desc}</p>
              </div>
              <Photo image={item.image} sizes="(max-width: 1024px) 100vw, 40vw" />
            </SiteLink>
          ))}
        </div>
        {more ? (
          <SiteLink link={{ ...more, external: false }} className="type-sm font-semibold text-brand hover:underline" />
        ) : null}
        {booking ? (
          <ButtonLink link={booking} size="lg" className="self-start">
            {bookingLabel}
          </ButtonLink>
        ) : null}
      </Container>
    </section>
  );
}
