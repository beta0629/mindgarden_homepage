import { Container } from "@/components/layout/Container";
import { SiteLink } from "@/components/links/SiteLink";
import ui from "@/content/data/ui.json";

export default function NotFound() {
  return (
    <main className="py-section">
      <Container className="flex max-w-xl flex-col gap-6">
        <h1 className="type-h1 text-ink">{ui.notFoundTitle}</h1>
        <p className="type-lead">{ui.notFoundLead}</p>
        <SiteLink link={{ label: ui.backHome, href: "/", external: false }} className="type-sm font-semibold text-brand hover:underline" />
      </Container>
    </main>
  );
}
