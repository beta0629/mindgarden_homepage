import { Container } from "@/components/layout/Container";
import { SiteLink } from "@/components/links/SiteLink";
import { SectionHeader } from "@/components/sections/SectionHeader";

export function DirectorBlock({
  eyebrow,
  quote,
  role,
  name,
  education,
  credentials,
  imageNote,
  cta,
}: {
  eyebrow: string;
  quote: string;
  role: string;
  name: string;
  education: string;
  credentials: string[];
  imageNote: string;
  cta: { label: string; href: string };
}) {
  return (
    <section className="section-defer py-section">
      <Container className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeader eyebrow={eyebrow} title={`${role} ${name}`} />
          <p className="type-xs mt-6 text-ink-3">{imageNote}</p>
        </div>
        <div className="line-wrap flex flex-col gap-8 lg:col-span-7">
          <blockquote className="type-quote text-ink">{quote}</blockquote>
          <p className="type-sm font-semibold text-ink">{education}</p>
          <ul className="flex flex-col gap-3">
            {credentials.slice(1).map((line) => (
              <li key={line} className="type-sm text-ink-2">
                {line}
              </li>
            ))}
          </ul>
          <SiteLink link={{ ...cta, external: false }} className="type-sm font-semibold text-brand hover:underline" />
        </div>
      </Container>
    </section>
  );
}
