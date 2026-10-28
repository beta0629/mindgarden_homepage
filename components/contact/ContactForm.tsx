"use client";

import { useActionState, useState } from "react";
import { submitContact, type ContactState } from "@/app/contact/actions";
import { SiteLink } from "@/components/links/SiteLink";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { LinkItem } from "@/lib/types";

type FieldCopy = {
  name: string;
  label: string;
  type: string;
  required: boolean;
  autocomplete?: string;
  placeholder?: string;
  help?: string;
  emptyLabel?: string;
  options?: string[];
};

export function ContactForm({
  fields,
  consent,
  honeypot,
  submitLabel,
  policy,
  phone,
}: {
  fields: FieldCopy[];
  consent: {
    label: string;
    summary: { k: string; v: string }[];
    errorRequired: string;
    policyLabel: string;
  };
  honeypot: string;
  submitLabel: string;
  policy: LinkItem;
  phone: LinkItem;
}) {
  const [state, action, pending] = useActionState(submitContact, { status: "idle" } satisfies ContactState);
  const [values, setValues] = useState<Record<string, string>>({});
  const [consentChecked, setConsentChecked] = useState(false);

  if (state.status === "success") {
    return (
      <div className="flex flex-col gap-4 rounded-xl bg-sand p-8" role="status">
        <p className="type-h3 text-ink">{state.message}</p>
        <SiteLink link={phone} className="type-sm font-semibold text-brand hover:underline" />
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-8" noValidate>
      <FieldGroup>
        {fields.map((field) => {
          const error =
            field.name === "name" || field.name === "phone" || field.name === "message"
              ? state.fieldErrors?.[field.name]
              : undefined;
          const invalid = Boolean(error);
          return (
            <Field key={field.name} data-invalid={invalid || undefined}>
              <FieldLabel htmlFor={field.name}>{field.label}</FieldLabel>
              {field.type === "textarea" ? (
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={values[field.name] ?? ""}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                  aria-invalid={invalid}
                  className="min-h-32 rounded-lg bg-surface px-4 py-3 type-sm"
                />
              ) : field.type === "select" ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={values[field.name] ?? ""}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                  className="h-control w-full rounded-lg border border-line bg-surface px-4 type-sm text-ink"
                >
                  <option value="">{field.emptyLabel}</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  required={field.required}
                  autoComplete={field.autocomplete}
                  placeholder={field.placeholder}
                  value={values[field.name] ?? ""}
                  onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                  aria-invalid={invalid}
                  className="h-control rounded-lg bg-surface px-4 type-sm"
                />
              )}
              {field.help ? <FieldDescription>{field.help}</FieldDescription> : null}
              {error ? <FieldError>{error}</FieldError> : null}
            </Field>
          );
        })}
      </FieldGroup>

      <div className="hp" aria-hidden="true">
        <label>
          {honeypot}
          <input name={honeypot} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <section className="flex flex-col gap-4 rounded-xl bg-sand p-6">
        <dl className="grid gap-3">
          {consent.summary.map((row) => (
            <div key={row.k} className="consent-row">
              <dt className="type-sm font-semibold text-ink">{row.k}</dt>
              <dd className="type-sm text-ink-2">{row.v}</dd>
            </div>
          ))}
        </dl>
        <SiteLink link={policy} className="type-sm font-semibold text-brand hover:underline">
          {consent.policyLabel}
        </SiteLink>
        <Field data-invalid={Boolean(state.fieldErrors?.consent) || undefined}>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="consent"
              value="yes"
              required
              checked={consentChecked}
              onChange={(event) => setConsentChecked(event.target.checked)}
              className="consent-box"
            />
            <span className="type-sm text-ink">{consent.label}</span>
          </label>
          {state.fieldErrors?.consent ? <FieldError>{state.fieldErrors.consent}</FieldError> : null}
        </Field>
      </section>

      {state.status === "error" && state.message ? (
        <p className="type-sm text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending} className="self-start">
        {submitLabel}
      </Button>
    </form>
  );
}
