import Image from "next/image";
import Link from "next/link";

export function Logo({
  src,
  alt,
  title,
  subtitle,
  homeLabel,
}: {
  src: string;
  alt: string;
  title: string;
  subtitle: string;
  homeLabel: string;
}) {
  return (
    <Link href="/" aria-label={homeLabel} className="inline-flex items-center gap-3">
      <Image src={src} alt={alt} width={602} height={463} className="logo-mark" />
      <span className="flex flex-col">
        <span className="type-sm font-semibold tracking-tight text-ink">{title}</span>
        <span className="type-xs text-ink-3">{subtitle}</span>
      </span>
    </Link>
  );
}
