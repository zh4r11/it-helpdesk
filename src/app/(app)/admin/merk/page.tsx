import type { Metadata } from "next";
import { PageContainer } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { NamaTable } from "../nama-table";
import { hapusMerk, tambahMerk, ubahMerk } from "./actions";

export const metadata: Metadata = { title: "Merk" };

export default async function MerkPage() {
  const merk = await prisma.merk.findMany({
    orderBy: { nama: "asc" },
    select: { id: true, nama: true, _count: { select: { komponen: true } } },
  });

  return (
    <PageContainer breadcrumbs={[{ title: "Merk" }]}>
      <NamaTable
        rows={merk}
        entitas="merk"
        title="Merk"
        description="Daftar merk/produsen komponen perangkat keras."
        store={tambahMerk}
        update={ubahMerk}
        destroy={hapusMerk}
      />
    </PageContainer>
  );
}
