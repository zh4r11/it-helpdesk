"use client";

import { Printer, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import InputError from "@/components/input-error";
import { SimpleSelect } from "@/components/select-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Jenis = "harian" | "bulanan" | "tahunan";

type Nilai = {
  dari: string;
  sampai: string;
  bulan: string;
  tahun: string;
  dari_tahun: string;
  sampai_tahun: string;
};

const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function FilterLaporan({
  jenis: jenisAwal,
  awal,
  errors,
  tahunTersedia,
}: {
  jenis: Jenis;
  awal: Nilai;
  errors: Record<string, string>;
  tahunTersedia: number[];
}) {
  const router = useRouter();
  const [jenis, setJenis] = useState<Jenis>(jenisAwal);
  const [data, setData] = useState(awal);

  const set = (key: keyof Nilai) => (value: string) => setData((prev) => ({ ...prev, [key]: value }));

  const tampilkan = (event: React.FormEvent) => {
    event.preventDefault();

    const fields: Record<Jenis, (keyof Nilai)[]> = {
      harian: ["dari", "sampai"],
      bulanan: ["bulan", "tahun"],
      tahunan: ["dari_tahun", "sampai_tahun"],
    };

    const params = new URLSearchParams({ jenis, tampil: "1" });
    for (const key of fields[jenis]) {
      params.set(key, data[key]);
    }

    router.push(`/admin/laporan?${params}`, { scroll: false });
  };

  const tahunOptions = tahunTersedia.map((t) => ({ value: String(t), label: String(t) }));

  return (
    <Card data-print="hide">
      <CardHeader>
        <CardTitle>Filter laporan</CardTitle>
        <CardDescription>Pilih jenis periode laporan yang ingin ditampilkan</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={tampilkan}>
          <Tabs value={jenis} onValueChange={(value) => setJenis(value as Jenis)}>
            <TabsList className="mb-4">
              <TabsTrigger value="harian">Harian</TabsTrigger>
              <TabsTrigger value="bulanan">Bulanan</TabsTrigger>
              <TabsTrigger value="tahunan">Tahunan</TabsTrigger>
            </TabsList>

            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <TabsContent value="harian" className="grid flex-1 gap-4 sm:grid-cols-2">
                <Field label="Dari tanggal" error={errors.dari}>
                  <Input type="date" value={data.dari} onChange={(e) => set("dari")(e.target.value)} required />
                </Field>
                <Field label="Sampai tanggal" error={errors.sampai}>
                  <Input
                    type="date"
                    value={data.sampai}
                    min={data.dari}
                    onChange={(e) => set("sampai")(e.target.value)}
                    required
                  />
                </Field>
              </TabsContent>

              <TabsContent value="bulanan" className="grid flex-1 gap-4 sm:grid-cols-2">
                <Field label="Bulan" error={errors.bulan}>
                  <SimpleSelect
                    value={data.bulan}
                    onChange={set("bulan")}
                    options={BULAN.map((nama, index) => ({ value: String(index + 1), label: nama }))}
                  />
                </Field>
                <Field label="Tahun" error={errors.tahun}>
                  <SimpleSelect value={data.tahun} onChange={set("tahun")} options={tahunOptions} />
                </Field>
              </TabsContent>

              <TabsContent value="tahunan" className="grid flex-1 gap-4 sm:grid-cols-2">
                <Field label="Dari tahun" error={errors.dari_tahun}>
                  <SimpleSelect value={data.dari_tahun} onChange={set("dari_tahun")} options={tahunOptions} />
                </Field>
                <Field label="Sampai tahun" error={errors.sampai_tahun}>
                  <SimpleSelect value={data.sampai_tahun} onChange={set("sampai_tahun")} options={tahunOptions} />
                </Field>
              </TabsContent>

              <Button type="submit">
                <Search />
                Tampilkan
              </Button>
            </div>
          </Tabs>
        </form>
      </CardContent>
    </Card>
  );
}

export function PrintButton({ disabled }: { disabled?: boolean }) {
  return (
    <Button variant="outline" size="sm" onClick={() => window.print()} disabled={disabled}>
      <Printer />
      Cetak
    </Button>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      <InputError message={error} />
    </div>
  );
}
