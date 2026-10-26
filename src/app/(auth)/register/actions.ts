"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { z } from "zod";
import { failure, fieldErrors, success, zodErrors, type ActionResult } from "@/lib/action";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emailSchema, passwordSchema, teks, usernameSchema } from "@/lib/validation";

const schema = z
  .object({
    name: teks("Nama lengkap"),
    nip: teks("NIK / NIP", 30),
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ["password_confirmation"],
    message: "Konfirmasi password tidak cocok.",
  });

export async function daftar(input: unknown): Promise<ActionResult> {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return zodErrors(parsed.error);
  }

  const { name, nip, username, email, password } = parsed.data;

  const [usernameDipakai, emailDipakai, nipDipakai] = await Promise.all([
    prisma.user.count({ where: { username } }),
    prisma.user.count({ where: { email } }),
    prisma.user.count({ where: { nip } }),
  ]);

  const errors: Record<string, string> = {};
  if (usernameDipakai) errors.username = "Username sudah digunakan.";
  if (emailDipakai) errors.email = "Email sudah digunakan.";
  if (nipDipakai) errors.nip = "NIK / NIP sudah terdaftar.";

  if (Object.keys(errors).length) {
    return fieldErrors(errors);
  }

  try {
    // Akun baru berstatus non-aktif sampai diaktifkan oleh admin.
    await auth.api.signUpEmail({
      body: { name, email, password, username, displayUsername: username, nip },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      return failure(error.message);
    }

    throw error;
  }

  return success(undefined, "/login?status=terdaftar");
}
