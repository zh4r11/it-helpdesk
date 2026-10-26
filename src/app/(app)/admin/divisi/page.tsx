import type { Metadata } from "next";
import { PageContainer } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { DivisiTable } from "./divisi-table";

export const metadata: Metadata = { title: "Divisi" };

export default async function DivisiPage() {
  const divisi = await prisma.divisi.findMany({
    orderBy: { kode: "asc" },
    select: { id: true, kode: true, nama: true, _count: { select: { karyawan: true, pengaduan: true } } },
  });

  return (
    <PageContainer breadcrumbs={[{ title: "Divisi" }]}>
      <DivisiTable divisi={divisi} />
    </PageContainer>
  );
}
