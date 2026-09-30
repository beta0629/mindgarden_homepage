import { LineArt } from "@/components/art/LineArt";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/links/ButtonLink";
import { SiteLink } from "@/components/links/SiteLink";
import type { LinkItem } from "@/lib/types";

export function FinalCta({
  title,
  lead,
  primary,
  booking,
  chat,
  phone,
  contact,
}: {
  title: string;
  lead: string;
  primary: string;
  booking: LinkItem;
  chat: LinkItem;
  phone: LinkItem;
  contact?: LinkItem;
}) {
  return (
    <section className="relative overflow-hidden bg-deep py-section text-on-deep">
      <LineArt
        kind="butterfly"
        tone="onDark"
        faint
        className="pointer-events-none absolute -right-8 bottom-0 size-final-art"
      />
      <Container className="relative flex max-w-3xl flex-col items-start gap-8">
        <h2 className="type-h2 text-on-deep">{title}</h2>
        <p className="type-lead text-on-deep-2">{lead}</p>
        <div className="flex flex-wrap items-center gap-4">
          <ButtonLink link={booking} variant="onDark" size="lg">
            {primary}
          </ButtonLink>
          <ButtonLink link={chat} variant="onDarkGhost" size="lg" />
          <SiteLink link={phone} className="type-sm text-on-deep hover:text-surface">
            {phone.label}
          </SiteLink>
          {contact ? (
            <SiteLink link={contact} className="type-sm text-on-deep hover:text-surface" />
          ) : null}
        </div>
      </Container>
    </section>
  );
}
