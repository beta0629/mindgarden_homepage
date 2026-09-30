import { LocationBlock } from "@/components/sections/LocationBlock";
import { resolveLink, site } from "@/config/site";
import { home } from "@/content/home";
import { seo } from "@/content/seo";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("/location", seo.pages.location.title, seo.pages.location.description);

export default function LocationPage() {
  const rows = home.location.rows.map((row) => ({
    icon: row.icon,
    label: row.label,
    lines: "lines" in row && row.lines ? [...row.lines] : [...site.hours.items],
  }));
  const ctas = home.location.ctas.flatMap((key) => {
    const link = resolveLink(key);
    const label = site.links[key as keyof typeof site.links];
    if (!link || !label || !("label" in label)) return [];
    return [{ label: label.label, link }];
  });

  return (
    <main>
      <LocationBlock
        eyebrow={home.location.eyebrow}
        title={home.location.title}
        rows={rows}
        image={home.location.mapImage}
        ctas={ctas}
      />
    </main>
  );
}
