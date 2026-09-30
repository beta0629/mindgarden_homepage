import { Phone } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";
import { MobileNav } from "@/components/layout/MobileNav";
import { ButtonLink } from "@/components/links/ButtonLink";
import { SiteLink } from "@/components/links/SiteLink";
import type { LinkItem } from "@/lib/types";

export function Header({
  logo,
  wordmark,
  homeLabel,
  nav,
  phone,
  booking,
  bookingLabel,
  openLabel,
  closeLabel,
  menuTitle,
}: {
  logo: { src: string; alt: string };
  wordmark: { title: string; subtitle: string };
  homeLabel: string;
  nav: { label: string; href: string }[];
  phone: LinkItem;
  booking: LinkItem;
  bookingLabel: string;
  openLabel: string;
  closeLabel: string;
  menuTitle: string;
}) {
  return (
    <header className="sticky top-0 z-header border-b border-line bg-paper">
      <Container className="flex min-h-header items-center justify-between gap-6">
        <Logo
          src={logo.src}
          alt={logo.alt}
          title={wordmark.title}
          subtitle={wordmark.subtitle}
          homeLabel={homeLabel}
        />
        <nav className="hidden items-center gap-6 lg:flex" aria-label={menuTitle}>
          {nav.map((item) => (
            <SiteLink
              key={item.href}
              link={{ ...item, external: false }}
              className="type-sm text-ink hover:text-brand"
            />
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <SiteLink link={phone} className="hidden items-center gap-2 type-sm text-ink xl:inline-flex">
            <Phone className="size-4 text-brand" aria-hidden="true" />
            {phone.label}
          </SiteLink>
          <ButtonLink link={booking} className="hidden sm:inline-flex">
            {bookingLabel}
          </ButtonLink>
          <MobileNav
            items={nav}
            phone={phone}
            booking={{ ...booking, label: bookingLabel }}
            openLabel={openLabel}
            closeLabel={closeLabel}
            title={menuTitle}
          />
        </div>
      </Container>
    </header>
  );
}
