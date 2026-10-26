import type { Metadata } from "next";
import { AuthHeading } from "@/components/auth-heading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { param } from "@/lib/pagination";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Masuk" };

const STATUS: Record<string, string> = {
  terdaftar: "Registrasi berhasil. Akun Anda akan aktif setelah disetujui oleh admin.",
  nonaktif: "Akun Anda telah dinonaktifkan. Silakan hubungi admin.",
  reset: "Password berhasil diubah. Silakan masuk dengan password baru.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const status = STATUS[param((await searchParams).status)];

  return (
    <>
      <AuthHeading title="Masuk ke panel IT Helpdesk" description="Gunakan username dan password akun petugas Anda" />

      {status && (
        <Alert>
          <AlertDescription>{status}</AlertDescription>
        </Alert>
      )}

      <LoginForm />
    </>
  );
}
