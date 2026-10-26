import type { Metadata } from "next";
import { PageContainer } from "@/components/page-header";
import { JABATAN } from "@/lib/helpdesk";
import { prisma } from "@/lib/prisma";
import { KaryawanTable } from "./karyawan-table";

export const metadata: Metadata = { title: "Karyawan" };

export default async function KaryawanPage() {
  const [karyawan, divisi] = await Promise.all([
    prisma.karyawan.findMany({
      orderBy: { nama: "asc" },
      select: {
        id: true,
        nama: true,
        jabatan: true,
        divisiId: true,
        aktif: true,
        divisi: { select: { nama: true } },
        _count: { select: { komputer: { where: { deletedAt: null } } } },
      },
    }),
    prisma.divisi.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true } }),
  ]);

  return (
    <PageContainer breadcrumbs={[{ title: "Karyawan" }]}>
      <KaryawanTable karyawan={karyawan} divisi={divisi} jabatan={[...JABATAN]} />
    </PageContainer>
  );
}
