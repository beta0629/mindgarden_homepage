import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/links/ButtonLink";
import { SiteLink } from "@/components/links/SiteLink";
import { SectionHeader } from "@/components/sections/SectionHeader";
import type { LinkItem } from "@/lib/types";

export function FaqList({
  eyebrow,
  title,
  items,
  more,
  actions,
  heading = "h2",
}: {
  eyebrow?: string;
  title: string;
  items: { q: string; a: string }[];
  more?: { label: string; href: string };
  actions?: { link: LinkItem; label?: string; button?: boolean }[];
  heading?: "h1" | "h2";
}) {
  return (
    <section className="section-defer py-section">
      <Container className="flex max-w-3xl flex-col gap-10">
        <SectionHeader eyebrow={eyebrow} title={title} as={heading} />
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
        {actions ? (
          <div className="flex flex-wrap items-center gap-4">
            {actions.map((action) =>
              action.button ? (
                <ButtonLink key={action.link.href} link={action.link} size="lg">
                  {action.label}
                </ButtonLink>
              ) : (
                <SiteLink
                  key={action.link.href}
                  link={action.link}
                  className="type-sm font-semibold text-brand hover:underline"
                />
              ),
            )}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
