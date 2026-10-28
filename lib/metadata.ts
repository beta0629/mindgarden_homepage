import type { Metadata } from "next";
import { env, siteUrl } from "@/config/env";
import { seo } from "@/content/seo";

export function pageMetadata(path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      locale: seo.locale,
      type: "website",
      images: [{ url: seo.image.src, alt: seo.image.alt }],
    },
  };
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: seo.homeTitle,
    template: seo.titleTemplate,
  },
  description: seo.homeDescription,
  openGraph: {
    title: seo.homeTitle,
    description: seo.homeDescription,
    locale: seo.locale,
    type: "website",
    images: [{ url: seo.image.src, alt: seo.image.alt }],
  },
  verification: env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION
    ? { other: { "naver-site-verification": env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION } }
    : undefined,
};
