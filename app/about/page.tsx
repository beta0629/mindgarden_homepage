import { Container } from "@/components/layout/Container";
import { SiteLink } from "@/components/links/SiteLink";
import { PageIntro } from "@/components/sections/PageIntro";
import { PrivacyBand } from "@/components/sections/PrivacyBand";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { SpaceBento } from "@/components/sections/SpaceBento";
import { home } from "@/content/home";
import { aboutPage } from "@/content/pages";
import { seo } from "@/content/seo";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("/about", seo.pages.about.title, seo.pages.about.description);

export default function AboutPage() {
  return (
    <main>
      <PageIntro title={aboutPage.title} lead={aboutPage.lead} />
      <section className="py-section">
        <Container className="flex flex-col gap-12">
          <SectionHeader eyebrow={aboutPage.ways.eyebrow} title={aboutPage.ways.title} />
          <div className="grid gap-8 lg:grid-cols-3">
            {aboutPage.ways.items.map((item) => (
              <article key={item.title} className="flex flex-col gap-3">
                <h3 className="type-h3 text-ink">{item.title}</h3>
                <p className="type-sm text-ink-2">{item.desc}</p>
              </article>
            ))}
          </div>
          <SiteLink
            link={{ label: aboutPage.directorCta, href: "/about/director", external: false }}
            className="type-sm font-semibold text-brand hover:underline"
          />
        </Container>
      </section>
      <PrivacyBand
        eyebrow={home.privacy.eyebrow}
        title={home.privacy.title}
        lead={home.privacy.lead}
        points={home.privacy.points}
        image={home.privacy.image}
      />
      <SpaceBento
        eyebrow={home.space.eyebrow}
        title={home.space.title}
        lead={home.space.lead}
        items={home.space.items.map((item) => ({ ...item }))}
      />
    </main>
  );
}
