"use client";

import { KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import InputError from "@/components/input-error";
import PasswordInput from "@/components/password-input";
import TextLink from "@/components/text-link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { authClient, pesanAuthError } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string>();
  const [processing, startTransition] = useTransition();
  const [passkeyProcessing, startPasskey] = useTransition();

  const masuk = () =>
    startTransition(async () => {
      setError(undefined);
      const value = login.trim().toLowerCase();

      // Boleh login memakai username atau email.
      const { data, error } = value.includes("@")
        ? await authClient.signIn.email({ email: value, password, rememberMe: remember })
        : await authClient.signIn.username({ username: value, password, rememberMe: remember });

      if (error) {
        setPassword("");
        setError(pesanAuthError(error));

        return;
      }

      // Pengguna dengan 2FA aktif harus memasukkan kode terlebih dahulu.
      if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) {
        router.push("/two-factor-challenge");

        return;
      }

      router.push("/dashboard");
      router.refresh();
    });

  const masukPasskey = () =>
    startPasskey(async () => {
      setError(undefined);
      const result = await authClient.signIn.passkey();

      if (result.error) {
        // Dibatalkan pengguna di dialog browser: abaikan diam-diam.
        if (result.error.status !== 0 && !String(result.error.message).toLowerCase().includes("cancel")) {
          setError(pesanAuthError(result.error));
        }

        return;
      }

      router.push("/dashboard");
      router.refresh();
    });

  return (
    <div className="flex flex-col gap-6">
      <form
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          masuk();
        }}
      >
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="username">Username atau email</Label>
            <Input
              id="username"
              name="username"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              autoFocus
              autoComplete="username webauthn"
              placeholder="username"
              aria-invalid={!!error}
            />
            <InputError message={error} />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <TextLink href="/forgot-password" className="ml-auto text-sm">
                Lupa password?
              </TextLink>
            </div>
            <PasswordInput
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Password"
            />
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
            <Label htmlFor="remember">Ingat saya</Label>
          </div>

          <Button type="submit" className="mt-4 w-full" disabled={processing || passkeyProcessing}>
            {processing && <Spinner />}
            Masuk
          </Button>
        </div>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        atau
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button type="button" variant="outline" onClick={masukPasskey} disabled={processing || passkeyProcessing}>
        {passkeyProcessing ? <Spinner /> : <KeyRound />}
        Masuk dengan passkey
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        Belum punya akun? <TextLink href="/register">Daftar</TextLink>
      </div>
    </div>
  );
}
