import type { Metadata } from "next";
import { PageContainer } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { NamaTable } from "../nama-table";
import { hapusKategori, tambahKategori, ubahKategori } from "./actions";

export const metadata: Metadata = { title: "Kategori" };

export default async function KategoriPage() {
  const kategori = await prisma.kategori.findMany({
    orderBy: { nama: "asc" },
    select: { id: true, nama: true, _count: { select: { komponen: true } } },
  });

  return (
    <PageContainer breadcrumbs={[{ title: "Kategori" }]}>
      <NamaTable
        rows={kategori}
        entitas="kategori"
        title="Kategori Komponen"
        description="Jenis komponen perangkat keras, mis. Motherboard, Processor, Memory."
        store={tambahKategori}
        update={ubahKategori}
        destroy={hapusKategori}
      />
    </PageContainer>
  );
}
