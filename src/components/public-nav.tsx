"use client";

import { Search, Send } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { title: "Ajukan Laporan", href: "/pengaduan", icon: Send },
  { title: "Cek Status", href: "/lacak", icon: Search },
];

export function PublicNav() {
  const pathname = usePathname();

  return NAV.map((item) => (
    <Button
      key={item.title}
      asChild
      variant="ghost"
      size="sm"
      className={cn("pointer-coarse:min-w-11", pathname === item.href && "bg-accent text-accent-foreground")}
    >
      <Link href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
        <item.icon />
        <span className="sr-only sm:not-sr-only">{item.title}</span>
      </Link>
    </Button>
  ));
}
