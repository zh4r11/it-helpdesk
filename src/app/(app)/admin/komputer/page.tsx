import { Eye, Globe, GlobeLock, Monitor, Pencil, Plus, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import ConfirmDelete from "@/components/confirm-delete";
import PageHeader, { PageContainer } from "@/components/page-header";
import Pagination from "@/components/pagination";
import SearchInput from "@/components/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Prisma } from "@/generated/prisma/client";
import { paginate, param, parsePage } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { hapusKomputer } from "./actions";

export const metadata: Metadata = { title: "Data PC" };

export default async function KomputerIndexPage({ searchParams }: PageProps<"/admin/komputer">) {
  const query = await searchParams;
  const cari = param(query.cari);

  const where: Prisma.KomputerWhereInput = {
    deletedAt: null,
    ...(cari && {
      OR: [
        { namaPc: { contains: cari, mode: "insensitive" } },
        { ipAddress: { contains: cari, mode: "insensitive" } },
        { karyawan: { nama: { contains: cari, mode: "insensitive" } } },
      ],
    }),
  };

  const page = paginate(parsePage(query.page), await prisma.komputer.count({ where }));
  const komputer = await prisma.komputer.findMany({
    where,
    include: {
      karyawan: { select: { nama: true, divisi: { select: { nama: true } } } },
      rakitan: {
        include: { komponen: { select: { tipe: true, spesifikasi: true, kategori: true, merk: true } } },
        orderBy: { id: "asc" },
      },
    },
    orderBy: { id: "desc" },
    skip: page.skip,
    take: page.take,
  });

  return (
    <PageContainer breadcrumbs={[{ title: "Data PC" }]}>
      <PageHeader title="Data PC" description="Inventaris komputer beserta rakitan komponen dan penggunanya.">
        <Button asChild>
          <Link href="/admin/komputer/create">
            <Plus />
            Tambah PC
          </Link>
        </Button>
      </PageHeader>

      <SearchInput value={cari} placeholder="Cari nama PC, IP, pengguna..." />

      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Komputer</TableHead>
              <TableHead>Pengguna</TableHead>
              <TableHead>Hardware</TableHead>
              <TableHead>Software</TableHead>
              <TableHead className="w-28 pr-4 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {komputer.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-40">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Monitor className="size-8" />
                    Belum ada data PC.
                  </div>
                </TableCell>
              </TableRow>
            )}
            {komputer.map((pc) => (
              <TableRow key={pc.id} className="align-top">
                <TableCell className="pl-4">
                  <Link href={`/admin/komputer/${pc.id}`} className="font-medium hover:underline">
                    {pc.namaPc}
                  </Link>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    {pc.aksesInternet ? (
                      <Globe className="size-3.5 text-emerald-600" />
                    ) : (
                      <GlobeLock className="size-3.5" />
                    )}
                    <span className="font-mono">{pc.ipAddress ?? "IP belum diatur"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {pc.karyawan ? (
                    <>
                      <div className="font-medium">{pc.karyawan.nama}</div>
                      <div className="text-xs text-muted-foreground">{pc.karyawan.divisi?.nama ?? "-"}</div>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Belum ada pengguna</span>
                  )}
                </TableCell>
                <TableCell className="max-w-md whitespace-normal">
                  <div className="flex flex-wrap gap-1">
                    {pc.rakitan.length ? (
                      pc.rakitan.map((r) => (
                        <Badge key={r.id} variant="secondary" className="font-normal" title={r.komponen.kategori.nama}>
                          <span className="text-muted-foreground">{r.komponen.kategori.nama}:</span>
                          {r.komponen.merk.nama} {r.komponen.tipe} {r.komponen.spesifikasi}
                          {r.jumlah > 1 && ` ×${r.jumlah}`}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  <div>{pc.sistemOperasi || "-"}</div>
                  <div className="text-xs text-muted-foreground">{pc.office || "-"}</div>
                </TableCell>
                <TableCell className="pr-4">
                  <div className="flex justify-end gap-1">
                    <Button asChild size="icon" variant="ghost" className="size-8">
                      <Link href={`/admin/komputer/${pc.id}`}>
                        <Eye />
                        <span className="sr-only">Detail</span>
                      </Link>
                    </Button>
                    <Button asChild size="icon" variant="ghost" className="size-8">
                      <Link href={`/admin/komputer/${pc.id}/edit`}>
                        <Pencil />
                        <span className="sr-only">Ubah</span>
                      </Link>
                    </Button>
                    <ConfirmDelete action={hapusKomputer.bind(null, pc.id, false)} title={`Hapus PC ${pc.namaPc}?`}>
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

      <Pagination meta={page.meta(komputer.length)} />
    </PageContainer>
  );
}
