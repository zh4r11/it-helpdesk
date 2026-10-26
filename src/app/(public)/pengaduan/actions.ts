"use server";

import { z } from "zod";
import { failure, success, zodErrors, type ActionResult } from "@/lib/action";
import { hariIni, toDbDate } from "@/lib/dates";
import { JABATAN, PREFIX_NOMOR } from "@/lib/helpdesk";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { idWajib, pilihan, teks } from "@/lib/validation";

const schema = z.object({
  nama_pelapor: teks("Nama pelapor", 100),
  jabatan: pilihan("Jabatan", JABATAN),
  divisi_id: idWajib("Unit kerja"),
  kendala: teks("Kendala", 150),
  keterangan: teks("Keterangan", 2000),
});

/** Kunci advisory agar nomor laporan berurutan tanpa bentrok. */
const NOMOR_LOCK = 4_201_001;

export async function kirimPengaduan(input: unknown): Promise<ActionResult> {
  if (!(await rateLimit("pengaduan", 10))) {
    return failure("Terlalu banyak pengiriman. Silakan coba lagi dalam satu menit.");
  }

  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  const data = parsed.data;

  if (!(await prisma.divisi.findUnique({ where: { id: data.divisi_id }, select: { id: true } }))) {
    return { ok: false, errors: { divisi_id: "Unit kerja yang dipilih tidak valid." } };
  }

  const pengaduan = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${NOMOR_LOCK})`;

    const terakhir = await tx.pengaduan.findFirst({
      where: { nomor: { startsWith: PREFIX_NOMOR } },
      orderBy: { id: "desc" },
      select: { nomor: true },
    });

    const urutan = terakhir ? Number.parseInt(terakhir.nomor.slice(PREFIX_NOMOR.length), 10) + 1 : 1;

    return tx.pengaduan.create({
      data: {
        nomor: `${PREFIX_NOMOR}${String(urutan).padStart(4, "0")}`,
        namaPelapor: data.nama_pelapor,
        jabatan: data.jabatan,
        divisiId: data.divisi_id,
        kendala: data.kendala,
        keterangan: data.keterangan,
        status: "diajukan",
        tanggalLapor: toDbDate(hariIni()),
      },
      select: { nomor: true },
    });
  });

  return success(undefined, `/pengaduan/${encodeURIComponent(pengaduan.nomor)}/terkirim`);
}
