import { Container } from "@/components/layout/Container";
import { PageIntro } from "@/components/sections/PageIntro";
import { FirstVisit } from "@/components/sections/FirstVisit";
import { bookingLink } from "@/config/site";
import { home } from "@/content/home";
import { firstVisitPage } from "@/content/pages";
import { seo } from "@/content/seo";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("/first-visit", seo.pages.firstVisit.title, seo.pages.firstVisit.description);

export default function FirstVisitPage() {
  return (
    <main>
      <PageIntro title={firstVisitPage.title} lead={firstVisitPage.lead} />
      <FirstVisit
        eyebrow={home.firstVisit.eyebrow}
        title={home.firstVisit.title}
        lead={home.firstVisit.lead}
        price={home.firstVisit.price}
        priceNote={home.firstVisit.priceNote}
        includes={[...home.firstVisit.includes]}
        cta={home.firstVisit.cta}
        image={home.firstVisit.image}
        booking={bookingLink}
      />
      <section className="py-section">
        <Container className="grid gap-12 lg:grid-cols-2">
          <ol className="grid gap-8">
            {firstVisitPage.steps.map((step) => (
              <li key={step.no} className="flex flex-col gap-2">
                <p className="type-sm font-semibold text-brand">{step.no}</p>
                <h2 className="type-h3 text-ink">{step.title}</h2>
                <p className="type-sm text-ink-2">{step.desc}</p>
              </li>
            ))}
          </ol>
          <section className="flex flex-col gap-4 rounded-xl bg-sand p-8">
            <h2 className="type-h3 text-ink">{firstVisitPage.prepareTitle}</h2>
            <ul className="flex flex-col gap-2">
              {firstVisitPage.prepare.map((line) => (
                <li key={line} className="type-sm text-ink-2">
                  {line}
                </li>
              ))}
            </ul>
          </section>
        </Container>
      </section>
    </main>
  );
}
