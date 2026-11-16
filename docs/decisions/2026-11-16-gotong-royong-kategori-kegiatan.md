# Gotong Royong menjadi kategori Kegiatan Desa

Tanggal: 2026-11-16

## Konteks
Menu admin Lingkungan → Gotong Royong dan Desa → Kegiatan Desa memakai tabel yang sama (`KegiatanDesa` +
`KategoriKegiatan`), tetapi kodenya terduplikasi (API `/api/lingkungan/kegiatandesa` + `/api/lingkungan/kategorikegiatan`,
state, halaman admin & publik). Halaman publik Gotong Royong menampilkan semua kategori (Budaya, Pembangunan, dll.).

## Keputusan
- **Setiap gotong royong adalah kegiatan desa, tidak sebaliknya.** Gotong Royong = satu kategori tetap di Kegiatan Desa,
  id `katgotongroyong01` (`KATEGORI_GOTONG_ROYONG_ID`, `src/lib/kegiatan-gotong-royong.ts`), pola sama dengan kategori
  Pembangunan (`KATEGORI_PEMBANGUNAN_ID`). Dibuat migrasi `20261116100000_kategori_gotong_royong` (kategori aktif bernama
  "Gotong Royong" yang sudah ada diadopsi ke id tetap) dan seed `kategori-kegiatan.json`. Kategori ini, seperti
  Pembangunan, tidak dikunci dari hapus/ganti nama di API kategori (belum ada mekanisme itu untuk Pembangunan); hapus tetap
  ditolak selama masih dipakai kegiatan aktif.
- **Publik.** `/lingkungan/gotong-royong/semua` (href navbar & kunci `MenuVisibility`, sengaja tidak diubah) memakai
  daftar Kegiatan Desa yang sama (`KegiatanList`/`KegiatanShell` dengan `KegiatanScope`), disaring per id kategori
  lewat parameter baru `kategoriId` di `GET /api/desa/kegiatandesa/find-many` (aditif; menang atas `kategori` nama).
  Tanpa pil kategori. Detail memakai halaman Kegiatan Desa (`/pemerintahan/kegiatan-desa/gotong%20royong/{id}`).
  URL lama dialihkan: `/lingkungan/gotong-royong` → `/semua` (307), `/lingkungan/gotong-royong/{kategori}` → `/semua`
  (308), `/lingkungan/gotong-royong/{kategori}/{id}` → detail Kegiatan Desa (308). Hasil pencarian bertipe
  `gotongRoyong` (isinya semua Kegiatan Desa; nama tipe dipertahankan) langsung menaut ke detail Kegiatan Desa.
- **Admin.** Menu, halaman, state, dan API Lingkungan → Gotong Royong (termasuk `kategorikegiatan`) dihapus; kelola lewat
  Desa → Kegiatan Desa dengan kategori "Gotong Royong". Penghapusan dari menu itu dulu **hard delete** (+ hapus berkas
  gambar); Kegiatan Desa memakai **soft delete** (`isActive=false`, gambar tetap).
- **Menu Access (kontrak).** ID `lingkungan.gotong-royong` dihapus dari `domains.ts`. Migrasi data yang sama memberi
  `desa.kegiatan-desa` kepada user yang punya `lingkungan.gotong-royong` atau section `Lingkungan` (yang dulu mencakup
  Gotong Royong) dan belum punya `Desa`/`desa.kegiatan-desa`, lalu menghapus baris `lingkungan.gotong-royong`. Urutan
  ini penting: user yang satu-satunya barisnya Gotong Royong tidak boleh berubah menjadi "tanpa Menu Access" (= fallback
  role, bisa lebih luas). ID ini dicatat di `RETIRED_IDS` pada `__tests__/api/menu_access_ids.contract.test.ts` dan tidak
  boleh dipakai ulang.
- **Partisipan opsional.** Form admin tidak mewajibkan partisipan; kosong disimpan 0 (kolom tetap `Int NOT NULL`, tanpa
  migrasi). 0/null disembunyikan di publik dan tampil "-" di detail admin (`src/lib/kegiatan-partisipan.ts`).

## Konsekuensi
- Kegiatan gotong royong yang sudah ada di DB tetap di kategori lamanya (mis. "Lingkungan"); admin memindahkannya ke
  kategori "Gotong Royong" agar tampil di halaman publik Gotong Royong. Seed `gotong-royong.json` sudah memakai id tetap.
- Rollback: kembalikan kode; baris `UserMenuAccess` `desa.kegiatan-desa` hasil migrasi tidak dihapus otomatis (aman —
  akses yang sama dengan sebelumnya), sedangkan `lingkungan.gotong-royong` perlu diisi ulang manual bila menu dipulihkan.
