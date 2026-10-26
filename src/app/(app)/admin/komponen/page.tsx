import type { Metadata } from "next";
import { PageContainer } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { KomponenTable } from "./komponen-table";

export const metadata: Metadata = { title: "Komponen" };

export default async function KomponenPage() {
  const [komponen, kategori, merk] = await Promise.all([
    prisma.komponen.findMany({
      orderBy: [{ kategori: { nama: "asc" } }, { merk: { nama: "asc" } }, { tipe: "asc" }],
      include: {
        kategori: { select: { nama: true } },
        merk: { select: { nama: true } },
        _count: { select: { rakitan: { where: { komputer: { deletedAt: null } } } } },
      },
    }),
    prisma.kategori.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true } }),
    prisma.merk.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true } }),
  ]);

  return (
    <PageContainer breadcrumbs={[{ title: "Komponen" }]}>
      <KomponenTable komponen={komponen} kategori={kategori} merk={merk} />
    </PageContainer>
  );
}
