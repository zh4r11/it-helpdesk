"use client";

import { Info, RotateCcw, Send } from "lucide-react";
import InputError from "@/components/input-error";
import { SimpleSelect } from "@/components/select-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@/hooks/use-form";
import { kirimPengaduan } from "./actions";

type Props = {
  divisi: { id: number; nama: string }[];
  jabatan: string[];
};

export function PengaduanForm({ divisi, jabatan }: Props) {
  const form = useForm({
    nama_pelapor: "",
    jabatan: "",
    divisi_id: "",
    kendala: "",
    keterangan: "",
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        form.submit(kirimPengaduan);
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Data pelapor & kendala</CardTitle>
          <CardDescription>Semua kolom wajib diisi.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <Alert>
            <Info />
            <AlertDescription>
              Nomor laporan akan ditampilkan setelah laporan terkirim. Harap catat nomor tersebut untuk cek status
              secara mandiri.
            </AlertDescription>
          </Alert>

          <div className="grid gap-2">
            <Label htmlFor="nama_pelapor">Nama pelapor</Label>
            <Input
              id="nama_pelapor"
              value={form.data.nama_pelapor}
              onChange={(e) => form.setData("nama_pelapor", e.target.value)}
              placeholder="Nama lengkap"
              aria-invalid={!!form.errors.nama_pelapor}
              autoFocus
            />
            <InputError message={form.errors.nama_pelapor} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="jabatan">Jabatan</Label>
              <SimpleSelect
                id="jabatan"
                value={form.data.jabatan}
                onChange={(value) => form.setData("jabatan", value)}
                options={jabatan.map((item) => ({ value: item, label: item }))}
                placeholder="Pilih jabatan"
                invalid={!!form.errors.jabatan}
              />
              <InputError message={form.errors.jabatan} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="divisi_id">Unit kerja</Label>
              <SimpleSelect
                id="divisi_id"
                value={form.data.divisi_id}
                onChange={(value) => form.setData("divisi_id", value)}
                options={divisi.map((item) => ({ value: String(item.id), label: item.nama }))}
                placeholder="Pilih unit kerja"
                invalid={!!form.errors.divisi_id}
              />
              <InputError message={form.errors.divisi_id} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="kendala">Kendala</Label>
            <Input
              id="kendala"
              value={form.data.kendala}
              onChange={(e) => form.setData("kendala", e.target.value)}
              placeholder="Mis. Printer tidak bisa mencetak"
              aria-invalid={!!form.errors.kendala}
            />
            <InputError message={form.errors.kendala} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              rows={5}
              value={form.data.keterangan}
              onChange={(e) => form.setData("keterangan", e.target.value)}
              placeholder="Ceritakan detail kendala, sejak kapan terjadi, dan langkah yang sudah dicoba."
              aria-invalid={!!form.errors.keterangan}
            />
            <InputError message={form.errors.keterangan} />
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t">
          <Button type="button" variant="ghost" onClick={form.reset} disabled={form.processing}>
            <RotateCcw />
            Reset
          </Button>
          <Button type="submit" disabled={form.processing}>
            {form.processing ? <Spinner /> : <Send />}
            Kirim laporan
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
