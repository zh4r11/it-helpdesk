"use client";

import { Fingerprint, KeyRound, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import ConfirmDelete from "@/components/confirm-delete";
import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import type { ActionResult } from "@/lib/action";
import { authClient, pesanAuthError } from "@/lib/auth-client";
import { formatTanggal } from "@/lib/format";

type Passkey = { id: string; name: string | null; deviceType: string; createdAt: Date | null };

export function ManagePasskeys({ passkeys }: { passkeys: Passkey[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [processing, startTransition] = useTransition();

  const tambah = () =>
    startTransition(async () => {
      const result = await authClient.passkey.addPasskey({ name: name.trim() || undefined });

      if (result?.error) {
        toast.error(pesanAuthError(result.error));

        return;
      }

      setName("");
      toast.success("Passkey berhasil ditambahkan.");
      router.refresh();
    });

  return (
    <div className="space-y-6">
      <Heading
        variant="small"
        title="Passkey"
        description="Masuk tanpa password memakai sidik jari, wajah, atau kunci keamanan perangkat"
      />

      {passkeys.length > 0 ? (
        <ul className="divide-y rounded-lg border">
          {passkeys.map((passkey) => (
            <li key={passkey.id} className="flex items-center gap-3 p-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Fingerprint className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{passkey.name || "Passkey"}</p>
                <p className="text-xs text-muted-foreground">
                  {passkey.deviceType === "multiDevice" ? "Tersinkron" : "Satu perangkat"} · ditambahkan{" "}
                  {formatTanggal(passkey.createdAt)}
                </p>
              </div>
              <ConfirmDelete
                title="Hapus passkey ini?"
                description="Anda tidak bisa lagi masuk memakai passkey ini."
                action={async (): Promise<ActionResult> => {
                  const { error } = await authClient.passkey.deletePasskey({ id: passkey.id });

                  if (error) {
                    return { ok: false, message: pesanAuthError(error) };
                  }

                  router.refresh();

                  return { ok: true, message: "Passkey berhasil dihapus." };
                }}
              >
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  Hapus
                </Button>
              </ConfirmDelete>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          <KeyRound className="size-4" />
          Belum ada passkey terdaftar.
        </div>
      )}

      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          tambah();
        }}
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama passkey, mis. Laptop kantor"
          className="sm:flex-1"
        />
        <Button type="submit" disabled={processing}>
          {processing ? <Spinner /> : <Plus />}
          Tambah passkey
        </Button>
      </form>
    </div>
  );
}
