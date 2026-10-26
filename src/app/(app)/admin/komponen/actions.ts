"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { failure, fieldErrors, success, zodErrors, type ActionResult } from "@/lib/action";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { idWajib, teks, teksOpsional } from "@/lib/validation";

const schema = z.object({
  kategori_id: idWajib("Kategori"),
  merk_id: idWajib("Merk"),
  tipe: teks("Tipe"),
  spesifikasi: teks("Spesifikasi"),
  keterangan: teksOpsional("Keterangan"),
  aktif: z.boolean(),
});

async function simpan(id: number | null, input: unknown, pesan: string): Promise<ActionResult> {
  await requireUser();
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  const { kategori_id, merk_id, ...rest } = parsed.data;

  const [kategori, merk] = await Promise.all([
    prisma.kategori.count({ where: { id: kategori_id } }),
    prisma.merk.count({ where: { id: merk_id } }),
  ]);

  const errors: Record<string, string> = {};
  if (!kategori) errors.kategori_id = "Kategori yang dipilih tidak valid.";
  if (!merk) errors.merk_id = "Merk yang dipilih tidak valid.";

  if (Object.keys(errors).length) {
    return fieldErrors(errors);
  }

  const data = { ...rest, kategoriId: kategori_id, merkId: merk_id };

  if (id) {
    await prisma.komponen.update({ where: { id }, data });
  } else {
    await prisma.komponen.create({ data });
  }

  refresh();

  return success(pesan);
}

export async function tambahKomponen(input: unknown) {
  return simpan(null, input, "Komponen berhasil ditambahkan.");
}

export async function ubahKomponen(id: number, input: unknown) {
  return simpan(id, input, "Komponen berhasil diperbarui.");
}

export async function hapusKomponen(id: number): Promise<ActionResult> {
  await requireUser();

  if (await prisma.rakitan.count({ where: { komponenId: id } })) {
    return failure("Komponen masih terpasang pada data PC. Nonaktifkan saja jika sudah tidak dipakai.");
  }

  await prisma.komponen.delete({ where: { id } });
  refresh();

  return success("Komponen berhasil dihapus.");
}
