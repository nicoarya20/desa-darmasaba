# Fix Bugs — 12 Agustus 2026

**Branch:** `fix-bugs/12-08-26`

**Sumber task:** PM Dashboard (`pm-dashboard.wibudev.com`) — assignee **Nico Arya Putra Laksana** (`nicoarya20@gmail.com`)

**Project:** website desa darmasaba

**Scope:** 29 item (14 BUG + 15 TASK) status **OPEN** &amp; **IN_PROGRESS**. IDEA (1) dikecualikan (read-only via token).

**STG base:** `https://desa-darmasaba-stg.wibudev.com`

**Backlog tambahan (unassigned, update 13 Agustus 2026):** ada 56 bug baru di PM Dashboard yang **belum di-assign** (32 hasil audit Safari + 16 lainnya, semua `OPEN`; plus 8 anomali `CLOSED` tanpa assignee) — belum masuk ke plan aktif ini. Lihat `[fix-bugs-12-08-26-backlog-unassigned.md](./fix-bugs-12-08-26-backlog-unassigned.md)`. Semua bug yang **sudah** ter-assign ke Nico dan berstatus OPEN/IN_PROGRESS sudah tercakup di plan ini (grup B–H) — tidak ada yang tertinggal.

---

## Cara Sinkronisasi (baca dulu)

- Kolom **Checklist** di file ini = progres lokal. Kolom **PM** = status di dashboard.
- Setelah sebuah task **selesai dikerjakan**, laporkan ke agent → agent akan:
  1. Centang `- [x]` di file ini.
  2. Update status di PM via API (butuh token **WRITE**).
- **State machine PM (penting saat update):**
  - **BUG:** `OPEN → IN_PROGRESS → READY_FOR_QC → CLOSED` (tidak bisa lompat langsung ke CLOSED — wajib lewat READY_FOR_QC).
  - **TASK:** `OPEN → IN_PROGRESS → CLOSED` (TASK tidak punya READY_FOR_QC).
- Evidence gambar (`/api/evidence/...`) hanya bisa dibuka dengan token PM.

**Legend prioritas:** 🔴 CRITICAL · 🟠 HIGH · 🔵 MEDIUM · ⚪ LOW

---

## A. Modul Kesejahteraan Masyarakat (Ekonomi) — FITUR BARU

> 7 task ini satu rangkaian fitur (bukan bug lepas). Urutan kerja: **Model → API → State → Admin CMS → Halaman publik → Suspense fix → Menu**. Kebanyakan sudah IN_PROGRESS.
>
> ✅ **Audit 2026-08-12:** A1–A7 **sudah terimplementasi &amp; terverifikasi** ada di branch `fix-bugs/12-08-26` (dibangun di branch `feature/kesejahteraan-masyarakat`, sudah ter-fold ke branch ini). Belum di-QC di STG; status PM masih perlu ditutup manual via token WRITE.

- [x] **A1. Model &amp; migration KesejahteraanMasyarakat** · TASK · 🟠 HIGH · PM: `IN_PROGRESS`
  - Tambah model `KesejahteraanMasyarakat` di `prisma/schema.prisma` (id cuid, judul, deskripsi, content, `imageId` opsional relasi ke FileStorage, `linkVideo`, relasi many `_KesejahteraanImages`, timestamp `createdAt/updatedAt/deletedAt`, `isActive`).
  - Buat migration `prisma/migrations/20260717000000_add_kesejahteraan_masyarakat/migration.sql` (CREATE TABLE utama + tabel pivot gambar + index + FK ke FileStorage).
  - `id: 7c4a9acb-20a6-43f8-8189-49100c7e3830`
- [x] **A2. API modul kesejahteraan-masyarakat** · TASK · 🟠 HIGH · PM: `IN_PROGRESS`
  - Handler Elysia di `src/app/api/[[...slugs]]/_lib/ekonomi/kesejahteraan-masyarakat/`: `index.ts` (mount), `create.ts`, `updt.ts`, `del.ts` (soft delete), `find-many.ts` (paginasi + search), `find-by-id.ts`, `findFirst.ts` (featured), `findRecent.ts`. Registrasi di `_lib/ekonomi/index.ts`.
  - `id: 8ba693be-33b6-40a4-ac4d-1e831248bc3e`
- [x] **A3. State valtio kesejahteraan-masyarakat** · TASK · 🟠 HIGH · PM: `IN_PROGRESS`
  - `src/app/admin/(dashboard)/_state/ekonomi/kesejahteraan-masyarakat.ts` — proxy state: `findMany` (list, paginasi, loading), `findFirst` (featured), `findUnique`, `create`, `edit` + fungsi `load` pemanggil API.
  - `id: 915a3241-0f8e-4486-b03a-1d4f7cd25384`
- [x] **A4. Admin CMS kesejahteraan-masyarakat** · TASK · 🟠 HIGH · PM: `IN_PROGRESS`
  - `src/app/admin/(dashboard)/ekonomi/kesejahteraan-masyarakat/`: `page.tsx` (list+tabel+search+paginasi), `create/page.tsx` (dropzone gambar + rich text), `[id]/page.tsx` (detail), `[id]/edit/page.tsx`. Ikuti pola Berita (minus kategori).
  - `id: e3afa225-ce37-49c9-a818-22f87a34eb6f`
- [x] **A5. Halaman publik kesejahteraan-masyarakat** · TASK · 🟠 HIGH · PM: `OPEN`
  - `src/app/darmasaba/(pages)/ekonomi/kesejahteraan-masyarakat/`: `page.tsx` (featured + grid program terbaru + paginasi via `useSearchParams`) dan `[id]/page.tsx` (detail).
  - `id: 390dc960-302d-4292-ac7f-74fd78a0a4a2`
- [x] **A6. Fix Suspense boundary halaman publik** · TASK · 🔵 MEDIUM · PM: `IN_PROGRESS`
  - Bungkus komponen yang pakai `useSearchParams()` di `.../kesejahteraan-masyarakat/page.tsx` dalam `<Suspense>` agar build Next.js tidak gagal (`missing-suspense-with-csr-bailout`). Pisah jadi `KesejahteraanMasyarakatContent` + wrapper Suspense.
  - `id: 91413ba8-bf49-4744-bd84-ac0560422eb9`
- [x] **A7. Registrasi menu navigasi** · TASK · 🔵 MEDIUM · PM: `IN_PROGRESS`
  - Tambah entry "Kesejahteraan Masyarakat" di `src/con/navbar-list-menu.ts` (submenu Ekonomi publik) dan `src/app/admin/_com/list_PageAdmin.tsx` (sidebar admin).
  - `id: a2afcdf6-26e6-4f69-9152-a72ddd06a099`

---

## B. UMKM (Admin + Publik Ekonomi)

- [x] **B1. UMKM &gt; Data UMKM** · BUG · 🔵 MEDIUM · PM: `IN_PROGRESS`
  - (1) Tidak bisa menambahkan data UMKM. (2) Tombol aksi tidak tersedia.
  - STG: `/admin/ekonomi/umkm/data-umkm` · create: `/admin/ekonomi/umkm/data-umkm/create`
  - `id: 7edd0018-3239-4b52-a3ad-6b546018c262`
- [x] **B2. UMKM &gt; Data Produk** · BUG · 🔵 MEDIUM · PM: `IN_PROGRESS`
  - (1) Tidak bisa menambahkan data produk UMKM. (2) Tombol aksi tidak ada.
  - STG: `/admin/ekonomi/umkm/produk` · create: `/admin/ekonomi/umkm/produk/create`
  - `id: 75751102-77aa-4662-8c8e-935afa266128`
- [x] **B3. UMKM &gt; Penjualan** · BUG · 🔵 MEDIUM · PM: `IN_PROGRESS`
  - Tidak ada tombol aksinya.
  - STG: `/admin/ekonomi/umkm/penjualan`
  - `id: 6bb880a9-85eb-448e-8179-542c9edf8f42`
- [x] **B4. UMKM &gt; Kategori Produk** · BUG · 🔵 MEDIUM · PM: `OPEN`
  - Tidak bisa edit kategori produk yang sudah dibuat.
  - STG: `/admin/ekonomi/umkm/kategori-produk`
  - `id: 20a93b66-db09-4a0c-baef-8388c6750d15`
- [x] **B5. UMKM &gt; Direktori Bisnis** · TASK · 🔵 MEDIUM · PM: `OPEN`
  - Masih tidak bisa menampilkan gambar produk.
  - STG: `/darmasaba/ekonomi/umkm`
  - `id: 71823208-21b4-4034-bb45-e0e20e3acfdd`
- [x] **B6. UMKM &gt; Katalog Produk** · TASK · 🔵 MEDIUM · PM: `OPEN`
  - Detail produk ambigu — tidak ada keterangan satuan (1 kg / 1 ons).
  - STG: `/darmasaba/ekonomi/umkm/produk/{id}`
  - `id: f88726ee-fc55-4483-941b-6bf310c002ff`

---

## C. Kependudukan

- [ ] **C1. Kependudukan &gt; Distribusi Agama** · BUG · 🔵 MEDIUM · PM: `OPEN`
  - Tulisan/teks masih ketumpuk (overlap).
  - STG: `/darmasaba/kependudukan/distribusi-agama`
  - `id: 11658f23-3bb0-49cf-85f9-fabcfb17fc58`
- [ ] **C2. Mobile Kependudukan &gt; Distribusi Agama** · BUG · 🔵 MEDIUM · PM: `OPEN`
  - Teks masih ketumpuk (versi mobile). Kemungkinan satu akar dengan C1.
  - STG: `/darmasaba/kependudukan/distribusi-agama`
  - `id: f4441134-b7ee-40df-a477-d9f42eb9eeed`
- [ ] **C3. Kependudukan &gt; Data perbanjar** · TASK · 🔵 MEDIUM · PM: `OPEN`
  - Tata letak angka (penduduk, KK, penduduk miskin) disamakan rata kiri seperti penulisan banjar agar rapi.
  - STG: `/darmasaba/kependudukan/data-per-banjar`
  - `id: a185c663-d786-4941-9734-73891f2e598a`
  - ⚠️ **Duplikat** dengan C4 (deskripsi &amp; halaman identik) — kerjakan sekali, tutup keduanya.
- [ ] **C4. Kependudukan &gt; Data perbanjar (duplikat C3)** · TASK · 🔵 MEDIUM · PM: `OPEN`
  - Sama persis dengan C3.
  - `id: 6c1a496a-ff20-46a8-a920-e1243021ea4e`

---

## D. Pendidikan

- [ ] **D1. Pendidikan &gt; Data Pendidikan** · BUG · 🔵 MEDIUM · PM: `OPEN`
  - (1) Tooltip grafik overflow melewati batas tampilan. (2) Data sekolah SD duplikat.
  - STG: `/darmasaba/pendidikan/data-pendidikan`
  - `id: 2cb85e39-e6ca-47cc-abf5-a60893669e2c`
- [ ] **D2. Pendidikan &gt; Perpustakaan Digital** · BUG · 🔵 MEDIUM · PM: `OPEN`
  - Fitur "Pinjam Buku" belum bisa digunakan. Kemungkinan data belum tersinkronisasi.
  - STG: `/darmasaba/pendidikan/perpustakaan-digital/...`
  - `id: 4a450401-09e9-4376-9f69-05b4d673087b`

---

## E. Lingkungan

- [ ] **E1. Lingkungan &gt; Gotong Royong** · BUG · 🔵 MEDIUM · PM: `IN_PROGRESS`
  - (1) Foto pada kegiatan gotong royong tidak kelihatan. (2) Samakan desain tombol "Baca Selengkapnya" antara banner utama &amp; daftar berita.
  - STG: `/darmasaba/lingkungan/gotong-royong/sosial`
  - `id: e9660d44-528e-487d-a5bd-b237a24648a7`

---

## F. PPID / Admin

- [ ] **F1. Field data pegawai PPID tidak tersimpan (Mobile Admin PPID)** · BUG · 🔵 MEDIUM · PM: `OPEN`
  - (1) Field foto profil ada opsi "Tidak ada foto profil", tapi sistem tidak bisa simpan tanpa foto. (2) Field gelar akademik tanpa indikator wajib, tapi tidak diisi → gagal simpan.
  - `id: 439dbd6c-fb2f-46d6-af66-3d6a38b5840d`
- [ ] **F2. Daftar Informasi Publik (Detail)** · BUG · 🔵 MEDIUM · PM: `OPEN`
  - Tata letak Title "Deskripsi" tidak sejajar dengan isi deskripsi.
  - `id: 62b1ed7f-3f9b-4707-8010-6d66aa5e4616`

---

## G. APBDes

- [ ] **G1. Tampilan detail APBDes kurang rapi (Admin Mobile)** · BUG · 🔵 MEDIUM · PM: `OPEN`
  - Menu Daftar APBDes bagian rincian pendapatan &amp; belanja terlihat kurang rapi (mobile).
  - `id: 710cd20f-c255-47ea-9492-b6f8c6150aad`

---

## H. Grafik / Chart

- [ ] **H1. Teks Grafik SDGs Desa Terpotong** · BUG · 🔵 MEDIUM · PM: `OPEN`
  - Teks "Desa Sehat &amp; Sejahtera" sebagian terpotong pada grafik SDGs.
  - STG: `/darmasaba/sdgs-desa`
  - `id: e948f63e-d13d-4aa3-bd6f-39257166870e`
- [ ] **H2. Hapus Label 0% (IKM)** · BUG · 🔵 MEDIUM · PM: `OPEN`
  - Diagram menu Indeks Kepuasan Masyarakat (Ulasan &amp; Kelompok Umur): hapus label 0% saat tidak ada data.
  - `id: 1bd3d647-69aa-4aed-84e4-72fc117305dc`

---

## I. BumDes / Struktur Organisasi &amp; Lain-lain

- [ ] **I1. Struktur Organisasi — garis putih fullscreen** · TASK · 🔵 MEDIUM · PM: `OPEN`
  - Ada garis putih di pinggir layar saat mode fullscreen (seharusnya tidak ada).
  - STG: `/darmasaba/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes`
  - `id: 8d8f4e7a-3df7-43d3-9d2d-35041a512835`
  - ℹ️ Cek `.DISKUSI/6-Jul/` — isu garis putih fullscreen BumDes kemungkinan sudah pernah disentuh; verifikasi ulang di STG dulu.
- [ ] **I2. Struktur Organisasi — garis penghubung card** · TASK · 🔵 MEDIUM · PM: `OPEN`
  - Garis penghubung di bawah card Kepala Desa &amp; Sekretaris Desa posisinya kurang pas.
  - STG: `/darmasaba/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes`
  - `id: ebd20c5c-3ac4-409e-8264-6f020b37dcea`
- [ ] **I3. Lowongan Kerja Lokal — jarak judul &amp; search** · TASK · 🔵 MEDIUM · PM: `OPEN`
  - Jarak antara judul dengan kolom pencarian terlalu dekat.
  - STG: `/darmasaba/ekonomi/lowongan-kerja-lokal`
  - `id: bcb88e02-e8d1-406d-a6bb-0a7a1c609193`
- [ ] **I4. Musik — pemutar lagu tidak berfungsi** · TASK · 🔵 MEDIUM · PM: `OPEN`
  - Setelah lagu dipilih muncul keterangan "sedang diputar", tapi durasi tidak jalan &amp; lagu tidak berfungsi.
  - STG: `/darmasaba/musik/musik-desa`
  - `id: 00b673af-d8b6-4ca9-be8d-b6d647291091`

---

## Ringkasan


| Grup                                | Jumlah | BUG    | TASK   |
| ----------------------------------- | ------ | ------ | ------ |
| A. Kesejahteraan Masyarakat (fitur) | 7      | 0      | 7      |
| B. UMKM                             | 6      | 4      | 2      |
| C. Kependudukan                     | 4      | 2      | 2      |
| D. Pendidikan                       | 2      | 2      | 0      |
| E. Lingkungan                       | 1      | 1      | 0      |
| F. PPID/Admin                       | 2      | 2      | 0      |
| G. APBDes                           | 1      | 1      | 0      |
| H. Grafik                           | 2      | 2      | 0      |
| I. BumDes/Lain                      | 4      | 0      | 4      |
| **Total**                           | **29** | **14** | **15** |


**Progress:** 7 / 29 selesai. (Grup A — Kesejahteraan Masyarakat A1–A7, terverifikasi ada di branch `fix-bugs/12-08-26`; masih perlu QC di STG + penutupan status PM.)

### Catatan

- **C3 = C4 duplikat**, dan **C1/C2** kemungkinan satu akar (overlap teks distribusi agama desktop vs mobile) → efektif &lt; 29 pekerjaan unik.
- **Grup A** adalah satu fitur berurutan, bukan bug independen — selesaikan sesuai urutan A1→A7.
- Semua bug wajib transisi PM lewat `READY_FOR_QC` sebelum `CLOSED`.

