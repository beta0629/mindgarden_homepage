import { Container } from "@/components/layout/Container";
import { PageIntro } from "@/components/sections/PageIntro";
import { PrivacyBody } from "@/components/privacy/PrivacyBody";
import ui from "@/content/data/ui.json";
import { privacy } from "@/content/privacy";
import { seo } from "@/content/seo";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("/privacy", seo.pages.privacy.title, seo.pages.privacy.description);

export default function PrivacyPage() {
  return (
    <main className="pb-section">
      <PageIntro title={privacy.title} lead={privacy.effectiveDate} />
      <Container className="flex max-w-3xl flex-col gap-6">
        {privacy.draft ? (
          <p className="rounded-xl bg-sand px-6 py-5 type-sm font-semibold text-ink">
            {ui.draft}. {privacy.reviewNote}
          </p>
        ) : null}
        <PrivacyBody blocks={privacy.blocks} />
      </Container>
    </main>
  );
}
