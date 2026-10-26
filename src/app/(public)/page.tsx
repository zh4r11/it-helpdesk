import { ArrowRight, ClipboardList, MessageSquareText, SearchCheck, Wrench } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import LacakForm from "@/components/lacak-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Beranda" };

const langkah = [
  {
    icon: ClipboardList,
    title: "Ajukan laporan",
    description: "Isi form pengaduan dengan kendala yang Anda alami. Tidak perlu login.",
  },
  {
    icon: MessageSquareText,
    title: "Simpan nomor laporan",
    description: "Setelah terkirim, Anda mendapat nomor laporan untuk memantau progres.",
  },
  {
    icon: Wrench,
    title: "Ditangani tim IT",
    description: "Petugas memproses laporan dan memberi catatan penanganan.",
  },
  {
    icon: SearchCheck,
    title: "Cek status kapan saja",
    description: "Pantau status laporan secara mandiri menggunakan nomor laporan.",
  },
];

export default function Welcome() {
  return (
    <>
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-primary)_0%,transparent_60%)] opacity-[0.08]"
        />
        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center md:py-28">
          <span className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            IT Helpdesk siap membantu Anda
          </span>
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

      <section className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Bagaimana cara kerjanya?</h2>
          <p className="mt-2 text-muted-foreground">Empat langkah sederhana dari laporan sampai selesai.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {langkah.map((item, index) => (
            <Card key={item.title} className="gap-3">
              <CardHeader>
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="size-5" />
                  </span>
                  <span className="text-3xl font-semibold text-muted-foreground/30">{index + 1}</span>
                </div>
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{item.description}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
