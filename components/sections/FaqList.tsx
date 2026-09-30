import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/layout/Container";
import { SiteLink } from "@/components/links/SiteLink";
import { SectionHeader } from "@/components/sections/SectionHeader";

export function FaqList({
  eyebrow,
  title,
  items,
  more,
}: {
  eyebrow?: string;
  title: string;
  items: { q: string; a: string }[];
  more?: { label: string; href: string };
}) {
  return (
    <section className="section-defer py-section">
      <Container className="flex max-w-3xl flex-col gap-10">
        <SectionHeader eyebrow={eyebrow} title={title} />
        <Accordion>
          {items.map((item, index) => (
            <AccordionItem key={item.q} value={String(index)} className="border-b border-line">
              <AccordionTrigger className="type-sm py-5 font-semibold text-ink hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="type-sm text-ink-2">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        {more ? (
          <SiteLink link={{ ...more, external: false }} className="type-sm font-semibold text-brand hover:underline" />
        ) : null}
      </Container>
    </section>
  );
}
