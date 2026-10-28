import Script from "next/script";
import { pretendard } from "@/app/fonts";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileCtaBar } from "@/components/layout/MobileCtaBar";
import { JsonLd } from "@/components/seo/JsonLd";
import { bookingLink, footerChannels, footerContacts, phoneLink, privacyLink, resolveLink, site } from "@/config/site";
import contactData from "@/content/data/contact.json";
import { home } from "@/content/home";
import { localBusiness, seo } from "@/content/seo";
import ui from "@/content/data/ui.json";
import { rootMetadata } from "@/lib/metadata";
import "./globals.css";

export const metadata = rootMetadata;

export default function RootLayout({ children }: LayoutProps<"/">) {
  const mobileItems = home.mobileBar.flatMap((item) => {
    const link = resolveLink(item.linkKey);
    if (!link) return [];
    return [{ icon: item.icon, label: item.label, link, primary: "primary" in item ? item.primary : undefined }];
  });
  const footerPages = [
    ...site.nav.map((item) => ({ label: item.label, href: item.href, external: false })),
    { label: seo.pages.faq.title, href: "/faq", external: false },
    { label: contactData.title, href: "/contact", external: false },
  ];

  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="has-mobile-bar min-h-dvh bg-paper text-ink antialiased">
        <Script src="/js/motion-init.js" strategy="beforeInteractive" />
        <JsonLd data={localBusiness} />
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-header focus:bg-surface focus:px-4 focus:py-2">
          {ui.skip}
        </a>
        <Header
          logo={{ src: site.logo.symbol, alt: site.logo.alt }}
          wordmark={site.wordmark}
          homeLabel={ui.home}
          nav={site.nav}
          phone={phoneLink}
          booking={bookingLink}
          bookingLabel={home.hero.primaryCta}
          openLabel={ui.openMenu}
          closeLabel={ui.closeMenu}
          menuTitle={ui.menuTitle}
        />
        <div id="main">{children}</div>
        <Footer
          logo={{ src: site.logo.symbol, alt: site.logo.alt }}
          wordmark={site.wordmark}
          homeLabel={ui.home}
          tagline={site.tagline}
          menuTitle={ui.menuTitle}
          pages={footerPages}
          contacts={footerContacts}
          channels={footerChannels}
          hours={site.hours.items}
          addressLines={[site.address.line1, site.address.line2]}
          business={site.business.items}
          privacy={privacyLink}
          copyright={site.copyright}
        />
        <MobileCtaBar items={mobileItems} />
      </body>
    </html>
  );
}
