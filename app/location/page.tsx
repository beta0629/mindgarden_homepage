import { LocationBlock } from "@/components/sections/LocationBlock";
import { resolveLink, site } from "@/config/site";
import { home } from "@/content/home";
import { locationPage } from "@/content/pages";
import { seo } from "@/content/seo";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("/location", seo.pages.location.title, seo.pages.location.description);

export default function LocationPage() {
  const ctas = locationPage.mapLinkKeys.flatMap((key) => {
    const link = resolveLink(key);
    const entry = site.links[key];
    if (!link || !entry || !("label" in entry)) return [];
    return [{ label: entry.label, link }];
  });

  return (
    <main>
      <LocationBlock
        eyebrow={locationPage.eyebrow}
        title={locationPage.title}
        lead={locationPage.lead}
        heading="h1"
        rows={locationPage.rows}
        image={home.location.mapImage}
        map={locationPage.map}
        ctas={ctas}
      />
    </main>
  );
}
