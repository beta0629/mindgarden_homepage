import { ScrollStem } from "@/components/art/ScrollStem";
import { Channels } from "@/components/sections/Channels";
import { DirectorBlock } from "@/components/sections/DirectorBlock";
import { FaqList } from "@/components/sections/FaqList";
import { FinalCta } from "@/components/sections/FinalCta";
import { FirstVisit } from "@/components/sections/FirstVisit";
import { Hero } from "@/components/sections/Hero";
import { LocationBlock } from "@/components/sections/LocationBlock";
import { PricingCards } from "@/components/sections/PricingCards";
import { PrivacyBand } from "@/components/sections/PrivacyBand";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { ProgramGrid } from "@/components/sections/ProgramGrid";
import { SpaceBento } from "@/components/sections/SpaceBento";
import { StatStrip } from "@/components/sections/StatStrip";
import { bookingLink, phoneLink, requireLink, resolveLink, site } from "@/config/site";
import contactData from "@/content/data/contact.json";
import { home } from "@/content/home";
import { pageMetadata } from "@/lib/metadata";
import { seo } from "@/content/seo";

export const metadata = {
  ...pageMetadata("/", seo.homeTitle, seo.homeDescription),
  title: { absolute: seo.homeTitle },
};

export default function HomePage() {
  const locationRows = home.location.rows.map((row) => ({
    icon: row.icon,
    label: row.label,
    lines: ("lines" in row && row.lines ? [...row.lines] : [...site.hours.items]).map((text) => ({ text })),
  }));
  const mapLinks = home.location.ctas.flatMap((key) => {
    const link = resolveLink(key);
    const label = site.links[key as keyof typeof site.links];
    if (!link || !label || !("label" in label)) return [];
    return [{ label: label.label, link }];
  });
  const locationNav = site.nav.find((item) => item.href === "/location");
  if (locationNav) {
    mapLinks.push({ label: locationNav.label, link: { ...locationNav, external: false } });
  }
  const channelItems = home.channels.items.flatMap((item) => {
    const link = resolveLink(item.linkKey);
    if (!link) return [];
    return [{ title: item.title, desc: item.desc, cta: item.cta, link }];
  });
  const chat = requireLink(home.finalCta.chatKey);

  return (
    <main>
      <ScrollStem>
        <Hero
          eyebrow={home.hero.eyebrow}
          titleLines={[...home.hero.titleLines]}
          lead={home.hero.lead}
          primaryCta={home.hero.primaryCta}
          notes={[...home.hero.note]}
          image={home.hero.image}
          floatCard={home.hero.floatCard}
          booking={bookingLink}
          phone={phoneLink}
        />
        <StatStrip items={home.stats.map((item) => ({ ...item, sub: "sub" in item ? item.sub : undefined }))} />
        <ProgramGrid
          eyebrow={home.programs.eyebrow}
          title={home.programs.title}
          lead={home.programs.lead}
          items={home.programs.items}
          more={{ label: home.programs.more, href: "/programs" }}
        />
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
          mark={false}
        />
        <DirectorBlock
          eyebrow={home.director.eyebrow}
          quote={home.director.quote}
          role={home.director.role}
          name={home.director.name}
          education={home.director.education}
          credentials={[...home.director.credentials]}
          imageNote={home.director.imageNote}
          cta={{ label: home.director.cta, href: "/about/director" }}
        />
        <PrivacyBand
          eyebrow={home.privacy.eyebrow}
          title={home.privacy.title}
          lead={home.privacy.lead}
          points={home.privacy.points}
          image={home.privacy.image}
          flowStem
        />
        <SpaceBento
          eyebrow={home.space.eyebrow}
          title={home.space.title}
          lead={home.space.lead}
          items={home.space.items.map((item) => ({ ...item }))}
        />
        <PricingCards
          eyebrow={home.pricing.eyebrow}
          title={home.pricing.title}
          items={home.pricing.items}
          note={home.pricing.note}
          cta={{ label: home.pricing.cta, href: "/pricing" }}
        />
        <ProcessSteps eyebrow={home.process.eyebrow} title={home.process.title} steps={home.process.steps} />
        <FaqList
          eyebrow={home.faq.eyebrow}
          title={home.faq.title}
          items={home.faq.items}
          more={{ label: home.faq.more, href: "/faq" }}
        />
        <Channels eyebrow={home.channels.eyebrow} title={home.channels.title} items={channelItems} />
        <LocationBlock
          eyebrow={home.location.eyebrow}
          title={home.location.title}
          rows={locationRows}
          image={home.location.mapImage}
          ctas={mapLinks}
        />
        <FinalCta
          title={home.finalCta.title}
          lead={home.finalCta.lead}
          primary={home.finalCta.primary}
          booking={bookingLink}
          chat={chat}
          phone={phoneLink}
          contact={{ label: contactData.title, href: "/contact", external: false }}
          flowStem
        />
      </ScrollStem>
    </main>
  );
}
