import type { Metadata } from "next";
import { isSuperAdmin } from "@/lib/helpdesk";
import { requireUser } from "@/lib/session";
import { DeleteUser } from "./delete-user";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Pengaturan profil" };

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <>
      <h1 className="sr-only">Pengaturan profil</h1>
      <ProfileForm
        key={`${user.updatedAt.getTime()}`}
        user={{ name: user.name, username: user.username ?? "", email: user.email, image: user.image ?? null }}
      />
      {!isSuperAdmin(user.username) && <DeleteUser />}
    </>
  );
}
