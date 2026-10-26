import { APP_TIMEZONE } from "@/lib/helpdesk";

/** Tanggal hari ini (YYYY-MM-DD) menurut zona waktu aplikasi. */
export function hariIni(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function tahunIni(): number {
  return Number(hariIni().slice(0, 4));
}

/** Kolom `@db.Date` disimpan sebagai tengah malam UTC. */
export function toDbDate(ymd: string): Date {
  return new Date(`${ymd}T00:00:00Z`);
}

export function fromDbDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
