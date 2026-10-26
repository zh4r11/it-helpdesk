import type { Metadata } from "next";
import { JABATAN } from "@/lib/helpdesk";
import { prisma } from "@/lib/prisma";
import { PengaduanForm } from "./pengaduan-form";

export const metadata: Metadata = { title: "Form Pengaduan" };

export default async function CreatePengaduanPage() {
  const divisi = await prisma.divisi.findMany({ orderBy: { nama: "asc" }, select: { id: true, nama: true } });

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 md:py-14">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Form Pengaduan Permasalahan TI</h1>
        <p className="text-muted-foreground">
          Jelaskan kendala Anda sejelas mungkin agar tim IT dapat menangani dengan cepat.
        </p>
      </div>

      <PengaduanForm divisi={divisi} jabatan={[...JABATAN]} />
    </div>
  );
}
