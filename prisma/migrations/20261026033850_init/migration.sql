-- CreateEnum
CREATE TYPE "StatusPengaduan" AS ENUM ('diajukan', 'diproses', 'selesai');

-- CreateTable
CREATE TABLE "divisi" (
    "id" SERIAL NOT NULL,
    "kode" VARCHAR(30) NOT NULL,
    "nama" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "divisi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kategori" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merk" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "komponen" (
    "id" SERIAL NOT NULL,
    "kategori_id" INTEGER NOT NULL,
    "merk_id" INTEGER NOT NULL,
    "tipe" TEXT NOT NULL,
    "spesifikasi" TEXT NOT NULL,
    "keterangan" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "komponen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "karyawan" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "divisi_id" INTEGER,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "karyawan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "komputer" (
    "id" SERIAL NOT NULL,
    "karyawan_id" INTEGER,
    "nama_pc" TEXT NOT NULL,
    "cal" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ip_address" VARCHAR(45),
    "akses_internet" BOOLEAN NOT NULL DEFAULT false,
    "sistem_operasi" TEXT,
    "office" TEXT,
    "catatan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "komputer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rakitan" (
    "id" SERIAL NOT NULL,
    "komputer_id" INTEGER NOT NULL,
    "komponen_id" INTEGER NOT NULL,
    "barcode" TEXT,
    "jumlah" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rakitan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengaduan" (
    "id" SERIAL NOT NULL,
    "nomor" VARCHAR(20) NOT NULL,
    "nama_pelapor" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "divisi_id" INTEGER,
    "kendala" TEXT NOT NULL,
    "keterangan" TEXT NOT NULL,
    "status" "StatusPengaduan" NOT NULL DEFAULT 'diajukan',
    "catatan_petugas" TEXT,
    "petugas_id" TEXT,
    "tanggal_lapor" DATE NOT NULL,
    "selesai_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengaduan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avatars" (
    "user_id" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "mime" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avatars_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" VARCHAR(30) NOT NULL,
    "display_username" TEXT,
    "nip" VARCHAR(30),
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_enabled" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMP(3),
    "refresh_token_expires_at" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "two_factors" (
    "id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backup_codes" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "verified" BOOLEAN DEFAULT true,
    "failed_verification_count" INTEGER DEFAULT 0,
    "locked_until" TIMESTAMP(3),

    CONSTRAINT "two_factors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passkeys" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "public_key" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "credential_id" TEXT NOT NULL,
    "counter" INTEGER NOT NULL,
    "device_type" TEXT NOT NULL,
    "backed_up" BOOLEAN NOT NULL,
    "transports" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "aaguid" TEXT,

    CONSTRAINT "passkeys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "divisi_kode_key" ON "divisi"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "kategori_nama_key" ON "kategori"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "merk_nama_key" ON "merk"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "pengaduan_nomor_key" ON "pengaduan"("nomor");

-- CreateIndex
CREATE INDEX "pengaduan_status_idx" ON "pengaduan"("status");

-- CreateIndex
CREATE INDEX "pengaduan_tanggal_lapor_idx" ON "pengaduan"("tanggal_lapor");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_nip_key" ON "users"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE INDEX "verifications_identifier_idx" ON "verifications"("identifier");

-- CreateIndex
CREATE INDEX "two_factors_secret_idx" ON "two_factors"("secret");

-- CreateIndex
CREATE INDEX "two_factors_user_id_idx" ON "two_factors"("user_id");

-- CreateIndex
CREATE INDEX "passkeys_user_id_idx" ON "passkeys"("user_id");

-- CreateIndex
CREATE INDEX "passkeys_credential_id_idx" ON "passkeys"("credential_id");

-- AddForeignKey
ALTER TABLE "komponen" ADD CONSTRAINT "komponen_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "komponen" ADD CONSTRAINT "komponen_merk_id_fkey" FOREIGN KEY ("merk_id") REFERENCES "merk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "karyawan" ADD CONSTRAINT "karyawan_divisi_id_fkey" FOREIGN KEY ("divisi_id") REFERENCES "divisi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "komputer" ADD CONSTRAINT "komputer_karyawan_id_fkey" FOREIGN KEY ("karyawan_id") REFERENCES "karyawan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rakitan" ADD CONSTRAINT "rakitan_komputer_id_fkey" FOREIGN KEY ("komputer_id") REFERENCES "komputer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rakitan" ADD CONSTRAINT "rakitan_komponen_id_fkey" FOREIGN KEY ("komponen_id") REFERENCES "komponen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengaduan" ADD CONSTRAINT "pengaduan_divisi_id_fkey" FOREIGN KEY ("divisi_id") REFERENCES "divisi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengaduan" ADD CONSTRAINT "pengaduan_petugas_id_fkey" FOREIGN KEY ("petugas_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avatars" ADD CONSTRAINT "avatars_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "two_factors" ADD CONSTRAINT "two_factors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passkeys" ADD CONSTRAINT "passkeys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
