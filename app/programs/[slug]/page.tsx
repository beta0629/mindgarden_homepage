import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/links/ButtonLink";
import { SiteLink } from "@/components/links/SiteLink";
import { Photo } from "@/components/media/Photo";
import { PageIntro } from "@/components/sections/PageIntro";
import { bookingLink } from "@/config/site";
import { programBySlug, programs } from "@/content/programs";
import { pageMetadata } from "@/lib/metadata";

export function generateStaticParams() {
  return programs.map((program) => ({ slug: program.slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const program = programBySlug(slug);
  if (!program) return {};
  return pageMetadata(program.href, program.title, program.lead);
}

export default async function ProgramPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const program = programBySlug(slug);
  if (!program) notFound();

  return (
    <main className="pb-section">
      <PageIntro eyebrow={program.tag} title={program.title} lead={program.lead} />
      <Container className="grid gap-12 lg:grid-cols-2">
        <Photo image={program.image} frame="portrait" sizes="(max-width: 1024px) 100vw, 42vw" />
        <div className="flex flex-col gap-10">
          <section className="flex flex-col gap-4">
            <h2 className="type-h3 text-ink">{program.labels.forTitle}</h2>
            <ul className="flex flex-col gap-3">
              {program.forWhom.map((item) => (
                <li key={item} className="inline-flex items-start gap-3 type-sm text-ink-2">
                  <Check className="mt-1 size-4 shrink-0 text-brand" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section className="flex flex-col gap-4">
            <h2 className="type-h3 text-ink">{program.labels.flowTitle}</h2>
            <p className="type-sm text-ink-2">{program.flow}</p>
          </section>
          <section className="flex flex-col gap-4">
            <h2 className="type-h3 text-ink">{program.labels.costTitle}</h2>
            <ul className="flex flex-col gap-2">
              {program.prices.map((item) => (
                <li key={item.name} className="flex flex-wrap justify-between gap-2 type-sm text-ink-2">
                  <span>{item.name}</span>
                  <span className="font-semibold text-ink">{item.price}</span>
                </li>
              ))}
            </ul>
          </section>
          <ButtonLink link={bookingLink} size="lg" className="self-start">
            {program.labels.cta}
          </ButtonLink>
          <SiteLink
            link={{ label: program.labels.back, href: "/programs", external: false }}
            className="type-sm text-brand hover:underline"
          />
        </div>
      </Container>
    </main>
  );
}
