import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import LacakForm from "@/components/lacak-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Beranda" };

const langkah = [
  {
    title: "Ajukan laporan",
    oleh: "Anda",
    description: "Isi form pengaduan dengan kendala yang Anda alami. Tidak perlu login.",
  },
  {
    title: "Simpan nomor laporan",
    oleh: "Anda",
    description: "Setelah terkirim, Anda mendapat nomor laporan untuk memantau progres.",
  },
  {
    title: "Laporan ditangani",
    oleh: "Tim IT",
    description: "Petugas memproses laporan dan memberi catatan penanganan.",
  },
  {
    title: "Cek status kapan saja",
    oleh: "Anda",
    description: "Pantau status laporan secara mandiri menggunakan nomor laporan.",
  },
];

export default function Welcome() {
  return (
    <>
      <section className="border-b">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-16 text-center md:py-24">
          <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">Punya kendala seputar IT?</h1>
          <p className="max-w-xl text-lg text-balance text-muted-foreground">
            Laporkan kerusakan perangkat, gangguan jaringan, atau masalah aplikasi. Tim IT kami akan segera
            menindaklanjuti.
          </p>

          <Card className="w-full max-w-xl text-left shadow-lg">
            <CardHeader>
              <CardTitle>Cek status laporan Anda</CardTitle>
              <CardDescription>Masukkan nomor laporan yang Anda terima saat mengajukan pengaduan.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <LacakForm size="lg" />
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                atau
                <span className="h-px flex-1 bg-border" />
              </div>
              <Button asChild size="lg" variant="secondary" className="h-11">
                <Link href="/pengaduan">
                  Ajukan laporan baru
                  <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-14 md:py-20">
        <h2 className="text-2xl font-semibold tracking-tight">Alur laporan Anda</h2>
        <p className="mt-2 text-muted-foreground">
          Anda mengajukan dan memantau; tim IT yang menangani di tengahnya.
        </p>

        <ol className="mt-8">
          {langkah.map((item, index) => (
            <li key={item.title} className="relative flex gap-4 pb-8 last:pb-0">
              {index < langkah.length - 1 && (
                <span aria-hidden className="absolute top-10 bottom-0 left-5 w-px bg-border" />
              )}
              <span
                className={cn(
                  "relative flex size-10 shrink-0 items-center justify-center rounded-full border-2 font-semibold tabular-nums",
                  item.oleh === "Tim IT"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background",
                )}
              >
                {index + 1}
              </span>
              <div className="pt-1.5">
                <p className="font-medium">
                  {item.title}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">{item.oleh}</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
