# Summary: Lomba Batch 1, Layanan + Pengaduan (branch `feature/lomba-batch-1-layanan`)

Juknis 3.3 (kanal pengaduan & tindak lanjut) dan 3.1 (SOP layanan). Semua perubahan schema nullable/aditif.

## Migration
`prisma/migrations/20261118110000_lomba_pengaduan_status_sop_layanan/migration.sql`: idempoten (`ADD COLUMN IF NOT EXISTS`, FK dalam blok `DO $$ ... pg_constraint`), tanpa backfill.
- `PengaduanMasyarakat`: `status String?`, `tanggapan String? @db.Text`, `tanggapanAt DateTime?`
- `PelayananSuratKeterangan` & `PelayananTelunjukSaktiDesa`: `sopFileId String?` → `FileStorage` (`onDelete: SetNull`, relasi `...Sop`). Relasi balik di `FileStorage` ditaruh di baris sendiri (2 baris di bawah `PelayananSuratKeteranganImage2`).
- SQL ditulis offline lewat `prisma migrate diff`; TIDAK dijalankan ke DB (tugas coordinator).

## 1. Pengaduan: status, tanggapan, rekap publik
- `src/lib/pengaduan-status.ts`: `PENGADUAN_STATUS` (`BARU|DIPROSES|SELESAI|DITOLAK`), label Indonesia, `parsePengaduanStatus` (validator), `resolvePengaduanStatus` (satu-satunya tempat `null` → `BARU`), `PENGADUAN_TANGGAPAN_MAX = 1000`.
- `src/lib/pengaduan-tanggapan-server.ts`: `sanitizeTanggapan` (HTML dibuang, entitas didekode, sisa `<`/`>` dihapus). `src/lib/pengaduan-rekap.ts`: tipe rekap bersama server/klien.
- API (`_lib/inovasi/layanan-online-desa/pengaduan-masyarakat/`):
  - `PUT /updt/:id` (`updt.ts`): `guardAdmin` per rute (role 0-4, 401/403), validasi status (400), tanggapan disanitasi + maks 1000 (400), `tanggapanAt` diisi server hanya bila isi tanggapan berubah (kosong → keduanya null), tanpa field `tanggapan` = hanya status berubah.
  - `GET /rekap` (`rekap.ts`): PUBLIK; hanya `{ total, perStatus, perJenis[{jenis,jumlah}], tanggapanTerbaru[≤20 {jenis,status,tanggapan,tanggapanAt}] }`. Rute statis dipasang sebelum `/:id`; `find-many` & `/:id` tetap `guardDataPribadi` (tidak ada perubahan `ADMIN_ONLY_GET_PATHS`/`route.ts`).
  - `find-many` menerima `?status=` (BARU mencakup baris lama bernilai null; nilai asing → 400). `create` publik tidak berubah (field status/tanggapan di body diabaikan karena `data` dipilih eksplisit; respons tetap `data: { id }`).
- Admin: daftar punya kolom Status (badge) + filter status; detail `[id]` menampilkan status/tanggapan + form ubah (`_com/PengaduanStatusBadge.tsx`, `_com/PengaduanTanggapanForm.tsx`, teks bantuan "Jangan menulis nama/NIK pelapor — tanggapan ini tampil publik"). State: `findMany.status` + `update.save`.
- Publik: `_com/rekap/` (`PengaduanRekapSection` memuat sekali lewat `useLoadOnce`, `PengaduanRekapView` presentasional, `rekap.{logic,source,text}.ts`, css) disisipkan satu baris di hub `LayananOnlinePage.tsx`.

### Keputusan coordinator (ask)
`pengaduan-masyarakat/page.tsx` ternyata hanya redirect 307 ke hub (dikunci test `inovasi_layanan_online_ui.test.tsx:166`). Coordinator memilih **B**: redirect dipertahankan, rekap ditaruh di hub. File di luar Target yang disentuh karenanya: `.../inovasi/layanan-online-desa/_com/LayananOnlinePage.tsx` (+1 import, +1 baris) dan folder baru `_com/rekap/`.

## 2. SOP layanan (PDF)
- API: `desa/layanan/sop-file.ts` (`parseSopFileId`, `SOP_FILE_SELECT`) + `sop-file.schema.ts` (body `sopFileId` opsional). Semantik: field hilang = tidak diubah; `null`/`""` = hapus tautan; string = harus ada di `FileStorage` (400 bila tidak). create/updt kedua layanan; find-many/findManyAll/findUnique menyertakan `sopFile {id, link, realName}`. Berkas SOP lama dibuang lewat `removeStoredFile` saat diganti/dihapus lewat updt dan saat layanan dihapus.
- Admin: `PdfDropzoneField` "SOP / Petunjuk (PDF)" (opsional, + tautan berkas saat ini di edit) di create & edit kedua layanan; unggah lewat `uploadPdfFile` sebelum simpan (gagal unggah = tidak menyimpan).
- Publik: komponen `SopLink` ("Unduh SOP (PDF)", tab baru, link-reveal) di baris Telunjuk Sakti (di luar `<a>` baris, tidak bersarang) dan di kepala halaman detail Surat Keterangan. Layanan tanpa berkas = markup lama. Perizinan Berusaha & Penduduk Non-Permanen tidak disentuh.

## Test (semua hijau)
- `__tests__/api/pengaduan_tindak_lanjut_api.test.ts` (18): helper status, `updt` admin-only + sanitasi, `create` publik, `rekap` (key persis, hitungan), `find-many`/`/:id` tetap admin-only, filter status.
- `__tests__/api/layanan_sop_pdf.test.tsx` (20): handler dua layanan menerima `sopFileId` + SSR tautan SOP hanya bila ada.
- `__tests__/api/pengaduan_rekap_publik_ui.test.tsx` (8): SSR rekap (ada data, kosong, memuat, escape HTML).
- Regresi: 18 file terkait (403 tes) hijau, termasuk hub, `no_hover_underline_guard`, `data_pribadi_admin_only`, registry Jenna.
- Tidak dijalankan (batas resource): `tsc`, build, seluruh suite.

## Hutang teknis / temuan di luar scope (tidak diperbaiki)
1. `pelayanan_telunjuk_sakti_desa/updt.ts` memanggil `update` dua kali identik (kode lama); `sopFileId` ditambahkan di keduanya.
2. State admin Telunjuk Sakti `delete.byId` memanggil `DELETE .../del/:id`, sedangkan rute API `DELETE /:id`; kemungkinan 404 (kode lama, belum diverifikasi).
3. Admin belum punya tombol "hapus SOP" (API mendukung `sopFileId: null`; `PdfDropzoneField` tidak punya aksi hapus).
4. `updt` pengaduan belum menulis `AuditLog` (`AUDIT_ACTIONS` daftar tertutup di luar Target).
5. `perJenis` dikirim API tetapi belum ditampilkan di UI publik (spec hanya kartu status + daftar tanggapan).
6. Kartu Surat Keterangan di daftar adalah satu tautan penuh, jadi SOP hanya tampil di halaman detail.
7. `rekap` publik belum punya rate limit/cache; tanggapan langsung tampil publik begitu disimpan (hanya peringatan teks di form).
8. Kolom `status` belum diindeks (tabel kecil; tambah bila filter jadi lambat).
