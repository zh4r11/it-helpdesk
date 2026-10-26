import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Pilihan karyawan & komponen aktif untuk form PC. Saat mengubah PC,
 * karyawan/komponen yang sudah terpasang tetap ikut walau kini non-aktif.
 */
export async function formOptions(terpasang: { karyawanId?: number | null; komponenIds?: number[] } = {}) {
  const [karyawan, komponen] = await Promise.all([
    prisma.karyawan.findMany({
      where: { OR: [{ aktif: true }, ...(terpasang.karyawanId ? [{ id: terpasang.karyawanId }] : [])] },
      orderBy: { nama: "asc" },
      select: { id: true, nama: true, jabatan: true, divisi: { select: { nama: true } } },
    }),
    prisma.komponen.findMany({
      where: { OR: [{ aktif: true }, { id: { in: terpasang.komponenIds ?? [] } }] },
      orderBy: [{ kategori: { nama: "asc" } }, { merk: { nama: "asc" } }, { tipe: "asc" }],
      select: {
        id: true,
        tipe: true,
        spesifikasi: true,
        keterangan: true,
        kategori: { select: { nama: true } },
        merk: { select: { nama: true } },
      },
    }),
  ]);

  return { karyawan, komponen };
}

export type FormOptions = Awaited<ReturnType<typeof formOptions>>;
