import { Bus, Car, Clock, MapPin } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SiteLink } from "@/components/links/SiteLink";
import { Photo } from "@/components/media/Photo";
import { SectionHeader } from "@/components/sections/SectionHeader";
import type { LinkItem, Media } from "@/lib/types";

const icons = {
  pin: MapPin,
  car: Car,
  bus: Bus,
  clock: Clock,
};

export function LocationBlock({
  eyebrow,
  title,
  rows,
  image,
  ctas,
}: {
  eyebrow: string;
  title: string;
  rows: { icon: string; label: string; lines: string[] }[];
  image: Media;
  ctas: { label: string; link: LinkItem }[];
}) {
  return (
    <section className="section-defer py-section">
      <Container className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-10">
          <SectionHeader eyebrow={eyebrow} title={title} />
          <ul className="flex flex-col gap-6">
            {rows.map((row) => {
              const Icon = icons[row.icon as keyof typeof icons] ?? MapPin;
              return (
                <li key={row.label} className="grid grid-cols-[auto_1fr] gap-4">
                  <Icon className="mt-1 size-5 text-brand" aria-hidden="true" />
                  <div className="flex flex-col gap-1">
                    <p className="type-sm font-semibold text-ink">{row.label}</p>
                    {row.lines.map((line) => (
                      <p key={line} className="type-sm text-ink-2">
                        {line}
                      </p>
                    ))}
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
        <Photo image={image} frame="portrait" sizes="(max-width: 1024px) 100vw, 520px" />
      </Container>
    </section>
  );
}
