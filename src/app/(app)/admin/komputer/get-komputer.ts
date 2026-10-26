import "server-only";
import { notFound } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

/** Detail PC (yang belum dihapus) beserta pengguna dan rakitannya. */
export const getKomputer = cache(async (id: string) => {
  const komputerId = Number(id);

  if (!Number.isInteger(komputerId)) {
    notFound();
  }

  const komputer = await prisma.komputer.findFirst({
    where: { id: komputerId, deletedAt: null },
    include: {
      karyawan: { include: { divisi: { select: { nama: true } } } },
      rakitan: {
        include: { komponen: { include: { kategori: true, merk: true } } },
        orderBy: { id: "asc" },
      },
    },
  });

  if (!komputer) {
    notFound();
  }

  return komputer;
});
