import { Download, FileText } from "lucide-react";
import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import PageHeader, { PageContainer } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { StatusPengaduan } from "@/generated/prisma/enums";
import { hariIni, tahunIni } from "@/lib/dates";
import { formatTanggalSingkat } from "@/lib/format";
import { STATUS_LABEL, STATUS_PENGADUAN } from "@/lib/helpdesk";
import { FilterLaporan, PrintButton } from "./filter-laporan";
import { ambilPengaduan, judul, parseFilter, tahunTersedia } from "./laporan";

export const metadata: Metadata = { title: "Laporan" };

export default async function LaporanPage({ searchParams }: PageProps<"/admin/laporan">) {
  const query = await searchParams;
  const { jenis, filter, errors } = parseFilter(query);
  const [pengaduan, tahun] = await Promise.all([filter ? ambilPengaduan(filter) : null, tahunTersedia()]);

  const ringkasan = Object.fromEntries(STATUS_PENGADUAN.map((s) => [s, 0])) as Record<StatusPengaduan, number>;
  for (const item of pengaduan ?? []) {
    ringkasan[item.status]++;
  }

  const hari = hariIni();
  const tahunSekarang = String(tahunIni());
  const nilai = (key: string, fallback: string) => {
    const value = query[key];

    return (Array.isArray(value) ? value[0] : value) || fallback;
  };

  const exportQuery = new URLSearchParams(
    Object.entries(query).flatMap(([key, value]) => (typeof value === "string" ? [[key, value]] : [])),
  ).toString();

  return (
    <PageContainer breadcrumbs={[{ title: "Laporan" }]}>
      <PageHeader
        title="Laporan Pengaduan"
        description="Rekap pengaduan kerusakan barang dan permasalahan TI berdasarkan periode."
      />

      <FilterLaporan
        jenis={jenis}
        errors={errors}
        tahunTersedia={tahun}
        awal={{
          dari: nilai("dari", hari),
          sampai: nilai("sampai", hari),
          bulan: nilai("bulan", String(Number(hari.slice(5, 7)))),
          tahun: nilai("tahun", tahunSekarang),
          dari_tahun: nilai("dari_tahun", tahunSekarang),
          sampai_tahun: nilai("sampai_tahun", tahunSekarang),
        }}
      />

      {filter && pengaduan && (
        <Card className="print:border-0 print:shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">Laporan Pengaduan Kerusakan Barang</CardTitle>
            <CardDescription>
              Periode {judul(filter)} · {pengaduan.length} laporan ·{" "}
              {STATUS_PENGADUAN.map((s) => `${ringkasan[s]} ${STATUS_LABEL[s].toLowerCase()}`).join(", ")}
            </CardDescription>
            <CardAction className="flex gap-2" data-print="hide">
              <PrintButton disabled={pengaduan.length === 0} />
              {pengaduan.length === 0 ? (
                <Button variant="outline" size="sm" disabled>
                  <Download />
                  Export CSV
                </Button>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <a href={`/admin/laporan/export?${exportQuery}`}>
                    <Download />
                    Export CSV
                  </a>
                </Button>
              )}
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            {pengaduan.length === 0 ? (
              <EmptyState icon={FileText} bare>
                Tidak ada pengaduan pada periode ini. Coba ubah periode di filter laporan.
              </EmptyState>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">No.</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Pelapor</TableHead>
                  <TableHead>Unit kerja</TableHead>
                  <TableHead>Kendala</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6">Catatan petugas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pengaduan.map((item) => (
                  <TableRow key={item.id} className="align-top">
                    <TableCell className="pl-6 font-mono text-xs">{item.nomor}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatTanggalSingkat(item.tanggalLapor)}</TableCell>
                    <TableCell>
                      <div className="font-medium">{item.namaPelapor}</div>
                      <div className="text-xs text-muted-foreground">{item.jabatan}</div>
                    </TableCell>
                    <TableCell className="whitespace-normal">{item.divisi?.nama ?? "-"}</TableCell>
                    <TableCell className="min-w-48 whitespace-normal">
                      <div className="font-medium">{item.kendala}</div>
                      <div className="text-xs text-muted-foreground">{item.keterangan}</div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="min-w-48 pr-6 whitespace-pre-line">{item.catatanPetugas || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
