# IT Helpdesk

Sistem Informasi Pengaduan Kerusakan Barang & Permasalahan TI berbasis web.
Rebuild dari `it-helpdesk-laravel` (Laravel + Inertia) menggunakan:

- **Next.js 16** (App Router, Server Components, Server Actions) + **React 19** + **TypeScript**
- **PostgreSQL** + **Prisma 7** (driver adapter `@prisma/adapter-pg`)
- **Better Auth** (login username/email, registrasi, reset password, 2FA TOTP, passkey)
- **shadcn/ui** + **Tailwind CSS 4**
- **pnpm**

## Fitur

**Publik (tanpa login)**

- Form pengaduan, nomor laporan otomatis (`LKTI-0001`, `LKTI-0002`, ...)
- Cek status laporan berdasarkan nomor, lengkap dengan progres & catatan petugas

**Panel admin**

- Dashboard: statistik pengaduan, grafik per bulan, pengaduan terbaru
- Pengaduan: tab per status (diajukan / diproses / selesai), pencarian, tindak lanjut & catatan petugas
- Laporan harian / bulanan / tahunan, cetak & export CSV
- Inventaris: Data PC (rakitan komponen, CAL, IP, akses internet, OS/Office), Komponen, Kategori, Merk
- Organisasi: Karyawan, Divisi, Akun Pengguna (aktivasi akun baru)
- Profil (foto, username, email), ubah password, 2FA, passkey, tema terang/gelap

## Instalasi

Butuh Node.js 22+, pnpm, dan PostgreSQL.

```bash
pnpm install
cp .env.example .env
```

Buat database PostgreSQL `it_helpdesk`, lalu sesuaikan `.env`:

- `DATABASE_URL` — koneksi PostgreSQL
- `BETTER_AUTH_SECRET` — string acak minimal 32 karakter (`openssl rand -base64 32`)
- `BETTER_AUTH_URL` — URL aplikasi (dipakai juga untuk passkey)

Kemudian:

```bash
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Buka http://localhost:3000.

Tanpa PostgreSQL terpasang, bisa memakai Postgres lokal bawaan Prisma:
jalankan `pnpm exec prisma dev`, lalu salin URL `TCP` yang ditampilkan ke `DATABASE_URL`.

## Akun default

| Username | Password |
| -------- | -------- |
| `admin`  | `admin`  |

Segera ganti password setelah login pertama. Akun yang mendaftar sendiri
berstatus non-aktif sampai diaktifkan admin di menu **Akun Pengguna**.

Belum ada mailer: tautan reset password ditulis ke log server
(`[reset-password] email: url`), setara `MAIL_MAILER=log` di versi Laravel.

## Script

| Perintah          | Keterangan                                    |
| ----------------- | --------------------------------------------- |
| `pnpm dev`        | Server development                            |
| `pnpm build`      | Build produksi                                |
| `pnpm start`      | Jalankan hasil build                          |
| `pnpm typecheck`  | Generate tipe route + `tsc`                   |
| `pnpm lint`       | ESLint                                        |
| `pnpm db:migrate` | Buat/terapkan migrasi (development)           |
| `pnpm db:deploy`  | Terapkan migrasi (produksi)                   |
| `pnpm db:seed`    | Isi data awal                                 |
| `pnpm db:reset`   | Hapus semua data, migrasi ulang (lalu `db:seed`) |
| `pnpm db:studio`  | Prisma Studio                                 |

## Struktur

```
prisma/
  schema.prisma        model data + tabel Better Auth
  seed.ts              data awal (dari database lama)
src/
  app/
    (public)/          beranda, form pengaduan, lacak
    (auth)/            login, register, lupa/reset password, 2FA
    (app)/             panel admin & pengaturan (butuh login aktif)
      admin/<modul>/   page.tsx (Server Component) + actions.ts (Server Actions)
    api/auth/          handler Better Auth
    api/avatar/        foto profil (disimpan di tabel avatars)
    logout/            keluarkan akun yang dinonaktifkan
  components/          komponen aplikasi + components/ui (shadcn)
  hooks/use-form.ts    state form → Server Action (pengganti useForm Inertia)
  lib/                 auth, prisma, sesi, validasi (zod), format tanggal
```

## Pemetaan dari versi Laravel

| Laravel                                   | Next.js                                          |
| ----------------------------------------- | ------------------------------------------------ |
| Controller + Inertia page                 | `page.tsx` (Server Component) + komponen client  |
| `$request->validate()` / Form Request     | Zod di `actions.ts`, error per field             |
| `Inertia::flash('toast')`                 | `ActionResult.message` → toast sonner            |
| Fortify (login, register, 2FA, passkey)   | Better Auth + plugin username/twoFactor/passkey  |
| Middleware `auth`, `active`               | `requireUser()` di layout `(app)` & tiap action  |
| `Pengaduan::buat()` + `lockForUpdate`     | transaksi + `pg_advisory_xact_lock`              |
| `SoftDeletes` (komputer)                  | kolom `deleted_at`                               |
| Storage `public` (avatar)                 | tabel `avatars` + route `/api/avatar/[id]`       |
| `config/helpdesk.php`                     | `src/lib/helpdesk.ts` + `.env`                   |
