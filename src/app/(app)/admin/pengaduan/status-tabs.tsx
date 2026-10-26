"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { StatusPengaduan } from "@/generated/prisma/enums";
import { STATUS_LABEL, STATUS_PENGADUAN } from "@/lib/helpdesk";

const LABEL_PENDEK: Record<StatusPengaduan, string> = {
  diajukan: "Diajukan",
  diproses: "Diproses",
  selesai: "Selesai",
};

export function StatusTabs({
  status,
  counts,
  cari,
}: {
  status: StatusPengaduan;
  counts: Partial<Record<StatusPengaduan, number>>;
  cari: string;
}) {
  const router = useRouter();

  return (
    <Tabs
      value={status}
      onValueChange={(value) => {
        const params = new URLSearchParams({ status: value });

        if (cari) {
          params.set("cari", cari);
        }

        router.push(`/admin/pengaduan?${params}`, { scroll: false });
      }}
    >
      <TabsList className="w-full @3xl:w-fit">
        {STATUS_PENGADUAN.map((item) => (
          <TabsTrigger key={item} value={item} className="gap-2">
            {/* Label penuh butuh sekitar 460 px; di area sempit pakai label pendek. */}
            <span className="@lg:hidden">{LABEL_PENDEK[item]}</span>
            <span className="hidden @lg:inline">{STATUS_LABEL[item]}</span>
            <Badge variant="secondary" className="h-5 min-w-5 rounded-full px-1.5 tabular-nums">
              {counts[item] ?? 0}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
