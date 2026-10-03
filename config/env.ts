import { z } from "zod";

const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().url().optional(),
);

const schema = z.object({
  CONTACT_ENDPOINT: optionalUrl,
  NEXT_PUBLIC_SITE_URL: optionalUrl,
  NEXT_PUBLIC_NAVER_SITE_VERIFICATION: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().min(1).optional(),
  ),
});

export const env = schema.parse({
  CONTACT_ENDPOINT: process.env.CONTACT_ENDPOINT,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_NAVER_SITE_VERIFICATION: process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION,
});

export const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
