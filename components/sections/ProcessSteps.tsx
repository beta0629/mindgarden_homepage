import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/sections/SectionHeader";

export function ProcessSteps({
  eyebrow,
  title,
  steps,
}: {
  eyebrow: string;
  title: string;
  steps: { no: string; title: string; desc: string }[];
}) {
  return (
    <section className="section-defer py-section">
      <Container>
        <div className="flex max-w-3xl flex-col gap-12 lg:gap-16">
        <SectionHeader eyebrow={eyebrow} title={title} />
        <ol className="flex flex-col gap-12">
          {steps.map((step) => (
            <li key={step.no} className="flex flex-col gap-3">
              <p className="type-sm text-ink-2">{step.no}</p>
              <h3 className="type-h3 text-ink">{step.title}</h3>
              <p className="type-sm text-ink-2">{step.desc}</p>
            </li>
          ))}
        </ol>
        </div>
      </Container>
    </section>
  );
}
