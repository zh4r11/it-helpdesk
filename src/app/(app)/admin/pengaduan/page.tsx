import { Eye, Inbox, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import ConfirmDelete from "@/components/confirm-delete";
import { EmptyState } from "@/components/empty-state";
import PageHeader, { PageContainer } from "@/components/page-header";
import Pagination from "@/components/pagination";
import SearchInput from "@/components/search-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Prisma } from "@/generated/prisma/client";
import type { StatusPengaduan } from "@/generated/prisma/enums";
import { formatTanggalSingkat } from "@/lib/format";
import { STATUS_LABEL, STATUS_PENGADUAN } from "@/lib/helpdesk";
import { paginate, param, parsePage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { hapusPengaduan } from "./actions";
import { StatusTabs } from "./status-tabs";

export const metadata: Metadata = { title: "Data Pengaduan" };

function pesanKosong(status: StatusPengaduan, cari: string): string {
  if (cari) {
    return `Tidak ada pengaduan ${STATUS_LABEL[status].toLowerCase()} yang cocok dengan "${cari}".`;
  }

  return status === "diajukan"
    ? "Tidak ada pengaduan yang menunggu. Laporan baru dari form publik akan muncul di sini."
    : `Belum ada pengaduan ${STATUS_LABEL[status].toLowerCase()}. Ubah status lewat halaman detail pengaduan.`;
}

export default async function PengaduanIndexPage({ searchParams }: PageProps<"/admin/pengaduan">) {
  const query = await searchParams;
  const statusParam = param(query.status);
  const status: StatusPengaduan = (STATUS_PENGADUAN as readonly string[]).includes(statusParam)
    ? (statusParam as StatusPengaduan)
    : "diajukan";
  const cari = param(query.cari);

  const where: Prisma.PengaduanWhereInput = {
    status,
    ...(cari && {
      OR: [
        { nomor: { contains: cari, mode: "insensitive" } },
        { namaPelapor: { contains: cari, mode: "insensitive" } },
        { kendala: { contains: cari, mode: "insensitive" } },
      ],
    }),
  };

  const [total, perStatus] = await Promise.all([
    prisma.pengaduan.count({ where }),
    prisma.pengaduan.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const page = paginate(parsePage(query.page), total);
  const pengaduan = await prisma.pengaduan.findMany({
    where,
    include: { divisi: { select: { nama: true } } },
    orderBy: [{ tanggalLapor: "desc" }, { id: "desc" }],
    skip: page.skip,
    take: page.take,
  });

  const counts = Object.fromEntries(perStatus.map((row) => [row.status, row._count._all])) as Partial<
    Record<StatusPengaduan, number>
  >;

  return (
    <PageContainer breadcrumbs={[{ title: "Pengaduan" }]}>
      <PageHeader title="Data Pengaduan" description="Kelola laporan kerusakan dan permasalahan TI dari karyawan." />

      {/* Container query: lebar area konten berubah oleh sidebar, bukan hanya oleh layar. */}
      <div className="@container">
        <div className="flex flex-col gap-3 @3xl:flex-row @3xl:items-center @3xl:justify-between">
          <StatusTabs status={status} counts={counts} cari={cari} />
          <SearchInput
            key={status}
            value={cari}
            placeholder="Cari nomor, pelapor, kendala..."
            className="sm:w-full @3xl:w-72"
          />
        </div>
      </div>

      {pengaduan.length === 0 ? (
        <EmptyState icon={Inbox}>{pesanKosong(status, cari)}</EmptyState>
      ) : (
      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32 pl-4">No. Laporan</TableHead>
              <TableHead>Pelapor</TableHead>
              <TableHead>Kendala</TableHead>
              <TableHead className="w-32">Tgl. Lapor</TableHead>
              <TableHead className="w-24 pr-4 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pengaduan.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="pl-4 font-mono text-xs font-medium">
                  <Link href={`/admin/pengaduan/${item.id}`} className="hover:underline">
                    {item.nomor}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{item.namaPelapor}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.jabatan} · {item.divisi?.nama ?? "-"}
                  </div>
                </TableCell>
                <TableCell className="max-w-md">
                  <div className="truncate font-medium">{item.kendala}</div>
                  <div className="truncate text-xs text-muted-foreground">{item.keterangan}</div>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatTanggalSingkat(item.tanggalLapor)}</TableCell>
                <TableCell className="pr-4">
                  <div className="flex justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button asChild size="icon" variant="ghost" className="size-8">
                          <Link href={`/admin/pengaduan/${item.id}`}>
                            <Eye />
                            <span className="sr-only">Detail</span>
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Detail & tindak lanjut</TooltipContent>
                    </Tooltip>
                    <ConfirmDelete action={hapusPengaduan.bind(null, item.id, false)} title={`Hapus pengaduan ${item.nomor}?`}>
                      <Button size="icon" variant="ghost" className="size-8 text-destructive hover:text-destructive">
                        <Trash2 />
                        <span className="sr-only">Hapus</span>
                      </Button>
                    </ConfirmDelete>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      )}

      <Pagination meta={page.meta(pengaduan.length)} />
    </PageContainer>
  );
}
