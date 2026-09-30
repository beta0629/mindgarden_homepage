import { FaqList } from "@/components/sections/FaqList";
import { JsonLd } from "@/components/seo/JsonLd";
import { bookingLink } from "@/config/site";
import contactData from "@/content/data/contact.json";
import { faq } from "@/content/faq";
import { home } from "@/content/home";
import { faqJsonLd, seo } from "@/content/seo";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("/faq", seo.pages.faq.title, seo.pages.faq.description);

export default function FaqPage() {
  return (
    <main>
      <JsonLd data={faqJsonLd} />
      <FaqList
        eyebrow={faq.eyebrow}
        title={faq.title}
        heading="h1"
        items={faq.items}
        actions={[
          { link: bookingLink, label: home.hero.primaryCta, button: true },
          { link: { label: contactData.title, href: "/contact", external: false } },
        ]}
      />
    </main>
  );
}
