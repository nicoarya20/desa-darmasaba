# Struktur fleksibel: satu kode untuk Perangkat Desa, PPID, dan BUMDes

Tanggal: 2026-11-12 · Migrasi: `20261112180000_struktur_fleksibel` · Induk: `2026-11-12-struktur-perangkat-desa.md`

## Konteks
Struktur Perangkat Desa sudah memakai kode bersama, tetapi Struktur PPID (dan BUMDes) masih salinan kode lama: semua field pegawai wajib, deskripsi jabatan wajib, atasan jabatan hanya bisa diisi seeder, email unik sehingga pegawai kedua tanpa email gagal disimpan. Desa meminta aturan yang sama untuk ketiga struktur.

## Keputusan
- **Aturan field (ketiga struktur).** Form pegawai: **Nama\*** (sudah termasuk gelar), Foto, Email, Nomor Telepon, **Jabatan\***. Gelar Akademik, Tanggal Masuk, dan Alamat dihapus dari form serta dari detail/list admin. Form jabatan: nama + hierarki wajib; deskripsi, atasan (`parentId`, siklus ditolak `validateParent`), dan `urutan` opsional. String kosong disimpan `null`.
- **Kolom lama tidak dihapus.** `gelarAkademik`/`tanggalMasuk`/`alamat` tetap di DB (rollback aman). Migrasi menggabungkan gelar ke `namaLengkap` dan mengosongkan `gelarAkademik`; seeder PPID memakai aturan yang sama (`gabungGelarKeNama` di `src/lib/struktur-organisasi/`). API masih menerima ketiga field itu secara opsional; form tidak mengirimnya, jadi nilai lama tidak berubah saat PUT.
- **Kode bersama, tabel terpisah.**
  - API: factory `src/app/api/[[...slugs]]/_lib/_struktur-organisasi/` — `createStrukturHandlers({ posisi, pegawai, pegawaiLabel, pegawaiLabelLower, softDelete })` + `createStrukturModule({ prefix, posisiPath, pegawaiPath, tag, logTag }, handlers)`. Delegate Prisma dibaca lazy.
  - `softDelete`: PPID `true` (punya `deletedAt` dan dirujuk tabel lama `StrukturPPID`/`StrukturOrganisasiPPID`; hapus = isi `deletedAt` + nonaktif, foto dibiarkan, semua baca mengabaikan baris terhapus). Perangkat Desa & BUMDes `false` (tanpa `deletedAt`; hapus baris + foto).
  - State: `src/app/admin/(dashboard)/_state/struktur-organisasi/` — `createStrukturState({ logTag, pegawaiLabel, pegawaiLabelLower, api: { posisi, pegawai } })` (node Eden API struktur itu).
  - Admin: halaman bersama di `src/app/admin/(dashboard)/_com/struktur-organisasi/halaman/` (Pegawai list/detail/tambah/edit, Jabatan list/tambah/edit, Bagan, layout tab) dikonfigurasi `StrukturAdminConfig` = `{ state, routes: strukturAdminRoutes(base), text }`. Halaman per struktur hanya pembungkus tipis.
  - Publik: bagan + profil memakai adapter `StrukturSource` per struktur.
- **Kompatibilitas endpoint PPID.** Path lama `/api/ppid/strukturppid/{posisiorganisasi,pegawai}/…` dipertahankan; bentuk respons diselaraskan dengan Perangkat Desa (`{ success, message, data }`, error = status HTTP + `{ success: false, message }`, list pegawai berpaginasi di DB maks 100). Semua konsumen di repo ikut diubah. Endpoint yang tidak dipakai lagi dihapus: `GET|PUT /strukturppid/:id` (tabel lama `StrukturPPID`), `GET posisiorganisasi/find-many`, `GET pegawai/find-many-all`, `DELETE pegawai/non-active/:id`, `PATCH pegawai/active/:id`. Kontrak dikunci `__tests__/api/struktur_ppid_kontrak_route.test.ts`.
- **URL admin PPID.** Menu `ppid.struktur-ppid` (basePath `/admin/ppid/struktur-ppid`) tetap. Tab baru `pegawai`, `jabatan`, `bagan`; URL lama `posisi-organisasi/…` dan `struktur-organisasi` di-redirect ke tab setara.

## Konsekuensi
- BUMDes tinggal memasang factory dengan `softDelete: false`, delegate `posisiOrganisasiBumDes`/`pegawaiBumDes`, state + config admin sendiri — tanpa menyalin handler/halaman.
- Profil publik (`StrukturDetailView`) masih menampilkan alamat/tanggal masuk bila kolom lama berisi; admin tidak bisa lagi mengubahnya.
