import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LinkItem } from "@/lib/types";

export function SiteLink({
  link,
  className,
  children,
}: {
  link: LinkItem;
  className?: string;
  children?: ReactNode;
}) {
  const classes = cn(className);
  if (link.external) {
    return (
      <a href={link.href} className={classes} target="_blank" rel="noopener noreferrer">
        {children ?? link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} className={classes}>
      {children ?? link.label}
    </Link>
  );
}
