"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import DataTableCard from "@/components/data-table-card";
import FormDialog from "@/components/form-dialog";
import InputError from "@/components/input-error";
import PageHeader from "@/components/page-header";
import RowActions from "@/components/row-actions";
import { ClientSearchInput, useClientSearch } from "@/components/search-input";
import SelectField, { SimpleSelect } from "@/components/select-field";
import { AktifBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCrudDialog } from "@/hooks/use-crud-dialog";
import { hapusKomponen, tambahKomponen, ubahKomponen } from "./actions";

type Komponen = {
  id: number;
  kategoriId: number;
  merkId: number;
  tipe: string;
  spesifikasi: string;
  keterangan: string | null;
  aktif: boolean;
  kategori: { nama: string };
  merk: { nama: string };
  _count: { rakitan: number };
};

type Pilihan = { id: number; nama: string };

type KomponenForm = {
  kategori_id: string;
  merk_id: string;
  tipe: string;
  spesifikasi: string;
  keterangan: string;
  aktif: boolean;
};

export function KomponenTable({ komponen, kategori, merk }: { komponen: Komponen[]; kategori: Pilihan[]; merk: Pilihan[] }) {
  const [filterKategori, setFilterKategori] = useState("semua");
  const terfilter =
    filterKategori === "semua" ? komponen : komponen.filter((k) => String(k.kategoriId) === filterKategori);

  const { cari, setCari, hasil } = useClientSearch(terfilter, (k) => [
    k.tipe,
    k.spesifikasi,
    k.keterangan ?? "",
    k.merk.nama,
    k.kategori.nama,
  ]);

  const crud = useCrudDialog<Komponen, KomponenForm>({
    empty: { kategori_id: "", merk_id: "", tipe: "", spesifikasi: "", keterangan: "", aktif: true },
    toForm: (k) => ({
      kategori_id: String(k.kategoriId),
      merk_id: String(k.merkId),
      tipe: k.tipe,
      spesifikasi: k.spesifikasi,
      keterangan: k.keterangan ?? "",
      aktif: k.aktif,
    }),
    store: tambahKomponen,
    update: ubahKomponen,
  });
  const { form } = crud;

  return (
    <>
      <PageHeader title="Komponen" description="Master komponen perangkat keras yang dapat dirakit pada data PC.">
        <Button onClick={crud.openCreate}>
          <Plus />
          Tambah komponen
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-2 sm:flex-row">
        <ClientSearchInput value={cari} onChange={setCari} placeholder="Cari tipe, spesifikasi, merk..." />
        <SimpleSelect
          value={filterKategori}
          onChange={setFilterKategori}
          className="w-full sm:w-48"
          options={[
            { value: "semua", label: "Semua kategori" },
            ...kategori.map((k) => ({ value: String(k.id), label: k.nama })),
          ]}
        />
      </div>

      <DataTableCard
        rows={hasil}
        rowKey={(k) => k.id}
        emptyText="Belum ada komponen."
        columns={[
          { header: "Kategori", cell: (k) => <Badge variant="secondary">{k.kategori.nama}</Badge>, className: "w-36" },
          { header: "Merk", cell: (k) => <span className="font-medium">{k.merk.nama}</span> },
          { header: "Tipe", cell: (k) => k.tipe },
          { header: "Spesifikasi", cell: (k) => k.spesifikasi },
          {
            header: "Keterangan",
            cell: (k) => <span className="text-muted-foreground">{k.keterangan || "-"}</span>,
          },
          {
            header: "Dipakai",
            cell: (k) => `${k._count.rakitan} PC`,
            className: "w-24 tabular-nums text-muted-foreground",
          },
          { header: "Status", cell: (k) => <AktifBadge aktif={k.aktif} />, className: "w-28" },
          {
            header: "Aksi",
            cell: (k) => (
              <RowActions
                onEdit={() => crud.openEdit(k)}
                destroy={() => hapusKomponen(k.id)}
                deleteTitle={`Hapus komponen ${k.merk.nama} ${k.tipe}?`}
              />
            ),
            className: "w-24 text-right",
          },
        ]}
      />

      <FormDialog
        open={crud.open}
        onOpenChange={crud.setOpen}
        title={crud.editing ? "Ubah komponen" : "Tambah komponen"}
        processing={form.processing}
        onSubmit={crud.submit}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="kategori_id"
            label="Kategori"
            value={form.data.kategori_id}
            onChange={(v) => form.setData("kategori_id", v)}
            options={kategori.map((k) => ({ value: String(k.id), label: k.nama }))}
            placeholder="Pilih kategori"
            error={form.errors.kategori_id}
          />
          <SelectField
            id="merk_id"
            label="Merk"
            value={form.data.merk_id}
            onChange={(v) => form.setData("merk_id", v)}
            options={merk.map((m) => ({ value: String(m.id), label: m.nama }))}
            placeholder="Pilih merk"
            error={form.errors.merk_id}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="tipe">Tipe</Label>
            <Input
              id="tipe"
              value={form.data.tipe}
              onChange={(e) => form.setData("tipe", e.target.value)}
              placeholder="Mis. DDR4"
              aria-invalid={!!form.errors.tipe}
            />
            <InputError message={form.errors.tipe} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="spesifikasi">Spesifikasi</Label>
            <Input
              id="spesifikasi"
              value={form.data.spesifikasi}
              onChange={(e) => form.setData("spesifikasi", e.target.value)}
              placeholder="Mis. 8 GB"
              aria-invalid={!!form.errors.spesifikasi}
            />
            <InputError message={form.errors.spesifikasi} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="keterangan">Keterangan</Label>
          <Input
            id="keterangan"
            value={form.data.keterangan}
            onChange={(e) => form.setData("keterangan", e.target.value)}
            placeholder="Opsional, mis. 3.20 GHz"
          />
          <InputError message={form.errors.keterangan} />
        </div>
        <Label htmlFor="aktif" className="flex items-center justify-between rounded-lg border p-3 font-normal">
          <span className="grid gap-0.5">
            <span className="font-medium">Aktif</span>
            <span className="text-xs text-muted-foreground">Komponen nonaktif tidak bisa dipilih saat merakit PC.</span>
          </span>
          <Switch id="aktif" checked={form.data.aktif} onCheckedChange={(v) => form.setData("aktif", v)} />
        </Label>
      </FormDialog>
    </>
  );
}
