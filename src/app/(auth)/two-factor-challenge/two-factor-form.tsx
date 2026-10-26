"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AuthHeading } from "@/components/auth-heading";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { authClient, pesanAuthError } from "@/lib/auth-client";

export function TwoFactorForm() {
  const router = useRouter();
  const [pakaiKodePemulihan, setPakaiKodePemulihan] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [processing, startTransition] = useTransition();

  const verifikasi = (value = code) =>
    startTransition(async () => {
      setError(undefined);
      const { error } = pakaiKodePemulihan
        ? await authClient.twoFactor.verifyBackupCode({ code: value.trim() })
        : await authClient.twoFactor.verifyTotp({ code: value });

      if (error) {
        setCode("");
        setError(pesanAuthError(error));

        return;
      }

      router.push("/dashboard");
      router.refresh();
    });

  return (
    <>
      <AuthHeading
        title={pakaiKodePemulihan ? "Kode pemulihan" : "Kode autentikasi"}
        description={
          pakaiKodePemulihan
            ? "Konfirmasi akses akun dengan memasukkan salah satu kode pemulihan darurat Anda."
            : "Masukkan kode autentikasi dari aplikasi authenticator Anda."
        }
      />

      <div className="space-y-6">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            verifikasi();
          }}
        >
          {pakaiKodePemulihan ? (
            <Input
              name="recovery_code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Masukkan kode pemulihan"
              autoFocus
              required
              aria-invalid={!!error}
            />
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3 text-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={setCode}
                onComplete={(value) => verifikasi(value)}
                disabled={processing}
                pattern={REGEXP_ONLY_DIGITS}
                autoFocus
              >
                <InputOTPGroup>
                  {Array.from({ length: 6 }, (_, index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          )}
          <InputError message={error} className="text-center" />

          <Button type="submit" className="w-full" disabled={processing}>
            {processing && <Spinner />}
            Lanjutkan
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <span>atau </span>
            <button
              type="button"
              className="cursor-pointer text-foreground underline decoration-neutral-300 underline-offset-4 hover:decoration-current dark:decoration-neutral-500"
              onClick={() => {
                setPakaiKodePemulihan((v) => !v);
                setCode("");
                setError(undefined);
              }}
            >
              {pakaiKodePemulihan ? "masuk memakai kode autentikasi" : "masuk memakai kode pemulihan"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
