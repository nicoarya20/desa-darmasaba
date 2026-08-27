# QC Admin Mobile — 26 Agustus 2026

**Branch:** `qc/admin-mobile-26-08-26`

**Device:** 📱 Real iPhone X (Safari) · 💻 Chrome DevTools iPhone 11 (emulasi)

**STG base:** `https://desa-darmasaba-stg.wibudev.com`

**Scope:** QC visual + input semua halaman admin (List/Create/Edit/Detail) per domain

**Legend prioritas:** 🔴 CRITICAL · 🟠 HIGH · 🔵 MEDIUM · ⚪ LOW

**Legend device:** 📱 = ketemu di real device · 💻 = ketemu di Chrome emulasi · 📱💻 = ketemu di dua-duanya

**Cara isi:** setiap nemu masalah, tambah baris checkbox baru di grup domain terkait. Format:

```
- [ ] **[Kode]. [Judul singkat masalah]** · [prioritas] · [device]
  - Halaman: `/admin/...` (List/Create/Edit/Detail)
  - Temuan: [deskripsi apa yang salah]
  - Repro: [langkah reproduksi kalau ada kondisi khusus, mis. "isi field X dengan 1 karakter"]
```

Urutan grup di bawah ikut daftar domain aktif di `ARCHITECTURE.md` — geser urutan kalau mau samakan dengan urutan sidebar admin.

---

## A. Landing Page

- [x] **A1. Menu Profil** - Program Inovasi· 🔵 MEDIUM · 📱💻
  - Halaman: `/admin/landing-page/profil/program-inovasi` (List)
  - Temuan: jika program dengan deskripsinya banyak auto dia menampilkan detail deskripsinya padahal kalau pada device lain engga
  - Repro: Buka page pada device Iphone X kalau di device lain aman aja

- [x] **A2. Menu APBDES**· 🔵 MEDIUM · 📱💻
  - Halaman: `/admin/landing-page/apbdes/create & /admin/landing-page/apbdes/edit` (Create &amp; Edit)
  - Temuan: jika halaman create &amp; edit ditampilan device mobile aneh jadinya pada bagian tambah item pendapatan / belanja 
  - 1 Pada bagian Tambah Item Pendapatan/Belanja kan ada tiga kolom kode, level, dan tipe kalau di desktop bagus keliatannya tapi kalau di mobile pas milih level itu kayak tulisannya ketutup gitu sama jarak ketiga select 
  - 2 Pada bagian daftar item jika sudah di create tambah item pendapatan / belanjanya itu berantakan tampilannya disemua device 
  - Repro: Buka page pada semua device sama sih
  - Halaman: `/admin/landing-page/apbdes/[id]` (Detail)
  - Temuan: Layoutnya berantakan rincian pendapatan &amp; belanja
  - Repro: Buka page pada mobile device

- [x] **A3. Menu PRESTASI Desa**· 🔵 MEDIUM · 📱💻

- Halaman: `/admin/landing-page/prestasi-desa/list-prestasi-desa` (Detail)
- Temuan: Layouttabs menunya sepertinya kurang lebar jika dimobile soalnya tulisan layouttabsnya keluar dari background belakangnya
- Repro: Buka page pada mobile device

## B. Desa

*(belum ada temuan)*

## C. Ekonomi

- [ ] ** B1. Tabel Data UMKM overflow, tidak bisa di-scroll horizontal** · 🟠 HIGH · 📱💻
  - Halaman: `/admin/ekonomi/umkm/data-umkm` (List)
  - Temuan: Kolom tabel (Nama, Kategori, Pemilik, Aksi) lebih lebar dari layar. Tidak ada scrollbar horizontal, jadi kolom paling kanan (Aksi) kepotong dan tidak bisa dijangkau.
  - Repro: Buka halaman di layar 375px lebar (baik real device maupun Chrome emulasi) → tabel langsung kepotong tanpa cara scroll ke kanan.

- [ ] ** B2. Field "Nama UMKM" lolos validasi meski cuma diisi spasi** · 🔵 MEDIUM · 📱
  - Halaman: `/admin/ekonomi/umkm/data-umkm/create` (Create)
  - Temuan: Field wajib "Nama UMKM" seharusnya menolak input kosong, tapi kalau diisi spasi doang (`"   "`) tombol Simpan tetap aktif dan data tersimpan dengan nama kosong (terlihat blank di list).
  - Repro: Buka form Create → isi field "Nama UMKM" dengan spasi saja → isi field lain seperlunya → klik Simpan → cek di list, muncul baris dengan nama kosong.

*(hapus 2 contoh di atas setelah paham formatnya, lalu ganti dengan temuan asli)*

## D. Inovasi

*(belum ada temuan)*

## E. Keamanan

*(belum ada temuan)*

## F. Kependudukan

*(belum ada temuan)*

## G. Kesehatan

*(belum ada temuan)*

## H. Lingkungan

*(belum ada temuan)*

## I. Musik

- [ ] **I1. Tampilan Mobile Berantakan Music Playernya** · 🟠 HIGH · 📱💻
  - Halaman: `/admin/ekonomi/umkm/data-umkm` (List)
  - Temuan: Tampilan mobile berantakan pada bagian music player.
  - Repro: Buka halaman di devie mobile apapun.

## J. Pendidikan

*(belum ada temuan)*

## K. PPID

- [ ] **K1. Menu Struktur PPID - Struktur Organisasi** · 🟠 HIGH · 📱💻
  - Halaman: `/admin/ppid/struktur-ppid/struktur-organisasi` (List)
  - Temuan: Tampilan struktur pada device mobile terlihat aneh bisa engga dimaskimalkan atau baiknya gimana
  - Repro: Buka page pada mobile device

---

## Catatan Umum (di luar halaman spesifik)

- [x] **1. Detail Semua Menu Yang Ada Imagenya**
  - Temuan: jika image foto yang diunggah itu bentuknya potrait yang diambil langsung dengan take foto dari kamera handphone otomatis dia nanti diubah menjadi landscape tapi dia rotate ke kiri jadinya fotonya potrait yang dipakasakan landscape akhirnya rotate ke kiri
  - Repro: Buka page pada semua device sama sih

