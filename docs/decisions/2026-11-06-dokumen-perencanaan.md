# Dokumen Perencanaan (RPJM / RKP / Berita Acara Musyawarah)

Tanggal: 2026-11-06 · Migrasi: `20261106100100_add_dokumen_perencanaan`

## Keputusan
- **Satu tabel** `DokumenPerencanaan` untuk tiga jenis (`RPJM` | `RKP` | `BERITA_ACARA_MUSYAWARAH`). Jenis dan `jenisMusyawarah` (`MUSDES` | `MUSRENBANGDES` | `MMD` | `LAINNYA`) divalidasi di API (`src/lib/dokumen-perencanaan.ts`), bukan enum DB, supaya jenis baru tidak butuh migrasi. DB hanya menjaga `tahunSelesai >= tahunMulai` (CHECK) dan index `(jenis, tahun)`.
- **Aturan per jenis**: RPJM wajib `tahunMulai`/`tahunSelesai` (bebas, mendukung 6 atau 8 tahun); RKP wajib `tahun`; Berita Acara wajib `tahun` + `jenisMusyawarah`. Field yang tidak relevan dikosongkan server.
- **Tanpa menu baru**: admin = tab "Dokumen Perencanaan" di halaman admin Kegiatan Desa (`/admin/pemerintahan/kegiatan-desa/dokumen-perencanaan`); publik = section di halaman Monev & Pembangunan; PPID hanya diberi tautan.
- **Tanpa FK ke KegiatanDesa**: label "Bersumber dari RKP Desa {tahun}" dicocokkan lewat tahun `tanggal` kegiatan = `tahun` dokumen RKP. Bila RKP tahun itu belum ada, label **disembunyikan** (tidak mengklaim sumber yang tidak terdokumentasi). Endpoint monev tidak diubah.
- **PDF** lewat jalur upload `FileStorage` yang ada; API memastikan `fileId` menunjuk file aktif ber-`mimeType` `application/pdf`.

## Endpoint (`/api/desa/dokumenperencanaan`)
| Method | Path | Akses | Catatan |
|---|---|---|---|
| GET | `/find-many` | publik | query `page`, `limit` (maks 50), `jenis`, `tahun` (cocok `tahun` atau tercakup periode RPJM), `search`; hanya `isActive` |
| GET | `/:id` | publik | 404 bila tidak ada |
| POST | `/create` | admin | body divalidasi `parseDokumenPerencanaanInput`; 400 bila tidak valid |
| PUT | `/:id` | admin | `fileId` tidak dikirim = PDF lama dipertahankan; `null` = lepas PDF |
| DELETE | `/del/:id` | admin | soft delete (`isActive=false` + `deletedAt`); klien admin memakai Eden (lihat `.DISKUSI/2026-07-13/*delete-eden*`) |
