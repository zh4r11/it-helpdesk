"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { failure, fieldErrors, isUniqueViolation, success, zodErrors, type ActionResult } from "@/lib/action";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { teks } from "@/lib/validation";

const schema = z.object({ nama: teks("Nama kategori") });

async function simpan(id: number | null, input: unknown, pesan: string): Promise<ActionResult> {
  await requireUser();
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  try {
    if (id) {
      await prisma.kategori.update({ where: { id }, data: parsed.data });
    } else {
      await prisma.kategori.create({ data: parsed.data });
    }
  } catch (error) {
    if (isUniqueViolation(error, "nama")) {
      return fieldErrors({ nama: "Nama kategori sudah digunakan." });
    }

    throw error;
  }

  refresh();

  return success(pesan);
}

export async function tambahKategori(input: unknown) {
  return simpan(null, input, "Kategori berhasil ditambahkan.");
}

export async function ubahKategori(id: number, input: unknown) {
  return simpan(id, input, "Kategori berhasil diperbarui.");
}

export async function hapusKategori(id: number): Promise<ActionResult> {
  await requireUser();

  if (await prisma.komponen.count({ where: { kategoriId: id } })) {
    return failure("Kategori masih digunakan oleh data komponen.");
  }

  await prisma.kategori.delete({ where: { id } });
  refresh();

  return success("Kategori berhasil dihapus.");
}
