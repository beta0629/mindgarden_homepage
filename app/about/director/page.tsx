import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/links/ButtonLink";
import { PageIntro } from "@/components/sections/PageIntro";
import { bookingLink } from "@/config/site";
import { directorPage } from "@/content/pages";
import { seo } from "@/content/seo";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("/about/director", seo.pages.director.title, seo.pages.director.description);

export default function DirectorPage() {
  return (
    <main className="pb-section">
      <PageIntro title={directorPage.title} lead={directorPage.lead} />
      <Container className="flex max-w-3xl flex-col gap-12">
        <blockquote className="type-quote text-ink">{directorPage.quote}</blockquote>
        {directorPage.sections.map((section) => (
          <section key={section.title} className="flex flex-col gap-4">
            <h2 className="type-h3 text-ink">{section.title}</h2>
            {"text" in section && section.text ? <p className="type-sm text-ink-2">{section.text}</p> : null}
            {"items" in section && section.items ? (
              <ul className="flex flex-col gap-2">
                {section.items.map((item) => (
                  <li key={item} className="type-sm text-ink-2">
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
        <p className="type-xs text-ink-3">{directorPage.photoNote}</p>
        <ButtonLink link={bookingLink} size="lg" className="self-start">
          {directorPage.bookingCta}
        </ButtonLink>
      </Container>
    </main>
  );
}
