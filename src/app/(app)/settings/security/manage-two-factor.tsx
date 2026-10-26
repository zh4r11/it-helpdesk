"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { KeyRound, RefreshCw, ShieldBan, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CopyButton } from "@/components/copy-button";
import Heading from "@/components/heading";
import InputError from "@/components/input-error";
import PasswordInput from "@/components/password-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { authClient, pesanAuthError } from "@/lib/auth-client";

type Mode = "enable" | "disable" | "codes";

export function ManageTwoFactor({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode | null>(null);
  const [setup, setSetup] = useState<{ uri: string; backupCodes: string[] } | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

  const selesaiSetup = () => {
    setSetup(null);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <Heading
        variant="small"
        title="Autentikasi dua faktor"
        description="Tambahkan lapisan keamanan dengan kode dari aplikasi authenticator"
      />

      {enabled ? (
        <div className="flex flex-col items-start justify-start space-y-4">
          <Badge className="bg-emerald-600 text-white">
            <ShieldCheck />
            Aktif
          </Badge>
          <p className="text-sm text-muted-foreground">
            Saat login, Anda akan diminta kode acak yang dapat diambil dari aplikasi authenticator (TOTP) di ponsel
            Anda.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setMode("codes")}>
              <RefreshCw />
              Buat ulang kode pemulihan
            </Button>
            <Button variant="destructive" onClick={() => setMode("disable")}>
              <ShieldBan />
              Nonaktifkan 2FA
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-start justify-start space-y-4">
          <Badge variant="destructive">
            <ShieldBan />
            Tidak aktif
          </Badge>
          <p className="text-sm text-muted-foreground">
            Setelah 2FA aktif, Anda akan diminta kode keamanan saat login. Kode dapat diambil dari aplikasi authenticator
            seperti Google Authenticator atau Microsoft Authenticator.
          </p>
          <Button onClick={() => setMode("enable")}>
            <ShieldCheck />
            Aktifkan 2FA
          </Button>
        </div>
      )}

      <PasswordPrompt
        open={mode !== null}
        onOpenChange={(open) => !open && setMode(null)}
        title={
          mode === "disable" ? "Nonaktifkan 2FA" : mode === "codes" ? "Buat ulang kode pemulihan" : "Aktifkan 2FA"
        }
        submitLabel={mode === "disable" ? "Nonaktifkan" : "Lanjutkan"}
        destructive={mode === "disable"}
        onConfirm={async (password) => {
          if (mode === "enable") {
            const { data, error } = await authClient.twoFactor.enable({ password, method: "totp" });

            if (error) return pesanAuthError(error);

            if (data.method === "totp") {
              setSetup({ uri: data.totpURI, backupCodes: data.backupCodes });
            }
          } else if (mode === "disable") {
            const { error } = await authClient.twoFactor.disable({ password });

            if (error) return pesanAuthError(error);

            toast.success("Autentikasi dua faktor dinonaktifkan.");
            router.refresh();
          } else if (mode === "codes") {
            const { data, error } = await authClient.twoFactor.generateBackupCodes({ password });

            if (error) return pesanAuthError(error);

            setBackupCodes(data.backupCodes);
          }

          setMode(null);
        }}
      />

      {setup && <SetupDialog setup={setup} onDone={selesaiSetup} />}

      <Dialog open={!!backupCodes} onOpenChange={(open) => !open && setBackupCodes(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kode pemulihan baru</DialogTitle>
            <DialogDescription>Kode lama sudah tidak berlaku. Simpan kode di bawah ini di tempat aman.</DialogDescription>
          </DialogHeader>
          {backupCodes && <BackupCodes codes={backupCodes} />}
          <DialogFooter>
            <Button onClick={() => setBackupCodes(null)}>Selesai</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SetupDialog({ setup, onDone }: { setup: { uri: string; backupCodes: string[] }; onDone: () => void }) {
  const [step, setStep] = useState<"scan" | "codes">("scan");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [processing, startTransition] = useTransition();
  const secret = new URL(setup.uri).searchParams.get("secret") ?? "";

  const verifikasi = (value = code) =>
    startTransition(async () => {
      setError(undefined);
      const { error } = await authClient.twoFactor.verifyTotp({ code: value });

      if (error) {
        setCode("");
        setError(pesanAuthError(error));

        return;
      }

      toast.success("Autentikasi dua faktor diaktifkan.");
      setStep("codes");
    });

  return (
    <Dialog open onOpenChange={(open) => !open && onDone()}>
      <DialogContent>
        {step === "scan" ? (
          <>
            <DialogHeader>
              <DialogTitle>Pindai kode QR</DialogTitle>
              <DialogDescription>
                Pindai kode QR berikut dengan aplikasi authenticator, atau masukkan kunci secara manual, lalu ketik kode
                6 digit yang muncul.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-4">
              <div className="rounded-lg border bg-white p-3">
                <QRCodeSVG value={setup.uri} size={176} />
              </div>
              <div className="flex w-full items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1">
                <code className="flex-1 truncate font-mono text-xs">{secret}</code>
                <CopyButton text={secret} label="Salin kunci" />
              </div>

              <form
                className="flex w-full flex-col items-center gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  verifikasi();
                }}
              >
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={setCode}
                  onComplete={(value) => verifikasi(value)}
                  pattern={REGEXP_ONLY_DIGITS}
                  disabled={processing}
                  autoFocus
                >
                  <InputOTPGroup>
                    {Array.from({ length: 6 }, (_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <InputError message={error} />
                <Button type="submit" className="w-full" disabled={processing || code.length < 6}>
                  {processing && <Spinner />}
                  Konfirmasi
                </Button>
              </form>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Simpan kode pemulihan</DialogTitle>
              <DialogDescription>
                Gunakan salah satu kode ini untuk login jika Anda kehilangan akses ke aplikasi authenticator. Setiap kode
                hanya bisa dipakai sekali.
              </DialogDescription>
            </DialogHeader>
            <BackupCodes codes={setup.backupCodes} />
            <DialogFooter>
              <Button onClick={onDone}>Selesai</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function BackupCodes({ codes }: { codes: string[] }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/40 p-4 font-mono text-sm">
        {codes.map((code) => (
          <span key={code}>{code}</span>
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <KeyRound className="size-4" />
        Salin semua kode
        <CopyButton text={codes.join("\n")} label="Salin kode pemulihan" />
      </div>
    </div>
  );
}

/** Dialog konfirmasi password; `onConfirm` mengembalikan pesan error bila gagal. */
function PasswordPrompt({
  open,
  onOpenChange,
  title,
  submitLabel,
  destructive,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  submitLabel: string;
  destructive?: boolean;
  onConfirm: (password: string) => Promise<string | void>;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [processing, startTransition] = useTransition();

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          setPassword("");
          setError(undefined);
        }

        onOpenChange(value);
      }}
    >
      <DialogContent>
        <form
          className="grid gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(async () => {
              const message = await onConfirm(password);
              setPassword("");
              setError(message || undefined);
            });
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>Demi keamanan, konfirmasi password Anda untuk melanjutkan.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Password</Label>
            <PasswordInput
              id="confirm-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
              required
            />
            <InputError message={error} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
              Batal
            </Button>
            <Button type="submit" variant={destructive ? "destructive" : "default"} disabled={processing}>
              {processing && <Spinner />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
