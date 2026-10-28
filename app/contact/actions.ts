"use server";

import { headers } from "next/headers";
import { z } from "zod";
import contactData from "@/content/data/contact.json";
import pricingData from "@/content/data/pricing.json";
import { env } from "@/config/env";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "phone" | "consent" | "message", string>>;
};

const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < 10 * 60 * 1000);
  if (recent.length >= 5) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function schema() {
  const programNames = pricingData.menu.map((item) => item.name);
  const times = contactData.fields.find((field) => field.name === "preferredTime");
  const timeOptions = times && "options" in times && times.options ? times.options : [];
  return z.object({
    name: z.string().trim().min(1, contactData.validation.name).max(80, contactData.validation.name),
    phone: z.string().trim().min(1, contactData.validation.phone).max(30, contactData.validation.phone),
    program: z.string().refine((value) => value === "" || programNames.includes(value), contactData.error),
    preferredTime: z.string().refine((value) => value === "" || timeOptions.includes(value), contactData.error),
    message: z.string().max(2000, contactData.validation.messageMax),
    consent: z.literal(true, contactData.consent.errorRequired),
    company: z.string(),
  });
}

export async function submitContact(_state: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = schema().safeParse({
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    program: String(formData.get("program") ?? ""),
    preferredTime: String(formData.get("preferredTime") ?? ""),
    message: String(formData.get("message") ?? ""),
    consent: formData.get("consent") === "yes",
    company: String(formData.get("company") ?? ""),
  });

  if (!parsed.success) {
    const fieldErrors: ContactState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key === "name" || key === "phone" || key === "consent" || key === "message") {
        fieldErrors[key] = issue.message;
      }
    }
    return { status: "error", fieldErrors };
  }

  if (parsed.data.company) {
    return { status: "success", message: contactData.success };
  }

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) {
    return { status: "error", message: contactData.error };
  }

  if (!env.CONTACT_ENDPOINT) {
    return { status: "error", message: contactData.error };
  }

  try {
    const response = await fetch(env.CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        name: parsed.data.name,
        phone: parsed.data.phone,
        program: parsed.data.program,
        preferredTime: parsed.data.preferredTime,
        message: parsed.data.message,
        consent: true,
        submittedAt: new Date().toISOString(),
      }),
      cache: "no-store",
    });
    if (!response.ok) return { status: "error", message: contactData.error };
    return { status: "success", message: contactData.success };
  } catch {
    return { status: "error", message: contactData.error };
  }
}
