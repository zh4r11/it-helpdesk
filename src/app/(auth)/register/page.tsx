import type { Metadata } from "next";
import { AuthHeading } from "@/components/auth-heading";
import { PASSWORD_RULES_HINT } from "@/lib/validation";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Daftar" };

export default function RegisterPage() {
  return (
    <>
      <AuthHeading title="Daftar akun petugas" description="Lengkapi data di bawah untuk membuat akun" />
      <RegisterForm passwordRules={PASSWORD_RULES_HINT} />
    </>
  );
}
