"use client";

import { ArrowLeft, Cpu, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import Combobox, { type ComboboxOption } from "@/components/combobox";
import InputError from "@/components/input-error";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "@/hooks/use-form";
import { CAL_OPTIONS } from "@/lib/helpdesk";
import { tambahKomputer, ubahKomputer } from "./actions";
import type { FormOptions } from "./form-options";

type RakitanForm = {
  komponen_id: string;
  barcode: string;
  jumlah: number;
};

export type KomputerAwal = {
  id: number;
  karyawanId: number | null;
  namaPc: string;
  cal: string[];
  ipAddress: string | null;
  aksesInternet: boolean;
  sistemOperasi: string | null;
  office: string | null;
  catatan: string | null;
  rakitan: { komponenId: number; barcode: string | null; jumlah: number }[];
};

const rakitanKosong = (): RakitanForm => ({ komponen_id: "", barcode: "", jumlah: 1 });

export function KomputerForm({ komputer, karyawan, komponen }: FormOptions & { komputer?: KomputerAwal }) {
  const isEdit = !!komputer;

  const form = useForm({
    karyawan_id: komputer?.karyawanId ? String(komputer.karyawanId) : "",
    nama_pc: komputer?.namaPc ?? "",
    cal: komputer?.cal ?? [],
    ip_address: komputer?.ipAddress ?? "",
    akses_internet: komputer?.aksesInternet ?? false,
    sistem_operasi: komputer?.sistemOperasi ?? "",
    office: komputer?.office ?? "",
    catatan: komputer?.catatan ?? "",
    rakitan: komputer?.rakitan.length
      ? komputer.rakitan.map((r) => ({ komponen_id: String(r.komponenId), barcode: r.barcode ?? "", jumlah: r.jumlah }))
      : [rakitanKosong()],
  });
  const { errors } = form;

  const karyawanOptions: ComboboxOption[] = karyawan.map((k) => ({
    value: String(k.id),
    label: k.nama,
    description: `${k.jabatan} · ${k.divisi?.nama ?? "-"}`,
  }));

  const komponenOptions: ComboboxOption[] = komponen.map((k) => ({
    value: String(k.id),
    label: `${k.merk.nama} ${k.tipe} ${k.spesifikasi}`,
    description: k.keterangan || undefined,
    group: k.kategori.nama,
  }));

  const setRakitan = (index: number, value: Partial<RakitanForm>) =>
    form.setData(
      "rakitan",
      form.data.rakitan.map((r, i) => (i === index ? { ...r, ...value } : r)),
    );

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    form.submit((data) => {
      // Baris tanpa komponen diabaikan.
      const payload = { ...data, rakitan: data.rakitan.filter((r) => r.komponen_id) };

      return isEdit ? ubahKomputer(komputer.id, payload) : tambahKomputer(payload);
    });
  };

  return (
    <>
      <PageHeader
        title={isEdit ? `Ubah PC ${komputer.namaPc}` : "Tambah PC"}
        description="Lengkapi identitas komputer, pengguna, dan komponen yang terpasang."
      >
        <Button asChild variant="outline">
          <Link href={isEdit ? `/admin/komputer/${komputer.id}` : "/admin/komputer"}>
            <ArrowLeft />
            Kembali
          </Link>
        </Button>
      </PageHeader>

      <form onSubmit={submit} className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Identitas komputer</CardTitle>
              <CardDescription>Nama, jaringan, dan lisensi</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="nama_pc">Computer name</Label>
                <Input
                  id="nama_pc"
                  value={form.data.nama_pc}
                  onChange={(e) => form.setData("nama_pc", e.target.value)}
                  placeholder="Mis. TI-AY"
                  aria-invalid={!!errors.nama_pc}
                />
                <InputError message={errors.nama_pc} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ip_address">IP address</Label>
                <Input
                  id="ip_address"
                  value={form.data.ip_address}
                  onChange={(e) => form.setData("ip_address", e.target.value)}
                  placeholder="Mis. 172.16.0.10"
                  className="font-mono"
                  aria-invalid={!!errors.ip_address}
                />
                <InputError message={errors.ip_address} />
              </div>
              <div className="grid gap-3">
                <Label>Client Access Licence (CAL)</Label>
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  {Object.entries(CAL_OPTIONS).map(([value, label]) => (
                    <Label key={value} className="flex items-center gap-2 font-normal">
                      <Checkbox
                        checked={form.data.cal.includes(value)}
                        onCheckedChange={(checked) =>
                          form.setData(
                            "cal",
                            checked ? [...form.data.cal, value] : form.data.cal.filter((c) => c !== value),
                          )
                        }
                      />
                      {label}
                    </Label>
                  ))}
                </div>
                <InputError message={errors.cal} />
              </div>
              <Label
                htmlFor="akses_internet"
                className="flex items-center justify-between rounded-lg border p-3 font-normal"
              >
                <span className="grid gap-0.5">
                  <span className="font-medium">Akses internet</span>
                  <span className="text-xs text-muted-foreground">Komputer diizinkan mengakses internet</span>
                </span>
                <Switch
                  id="akses_internet"
                  checked={form.data.akses_internet}
                  onCheckedChange={(v) => form.setData("akses_internet", v)}
                />
              </Label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pengguna & software</CardTitle>
              <CardDescription>Karyawan pemakai dan perangkat lunak terpasang</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="karyawan_id">Pengguna</Label>
                <div className="flex gap-2">
                  <Combobox
                    id="karyawan_id"
                    options={karyawanOptions}
                    value={form.data.karyawan_id}
                    onChange={(v) => form.setData("karyawan_id", v)}
                    placeholder="Pilih karyawan"
                    searchPlaceholder="Cari karyawan..."
                    invalid={!!errors.karyawan_id}
                  />
                  {form.data.karyawan_id && (
                    <Button type="button" variant="ghost" onClick={() => form.setData("karyawan_id", "")}>
                      Kosongkan
                    </Button>
                  )}
                </div>
                <InputError message={errors.karyawan_id} />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="sistem_operasi">Operating system</Label>
                  <Input
                    id="sistem_operasi"
                    value={form.data.sistem_operasi}
                    onChange={(e) => form.setData("sistem_operasi", e.target.value)}
                    placeholder="Mis. Windows 11 Pro"
                  />
                  <InputError message={errors.sistem_operasi} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="office">Office</Label>
                  <Input
                    id="office"
                    value={form.data.office}
                    onChange={(e) => form.setData("office", e.target.value)}
                    placeholder="Mis. Office 2021"
                  />
                  <InputError message={errors.office} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="catatan">Catatan</Label>
                <Textarea
                  id="catatan"
                  rows={4}
                  value={form.data.catatan}
                  onChange={(e) => form.setData("catatan", e.target.value)}
                  placeholder="Catatan tambahan (opsional)"
                />
                <InputError message={errors.catatan} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Rakitan komponen</CardTitle>
            <CardDescription>Komponen perangkat keras yang terpasang pada PC ini</CardDescription>
            <CardAction>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => form.setData("rakitan", [...form.data.rakitan, rakitanKosong()])}
              >
                <Plus />
                Tambah baris
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            {komponen.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-8 text-center text-sm text-muted-foreground">
                <Cpu className="size-8" />
                Belum ada komponen aktif. Tambahkan pada menu Komponen terlebih dahulu.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Komponen</TableHead>
                    <TableHead className="w-48">Barcode</TableHead>
                    <TableHead className="w-28">Jumlah</TableHead>
                    <TableHead className="w-16 pr-6" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {form.data.rakitan.map((r, index) => (
                    <TableRow key={index} className="align-top hover:bg-transparent">
                      <TableCell className="min-w-72 pl-6">
                        <Combobox
                          options={komponenOptions}
                          value={r.komponen_id}
                          onChange={(v) => setRakitan(index, { komponen_id: v })}
                          placeholder="Pilih komponen"
                          searchPlaceholder="Cari kategori, merk, tipe..."
                          invalid={!!errors[`rakitan.${index}.komponen_id`]}
                          renderValue={(o) => (
                            <>
                              <span className="text-muted-foreground">{o.group}:</span> {o.label}
                            </>
                          )}
                        />
                        <InputError className="mt-1" message={errors[`rakitan.${index}.komponen_id`]} />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={r.barcode}
                          onChange={(e) => setRakitan(index, { barcode: e.target.value })}
                          placeholder="Opsional"
                        />
                        <InputError className="mt-1" message={errors[`rakitan.${index}.barcode`]} />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          max={99}
                          value={r.jumlah}
                          onChange={(e) => setRakitan(index, { jumlah: Number(e.target.value) })}
                        />
                        <InputError className="mt-1" message={errors[`rakitan.${index}.jumlah`]} />
                      </TableCell>
                      <TableCell className="pr-6">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            form.setData(
                              "rakitan",
                              form.data.rakitan.filter((_, i) => i !== index),
                            )
                          }
                        >
                          <Trash2 />
                          <span className="sr-only">Hapus baris</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {form.data.rakitan.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                        Belum ada komponen. Klik “Tambah baris”.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter className="justify-end gap-2 border-t">
            <Button type="submit" disabled={form.processing}>
              {form.processing ? <Spinner /> : <Save />}
              {isEdit ? "Simpan perubahan" : "Simpan PC"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </>
  );
}
