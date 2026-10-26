"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { failure, fieldErrors, isUniqueViolation, success, zodErrors, type ActionResult } from "@/lib/action";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { teks } from "@/lib/validation";

const schema = z.object({ nama: teks("Nama merk") });

async function simpan(id: number | null, input: unknown, pesan: string): Promise<ActionResult> {
  await requireUser();
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  try {
    if (id) {
      await prisma.merk.update({ where: { id }, data: parsed.data });
    } else {
      await prisma.merk.create({ data: parsed.data });
    }
  } catch (error) {
    if (isUniqueViolation(error, "nama")) {
      return fieldErrors({ nama: "Nama merk sudah digunakan." });
    }

    throw error;
  }

  refresh();

  return success(pesan);
}

export async function tambahMerk(input: unknown) {
  return simpan(null, input, "Merk berhasil ditambahkan.");
}

export async function ubahMerk(id: number, input: unknown) {
  return simpan(id, input, "Merk berhasil diperbarui.");
}

export async function hapusMerk(id: number): Promise<ActionResult> {
  await requireUser();

  if (await prisma.komponen.count({ where: { merkId: id } })) {
    return failure("Merk masih digunakan oleh data komponen.");
  }

  await prisma.merk.delete({ where: { id } });
  refresh();

  return success("Merk berhasil dihapus.");
}
