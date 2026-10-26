"use client";

import { Save } from "lucide-react";
import InputError from "@/components/input-error";
import type { Option } from "@/components/select-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { StatusPengaduan } from "@/generated/prisma/enums";
import { useForm } from "@/hooks/use-form";
import { cn } from "@/lib/utils";
import { tindakLanjutPengaduan } from "../actions";

export function TindakLanjutForm({
  id,
  status,
  catatanPetugas,
  statusOptions,
}: {
  id: number;
  status: StatusPengaduan;
  catatanPetugas: string;
  statusOptions: Option[];
}) {
  const form = useForm({ status, catatan_petugas: catatanPetugas });

  return (
    <form
      className="lg:col-span-2"
      onSubmit={(event) => {
        event.preventDefault();
        form.submit(tindakLanjutPengaduan.bind(null, id));
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Tindak lanjut</CardTitle>
          <CardDescription>Perbarui status dan beri catatan untuk pelapor</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-3">
            <Label>Status</Label>
            <RadioGroup
              value={form.data.status}
              onValueChange={(value) => form.setData("status", value as StatusPengaduan)}
              className="gap-2"
            >
              {statusOptions.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`status-${option.value}`}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 font-normal transition-colors hover:bg-muted/50",
                    form.data.status === option.value && "border-primary bg-primary/5",
                  )}
                >
                  <RadioGroupItem id={`status-${option.value}`} value={option.value} />
                  {option.label}
                </Label>
              ))}
            </RadioGroup>
            <InputError message={form.errors.status} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="catatan_petugas">Catatan dari petugas</Label>
            <Textarea
              id="catatan_petugas"
              rows={6}
              value={form.data.catatan_petugas}
              onChange={(e) => form.setData("catatan_petugas", e.target.value)}
              placeholder="Mis. sudah dicek, kabel LAN diganti, aplikasi normal kembali."
            />
            <p className="text-xs text-muted-foreground">
              Catatan ini dapat dilihat pelapor pada halaman cek status.
            </p>
            <InputError message={form.errors.catatan_petugas} />
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t">
          <Button type="button" variant="ghost" onClick={form.reset} disabled={!form.isDirty || form.processing}>
            Reset
          </Button>
          <Button type="submit" disabled={form.processing}>
            {form.processing ? <Spinner /> : <Save />}
            Simpan
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
