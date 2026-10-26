import "server-only";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { tahunIni, toDbDate } from "@/lib/dates";
import { param } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";

export type Jenis = "harian" | "bulanan" | "tahunan";

export type Filter =
  | { jenis: "harian"; dari: string; sampai: string }
  | { jenis: "bulanan"; bulan: number; tahun: number }
  | { jenis: "tahunan"; dari_tahun: number; sampai_tahun: number };

type SearchParams = Record<string, string | string[] | undefined>;

const tanggal = (label: string) =>
  z.string({ error: `${label} wajib diisi.` }).regex(/^\d{4}-\d{2}-\d{2}$/, `${label} bukan tanggal yang valid.`);

const tahun = (label: string) =>
  z.coerce
    .number({ error: `${label} wajib diisi.` })
    .int()
    .min(2000, `${label} harus antara 2000 dan 2100.`)
    .max(2100, `${label} harus antara 2000 dan 2100.`);

const schemas = {
  harian: z
    .object({ jenis: z.literal("harian"), dari: tanggal("Dari tanggal"), sampai: tanggal("Sampai tanggal") })
    .refine((v) => v.sampai >= v.dari, { path: ["sampai"], message: "Sampai tanggal harus sama atau setelah dari tanggal." }),
  bulanan: z.object({
    jenis: z.literal("bulanan"),
    bulan: z.coerce.number().int().min(1, "Bulan tidak valid.").max(12, "Bulan tidak valid."),
    tahun: tahun("Tahun"),
  }),
  tahunan: z
    .object({ jenis: z.literal("tahunan"), dari_tahun: tahun("Dari tahun"), sampai_tahun: tahun("Sampai tahun") })
    .refine((v) => v.sampai_tahun >= v.dari_tahun, {
      path: ["sampai_tahun"],
      message: "Sampai tahun harus sama atau setelah dari tahun.",
    }),
};

/**
 * Baca filter dari query string. Laporan hanya ditampilkan bila ada `tampil`
 * dan jenis periodenya valid.
 */
export function parseFilter(query: SearchParams): {
  jenis: Jenis;
  filter: Filter | null;
  errors: Record<string, string>;
} {
  const jenisParam = param(query.jenis);
  const jenis: Jenis = jenisParam === "bulanan" || jenisParam === "tahunan" ? jenisParam : "harian";

  if (!(jenisParam in schemas) || query.tampil === undefined) {
    return { jenis, filter: null, errors: {} };
  }

  const raw = Object.fromEntries(Object.entries(query).map(([key, value]) => [key, param(value) || undefined]));
  const parsed = schemas[jenis].safeParse(raw);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      errors[String(issue.path[0])] ??= issue.message;
    }

    return { jenis, filter: null, errors };
  }

  return { jenis, filter: parsed.data as Filter, errors: {} };
}

function where(filter: Filter): Prisma.PengaduanWhereInput {
  switch (filter.jenis) {
    case "harian":
      return { tanggalLapor: { gte: toDbDate(filter.dari), lte: toDbDate(filter.sampai) } };
    case "bulanan": {
      const awal = new Date(Date.UTC(filter.tahun, filter.bulan - 1, 1));
      const akhir = new Date(Date.UTC(filter.tahun, filter.bulan, 1));

      return { tanggalLapor: { gte: awal, lt: akhir } };
    }
    case "tahunan":
      return {
        tanggalLapor: { gte: toDbDate(`${filter.dari_tahun}-01-01`), lte: toDbDate(`${filter.sampai_tahun}-12-31`) },
      };
  }
}

export function ambilPengaduan(filter: Filter) {
  return prisma.pengaduan.findMany({
    where: where(filter),
    include: { divisi: { select: { nama: true } } },
    orderBy: [{ tanggalLapor: "asc" }, { id: "asc" }],
  });
}

const tanggalPanjang = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
const bulanTahun = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" });

export function judul(filter: Filter): string {
  switch (filter.jenis) {
    case "harian":
      return filter.dari === filter.sampai
        ? tanggalPanjang.format(toDbDate(filter.dari))
        : `${tanggalPanjang.format(toDbDate(filter.dari))} - ${tanggalPanjang.format(toDbDate(filter.sampai))}`;
    case "bulanan":
      return bulanTahun.format(new Date(Date.UTC(filter.tahun, filter.bulan - 1, 1)));
    case "tahunan":
      return filter.dari_tahun === filter.sampai_tahun
        ? `Tahun ${filter.dari_tahun}`
        : `Tahun ${filter.dari_tahun} - ${filter.sampai_tahun}`;
  }
}

/** Pilihan tahun: tahun ini mundur sampai data tertua (minimal 5 tahun ke belakang). */
export async function tahunTersedia(): Promise<number[]> {
  const sekarang = tahunIni();
  const { _min } = await prisma.pengaduan.aggregate({ _min: { tanggalLapor: true } });
  const awal = Math.min(_min.tanggalLapor?.getUTCFullYear() ?? sekarang, sekarang - 5);

  return Array.from({ length: sekarang - awal + 1 }, (_, i) => sekarang - i);
}
