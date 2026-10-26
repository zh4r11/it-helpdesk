"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Heading from "@/components/heading";
import InputError from "@/components/input-error";
import PasswordInput from "@/components/password-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { authClient, pesanAuthError } from "@/lib/auth-client";

export function DeleteUser() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [processing, startTransition] = useTransition();

  const hapus = () =>
    startTransition(async () => {
      setError(undefined);
      const { error } = await authClient.deleteUser({ password });

      if (error) {
        setPassword("");
        setError(pesanAuthError(error));

        return;
      }

      router.push("/");
      router.refresh();
    });

  return (
    <div className="space-y-6">
      <Heading variant="small" title="Hapus akun" description="Hapus akun beserta seluruh datanya" />
      <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
        <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
          <p className="font-medium">Peringatan</p>
          <p className="text-sm">Lakukan dengan hati-hati, tindakan ini tidak dapat dibatalkan.</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive">Hapus akun</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Yakin ingin menghapus akun Anda?</DialogTitle>
            <DialogDescription>
              Setelah akun dihapus, semua data akan terhapus permanen. Masukkan password Anda untuk mengonfirmasi.
            </DialogDescription>

            <form
              className="space-y-6"
              onSubmit={(event) => {
                event.preventDefault();
                hapus();
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="password" className="sr-only">
                  Password
                </Label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                />
                <InputError message={error} />
              </div>

              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <Button variant="secondary" type="button">
                    Batal
                  </Button>
                </DialogClose>
                <Button variant="destructive" disabled={processing}>
                  {processing && <Spinner />}
                  Hapus akun
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
