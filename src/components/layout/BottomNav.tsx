"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CandlestickChart,
  Telescope,
  Tag,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/trades", label: "Trades", icon: CandlestickChart },
  { href: "/discover", label: "Discover", icon: Telescope },
  { href: "/promo", label: "Promo", icon: Tag, badge: true },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/chart") ||
    pathname.startsWith("/profile/deposit") ||
    pathname.startsWith("/auth")
  ) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#1a2332] bg-[#0b121c]">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const active =
            pathname === href ||
            (href === "/profile" && pathname.startsWith("/profile") && !pathname.startsWith("/profile/deposit"));
          return (
            <Link
              key={href}
              href={href}
              prefetch
              className="relative flex flex-col items-center gap-0.5 px-3 py-1"
            >
              <Icon
                size={22}
                className={cn(
                  active ? "text-[#26a69a]" : "text-[#5a6a7e]"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  active ? "text-[#26a69a]" : "text-[#5a6a7e]"
                )}
              >
                {label}
              </span>
              {badge && (
                <span className="absolute right-2 top-0 h-2 w-2 rounded-full bg-red-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
