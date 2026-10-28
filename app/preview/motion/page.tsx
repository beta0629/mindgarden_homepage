import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { seo } from "@/content/seo";
import { MotionStudy } from "./study";

export const metadata: Metadata = {
  ...pageMetadata("/preview/motion", seo.homeTitle, seo.homeDescription),
  title: { absolute: seo.homeTitle },
  robots: { index: false, follow: false },
};

export default function MotionPreviewPage() {
  return <MotionStudy />;
}
