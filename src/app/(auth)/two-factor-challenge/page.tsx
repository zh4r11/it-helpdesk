import type { Metadata } from "next";
import { TwoFactorForm } from "./two-factor-form";

export const metadata: Metadata = { title: "Autentikasi Dua Faktor" };

export default function Page() {
  return <TwoFactorForm />;
}
