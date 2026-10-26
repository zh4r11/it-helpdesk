# Tindak lanjut audit 001 (2026-10-27)

Disetujui: semua HIGH (1 sampai 11). Diperbaiki: 1 sampai 8 dan 11.
Menunggu masukan pemilik: 9 (arahan desain) dan 10 (nomor ekstensi). MEDIUM dan LOW tidak disentuh.

## Hasil per nomor

| No | Aturan | Status | Perubahan dan bukti |
|----|--------|--------|---------------------|
| 1 | R-25 | Selesai | `--primary` mode gelap jadi `#155DFC`. Terukur di browser: teks `#FAFAFA` di atas `#155DFC` = 5.03:1. |
| 2 | R-25 | Selesai | `--chart-1` mode terang jadi `#E17100` (3.20:1 terhadap kartu). Segmen bertumpuk diberi garis warna kartu sebagai pemisah. |
| 3 | R-32 | Selesai | `--ring` terang `#155DFC` (5.25:1), gelap `#2B7FFF` (5.26:1 terhadap latar, 4.77:1 terhadap kartu). Ring dipakai penuh (`ring-ring`, bukan `/50`) di 13 komponen UI dan `outline-ring` global. Terukur saat Tab: cincin 3 px warna ring penuh. |
| 4 | R-32 | Selesai | Tombol tampilkan password bisa dijangkau Tab, aktif dengan Enter, punya `aria-pressed` dan ring fokus. Ditemukan saat pengujian: `tabIndex={5}` di link "Lupa password?" mengacak urutan Tab, ikut dihapus. Tombol polos lain (hapus pencarian, tab tema, tautan kode pemulihan, TextLink) diberi ring fokus. |
| 5 | R-03 | Selesai | Di perangkat sentuh (`pointer: coarse`) tombol, input, select, tab, item menu, sidebar, breadcrumb, dan slot OTP jadi minimal 44 px. Checkbox, switch, dan radio diberi area sentuh 44 px. Tampilan desktop (mouse) tidak berubah. Terukur di 17 halaman pada 375 px: 0 kontrol di bawah 44 px (sebelumnya hampir semua), tanpa overflow horizontal. |
| 6 | R-03 / R-32 | Selesai | Teks link header publik memakai `sr-only sm:not-sr-only`. Terukur di 375 px: "Ajukan Laporan", "Cek Status", "Dashboard" terbaca; link aktif punya `aria-current="page"`. |
| 7 | R-27 | Selesai | `loading.tsx` di `(app)` dan `(public)`; `error.tsx` di `(app)`, `(public)`, dan root. Diuji dengan mematikan database: muncul "Halaman ini gagal dimuat" beserta kode digest; setelah database hidup, "Muat ulang" memulihkan halaman. |
| 8 | R-27 | Selesai | Pesan kosong membedakan "belum ada data" (menyebut langkah berikutnya) dari "tidak cocok dengan pencarian/filter". Terverifikasi di Data PC, Pengaduan, dan Laporan. |
| 9 | R-37 | Menunggu | Butuh arahan desain dari pemilik (identitas, palet, tipografi, suasana). |
| 10 | R-38 | Selesai | Atas keputusan pemilik, kalimat "Hubungi tim IT di ekstensi kantor" dihapus dari footer. |
| 11 | R-02 | Selesai | Em dash di README diganti titik dua; `DATABASE_POOL_MAX` ikut didokumentasikan. Tidak ada em dash tersisa selain di `AGENTS.md` (ditulis ulang otomatis oleh `next dev`). |

## MEDIUM dan LOW (disetujui pada putaran kedua)

| No | Aturan | Status | Perubahan dan alasan tertulis (R-31) |
|----|--------|--------|--------------------------------------|
| 12 | R-09 | Selesai | Pil di atas H1 beranda dihapus; judul sudah membawa pesannya. |
| 13 | R-01 | Selesai | Gradien radial di belakang hero dihapus; tidak ada alasan hierarki atau merek untuknya. Fokus hero kini kartu cek status (satu-satunya elemen berbayang, karena itu aksi utama halaman). |
| 14 | R-14 / R-05 | Selesai | Empat kartu seragam diganti daftar bernomor berurutan dengan garis penghubung. Tiap langkah menyebut pelakunya (Anda / Tim IT); satu-satunya aksen warna menandai langkah yang dikerjakan tim IT. Angka langkah kini berkontras penuh. Judul jadi "Alur laporan Anda". |
| 15 | R-06 | Selesai | Font sans kembali ke Instrument Sans. Alasan: font versi Laravel, jadi tampilan tetap dikenali pengguna lama. Geist Mono dipertahankan untuk nomor laporan dan IP yang dibaca per karakter. Terverifikasi: `font-family` body = Instrument Sans, font termuat. |
| 16 | R-04 | Selesai | Keputusan: Lucide dipertahankan. Alasan: dipakai juga di versi Laravel dan terintegrasi dengan shadcn; setiap ikon dipilih karena relevan dengan isinya. Satu ikon yang tidak relevan diganti: "Form Pengaduan" di sidebar dari `Boxes` ke `Send` (sama dengan "Ajukan Laporan" di header publik). |
| 17 | C-3 / R-05 | Selesai | Dashboard disusun ulang di sekitar keputusan petugas: "pengaduan mana yang ditangani berikutnya". Panel utama kini "Perlu ditangani" (status diajukan, paling lama menunggu di atas, dengan label lama menunggu). Grafik pindah ke samping. Empat kartu besar inventaris jadi satu baris tautan ringkas; "Akun menunggu aktivasi" disorot amber hanya bila ada. Diuji dengan satu pengaduan uji (LKTI-0006, sudah dihapus lagi). |
| 18 | antislop-code | Selesai | Komentar yang hanya mengulang nama dihapus di `users/actions.ts`, `theme-toggle.tsx`, `form-dialog.tsx`, `row-actions.tsx`, `data-table-card.tsx`. Kode tidak diubah. |

Kontras baru yang diukur: teks lama menunggu `#BB4D00` di atas kartu terang 5.03:1; teks redup di chip amber 4.57:1 (terang) dan 6.37:1 (gelap).

## Pemeriksaan

- `pnpm typecheck` dan `pnpm lint` bersih.
- Diklik di browser: password toggle (Tab, Enter), tab tema, form pengaduan (Tab ke Jabatan, ring tampil), "Muat ulang" di halaman error.

## Catatan baru (di luar nomor yang disetujui)

- Tab tema di Pengaturan > Tampilan ternyata memakai `neutral-500` di atas `neutral-100` (4.35:1). Masuk lingkup no. 3/4 (komponen yang sama), sudah dinaikkan ke `neutral-600` (7.17:1).
- Angka langkah pudar di bagian "Bagaimana cara kerjanya?" (`text-muted-foreground/30`) kontrasnya jauh di bawah 3:1. Ikut selesai bersama no. 14.
- Perubahan token warna di `globals.css` dibuat dengan satu skrip Python sekali jalan; hasilnya langsung di source dan tidak ada skrip yang tertinggal di repo. Perubahan lain memakai editor biasa.
