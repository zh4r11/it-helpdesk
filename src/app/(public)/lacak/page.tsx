import { CircleCheck, Clock, FileQuestion, Loader } from "lucide-react";
import type { Metadata } from "next";
import LacakForm from "@/components/lacak-form";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { StatusPengaduan } from "@/generated/prisma/enums";
import { formatTanggal, formatWaktu } from "@/lib/format";
import { param } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Cek Status Laporan" };

const TAHAP: { status: StatusPengaduan; label: string; icon: typeof Clock }[] = [
  { status: "diajukan", label: "Diajukan", icon: Clock },
  { status: "diproses", label: "Diproses", icon: Loader },
  { status: "selesai", label: "Selesai", icon: CircleCheck },
];

export default async function LacakPage({ searchParams }: PageProps<"/lacak">) {
  const nomor = param((await searchParams).nomor).toUpperCase();

  const pengaduan = nomor
    ? await prisma.pengaduan.findUnique({
        where: { nomor },
        // Hanya data yang pantas dilihat publik.
        select: {
          nomor: true,
          namaPelapor: true,
          jabatan: true,
          kendala: true,
          keterangan: true,
          status: true,
          catatanPetugas: true,
          tanggalLapor: true,
          updatedAt: true,
          divisi: { select: { nama: true } },
        },
      })
    : null;

  const tahapAktif = pengaduan ? TAHAP.findIndex((t) => t.status === pengaduan.status) : -1;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 md:py-14">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Cek Status Laporan</h1>
        <p className="text-muted-foreground">Masukkan nomor laporan untuk melihat progres penanganan.</p>
      </div>

      <LacakForm key={nomor} defaultValue={nomor} className="mb-6" />

      {nomor && !pengaduan && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <FileQuestion className="size-10 text-muted-foreground" />
            <p className="font-medium">Laporan {nomor} tidak ditemukan</p>
            <p className="text-sm text-muted-foreground">Periksa kembali nomor laporan Anda.</p>
          </CardContent>
        </Card>
      )}

      {pengaduan && (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="space-y-1">
              <CardDescription>Nomor laporan</CardDescription>
              <CardTitle className="font-mono text-xl">{pengaduan.nomor}</CardTitle>
            </div>
            <StatusBadge status={pengaduan.status} />
          </CardHeader>
          <CardContent className="space-y-6">
            <ol className="grid grid-cols-3 gap-2">
              {TAHAP.map((tahap, index) => {
                const selesai = index <= tahapAktif;

                return (
                  <li key={tahap.status} className="flex flex-col items-center gap-2 text-center">
                    <div className="flex w-full items-center">
                      <span
                        className={cn(
                          "h-0.5 flex-1",
                          index === 0 ? "bg-transparent" : selesai ? "bg-primary" : "bg-border",
                        )}
                      />
                      <span
                        className={cn(
                          "flex size-9 items-center justify-center rounded-full border-2",
                          selesai
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        <tahap.icon className="size-4" />
                      </span>
                      <span
                        className={cn(
                          "h-0.5 flex-1",
                          index === TAHAP.length - 1 ? "bg-transparent" : index < tahapAktif ? "bg-primary" : "bg-border",
                        )}
                      />
                    </div>
                    <span className={cn("text-xs font-medium", !selesai && "text-muted-foreground")}>{tahap.label}</span>
                  </li>
                );
              })}
            </ol>

            <Separator />

            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <Detail label="Tanggal lapor" value={formatTanggal(pengaduan.tanggalLapor)} />
              <Detail label="Nama pelapor" value={pengaduan.namaPelapor} />
              <Detail label="Jabatan" value={pengaduan.jabatan} />
              <Detail label="Unit kerja" value={pengaduan.divisi?.nama ?? "-"} />
              <Detail label="Kendala" value={pengaduan.kendala} className="sm:col-span-2" />
              <Detail label="Keterangan" value={pengaduan.keterangan} className="sm:col-span-2" />
            </dl>

            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="mb-1 text-sm font-medium">Catatan dari IT Helpdesk</p>
              <p className="text-sm whitespace-pre-line text-muted-foreground">
                {pengaduan.catatanPetugas || "Belum ada catatan dari petugas."}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Terakhir diperbarui {formatWaktu(pengaduan.updatedAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Detail({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("space-y-1", className)}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium whitespace-pre-line">{value}</dd>
    </div>
  );
}
