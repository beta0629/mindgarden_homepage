import { Container } from "@/components/layout/Container";

export function PageIntro({
  eyebrow,
  title,
  lead,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
}) {
  return (
    <section className="pt-16 pb-8 lg:pt-24">
      <Container className="flex max-w-3xl flex-col gap-5">
        {eyebrow ? <p className="type-eyebrow">{eyebrow}</p> : null}
        <h1 className="type-h1 text-ink">{title}</h1>
        {lead ? <p className="type-lead">{lead}</p> : null}
      </Container>
    </section>
  );
}
