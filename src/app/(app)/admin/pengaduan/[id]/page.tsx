import { ArrowLeft, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, type ReactNode } from "react";
import ConfirmDelete from "@/components/confirm-delete";
import PageHeader, { PageContainer } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTanggal, formatWaktu } from "@/lib/format";
import { STATUS_LABEL, STATUS_PENGADUAN } from "@/lib/helpdesk";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { hapusPengaduan } from "../actions";
import { TindakLanjutForm } from "./tindak-lanjut-form";

const getPengaduan = cache(async (id: string) => {
  const pengaduanId = Number(id);

  if (!Number.isInteger(pengaduanId)) {
    notFound();
  }

  const pengaduan = await prisma.pengaduan.findUnique({
    where: { id: pengaduanId },
    include: { divisi: { select: { nama: true } }, petugas: { select: { name: true } } },
  });

  if (!pengaduan) {
    notFound();
  }

  return pengaduan;
});

export async function generateMetadata({ params }: PageProps<"/admin/pengaduan/[id]">): Promise<Metadata> {
  const pengaduan = await getPengaduan((await params).id);

  return { title: `Pengaduan ${pengaduan.nomor}` };
}

export default async function PengaduanShowPage({ params }: PageProps<"/admin/pengaduan/[id]">) {
  const pengaduan = await getPengaduan((await params).id);

  return (
    <PageContainer breadcrumbs={[{ title: "Pengaduan", href: "/admin/pengaduan" }, { title: "Detail" }]}>
      <PageHeader
        title={`Pengaduan ${pengaduan.nomor}`}
        description={`Dilaporkan pada ${formatTanggal(pengaduan.tanggalLapor)}`}
      >
        <Button asChild variant="outline">
          <Link href={`/admin/pengaduan?status=${pengaduan.status}`}>
            <ArrowLeft />
            Kembali
          </Link>
        </Button>
        <ConfirmDelete action={hapusPengaduan.bind(null, pengaduan.id, true)} title={`Hapus pengaduan ${pengaduan.nomor}?`}>
          <Button variant="outline" className="text-destructive">
            <Trash2 />
            Hapus
          </Button>
        </ConfirmDelete>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Detail laporan</CardTitle>
            <CardDescription>Informasi yang dikirim oleh pelapor</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-6 gap-y-5 text-sm sm:grid-cols-2">
              <Detail label="Nomor laporan">
                <span className="font-mono">{pengaduan.nomor}</span>
              </Detail>
              <Detail label="Status saat ini">
                <StatusBadge status={pengaduan.status} />
              </Detail>
              <Detail label="Nama pelapor">{pengaduan.namaPelapor}</Detail>
              <Detail label="Jabatan">{pengaduan.jabatan}</Detail>
              <Detail label="Unit kerja">{pengaduan.divisi?.nama ?? "-"}</Detail>
              <Detail label="Tanggal lapor">{formatTanggal(pengaduan.tanggalLapor)}</Detail>
              <Detail label="Kendala" className="sm:col-span-2">
                {pengaduan.kendala}
              </Detail>
              <Detail label="Keterangan" className="sm:col-span-2">
                <p className="rounded-md border bg-muted/40 p-3 whitespace-pre-line">{pengaduan.keterangan}</p>
              </Detail>
              {pengaduan.petugas && <Detail label="Ditangani oleh">{pengaduan.petugas.name}</Detail>}
              {pengaduan.selesaiAt && <Detail label="Selesai pada">{formatWaktu(pengaduan.selesaiAt)}</Detail>}
            </dl>
          </CardContent>
        </Card>

        <TindakLanjutForm
          key={pengaduan.updatedAt.toISOString()}
          id={pengaduan.id}
          status={pengaduan.status}
          catatanPetugas={pengaduan.catatanPetugas ?? ""}
          statusOptions={STATUS_PENGADUAN.map((value) => ({ value, label: STATUS_LABEL[value] }))}
        />
      </div>
    </PageContainer>
  );
}

function Detail({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  );
}
