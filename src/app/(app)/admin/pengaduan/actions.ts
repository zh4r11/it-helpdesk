"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { failure, success, zodErrors, type ActionResult } from "@/lib/action";
import { STATUS_PENGADUAN } from "@/lib/helpdesk";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { pilihan, teksOpsional } from "@/lib/validation";

const schema = z.object({
  status: pilihan("Status", STATUS_PENGADUAN),
  catatan_petugas: teksOpsional("Catatan petugas", 2000),
});

export async function tindakLanjutPengaduan(id: number, input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  const pengaduan = await prisma.pengaduan.findUnique({ where: { id }, select: { nomor: true, selesaiAt: true } });

  if (!pengaduan) {
    return failure("Pengaduan tidak ditemukan.");
  }

  const { status, catatan_petugas } = parsed.data;

  await prisma.pengaduan.update({
    where: { id },
    data: {
      status,
      catatanPetugas: catatan_petugas,
      petugasId: user.id,
      selesaiAt: status === "selesai" ? (pengaduan.selesaiAt ?? new Date()) : null,
    },
  });

  refresh();

  return success(`Pengaduan ${pengaduan.nomor} berhasil diperbarui.`, `/admin/pengaduan?status=${status}`);
}

export async function hapusPengaduan(id: number, dariDetail = false): Promise<ActionResult> {
  await requireUser();

  const pengaduan = await prisma.pengaduan.findUnique({ where: { id }, select: { nomor: true, status: true } });

  if (!pengaduan) {
    return failure("Pengaduan tidak ditemukan.");
  }

  await prisma.pengaduan.delete({ where: { id } });

  refresh();

  return success(
    `Pengaduan ${pengaduan.nomor} telah dihapus.`,
    dariDetail ? `/admin/pengaduan?status=${pengaduan.status}` : undefined,
  );
}
