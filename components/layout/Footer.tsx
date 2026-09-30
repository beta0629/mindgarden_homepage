import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";
import { SiteLink } from "@/components/links/SiteLink";
import type { LinkItem } from "@/lib/types";

export function Footer({
  logo,
  wordmark,
  homeLabel,
  tagline,
  contacts,
  channels,
  hours,
  addressLines,
  business,
  privacy,
  copyright,
}: {
  logo: { src: string; alt: string };
  wordmark: { title: string; subtitle: string };
  homeLabel: string;
  tagline: string;
  contacts: LinkItem[];
  channels: LinkItem[];
  hours: string[];
  addressLines: string[];
  business: string[];
  privacy: LinkItem;
  copyright: string;
}) {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="brand-bar" aria-hidden="true" />
      <Container className="flex flex-col gap-12 py-16">
        <div className="flex flex-col gap-4">
          <Logo
            src={logo.src}
            alt={logo.alt}
            title={wordmark.title}
            subtitle={wordmark.subtitle}
            homeLabel={homeLabel}
          />
          <p className="type-sm text-ink-2">{tagline}</p>
        </div>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <ul className="flex flex-col gap-2">
            {contacts.map((link) => (
              <li key={link.href}>
                <SiteLink link={link} className="type-sm text-ink hover:text-brand" />
              </li>
            ))}
          </ul>
          <ul className="flex flex-col gap-2">
            {channels.map((link) => (
              <li key={link.href}>
                <SiteLink link={link} className="type-sm text-ink hover:text-brand" />
              </li>
            ))}
          </ul>
          <ul className="flex flex-col gap-2">
            {hours.map((line) => (
              <li key={line} className="type-sm text-ink-2">
                {line}
              </li>
            ))}
          </ul>
          <ul className="flex flex-col gap-2">
            {addressLines.map((line) => (
              <li key={line} className="type-sm text-ink-2">
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-4 border-t border-line pt-8">
          <p className="type-xs text-ink-3">{business.join(" · ")}</p>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SiteLink link={privacy} className="type-sm text-ink hover:text-brand" />
            <p className="type-xs text-ink-3">{copyright}</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
