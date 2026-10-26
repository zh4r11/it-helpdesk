import type { Metadata } from "next";
import { PageContainer } from "@/components/page-header";
import { SUPER_ADMIN } from "@/lib/helpdesk";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { UsersTable } from "./users-table";

export const metadata: Metadata = { title: "Akun Pengguna" };

export default async function UsersPage() {
  const current = await requireUser();
  const users = await prisma.user.findMany({
    orderBy: [{ isActive: "asc" }, { name: "asc" }],
    select: { id: true, name: true, username: true, nip: true, email: true, image: true, isActive: true, createdAt: true },
  });

  return (
    <PageContainer breadcrumbs={[{ title: "Akun Pengguna" }]}>
      <UsersTable users={users} currentUserId={current.id} superAdmin={SUPER_ADMIN} />
    </PageContainer>
  );
}
