"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { failure, fieldErrors, success, zodErrors, type ActionResult } from "@/lib/action";
import { CAL_OPTIONS } from "@/lib/helpdesk";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { idOpsional, idWajib, teks, teksOpsional } from "@/lib/validation";

const calKeys = Object.keys(CAL_OPTIONS) as [string, ...string[]];

const schema = z
  .object({
    karyawan_id: idOpsional(),
    nama_pc: teks("Nama PC", 100),
    cal: z.array(z.enum(calKeys, { error: "CAL yang dipilih tidak valid." })).default([]),
    ip_address: z
      .string()
      .trim()
      .refine((v) => v === "" || z.ipv4().safeParse(v).success || z.ipv6().safeParse(v).success, {
        message: "IP address tidak valid.",
      })
      .transform((v) => v || null),
    akses_internet: z.boolean(),
    sistem_operasi: teksOpsional("Operating system", 100),
    office: teksOpsional("Office", 100),
    catatan: teksOpsional("Catatan", 2000),
    rakitan: z
      .array(
        z.object({
          komponen_id: idWajib("Komponen"),
          barcode: teksOpsional("Barcode", 100),
          jumlah: z.coerce
            .number({ error: "Jumlah wajib diisi." })
            .int("Jumlah harus bilangan bulat.")
            .min(1, "Jumlah minimal 1.")
            .max(99, "Jumlah maksimal 99."),
        }),
      )
      .default([]),
  })
  .superRefine((data, ctx) => {
    const seen = new Set<number>();
    data.rakitan.forEach((r, index) => {
      if (seen.has(r.komponen_id)) {
        ctx.addIssue({ code: "custom", path: ["rakitan", index, "komponen_id"], message: "Komponen sudah dipilih di baris lain." });
      }
      seen.add(r.komponen_id);
    });
  });

async function validasi(input: unknown) {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return { error: zodErrors(parsed.error) } as const;
  }

  const data = parsed.data;
  const errors: Record<string, string> = {};

  if (data.karyawan_id && !(await prisma.karyawan.count({ where: { id: data.karyawan_id } }))) {
    errors.karyawan_id = "Karyawan yang dipilih tidak valid.";
  }

  const ids = data.rakitan.map((r) => r.komponen_id);
  const ada = new Set(
    (await prisma.komponen.findMany({ where: { id: { in: ids } }, select: { id: true } })).map((k) => k.id),
  );
  data.rakitan.forEach((r, index) => {
    if (!ada.has(r.komponen_id)) {
      errors[`rakitan.${index}.komponen_id`] = "Komponen yang dipilih tidak valid.";
    }
  });

  if (Object.keys(errors).length) {
    return { error: fieldErrors(errors) } as const;
  }

  return { data } as const;
}

function kolom(data: z.output<typeof schema>) {
  return {
    karyawanId: data.karyawan_id,
    namaPc: data.nama_pc,
    cal: data.cal,
    ipAddress: data.ip_address,
    aksesInternet: data.akses_internet,
    sistemOperasi: data.sistem_operasi,
    office: data.office,
    catatan: data.catatan,
  };
}

function rakitan(data: z.output<typeof schema>) {
  return data.rakitan.map((r) => ({ komponenId: r.komponen_id, barcode: r.barcode, jumlah: r.jumlah }));
}

export async function tambahKomputer(input: unknown): Promise<ActionResult> {
  await requireUser();
  const result = await validasi(input);

  if (result.error) {
    return result.error;
  }

  const komputer = await prisma.komputer.create({
    data: { ...kolom(result.data), rakitan: { create: rakitan(result.data) } },
  });

  refresh();

  return success(`PC ${komputer.namaPc} berhasil ditambahkan.`, `/admin/komputer/${komputer.id}`);
}

export async function ubahKomputer(id: number, input: unknown): Promise<ActionResult> {
  await requireUser();
  const result = await validasi(input);

  if (result.error) {
    return result.error;
  }

  if (!(await prisma.komputer.count({ where: { id, deletedAt: null } }))) {
    return failure("Data PC tidak ditemukan.");
  }

  const komputer = await prisma.$transaction(async (tx) => {
    await tx.rakitan.deleteMany({ where: { komputerId: id } });

    return tx.komputer.update({
      where: { id },
      data: { ...kolom(result.data), rakitan: { create: rakitan(result.data) } },
    });
  });

  refresh();

  return success(`PC ${komputer.namaPc} berhasil diperbarui.`, `/admin/komputer/${komputer.id}`);
}

/** Soft delete: data PC disembunyikan, riwayat rakitan tetap tersimpan. */
export async function hapusKomputer(id: number, dariDetail = false): Promise<ActionResult> {
  await requireUser();

  const komputer = await prisma.komputer.update({ where: { id }, data: { deletedAt: new Date() } });

  refresh();

  return success(`PC ${komputer.namaPc} telah dihapus.`, dariDetail ? "/admin/komputer" : undefined);
}
