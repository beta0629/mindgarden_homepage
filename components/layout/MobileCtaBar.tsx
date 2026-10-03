import { Calendar, MessageCircle, Phone } from "lucide-react";
import { SiteLink } from "@/components/links/SiteLink";
import type { LinkItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const icons = {
  phone: Phone,
  chat: MessageCircle,
  calendar: Calendar,
};

export function MobileCtaBar({
  items,
}: {
  items: { icon: string; label: string; link: LinkItem; primary?: boolean }[];
}) {
  return (
    <div className="mobile-cta fixed inset-x-0 bottom-0 z-bar border-t border-line bg-paper sm:hidden">
      <div className="grid grid-cols-3 gap-2 px-3 py-2">
        {items.map((item) => {
          const Icon = icons[item.icon as keyof typeof icons] ?? Phone;
          return (
            <SiteLink
              key={item.label}
              link={item.link}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-full px-2 py-3 type-xs font-semibold",
                item.primary ? "bg-fill text-surface" : "border border-line bg-surface text-ink",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {item.label}
            </SiteLink>
          );
        })}
      </div>
    </div>
  );
}
