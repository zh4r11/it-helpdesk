// Data awal diambil dari database lama (sipekerba).
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "../src/generated/prisma/client";
import type { StatusPengaduan } from "../src/generated/prisma/enums";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const adminId = randomUUID();

  await prisma.user.create({
    data: {
      id: adminId,
      name: "Administrator",
      username: "admin",
      displayUsername: "admin",
      nip: "M0701001",
      email: "admin@helpdesk.test",
      emailVerified: true,
      isActive: true,
      accounts: {
        create: {
          id: randomUUID(),
          accountId: adminId,
          providerId: "credential",
          password: await hashPassword("admin"),
        },
      },
    },
  });

  const divisiData: [string, string][] = [
    ["TI", "Teknologi Informasi"],
    ["PP", "Pelayanan dan Pemeliharaan"],
    ["SPI", "Satuan Pengawasan Intern"],
    ["MGT", "Manajemen Gerbang Tol"],
    ["UMUM", "Umum"],
    ["SDM", "Sumber Daya Manusia"],
    ["TQA", "Teknik & Quality Assurance (QA)"],
    ["KEU", "Keuangan"],
    ["HKM", "Hukum"],
    ["SEKPER", "Sekretaris Perusahaan"],
    ["AKT", "Akuntansi dan Perpajakan"],
    ["PU", "Pengembangan Usaha"],
    ["SIM & Anggaran", "Sistem Informasi Manajemen dan Anggaran"],
    ["PENGADAAN", "Pengadaan"],
    ["DIRKOM", "Direksi & Komisaris"],
  ];

  const divisi: Record<string, number> = {};
  for (const [kode, nama] of divisiData) {
    divisi[kode] = (await prisma.divisi.create({ data: { kode, nama } })).id;
  }

  const kategori: Record<string, number> = {};
  for (const nama of ["Motherboard", "Processor", "Hard Disk", "Memory"]) {
    kategori[nama] = (await prisma.kategori.create({ data: { nama } })).id;
  }

  const merk: Record<string, number> = {};
  for (const nama of ["ASUS", "INTEL", "SEAGATE", "V-GEN"]) {
    merk[nama] = (await prisma.merk.create({ data: { nama } })).id;
  }

  const komponenData: [string, string, string, string, string | null][] = [
    ["Motherboard", "ASUS", "H81M", "-", null],
    ["Processor", "INTEL", "CORE I-5", "4570", "3.20 GHz"],
    ["Hard Disk", "SEAGATE", "SATA", "1 TB", null],
    ["Hard Disk", "SEAGATE", "SATA", "500 GB", null],
    ["Hard Disk", "SEAGATE", "SSD", "256 GB", null],
    ["Memory", "V-GEN", "DDR3", "8 GB", null],
  ];

  const komponen: number[] = [];
  for (const [kat, mrk, tipe, spesifikasi, keterangan] of komponenData) {
    const row = await prisma.komponen.create({
      data: { kategoriId: kategori[kat], merkId: merk[mrk], tipe, spesifikasi, keterangan, aktif: true },
    });
    komponen.push(row.id);
  }

  const karyawan: number[] = [];
  for (const nama of ["Andi Yudi", "Samsul"]) {
    const row = await prisma.karyawan.create({
      data: { nama, jabatan: "STAFF", divisiId: divisi.TI, aktif: true },
    });
    karyawan.push(row.id);
  }

  await prisma.komputer.create({
    data: {
      karyawanId: karyawan[0],
      namaPc: "TI-AY",
      cal: ["server", "email"],
      ipAddress: "172.16.0.10",
      aksesInternet: true,
      sistemOperasi: "Windows 11 Pro",
      office: "Microsoft Office 2021",
      catatan: "PC kerja divisi TI",
      rakitan: {
        create: [
          { komponenId: komponen[0], barcode: "16442", jumlah: 1 },
          { komponenId: komponen[1], barcode: "16442", jumlah: 1 },
          { komponenId: komponen[4], barcode: "16442", jumlah: 1 },
          { komponenId: komponen[2], barcode: "16442", jumlah: 1 },
          { komponenId: komponen[5], barcode: "16442", jumlah: 2 },
        ],
      },
    },
  });

  const pengaduanData: [string, string, string, string, string, string, StatusPengaduan, string, string][] = [
    ["LKTI-0001", "Marta", "STAFF", "SDM", "Aplikasi Ruang Rapat", "Tidak bisa digunakan", "selesai", "Server cek oke\nRestart PC\nTest aplikasi oke", "2022-01-04"],
    ["LKTI-0002", "Rifai", "STAFF", "UMUM", "Aplikasi Arsip", "Tidak bisa diakses", "selesai", "Gangguan dari active directory", "2022-01-04"],
    ["LKTI-0003", "Kalistus", "MANAGER", "AKT", "Aplikasi Cash Management", "Tidak bisa diakses", "selesai", "Cek aplikasi oke\nCek koneksi jaringan laptop disabled\nEnabled jaringan, aplikasi oke", "2022-01-05"],
    ["LKTI-0004", "Andi Yudi", "STAFF", "TI", "Aplikasi Help Desk", "Belum dicoba", "diproses", "Dicek dulu", "2022-02-07"],
  ];

  for (const [nomor, namaPelapor, jabatan, kodeDivisi, kendala, keterangan, status, catatanPetugas, tanggal] of pengaduanData) {
    await prisma.pengaduan.create({
      data: {
        nomor,
        namaPelapor,
        jabatan,
        divisiId: divisi[kodeDivisi],
        kendala,
        keterangan,
        status,
        catatanPetugas,
        tanggalLapor: new Date(`${tanggal}T00:00:00Z`),
        selesaiAt: status === "selesai" ? new Date(`${tanggal}T16:00:00+07:00`) : null,
      },
    });
  }

  console.info("Seed selesai. Login dengan username `admin` / password `admin`.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
