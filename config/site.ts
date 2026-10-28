import siteData from "@/content/data/site.json";
import type { LinkItem } from "@/lib/types";

export const site = siteData;

function toLink(label: string, href: string | null): LinkItem | null {
  if (!href) return null;
  return {
    label,
    href,
    external: href.startsWith("http"),
  };
}

const contactLinks = {
  phoneMain: toLink(site.contact.phoneMain.label, site.contact.phoneMain.href),
  phoneMobile: toLink(site.contact.phoneMobile.label, site.contact.phoneMobile.href),
  email: toLink(site.contact.email.label, site.contact.email.href),
};

export function resolveLink(key: string): LinkItem | null {
  if (key in contactLinks) {
    return contactLinks[key as keyof typeof contactLinks];
  }
  const entry = site.links[key as keyof typeof site.links];
  if (!entry || !("href" in entry)) return null;
  return toLink(entry.label, entry.href);
}

export function requireLink(key: string): LinkItem {
  const link = resolveLink(key);
  if (!link) {
    throw new Error(`Missing link: ${key}`);
  }
  return link;
}

export const footerContacts = site.contact.footerOrder
  .map((key) => resolveLink(key))
  .filter((link): link is LinkItem => link !== null);

export const footerChannels = site.footerLinks
  .map((key) => resolveLink(key))
  .filter((link): link is LinkItem => link !== null);

export const bookingLink = requireLink("booking");
export const privacyLink = requireLink("privacy");
export const phoneLink = requireLink("phoneMain");
export const talkLink = requireLink("talktalk");

export const mapEmbedSrc = site.geo.embed.pattern
  .replaceAll("{lat}", String(site.geo.lat))
  .replaceAll("{lng}", String(site.geo.lng));
