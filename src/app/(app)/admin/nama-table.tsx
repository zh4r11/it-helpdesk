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
import type { ActionResult } from "@/lib/action";

type Row = { id: number; nama: string; _count: { komponen: number } };

/**
 * Tabel master data yang hanya berisi kolom nama (kategori & merk).
 */
export function NamaTable({
  rows,
  entitas,
  title,
  description,
  store,
  update,
  destroy,
}: {
  rows: Row[];
  entitas: string;
  title: string;
  description: string;
  store: (data: { nama: string }) => Promise<ActionResult>;
  update: (id: number, data: { nama: string }) => Promise<ActionResult>;
  destroy: (id: number) => Promise<ActionResult>;
}) {
  const { cari, setCari, hasil } = useClientSearch(rows, (r) => [r.nama]);
  const crud = useCrudDialog<Row, { nama: string }>({
    empty: { nama: "" },
    toForm: (r) => ({ nama: r.nama }),
    store,
    update,
  });

  return (
    <>
      <PageHeader title={title} description={description}>
        <Button onClick={crud.openCreate}>
          <Plus />
          Tambah {entitas}
        </Button>
      </PageHeader>

      <ClientSearchInput value={cari} onChange={setCari} placeholder={`Cari ${entitas}...`} />

      <DataTableCard
        rows={hasil}
        rowKey={(r) => r.id}
        emptyText={
          cari
            ? `Tidak ada ${entitas} yang cocok dengan "${cari}".`
            : `Belum ada ${entitas}. Tambahkan lewat tombol Tambah ${entitas}.`
        }
        columns={[
          { header: "No", cell: (_, i) => i + 1, className: "w-12 text-muted-foreground" },
          { header: `Nama ${entitas}`, cell: (r) => <span className="font-medium">{r.nama}</span> },
          {
            header: "Jumlah komponen",
            cell: (r) => <Badge variant="secondary">{r._count.komponen}</Badge>,
            className: "w-40",
          },
          {
            header: "Aksi",
            cell: (r) => (
              <RowActions
                onEdit={() => crud.openEdit(r)}
                destroy={() => destroy(r.id)}
                deleteTitle={`Hapus ${entitas} ${r.nama}?`}
              />
            ),
            className: "w-24 text-right",
          },
        ]}
      />

      <FormDialog
        open={crud.open}
        onOpenChange={crud.setOpen}
        title={crud.editing ? `Ubah ${entitas}` : `Tambah ${entitas}`}
        processing={crud.form.processing}
        onSubmit={crud.submit}
      >
        <div className="grid gap-2">
          <Label htmlFor="nama">Nama {entitas}</Label>
          <Input
            id="nama"
            value={crud.form.data.nama}
            onChange={(e) => crud.form.setData("nama", e.target.value)}
            aria-invalid={!!crud.form.errors.nama}
            autoFocus
          />
          <InputError message={crud.form.errors.nama} />
        </div>
      </FormDialog>
    </>
  );
}
