import { ProgramGrid } from "@/components/sections/ProgramGrid";
import { bookingLink } from "@/config/site";
import { programs, programsPage } from "@/content/programs";
import { seo } from "@/content/seo";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("/programs", seo.pages.programs.title, seo.pages.programs.description);

export default function ProgramsPage() {
  return (
    <main>
      <ProgramGrid
        eyebrow={programsPage.eyebrow}
        title={programsPage.title}
        lead={programsPage.lead}
        heading="h1"
        items={programs}
        booking={bookingLink}
        bookingLabel={programsPage.bookingLabel}
      />
    </main>
  );
}
