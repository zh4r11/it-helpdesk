import { CircleCheckBig, Home, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Laporan Terkirim" };

export default async function PengaduanSuksesPage({ params }: PageProps<"/pengaduan/[nomor]/terkirim">) {
  const { nomor } = await params;
  const pengaduan = await prisma.pengaduan.findUnique({
    where: { nomor: decodeURIComponent(nomor) },
    select: { nomor: true },
  });

  if (!pengaduan) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 items-center px-4 py-12">
      <Card className="w-full text-center">
        <CardHeader className="items-center">
          <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            <CircleCheckBig className="size-7" />
          </div>
          <CardTitle className="text-xl">Laporan berhasil terkirim</CardTitle>
          <CardDescription>
            Simpan nomor laporan di bawah ini untuk mengecek status penanganan secara mandiri.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/50 p-4">
            <span className="font-mono text-2xl font-semibold tracking-wider">{pengaduan.nomor}</span>
            <CopyButton text={pengaduan.nomor} label="Salin nomor laporan" />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href={`/lacak?nomor=${encodeURIComponent(pengaduan.nomor)}`}>
                <Search />
                Cek status laporan
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <Home />
                Kembali ke beranda
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
