"use client";

import { ShieldCheck, UserCog } from "lucide-react";
import DataTableCard from "@/components/data-table-card";
import PageHeader from "@/components/page-header";
import RowActions from "@/components/row-actions";
import { ClientSearchInput, useClientSearch } from "@/components/search-input";
import { AktifBadge } from "@/components/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAction } from "@/hooks/use-form";
import { formatTanggalSingkat } from "@/lib/format";
import { initials } from "@/lib/utils";
import { hapusAkun, setAkunAktif } from "./actions";

type Akun = {
  id: string;
  name: string;
  username: string;
  nip: string | null;
  email: string;
  image: string | null;
  isActive: boolean;
  createdAt: Date;
};

export function UsersTable({
  users,
  currentUserId,
  superAdmin,
}: {
  users: Akun[];
  currentUserId: string;
  superAdmin: string;
}) {
  const [pending, run] = useAction();
  const { cari, setCari, hasil } = useClientSearch(users, (u) => [u.name, u.username, u.nip ?? "", u.email]);

  const terkunci = (user: Akun) => user.username.toLowerCase() === superAdmin || user.id === currentUserId;

  return (
    <>
      <PageHeader
        title="Akun Pengguna"
        description="Aktifkan akun petugas yang baru mendaftar atau nonaktifkan akun yang tidak dipakai."
      />

      <ClientSearchInput value={cari} onChange={setCari} placeholder="Cari nama, username, NIK..." />

      <DataTableCard
        rows={hasil}
        rowKey={(u) => u.id}
        emptyText="Tidak ada akun."
        emptyIcon={UserCog}
        columns={[
          {
            header: "Pengguna",
            cell: (u) => (
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarImage src={u.image ?? undefined} alt={u.name} className="object-cover" />
                  <AvatarFallback>{initials(u.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 font-medium">
                    {u.name}
                    {u.username.toLowerCase() === superAdmin && <ShieldCheck className="size-3.5 text-primary" />}
                    {u.id === currentUserId && (
                      <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                        Anda
                      </Badge>
                    )}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    @{u.username} · {u.email}
                  </div>
                </div>
              </div>
            ),
          },
          { header: "NIK / NIP", cell: (u) => <span className="font-mono text-xs">{u.nip ?? "-"}</span> },
          {
            header: "Terdaftar",
            cell: (u) => <span className="text-muted-foreground">{formatTanggalSingkat(u.createdAt)}</span>,
          },
          {
            header: "Status",
            cell: (u) => <AktifBadge aktif={u.isActive} labelNonaktif="Menunggu aktivasi" />,
            className: "w-40",
          },
          {
            header: "Aktif",
            cell: (u) => (
              <Switch
                checked={u.isActive}
                disabled={terkunci(u) || pending}
                aria-label={`Aktifkan akun ${u.username}`}
                onCheckedChange={(checked) => run(() => setAkunAktif(u.id, checked))}
              />
            ),
            className: "w-20",
          },
          {
            header: "Aksi",
            cell: (u) =>
              terkunci(u) ? null : (
                <RowActions
                  destroy={() => hapusAkun(u.id)}
                  deleteTitle={`Hapus akun ${u.username}?`}
                  deleteDescription="Akun akan dihapus permanen dan tidak bisa login lagi."
                />
              ),
            className: "w-20 text-right",
          },
        ]}
      />
    </>
  );
}
