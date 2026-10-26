"use client";

import { Plus } from "lucide-react";
import DataTableCard from "@/components/data-table-card";
import FormDialog from "@/components/form-dialog";
import InputError from "@/components/input-error";
import PageHeader from "@/components/page-header";
import RowActions from "@/components/row-actions";
import { ClientSearchInput, useClientSearch } from "@/components/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { hapusDivisi, tambahDivisi, ubahDivisi } from "./actions";

type Divisi = {
  id: number;
  kode: string;
  nama: string;
  _count: { karyawan: number; pengaduan: number };
};

export function DivisiTable({ divisi }: { divisi: Divisi[] }) {
  const { cari, setCari, hasil } = useClientSearch(divisi, (d) => [d.kode, d.nama]);
  const crud = useCrudDialog<Divisi, { kode: string; nama: string }>({
    empty: { kode: "", nama: "" },
    toForm: (d) => ({ kode: d.kode, nama: d.nama }),
    store: tambahDivisi,
    update: ubahDivisi,
  });

  return (
    <>
      <PageHeader
        title="Divisi / Unit Kerja"
        description="Unit kerja yang digunakan pada form pengaduan dan data karyawan."
      >
        <Button onClick={crud.openCreate}>
          <Plus />
          Tambah divisi
        </Button>
      </PageHeader>

      <ClientSearchInput value={cari} onChange={setCari} placeholder="Cari kode atau nama divisi..." />

      <DataTableCard
        rows={hasil}
        rowKey={(d) => d.id}
        emptyText={
          cari
            ? `Tidak ada divisi yang cocok dengan "${cari}".`
            : "Belum ada divisi. Tambahkan lewat tombol Tambah divisi."
        }
        columns={[
          {
            header: "Kode",
            cell: (d) => (
              <Badge variant="outline" className="font-mono">
                {d.kode}
              </Badge>
            ),
            className: "w-40",
          },
          { header: "Nama divisi", cell: (d) => <span className="font-medium">{d.nama}</span> },
          { header: "Karyawan", cell: (d) => d._count.karyawan, className: "w-28 tabular-nums" },
          { header: "Pengaduan", cell: (d) => d._count.pengaduan, className: "w-28 tabular-nums" },
          {
            header: "Aksi",
            cell: (d) => (
              <RowActions
                onEdit={() => crud.openEdit(d)}
                destroy={() => hapusDivisi(d.id)}
                deleteTitle={`Hapus divisi ${d.nama}?`}
                deleteDescription="Karyawan dan pengaduan pada divisi ini akan kehilangan relasi unit kerjanya."
              />
            ),
            className: "w-24 text-right",
          },
        ]}
      />

      <FormDialog
        open={crud.open}
        onOpenChange={crud.setOpen}
        title={crud.editing ? "Ubah divisi" : "Tambah divisi"}
        processing={crud.form.processing}
        onSubmit={crud.submit}
      >
        <div className="grid gap-2">
          <Label htmlFor="kode">Kode</Label>
          <Input
            id="kode"
            value={crud.form.data.kode}
            onChange={(e) => crud.form.setData("kode", e.target.value)}
            aria-invalid={!!crud.form.errors.kode}
            placeholder="Mis. TI"
            autoFocus
          />
          <InputError message={crud.form.errors.kode} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="nama">Nama divisi</Label>
          <Input
            id="nama"
            value={crud.form.data.nama}
            onChange={(e) => crud.form.setData("nama", e.target.value)}
            aria-invalid={!!crud.form.errors.nama}
            placeholder="Mis. Teknologi Informasi"
          />
          <InputError message={crud.form.errors.nama} />
        </div>
      </FormDialog>
    </>
  );
}
