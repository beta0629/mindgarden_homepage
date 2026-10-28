import { Container } from "@/components/layout/Container";
import { Photo } from "@/components/media/Photo";
import { TextLines } from "@/components/sections/SectionHeader";
import type { Media } from "@/lib/types";

export function PrivacyBand({
  title,
  lead,
  points,
  image,
}: {
  eyebrow?: string;
  title: string;
  lead: string;
  points: { title: string; desc: string }[];
  image: Media;
}) {
  return (
    <section className="section-defer bg-deep py-section text-on-deep">
      <Container className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="flex flex-col gap-8">
          <h2 className="type-h2 text-on-deep">
            <TextLines text={title} />
          </h2>
          <p className="type-lead text-on-deep">{lead}</p>
          <ul className="grid gap-8">
            {points.map((point) => (
              <li key={point.title}>
                <p className="type-h3 text-on-deep">{point.title}</p>
                <p className="type-sm mt-2 text-on-deep">{point.desc}</p>
              </li>
            ))}
          </ul>
        </div>
        <Photo image={image} frame="portrait" sizes="(max-width: 1024px) 100vw, 42vw" />
      </Container>
    </section>
  );
}
