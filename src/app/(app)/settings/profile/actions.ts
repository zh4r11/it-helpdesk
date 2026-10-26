"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { fieldErrors, success, zodErrors, type ActionResult } from "@/lib/action";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { emailSchema, teks, usernameSchema } from "@/lib/validation";

const MAX_AVATAR = 2 * 1024 * 1024;
const MIME_GAMBAR = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const schema = z.object({
  name: teks("Nama"),
  username: usernameSchema,
  email: emailSchema,
  hapus_avatar: z.enum(["0", "1"]).default("0"),
});

/** Perbarui nama, username, email, dan foto profil (FormData karena ada file). */
export async function perbaruiProfil(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = schema.safeParse(Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === "string")));

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  const { name, username, email, hapus_avatar } = parsed.data;
  const avatar = formData.get("avatar");
  const file = avatar instanceof File && avatar.size > 0 ? avatar : null;

  const errors: Record<string, string> = {};

  if (file && !MIME_GAMBAR.includes(file.type)) {
    errors.avatar = "Foto harus berupa gambar JPG, PNG, WEBP, atau GIF.";
  } else if (file && file.size > MAX_AVATAR) {
    errors.avatar = "Ukuran foto maksimal 2 MB.";
  }

  const [usernameDipakai, emailDipakai] = await Promise.all([
    prisma.user.count({ where: { username, NOT: { id: user.id } } }),
    prisma.user.count({ where: { email, NOT: { id: user.id } } }),
  ]);
  if (usernameDipakai) errors.username = "Username sudah digunakan.";
  if (emailDipakai) errors.email = "Email sudah digunakan.";

  if (Object.keys(errors).length) {
    return fieldErrors(errors);
  }

  let image: string | null | undefined;

  if (file) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const saved = await prisma.avatar.upsert({
      where: { userId: user.id },
      create: { userId: user.id, data: bytes, mime: file.type },
      update: { data: bytes, mime: file.type },
    });
    image = `/api/avatar/${user.id}?v=${saved.updatedAt.getTime()}`;
  } else if (hapus_avatar === "1") {
    await prisma.avatar.deleteMany({ where: { userId: user.id } });
    image = null;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { name, username, displayUsername: username, email, ...(image !== undefined && { image }) },
  });

  refresh();

  return success("Profil berhasil diperbarui.");
}
