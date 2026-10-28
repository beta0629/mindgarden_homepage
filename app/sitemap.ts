import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/env";
import { routes } from "@/content/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    priority: route.priority,
  }));
}
