import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/links/ButtonLink";
import { PageIntro } from "@/components/sections/PageIntro";
import { PricingCards } from "@/components/sections/PricingCards";
import { bookingLink, site } from "@/config/site";
import { home } from "@/content/home";
import { pricingPage } from "@/content/pages";
import { seo } from "@/content/seo";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("/pricing", seo.pages.pricing.title, seo.pages.pricing.description);

export default function PricingPage() {
  return (
    <main>
      <PageIntro title={pricingPage.title} lead={pricingPage.lead} />
      <PricingCards
        eyebrow={home.pricing.eyebrow}
        title={home.pricing.title}
        items={home.pricing.items}
        note={home.pricing.note}
      />
      <section className="pb-section">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h2 className="type-h3 text-ink">{pricingPage.menuTitle}</h2>
            <ul className="flex flex-col">
              {pricingPage.menu.map((item) => (
                <li key={item.name} className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line py-4">
                  <span className="type-sm text-ink">{item.name}</span>
                  <span className="type-sm font-semibold text-brand">{item.price}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-3">
              <h2 className="type-h3 text-ink">{pricingPage.policyTitle}</h2>
              <ul className="flex flex-col gap-2">
                {pricingPage.policies.map((line) => (
                  <li key={line} className="type-sm text-ink-2">
                    {line}
                  </li>
                ))}
              </ul>
            </section>
            <section className="flex flex-col gap-3">
              <h2 className="type-h3 text-ink">{pricingPage.paymentTitle}</h2>
              <p className="type-sm text-ink-2">{pricingPage.payment.join(" · ")}</p>
              <p className="type-sm text-ink-2">{pricingPage.voucher}</p>
            </section>
            <section className="flex flex-col gap-2">
              {site.hours.items.map((line) => (
                <p key={line} className="type-sm text-ink-2">
                  {line}
                </p>
              ))}
            </section>
            <ButtonLink link={bookingLink} size="lg" className="self-start">
              {pricingPage.bookingCta}
            </ButtonLink>
          </div>
        </Container>
      </section>
    </main>
  );
}
