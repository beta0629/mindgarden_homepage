import { ContactForm } from "@/components/contact/ContactForm";
import { Container } from "@/components/layout/Container";
import { PageIntro } from "@/components/sections/PageIntro";
import { phoneLink, privacyLink } from "@/config/site";
import contactData from "@/content/data/contact.json";
import pricingData from "@/content/data/pricing.json";
import { seo } from "@/content/seo";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("/contact", seo.pages.contact.title, seo.pages.contact.description);

export default function ContactPage() {
  const fields = contactData.fields.map((field) => ({
    name: field.name,
    label: field.label,
    type: field.type,
    required: field.required,
    autocomplete: "autocomplete" in field ? field.autocomplete : undefined,
    placeholder: "placeholder" in field ? field.placeholder : undefined,
    help: "help" in field ? field.help : undefined,
    emptyLabel: "emptyLabel" in field ? field.emptyLabel : undefined,
    options:
      field.name === "program"
        ? pricingData.menu.map((item) => item.name)
        : "options" in field
          ? field.options
          : undefined,
  }));

  return (
    <main className="pb-section">
      <PageIntro title={contactData.title} lead={contactData.lead} />
      <Container className="max-w-3xl">
        <ContactForm
          fields={fields}
          consent={{
            label: contactData.consent.label,
            summary: contactData.consent.summary,
            errorRequired: contactData.consent.errorRequired,
            policyLabel: privacyLink.label,
          }}
          honeypot={contactData.honeypot}
          submitLabel={contactData.submit}
          policy={privacyLink}
          phone={phoneLink}
        />
      </Container>
    </main>
  );
}
