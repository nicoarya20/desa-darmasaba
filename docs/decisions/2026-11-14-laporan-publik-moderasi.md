# Moderasi kiriman Laporan Publik

Tanggal: 2026-11-14 · Versi: 0.1.270

## Masalah
`POST /api/keamanan/laporanpublik/create` sengaja terbuka untuk warga anonim (`PUBLIC_POST_PATHS`), dan kiriman
langsung tampil di `/keamanan/laporan-publik` (status bawaan `Proses`) → spam/fitnah tampil tanpa disaring, tanpa batas
jumlah kiriman.

## Keputusan
- **Kiriman non-admin ditahan dengan status `Baru`.** Enum `StatusLaporan.Baru` sudah ada dan belum dipakai →
  **tanpa migration**. Sesi admin aktif (role 0–4) tetap memakai status bawaan schema (`Proses`, langsung tampil);
  warga anonim, user login biasa (role 5), dan admin nonaktif → `Baru`.
- **Bukan `isActive=false`.** `isActive` adalah penanda soft-delete; kalau dipakai juga untuk "menunggu", laporan yang
  dihapus dan yang belum disetujui tidak bisa dibedakan.
- **`Baru` tidak tampil ke publik** di daftar (`find-many`), detail (`/:id` → "tidak ditemukan"), dan pencarian global
  (`search/findMany`, jalur `type=laporanPublik` dan semua modul). Satu filter: `WHERE_LAPORAN_TAMPIL_PUBLIK`.
- **Tampilan moderasi lewat query opsional `?moderasi=true`** (find-many & `/:id`), hanya dihormati untuk sesi admin;
  selain itu **diabaikan** (bukan 403) dan yang berlaku tampilan publik, jadi tidak pernah membocorkan laporan tertahan.
  Param eksplisit dipilih, bukan "berbasis sesi saja", supaya admin yang sedang login lalu membuka halaman publik tidak
  melihat laporan tertahan seolah sudah tampil. State admin (`_state/keamanan/laporan-publik.ts`) selalu mengirim param ini.
- **Menyetujui = mengubah status** di halaman edit admin (opsi "Baru (menunggu verifikasi, belum tampil di publik)"
  ditambahkan; `PUT /:id` kini menerima `Baru`, jadi admin juga bisa menyembunyikan kembali). Tidak ada tombol
  "Setujui" khusus (YAGNI); di daftar/detail admin status tampil sebagai teks `Baru` berwarna merah (warna bawaan
  untuk status selain Selesai/Proses).
- **Batas kiriman non-admin: 5 per 10 menit per alamat** (`createLimiter` in-memory yang sama dengan OTP, kini
  diekspor). Lewat batas → HTTP 429 + `Retry-After` + `{ success:false, message }`. Kunci alamat: `cf-connecting-ip`
  (diisi Cloudflare, tak bisa dipalsukan pengirim) → entri pertama `x-forwarded-for` → `x-real-ip`. Limiter per proses
  dan reset saat container restart — cukup untuk deployment satu instance.
- **Umpan balik ke pelapor**: toast mengikuti status dari respons server (`Baru` → "Laporan terkirim. Akan tampil
  setelah diverifikasi admin desa."), bukan flag di klien; catatan formulir publik menyebut verifikasi.

## Kontrak API (aditif)
- `GET find-many`, `GET /:id`: query opsional `moderasi`.
- `PUT /:id`: `status` menerima nilai tambahan `Baru`.
- `POST create`: bisa membalas 429; field respons tidak berubah (status kiriman non-admin kini `Baru`).
- Perubahan perilaku: `GET /:id` laporan `Baru` tanpa tampilan moderasi → `{ success:false, message }` (bentuk yang
  sama dengan id tak ada).

## Batasan yang diketahui
- **T19** (`docs/penilaian-lomba-website-desa-2027.md`): guard global API hanya memastikan login, bukan role admin →
  user login role 5 masih bisa memanggil `PUT`/`DELETE` laporan, termasuk mengubah status kirimannya sendiri. Moderasi
  ini menahan pengirim anonim; menutup celah role adalah pekerjaan T19.
- Tanpa captcha; batas per alamat bisa diakali dengan banyak alamat.
- Laporan lama tidak diubah (yang sudah `Proses`/`Selesai`/`Gagal` tetap tampil).
- Statistik admin `cctv/stats` (`laporanMingguIni`) tetap menghitung laporan `Baru`.

Test: `__tests__/api/laporan_publik_moderasi_api.test.ts`, `…_search.test.ts`, `…_state.test.ts`.
