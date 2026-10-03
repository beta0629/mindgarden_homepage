import { ChairBook } from "@/components/art/ChairBook";
import { LineArt } from "@/components/art/LineArt";
import { Container } from "@/components/layout/Container";
import { Photo } from "@/components/media/Photo";
import { TextLines } from "@/components/sections/SectionHeader";
import { cn } from "@/lib/utils";
import type { Media } from "@/lib/types";

export function PrivacyBand({
  eyebrow,
  title,
  lead,
  points,
  image,
  flowStem = false,
  lineScene = false,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  points: { title: string; desc: string }[];
  image: Media;
  flowStem?: boolean;
  lineScene?: boolean;
}) {
  if (lineScene) {
    return (
      <section className="news-line">
        <div className="news-line-frame">
          <ChairBook />
          <div className="news-line-copy">
            <p className="news-line-kicker type-eyebrow-en">{eyebrow}</p>
            <h2 className="type-h2">
              <TextLines text={title} />
            </h2>
            <p className="type-lead">{lead}</p>
            <ul className="news-line-points">
              {points.map((point) => (
                <li key={point.title}>
                  <p className="type-h3">{point.title}</p>
                  <p className="type-sm mt-2">{point.desc}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "section-defer relative overflow-hidden bg-deep py-section text-on-deep",
        flowStem && "page-stem-band",
      )}
    >
      {flowStem ? null : <LineArt kind="vine" tone="onDark" className="pointer-events-none absolute inset-x-0 top-8" />}
      <Container className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-8">
          <p className="type-eyebrow text-on-deep-2">{eyebrow}</p>
          <h2 className="type-h2 text-on-deep">
            <TextLines text={title} />
          </h2>
          <p className="type-lead text-on-deep-2">{lead}</p>
          <ul className="grid gap-6">
            {points.map((point) => (
              <li key={point.title}>
                <p className="type-h3 text-on-deep">{point.title}</p>
                <p className="type-sm mt-2 text-on-deep-2">{point.desc}</p>
              </li>
            ))}
          </ul>
        </div>
        <Photo image={image} frame="portrait" sizes="(max-width: 1024px) 100vw, 42vw" className={flowStem ? "line-wrap" : undefined} />
      </Container>
    </section>
  );
}
