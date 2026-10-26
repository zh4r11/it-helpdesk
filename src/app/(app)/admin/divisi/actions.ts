"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { fieldErrors, isUniqueViolation, success, zodErrors, type ActionResult } from "@/lib/action";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { teks } from "@/lib/validation";

const schema = z.object({
  kode: teks("Kode", 30),
  nama: teks("Nama divisi"),
});

async function simpan(id: number | null, input: unknown, pesan: string): Promise<ActionResult> {
  await requireUser();
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  try {
    if (id) {
      await prisma.divisi.update({ where: { id }, data: parsed.data });
    } else {
      await prisma.divisi.create({ data: parsed.data });
    }
  } catch (error) {
    if (isUniqueViolation(error, "kode")) {
      return fieldErrors({ kode: "Kode sudah digunakan." });
    }

    throw error;
  }

  refresh();

  return success(pesan);
}

export async function tambahDivisi(input: unknown) {
  return simpan(null, input, "Divisi berhasil ditambahkan.");
}

export async function ubahDivisi(id: number, input: unknown) {
  return simpan(id, input, "Divisi berhasil diperbarui.");
}

export async function hapusDivisi(id: number): Promise<ActionResult> {
  await requireUser();
  await prisma.divisi.delete({ where: { id } });
  refresh();

  return success("Divisi berhasil dihapus.");
}
