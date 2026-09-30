import { FaqList } from "@/components/sections/FaqList";
import { JsonLd } from "@/components/seo/JsonLd";
import { faq } from "@/content/faq";
import { faqJsonLd, seo } from "@/content/seo";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("/faq", seo.pages.faq.title, seo.pages.faq.description);

export default function FaqPage() {
  return (
    <main>
      <JsonLd data={faqJsonLd} />
      <FaqList title={faq.title} items={faq.items} />
    </main>
  );
}
