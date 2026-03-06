"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNavItems, adminNavItems, isNavItemActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface AppNavProps {
  type: "dashboard" | "admin";
  mobile?: boolean;
}

export function AppNav({ type, mobile = false }: AppNavProps) {
  const pathname = usePathname();
  const items = type === "dashboard" ? dashboardNavItems : adminNavItems;

  return (
    <nav
      className={cn(
        mobile
          ? "grid grid-cols-5 gap-2 rounded-[1.35rem] border border-border/70 bg-background/90 p-2 shadow-lg backdrop-blur-xl"
          : "space-y-1.5"
      )}
    >
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = isNavItemActive(pathname, href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "group flex items-center gap-3 rounded-2xl text-sm transition-all duration-200",
              mobile
                ? "flex-col px-2 py-2.5 text-[11px]"
                : "px-3.5 py-3 font-medium",
              isActive
                ? "bg-primary text-primary-foreground shadow-[0_12px_28px_-18px_rgba(79,70,229,0.65)]"
                : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"
            )}
          >
            <Icon
              className={cn(
                mobile ? "size-4" : "size-4",
                !isActive && "opacity-80 group-hover:opacity-100"
              )}
            />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
