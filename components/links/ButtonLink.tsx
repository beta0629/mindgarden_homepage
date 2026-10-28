import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { LinkItem } from "@/lib/types";

export function ButtonLink({
  link,
  variant = "primary",
  size = "md",
  children,
  className,
}: {
  link: LinkItem;
  variant?: "primary" | "outline" | "ghost" | "onDark" | "onDarkGhost";
  size?: "sm" | "md" | "lg";
  children?: ReactNode;
  className?: string;
}) {
  const anchor = link.external ? (
    <a href={link.href} target="_blank" rel="noopener noreferrer" />
  ) : (
    <Link href={link.href} />
  );

  return (
    <Button nativeButton={false} render={anchor} variant={variant} size={size} className={className}>
      {children ?? link.label}
    </Button>
  );
}
