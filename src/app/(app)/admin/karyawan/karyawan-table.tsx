"use client";

import { Plus, Users } from "lucide-react";
import DataTableCard from "@/components/data-table-card";
import FormDialog from "@/components/form-dialog";
import InputError from "@/components/input-error";
import PageHeader from "@/components/page-header";
import RowActions from "@/components/row-actions";
import { ClientSearchInput, useClientSearch } from "@/components/search-input";
import SelectField from "@/components/select-field";
import { AktifBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { hapusKaryawan, tambahKaryawan, ubahKaryawan } from "./actions";

type Karyawan = {
  id: number;
  nama: string;
  jabatan: string;
  divisiId: number | null;
  aktif: boolean;
  divisi: { nama: string } | null;
  _count: { komputer: number };
};

type KaryawanForm = {
  nama: string;
  jabatan: string;
  divisi_id: string;
  aktif: boolean;
};

export function KaryawanTable({
  karyawan,
  divisi,
  jabatan,
}: {
  karyawan: Karyawan[];
  divisi: { id: number; nama: string }[];
  jabatan: string[];
}) {
  const { cari, setCari, hasil } = useClientSearch(karyawan, (k) => [k.nama, k.jabatan, k.divisi?.nama ?? ""]);

  const crud = useCrudDialog<Karyawan, KaryawanForm>({
    empty: { nama: "", jabatan: "", divisi_id: "", aktif: true },
    toForm: (k) => ({
      nama: k.nama,
      jabatan: k.jabatan,
      divisi_id: k.divisiId ? String(k.divisiId) : "",
      aktif: k.aktif,
    }),
    store: tambahKaryawan,
    update: ubahKaryawan,
  });
  const { form } = crud;

  return (
    <>
      <PageHeader title="Data Karyawan" description="Karyawan pengguna perangkat komputer.">
        <Button onClick={crud.openCreate}>
          <Plus />
          Tambah karyawan
        </Button>
      </PageHeader>

      <ClientSearchInput value={cari} onChange={setCari} placeholder="Cari nama, jabatan, divisi..." />

      <DataTableCard
        rows={hasil}
        rowKey={(k) => k.id}
        emptyText={
          cari
            ? `Tidak ada karyawan yang cocok dengan "${cari}".`
            : "Belum ada data karyawan. Tambahkan lewat tombol Tambah karyawan."
        }
        emptyIcon={Users}
        columns={[
          { header: "No", cell: (_, i) => i + 1, className: "w-12 text-muted-foreground" },
          { header: "Nama", cell: (k) => <span className="font-medium">{k.nama}</span> },
          { header: "Jabatan", cell: (k) => k.jabatan },
          { header: "Unit kerja", cell: (k) => k.divisi?.nama ?? "-" },
          { header: "PC", cell: (k) => k._count.komputer, className: "w-16 tabular-nums text-muted-foreground" },
          { header: "Status", cell: (k) => <AktifBadge aktif={k.aktif} />, className: "w-28" },
          {
            header: "Aksi",
            cell: (k) => (
              <RowActions
                onEdit={() => crud.openEdit(k)}
                destroy={() => hapusKaryawan(k.id)}
                deleteTitle={`Hapus karyawan ${k.nama}?`}
                deleteDescription="PC milik karyawan ini akan tetap tersimpan tanpa pengguna."
              />
            ),
            className: "w-24 text-right",
          },
        ]}
      />

      <FormDialog
        open={crud.open}
        onOpenChange={crud.setOpen}
        title={crud.editing ? "Ubah karyawan" : "Tambah karyawan"}
        processing={form.processing}
        onSubmit={crud.submit}
      >
        <div className="grid gap-2">
          <Label htmlFor="nama">Nama</Label>
          <Input
            id="nama"
            value={form.data.nama}
            onChange={(e) => form.setData("nama", e.target.value)}
            aria-invalid={!!form.errors.nama}
            autoFocus
          />
          <InputError message={form.errors.nama} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="jabatan"
            label="Jabatan"
            value={form.data.jabatan}
            onChange={(v) => form.setData("jabatan", v)}
            options={jabatan.map((j) => ({ value: j, label: j }))}
            placeholder="Pilih jabatan"
            error={form.errors.jabatan}
          />
          <SelectField
            id="divisi_id"
            label="Unit kerja"
            value={form.data.divisi_id}
            onChange={(v) => form.setData("divisi_id", v)}
            options={divisi.map((d) => ({ value: String(d.id), label: d.nama }))}
            placeholder="Pilih unit kerja"
            error={form.errors.divisi_id}
          />
        </div>
        <Label htmlFor="aktif" className="flex items-center justify-between rounded-lg border p-3 font-normal">
          <span className="grid gap-0.5">
            <span className="font-medium">Karyawan aktif</span>
            <span className="text-xs text-muted-foreground">Karyawan nonaktif tidak muncul saat menambah data PC.</span>
          </span>
          <Switch id="aktif" checked={form.data.aktif} onCheckedChange={(v) => form.setData("aktif", v)} />
        </Label>
      </FormDialog>
    </>
  );
}
