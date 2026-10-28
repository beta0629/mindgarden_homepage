import { Bus, Car, Clock, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SiteLink } from "@/components/links/SiteLink";
import { MapFrame } from "@/components/media/MapFrame";
import { Photo } from "@/components/media/Photo";
import { SectionHeader } from "@/components/sections/SectionHeader";
import type { LinkItem, Media } from "@/lib/types";

const icons = {
  pin: MapPin,
  car: Car,
  bus: Bus,
  clock: Clock,
  phone: Phone,
};

export function LocationBlock({
  eyebrow,
  title,
  lead,
  heading = "h2",
  rows,
  image,
  map,
  ctas,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  heading?: "h1" | "h2";
  rows: { icon: string; label: string; lines: { text: string; link?: LinkItem }[] }[];
  image?: Media;
  map?: { src: string; title: string };
  ctas: { label: string; link: LinkItem }[];
}) {
  return (
    <section className="section-defer py-section">
      <Container className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-10">
          <SectionHeader eyebrow={eyebrow} title={title} lead={lead} as={heading} />
          <ul className="flex flex-col gap-6">
            {rows.map((row) => {
              const Icon = icons[row.icon as keyof typeof icons] ?? MapPin;
              return (
                <li key={row.label} className="grid grid-cols-[auto_1fr] gap-4">
                  <Icon className="mt-1 size-5 text-brand" aria-hidden="true" />
                  <div className="flex flex-col gap-1">
                    <p className="type-sm font-semibold text-ink">{row.label}</p>
                    {row.lines.map((line) =>
                      line.link ? (
                        <SiteLink
                          key={line.link.href}
                          link={line.link}
                          className="type-sm text-ink-2 hover:text-brand"
                        />
                      ) : (
                        <p key={line.text} className="type-sm text-ink-2">
                          {line.text}
                        </p>
                      ),
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap gap-4">
            {ctas.map((cta) => (
              <SiteLink key={cta.link.href} link={cta.link} className="type-sm font-semibold text-brand hover:underline">
                {cta.label}
              </SiteLink>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          {map ? <MapFrame src={map.src} title={map.title} /> : null}
          {image ? <Photo image={image} frame="portrait" sizes="(max-width: 1024px) 100vw, 42vw" /> : null}
        </div>
      </Container>
    </section>
  );
}
