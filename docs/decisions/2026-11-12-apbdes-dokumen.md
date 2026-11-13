# Dokumen APBDes Multi-berkas + Folder

Tanggal: 2026-11-12 · Migrasi: `20261112150000_apbdes_dokumen`

## Keputusan
- **Satu APBDes (per tahun) → banyak dokumen** di tabel `DokumenAPBDes`, dikelompokkan ke `FolderDokumenAPBDes`
  (satu tingkat, nama bebas). Dokumen tanpa folder = folder virtual **"Umum"** (`folderId` NULL). Folder hanya
  mengelompokkan dokumen; angka anggaran/item/realisasi tetap per tahun dan tidak disentuh.
- **Pola & kode sama dengan Desa Anti Korupsi** (`docs/decisions/2026-11-09-dokumen-desa-anti-korupsi.md`):
  validasi `planProgramSync`, batas 50 dokumen / 30 folder, nama folder unik tanpa beda kapital, berkas unik per
  folder. Bagian yang dulu terikat tabel DAK diekstrak ke modul bersama tanpa mengubah perilaku DAK:
  `src/lib/dokumen-folder-sync.ts` (urutan tulis lewat `IsiSyncStore` per domain), `dokumen-folder-prepare.ts`
  (validasi + cek `FileStorage` aktif), `dokumen-folder-view.ts` (pengelompokan respons), `dokumen-folder-body.ts`
  (skema body Elysia). Editor admin (`desa-anti-korupsi/_com/DokumenFolderEditor`) dipakai ulang apa adanya tanpa
  `programId`, sehingga "Salin ke program lain" (khusus DAK) tidak tampil.
- **Backfill**: migrasi menyalin setiap `APBDes.fileId` (yang belum punya dokumen) menjadi satu dokumen di "Umum"
  (`id = 'apbdok_' || md5(id APBDes)`, judul = nama berkas → nama APBDes → "Dokumen APBDes").
- **`APBDes.fileId` dipertahankan satu rilis** (rollback & klien admin lama), dihapus di rilis berikut. Saat admin
  menyimpan daftar `dokumen`, `fileId` dikosongkan di transaksi yang sama: daftar dokumen jadi sumber kebenaran,
  dan fallback publik tidak memunculkan lagi berkas yang sudah dihapus. Konsekuensi rollback: APBDes yang sudah
  disimpan ulang di versi ini tidak lagi menampilkan dokumen di versi lama.
- **Hapus dokumen = soft delete**; `FileStorage`/objek MinIO tidak dihapus (menghindari pola bug Maskot yang
  menghapus berkas sebelum relasinya). Berkas yatim tetap utang yang sama dengan DAK.

## Kontrak `/api/landingpage/apbdes` (tambahan, kompatibel)
| Method | Path | Perubahan |
|---|---|---|
| GET | `/findMany`, `/:id` | + `folders: { id, nama, urutan, dokumen: Dokumen[] }[]` (urut `urutan`) + `dokumenUmum: Dokumen[]`; bentuk `Dokumen` sama dengan DAK. `file` lama tetap ada. |
| POST | `/create` | + `folders?`, `dokumen?` (bentuk sama dengan DAK; folder baru via `tempKey`). |
| PUT | `/:id` | + `folders?`, `dokumen?`: tidak dikirim = isi tidak diubah; array = set final (folder hilang → dokumennya ke "Umum"). `fileId` masih diterima. |

Error validasi isi: HTTP 400 `{ success: false, message }` sebelum menulis apa pun. GET tetap publik tanpa whitelist
baru (`/api/landingpage/*`).

## Tampilan
- **Publik** (`ApbdesDocument`): "Umum" dulu lalu folder sesuai urutan, kelompok kosong disembunyikan; judul
  kelompok hanya tampil bila ada folder nyata. Tanpa dokumen tapi `file` lama ada → satu dokumen fallback.
- **Admin**: create/edit memakai editor folder bersama (unggah saat Simpan); detail menampilkan daftar per folder.
