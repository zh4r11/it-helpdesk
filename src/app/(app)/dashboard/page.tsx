import { ArrowRight, CircleCheck, Clock, Cpu, Inbox, Loader, Monitor, UserCog, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CountUp } from "@/components/count-up";
import { PageContainer } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { tahunIni, toDbDate } from "@/lib/dates";
import { formatTanggalSingkat } from "@/lib/format";
import { STATUS_PENGADUAN } from "@/lib/helpdesk";
import { prisma } from "@/lib/prisma";
import { GrafikPengaduan, type BarisGrafik } from "./grafik";

export const metadata: Metadata = { title: "Dashboard" };

const namaBulan = new Intl.DateTimeFormat("id-ID", { month: "short", timeZone: "UTC" });

export default async function DashboardPage() {
  const tahun = tahunIni();

  const [perStatus, perTanggal, komputer, karyawan, komponen, akunPending, terbaru] = await Promise.all([
    prisma.pengaduan.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.pengaduan.groupBy({
      by: ["tanggalLapor", "status"],
      where: { tanggalLapor: { gte: toDbDate(`${tahun}-01-01`), lte: toDbDate(`${tahun}-12-31`) } },
      _count: { _all: true },
    }),
    prisma.komputer.count({ where: { deletedAt: null } }),
    prisma.karyawan.count({ where: { aktif: true } }),
    prisma.komponen.count({ where: { aktif: true } }),
    prisma.user.count({ where: { isActive: false } }),
    prisma.pengaduan.findMany({
      orderBy: { id: "desc" },
      take: 6,
      select: { id: true, nomor: true, namaPelapor: true, kendala: true, status: true, tanggalLapor: true },
    }),
  ]);

  const stats = Object.fromEntries(STATUS_PENGADUAN.map((s) => [s, 0])) as Record<(typeof STATUS_PENGADUAN)[number], number>;
  for (const row of perStatus) {
    stats[row.status] = row._count._all;
  }

  const grafik: BarisGrafik[] = Array.from({ length: 12 }, (_, index) => ({
    bulan: namaBulan.format(new Date(Date.UTC(tahun, index, 1))),
    diajukan: 0,
    diproses: 0,
    selesai: 0,
  }));
  for (const row of perTanggal) {
    grafik[row.tanggalLapor.getUTCMonth()][row.status] += row._count._all;
  }

  const total = stats.diajukan + stats.diproses + stats.selesai;

  return (
    <PageContainer breadcrumbs={[{ title: "Dashboard" }]}>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Ringkasan pengaduan dan inventaris perangkat TI.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total pengaduan" value={total} icon={Inbox} description="Seluruh laporan yang masuk" />
        <StatCard
          title="Belum diproses"
          value={stats.diajukan}
          icon={Clock}
          tone="amber"
          href="/admin/pengaduan?status=diajukan"
        />
        <StatCard
          title="Sedang diproses"
          value={stats.diproses}
          icon={Loader}
          tone="blue"
          href="/admin/pengaduan?status=diproses"
        />
        <StatCard
          title="Selesai"
          value={stats.selesai}
          icon={CircleCheck}
          tone="emerald"
          href="/admin/pengaduan?status=selesai"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Pengaduan per bulan</CardTitle>
            <CardDescription>Jumlah laporan tahun {tahun} berdasarkan status</CardDescription>
          </CardHeader>
          <CardContent>
            <GrafikPengaduan data={grafik} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Pengaduan terbaru</CardTitle>
            <CardDescription>Enam laporan terakhir yang masuk</CardDescription>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/pengaduan">
                  Semua
                  <ArrowRight />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {terbaru.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Belum ada pengaduan.</p>
            ) : (
              <ul className="divide-y">
                {terbaru.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/admin/pengaduan/${item.id}`}
                      className="-mx-2 flex items-center gap-3 rounded-md px-2 py-3 hover:bg-muted/60"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.kendala}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          <span className="font-mono">{item.nomor}</span> · {item.namaPelapor} ·{" "}
                          {formatTanggalSingkat(item.tanggalLapor)}
                        </p>
                      </div>
                      <StatusBadge status={item.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Data PC" value={komputer} icon={Monitor} href="/admin/komputer" />
        <StatCard title="Komponen aktif" value={komponen} icon={Cpu} href="/admin/komponen" />
        <StatCard title="Karyawan aktif" value={karyawan} icon={Users} href="/admin/karyawan" />
        <StatCard
          title="Akun menunggu aktivasi"
          value={akunPending}
          icon={UserCog}
          tone={akunPending > 0 ? "amber" : undefined}
          href="/admin/users"
        />
      </div>
    </PageContainer>
  );
}

const TONE = {
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  default: "bg-muted text-foreground",
};

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  tone,
  href,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  tone?: keyof typeof TONE;
  href?: string;
}) {
  const content = (
    <Card className="h-full gap-2 transition-colors group-hover:border-primary/40">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">
          <CountUp value={value} />
        </CardTitle>
        <CardAction>
          <span className={`flex size-9 items-center justify-center rounded-lg ${TONE[tone ?? "default"]}`}>
            <Icon className="size-4" />
          </span>
        </CardAction>
      </CardHeader>
      {description && <CardContent className="text-xs text-muted-foreground">{description}</CardContent>}
    </Card>
  );

  return href ? (
    <Link href={href} className="group">
      {content}
    </Link>
  ) : (
    content
  );
}
