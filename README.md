# IT Helpdesk

Aplikasi pengaduan kerusakan barang dan permasalahan TI untuk lingkungan kantor.
Karyawan melapor lewat form tanpa perlu akun, lalu memantau penanganannya dengan nomor laporan.
Petugas IT menindaklanjuti laporan, mencatat inventaris PC, dan menarik rekap periodik.

Ini adalah rebuild dari `it-helpdesk-laravel` ke Next.js 16, PostgreSQL, Prisma 7, Better Auth, dan shadcn/ui.
Fitur dan data awalnya sama dengan versi Laravel.

## Alur laporan

1. Karyawan mengisi form di `/pengaduan`: nama, jabatan, unit kerja, kendala, dan keterangan.
2. Laporan langsung mendapat nomor berurutan, misalnya `LKTI-0007`. Nomor ini yang dipakai untuk mengecek status.
3. Petugas melihatnya di antrean "Perlu ditangani" pada dashboard, mengubah status (diajukan, diproses, selesai), dan menulis catatan.
4. Karyawan membuka `/lacak`, memasukkan nomor laporan, dan melihat status beserta catatan petugas.

## Isi aplikasi

Halaman publik, tanpa login: form pengaduan, halaman konfirmasi nomor laporan, dan cek status.

Panel petugas:

- Dashboard dengan antrean pengaduan yang paling lama menunggu, jumlah per status, dan grafik per bulan
- Daftar pengaduan per status dengan pencarian, halaman detail, dan form tindak lanjut
- Laporan harian, bulanan, atau tahunan yang bisa dicetak atau diunduh sebagai CSV
- Data PC lengkap dengan rakitan komponen, CAL, IP, akses internet, sistem operasi, dan Office
- Master komponen, kategori, merk, karyawan, dan divisi
- Aktivasi akun petugas baru
- Pengaturan profil dan foto, ganti password, autentikasi dua faktor (TOTP), passkey, serta tema terang dan gelap

## Menjalankan di komputer sendiri

Yang dibutuhkan: Node.js 22 atau lebih baru, pnpm, dan PostgreSQL.

```bash
pnpm install
cp .env.example .env
```

Isi `.env`:

| Variabel | Isi |
| --- | --- |
| `DATABASE_URL` | Koneksi PostgreSQL, misalnya `postgresql://postgres:postgres@localhost:5432/it_helpdesk` |
| `DATABASE_POOL_MAX` | Kosongkan untuk PostgreSQL biasa. Isi `1` bila memakai `prisma dev` (lihat di bawah) |
| `BETTER_AUTH_SECRET` | String acak minimal 32 karakter, misalnya hasil `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Alamat aplikasi, misalnya `http://localhost:3000`. Passkey hanya berlaku di domain ini |
| `NEXT_PUBLIC_APP_NAME` | Nama yang tampil di aplikasi |
| `HELPDESK_PREFIX_NOMOR` | Awalan nomor laporan, bawaannya `LKTI-` |
| `NEXT_PUBLIC_APP_TIMEZONE` | Zona waktu tanggal lapor dan laporan, bawaannya `Asia/Jakarta` |

Buat tabel, isi data awal, lalu jalankan:

```bash
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Aplikasi berjalan di http://localhost:3000.

Kalau PostgreSQL belum terpasang, untuk development bisa memakai Postgres lokal bawaan Prisma.
Jalankan `pnpm exec prisma dev -n it-helpdesk -d`, salin URL `TCP` yang ditampilkan ke `DATABASE_URL`,
dan isi `DATABASE_POOL_MAX` dengan `1`. Server ini tidak tahan banyak koneksi bersamaan, jadi jangan dipakai untuk produksi.

## Akun awal

Seeder membuat satu akun admin dengan username `admin` dan password `admin`. Ganti password itu setelah login pertama.

Petugas lain mendaftar sendiri di `/register`. Akun mereka belum bisa dipakai sampai admin mengaktifkannya di menu Akun Pengguna.
Akun yang dinonaktifkan langsung keluar dari semua perangkat.

## Batasan saat ini

- Belum ada pengiriman email. Tautan reset password ditulis ke log server dalam format `[reset-password] email: url`.
- Belum ada test otomatis. Alur utama diuji manual di browser: form publik, login, 2FA, registrasi dan aktivasi, CRUD, laporan, dan tampilan ponsel.
- Passkey sudah terpasang tetapi belum diuji di perangkat nyata.
- Belum ada `DESIGN.md`. Warna dan font masih mengikuti versi Laravel ditambah preset shadcn, belum dari arahan desain tertulis.

## Perintah

| Perintah | Kegunaan |
| --- | --- |
| `pnpm dev` | Server development |
| `pnpm build` lalu `pnpm start` | Build dan jalankan versi produksi |
| `pnpm typecheck` | Generate tipe route lalu `tsc` |
| `pnpm lint` | ESLint |
| `pnpm db:migrate` | Buat dan terapkan migrasi saat development |
| `pnpm db:deploy` | Terapkan migrasi di server produksi |
| `pnpm db:seed` | Isi data awal |
| `pnpm db:reset` | Hapus semua data dan migrasi ulang, lalu jalankan `pnpm db:seed` |
| `pnpm db:studio` | Buka Prisma Studio |

## Struktur folder

```
prisma/
  schema.prisma        model data helpdesk dan tabel Better Auth
  seed.ts              data awal dari database lama
src/
  app/
    (public)/          beranda, form pengaduan, cek status
    (auth)/            login, daftar, lupa dan reset password, 2FA
    (app)/             panel petugas dan pengaturan, wajib login dengan akun aktif
      admin/<modul>/   page.tsx untuk tampilan, actions.ts untuk simpan dan hapus
    api/auth/          endpoint Better Auth
    api/avatar/        foto profil, disimpan di tabel avatars
    logout/            mengeluarkan akun yang sudah dinonaktifkan
  components/          komponen aplikasi, dan components/ui dari shadcn
  hooks/use-form.ts    state form yang dikirim ke Server Action
  lib/                 auth, prisma, sesi, validasi zod, format tanggal
anti-slop/             laporan audit tampilan dan aksesibilitas
```

## Catatan teknis

Nomor laporan dibuat di dalam transaksi dengan `pg_advisory_xact_lock`, jadi dua laporan yang masuk bersamaan tidak mendapat nomor yang sama.

Setiap Server Action memeriksa sesi sendiri lewat `requireUser()`, tidak hanya mengandalkan layout. Input divalidasi dengan Zod, dan pesan error dikembalikan per field.

Di perangkat sentuh, tombol dan input membesar ke minimal 44 px lewat varian Tailwind `pointer-coarse:`.
Tampilan desktop dengan mouse tetap rapat. Tab status pengaduan memakai container query karena lebar area konten
berubah ketika sidebar dibuka, bukan hanya ketika layar mengecil.

`src/hooks/use-form.ts` sengaja memakai arrow function untuk `setData`. React Compiler 1.0 membiarkan
function declaration yang ber-overload bernilai `undefined` pada render pertama.
