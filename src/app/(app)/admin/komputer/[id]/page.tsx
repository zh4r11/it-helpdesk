import { ArrowLeft, Cpu, Pencil, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import ConfirmDelete from "@/components/confirm-delete";
import { EmptyState } from "@/components/empty-state";
import PageHeader, { PageContainer } from "@/components/page-header";
import { AktifBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatWaktu } from "@/lib/format";
import { CAL_OPTIONS } from "@/lib/helpdesk";
import { cn } from "@/lib/utils";
import { hapusKomputer } from "../actions";
import { getKomputer } from "../get-komputer";

export async function generateMetadata({ params }: PageProps<"/admin/komputer/[id]">): Promise<Metadata> {
  const komputer = await getKomputer((await params).id);

  return { title: komputer.namaPc };
}

export default async function KomputerShowPage({ params }: PageProps<"/admin/komputer/[id]">) {
  const komputer = await getKomputer((await params).id);
  const { rakitan } = komputer;

  return (
    <PageContainer breadcrumbs={[{ title: "Data PC", href: "/admin/komputer" }, { title: "Detail" }]}>
      <PageHeader title={komputer.namaPc} description={`Terakhir diperbarui ${formatWaktu(komputer.updatedAt)}`}>
        <Button asChild variant="outline">
          <Link href="/admin/komputer">
            <ArrowLeft />
            Kembali
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/admin/komputer/${komputer.id}/edit`}>
            <Pencil />
            Ubah
          </Link>
        </Button>
        <ConfirmDelete action={hapusKomputer.bind(null, komputer.id, true)} title={`Hapus PC ${komputer.namaPc}?`}>
          <Button variant="outline" className="text-destructive">
            <Trash2 />
            Hapus
          </Button>
        </ConfirmDelete>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Pengguna</CardTitle>
          </CardHeader>
          <CardContent>
            {komputer.karyawan ? (
              <dl className="grid gap-4 text-sm">
                <Detail label="Nama">{komputer.karyawan.nama}</Detail>
                <Detail label="Jabatan">{komputer.karyawan.jabatan}</Detail>
                <Detail label="Unit kerja">{komputer.karyawan.divisi?.nama ?? "-"}</Detail>
                <Detail label="Status karyawan">
                  <AktifBadge aktif={komputer.karyawan.aktif} />
                </Detail>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">PC ini belum memiliki pengguna.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jaringan & lisensi</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 text-sm">
              <Detail label="IP address">
                <span className="font-mono">{komputer.ipAddress ?? "-"}</span>
              </Detail>
              <Detail label="Akses internet">
                <AktifBadge aktif={komputer.aksesInternet} labelAktif="Ya" labelNonaktif="Tidak" />
              </Detail>
              <Detail label="Client Access Licence">
                <div className="flex flex-wrap gap-1">
                  {komputer.cal.length
                    ? komputer.cal.map((c) => (
                        <Badge key={c} variant="secondary">
                          {CAL_OPTIONS[c] ?? c}
                        </Badge>
                      ))
                    : "-"}
                </div>
              </Detail>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Software</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 text-sm">
              <Detail label="Operating system">{komputer.sistemOperasi || "-"}</Detail>
              <Detail label="Office">{komputer.office || "-"}</Detail>
              <Detail label="Catatan">
                <span className="whitespace-pre-line">{komputer.catatan || "-"}</span>
              </Detail>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rakitan komponen</CardTitle>
          <CardDescription>{rakitan.length} komponen terpasang</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {rakitan.length === 0 ? (
            <EmptyState icon={Cpu} bare>
              Belum ada komponen terpasang. Tambahkan lewat tombol Ubah.
            </EmptyState>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Kategori</TableHead>
                <TableHead>Merk</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Spesifikasi</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead className="pr-6 text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rakitan.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="pl-6">
                    <Badge variant="secondary">{r.komponen.kategori.nama}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{r.komponen.merk.nama}</TableCell>
                  <TableCell>{r.komponen.tipe}</TableCell>
                  <TableCell>{r.komponen.spesifikasi}</TableCell>
                  <TableCell className="text-muted-foreground">{r.komponen.keterangan || "-"}</TableCell>
                  <TableCell className="font-mono text-xs">{r.barcode || "-"}</TableCell>
                  <TableCell className="pr-6 text-right tabular-nums">{r.jumlah}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function Detail({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn("space-y-1", className)}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  );
}
