import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  lead,
  className,
  tone = "ink",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  className?: string;
  tone?: "ink" | "onDark";
}) {
  const latin = eyebrow ? /^[A-Za-z]/.test(eyebrow) : false;
  return (
    <div className={cn("flex max-w-3xl flex-col gap-5", className)}>
      {eyebrow ? <p className={latin ? "type-eyebrow-en" : "type-eyebrow"}>{eyebrow}</p> : null}
      <h2 className={cn("type-h2", tone === "onDark" ? "text-on-deep" : "text-ink")}>{title}</h2>
      {lead ? <p className={cn("type-lead", tone === "onDark" && "text-on-deep-2")}>{lead}</p> : null}
    </div>
  );
}

export function TextLines({ text }: { text: string }) {
  return text.split("\n").map((line, index) => (
    <span key={`${index}-${line.length}`} className="block">
      {line}
    </span>
  ));
}
