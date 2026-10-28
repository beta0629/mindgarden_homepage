"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SiteLink } from "@/components/links/SiteLink";
import { ButtonLink } from "@/components/links/ButtonLink";
import type { LinkItem } from "@/lib/types";

export function MobileNav({
  items,
  phone,
  booking,
  openLabel,
  closeLabel,
  title,
}: {
  items: { label: string; href: string }[];
  phone: LinkItem;
  booking: LinkItem;
  openLabel: string;
  closeLabel: string;
  title: string;
}) {
  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="outline" size="icon" aria-label={openLabel} className="lg:hidden" />}
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="right" closeLabel={closeLabel} className="bg-paper">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 px-4">
          {items.map((item) => (
            <SiteLink
              key={item.href}
              link={{ ...item, external: false }}
              className="type-h3 py-2 text-ink"
            />
          ))}
        </nav>
        <div className="mt-6 flex flex-col gap-3 px-4">
          <ButtonLink link={booking} size="lg" />
          <ButtonLink link={phone} variant="ghost" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
