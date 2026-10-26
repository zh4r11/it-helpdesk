import type { NextRequest } from "next/server";
import { fromDbDate } from "@/lib/dates";
import { STATUS_LABEL } from "@/lib/helpdesk";
import { getSession } from "@/lib/session";
import { ambilPengaduan, judul, parseFilter } from "../laporan";

function csv(values: (string | null | undefined)[]): string {
  return values
    .map((value) => {
      const text = value ?? "";

      return /[";\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
    })
    .join(";");
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Unduh laporan dalam format CSV (dapat dibuka di Excel). */
export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session?.user.isActive) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { filter } = parseFilter(Object.fromEntries(request.nextUrl.searchParams));

  if (!filter) {
    return new Response("Filter laporan tidak valid.", { status: 422 });
  }

  const pengaduan = await ambilPengaduan(filter);

  const rows = [
    csv(["No. Laporan", "Tanggal", "Nama Pelapor", "Jabatan", "Unit Kerja", "Kendala", "Keterangan", "Status", "Catatan Petugas"]),
    ...pengaduan.map((p) =>
      csv([
        p.nomor,
        fromDbDate(p.tanggalLapor),
        p.namaPelapor,
        p.jabatan,
        p.divisi?.nama,
        p.kendala,
        p.keterangan,
        STATUS_LABEL[p.status],
        p.catatanPetugas,
      ]),
    ),
  ];

  // BOM agar Excel membaca UTF-8 dengan benar.
  const body = `﻿${rows.join("\r\n")}\r\n`;
  const nama = `laporan-pengaduan-${slug(judul(filter))}.csv`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=UTF-8",
      "Content-Disposition": `attachment; filename="${nama}"`,
    },
  });
}
