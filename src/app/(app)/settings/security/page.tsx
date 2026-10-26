import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PASSWORD_RULES_HINT } from "@/lib/validation";
import { ManagePasskeys } from "./manage-passkeys";
import { ManageTwoFactor } from "./manage-two-factor";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "Keamanan" };

export default async function SecurityPage() {
  const user = await requireUser();
  const passkeys = await prisma.passkey.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, deviceType: true, createdAt: true },
  });

  return (
    <>
      <h1 className="sr-only">Pengaturan keamanan</h1>
      <PasswordForm passwordRules={PASSWORD_RULES_HINT} />
      <ManageTwoFactor enabled={!!user.twoFactorEnabled} />
      <ManagePasskeys passkeys={passkeys} />
    </>
  );
}
