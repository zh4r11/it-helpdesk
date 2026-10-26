"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { fieldErrors, success, zodErrors, type ActionResult } from "@/lib/action";
import { JABATAN } from "@/lib/helpdesk";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { idWajib, pilihan, teks } from "@/lib/validation";

const schema = z.object({
  nama: teks("Nama"),
  jabatan: pilihan("Jabatan", JABATAN),
  divisi_id: idWajib("Unit kerja"),
  aktif: z.boolean(),
});

async function simpan(id: number | null, input: unknown, pesan: string): Promise<ActionResult> {
  await requireUser();
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  const { nama, jabatan, divisi_id, aktif } = parsed.data;

  if (!(await prisma.divisi.count({ where: { id: divisi_id } }))) {
    return fieldErrors({ divisi_id: "Unit kerja yang dipilih tidak valid." });
  }

  const data = { nama, jabatan, divisiId: divisi_id, aktif };

  if (id) {
    await prisma.karyawan.update({ where: { id }, data });
  } else {
    await prisma.karyawan.create({ data });
  }

  refresh();

  return success(pesan);
}

export async function tambahKaryawan(input: unknown) {
  return simpan(null, input, "Data karyawan berhasil ditambahkan.");
}

export async function ubahKaryawan(id: number, input: unknown) {
  return simpan(id, input, "Data karyawan berhasil diperbarui.");
}

export async function hapusKaryawan(id: number): Promise<ActionResult> {
  await requireUser();
  await prisma.karyawan.delete({ where: { id } });
  refresh();

  return success("Data karyawan berhasil dihapus.");
}
