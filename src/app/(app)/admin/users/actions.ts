"use server";

import { refresh } from "next/cache";
import { failure, success, type ActionResult } from "@/lib/action";
import { isSuperAdmin } from "@/lib/helpdesk";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

/** Akun admin utama dan akun yang sedang dipakai tidak boleh diubah dari sini. */
async function targetAkun(id: string) {
  const current = await requireUser();
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, username: true } });

  if (!user) {
    return { error: failure("Akun tidak ditemukan.") } as const;
  }

  if (isSuperAdmin(user.username) || user.id === current.id) {
    return { error: failure("Akun ini tidak dapat diubah atau dihapus.") } as const;
  }

  return { user } as const;
}

/** Aktifkan atau nonaktifkan akun. */
export async function setAkunAktif(id: string, aktif: boolean): Promise<ActionResult> {
  const target = await targetAkun(id);

  if (target.error) {
    return target.error;
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { isActive: aktif } }),
    // Akun yang dinonaktifkan langsung keluar dari semua perangkat.
    ...(aktif ? [] : [prisma.session.deleteMany({ where: { userId: id } })]),
  ]);

  refresh();

  return success(
    aktif
      ? `Akun ${target.user.username} berhasil diaktifkan.`
      : `Akun ${target.user.username} berhasil dinonaktifkan.`,
  );
}

export async function hapusAkun(id: string): Promise<ActionResult> {
  const target = await targetAkun(id);

  if (target.error) {
    return target.error;
  }

  await prisma.user.delete({ where: { id } });
  refresh();

  return success(`Akun ${target.user.username} telah dihapus.`);
}
