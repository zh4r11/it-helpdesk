import { CircleCheck, Clock, Loader } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { StatusPengaduan } from "@/generated/prisma/enums";
import { STATUS_LABEL } from "@/lib/helpdesk";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<StatusPengaduan, string> = {
  diajukan:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  diproses: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
  selesai:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
};

const STATUS_ICON = {
  diajukan: Clock,
  diproses: Loader,
  selesai: CircleCheck,
} as const;

export function StatusBadge({ status, className }: { status: StatusPengaduan; className?: string }) {
  const Icon = STATUS_ICON[status];

  return (
    <Badge variant="outline" className={cn(STATUS_STYLE[status], className)}>
      <Icon />
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export function AktifBadge({
  aktif,
  labelAktif = "Aktif",
  labelNonaktif = "Tidak aktif",
}: {
  aktif: boolean;
  labelAktif?: string;
  labelNonaktif?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={
        aktif
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
          : "text-muted-foreground"
      }
    >
      <span className={cn("size-1.5 rounded-full", aktif ? "bg-emerald-500" : "bg-muted-foreground/60")} />
      {aktif ? labelAktif : labelNonaktif}
    </Badge>
  );
}
