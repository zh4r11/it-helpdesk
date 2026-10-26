import type { StatusPengaduan } from "@/generated/prisma/enums";

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "IT Helpdesk";

/** Nomor laporan = prefix + nomor urut empat digit, mis. LKTI-0001. */
export const PREFIX_NOMOR = process.env.HELPDESK_PREFIX_NOMOR ?? "LKTI-";

/** Zona waktu untuk tanggal lapor dan laporan periode. */
export const APP_TIMEZONE = process.env.NEXT_PUBLIC_APP_TIMEZONE ?? "Asia/Jakarta";

/** Username akun utama yang tidak boleh dihapus atau dinonaktifkan. */
export const SUPER_ADMIN = "admin";

export const JABATAN = [
  "STAFF",
  "SENIOR OFFICER",
  "ASSISTEN MANAGER",
  "MANAGER",
  "DIREKSI-KOMISARIS",
  "LAIN-LAIN",
] as const;

/** Client Access Licence (CAL). */
export const CAL_OPTIONS: Record<string, string> = {
  server: "CAL Server",
  email: "CAL Email",
  sql: "CAL SQL",
};

export const STATUS_PENGADUAN = ["diajukan", "diproses", "selesai"] as const satisfies readonly StatusPengaduan[];

export const STATUS_LABEL: Record<StatusPengaduan, string> = {
  diajukan: "Sedang diajukan",
  diproses: "Sedang diproses",
  selesai: "Selesai diproses",
};

export function isSuperAdmin(username: string | null | undefined): boolean {
  return (username ?? "").toLowerCase() === SUPER_ADMIN;
}
