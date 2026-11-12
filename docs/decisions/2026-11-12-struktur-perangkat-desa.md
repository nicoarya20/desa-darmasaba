# Struktur Perangkat Desa: tabel sendiri, kode bersama

Tanggal: 2026-11-12 · Migrasi: `20261112100000_struktur_perangkat_desa` (additive + seed 20 jabatan)

## Konteks
Section "Struktur Perangkat Desa" di Profil Desa dan halaman `/pemerintahan/profil/struktur-perangkat-desa` membaca tabel Struktur PPID (`PegawaiPPID`/`PosisiOrganisasiPPID`). Akibatnya halaman Struktur PPID berisi perangkat desa, dan mengubah satu struktur berarti mengubah yang lain. Admin juga tidak punya menu Struktur Perangkat Desa. Struktur PPID dan BUMDes adalah salinan kode yang hampir identik (API, state, admin) dengan batasan yang sama: foto, gelar, email, telepon, alamat, dan tanggal masuk wajib diisi; atasan jabatan (`parentId`) hanya bisa diisi seeder; bagan admin hanya menampilkan pegawai pertama per jabatan.

## Keputusan
- **Tabel sendiri per struktur.** `PosisiPerangkatDesa` + `PerangkatDesa` terpisah dari PPID/BUMDes. Hanya `namaLengkap` + `posisiId` wajib; field lain nullable dan string kosong disimpan sebagai `null`. `email` sengaja tidak unik (boleh kosong untuk banyak orang). `urutan` mengatur posisi jabatan selevel. `parentId` bisa diatur admin; API menolak atasan yang tidak ada, diri sendiri, atau siklus.
- **Jabatan awal di migrasi, bukan seeder.** 20 jabatan dari bagan resmi (Perbup Badung 44/2016, ID `pd-*`) di-INSERT `ON CONFLICT DO NOTHING`, karena deploy hanya menjalankan `prisma migrate deploy`. Nama pegawai tidak di-seed; diisi admin.
- **Kode generik, data terpisah.** Logika murni (`src/lib/struktur-organisasi/`), bagan + halaman profil publik (`src/app/(public)/_com/struktur-organisasi/`, sumber data lewat adapter `StrukturSource`), dan komponen admin (`src/app/admin/(dashboard)/_com/struktur-organisasi/`) dibuat tanpa ketergantungan ke tabel tertentu. Perangkat Desa adalah pemakai pertama; PPID memakai bagan + halaman profil publik lewat `strukturPpidSource`.
- **Data PPID yang ada tidak dipindah atau dihapus.** Halaman PPID tetap menampilkan datanya sampai data SK PPID diisi admin.

## Konsekuensi
- API: `/api/desa/strukturperangkat/{posisi,pegawai}` (GET publik, mutasi lewat guard admin global). Kontrak dikunci `__tests__/api/struktur_perangkat_kontrak_route.test.ts`.
- Admin: Pemerintahan → Struktur Perangkat Desa (`/admin/pemerintahan/struktur-perangkat-desa/{pegawai,jabatan,bagan}`).
- Fase berikutnya (tugas terpisah): pindahkan API/state/admin PPID dan BUMDes ke kode bersama yang sama, supaya field opsional, atasan yang bisa diatur, dan bagan admin yang benar juga berlaku di sana. Kolom tabel mereka sudah nullable; `urutan` perlu migrasi bila ingin dipakai.
