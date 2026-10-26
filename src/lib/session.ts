import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";

export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

/**
 * Pengguna yang sedang login dan aktif. Tanpa sesi diarahkan ke login;
 * akun yang dinonaktifkan admin dikeluarkan.
 */
export async function requireUser() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.isActive) {
    redirect("/logout?status=nonaktif");
  }

  return session.user;
}

export type CurrentUser = Awaited<ReturnType<typeof requireUser>>;
