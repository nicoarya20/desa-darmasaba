# Kegiatan Desa Pembangunan: foto sebelum/sesudah + galeri progres

Tanggal: 2026-11-18 · Migrasi: `20261118100000_kegiatan_pembangunan_foto`

## Konteks
Kegiatan Desa kategori Pembangunan (`KATEGORI_PEMBANGUNAN_ID`) hanya punya satu `image`. Kebutuhan desa: dokumentasi
foto sebelum/sesudah dan galeri progres. Semua field baru **opsional**; "Gambar (Opsional)" lama tetap untuk semua
kategori dan tidak berubah.

## Keputusan
- **Schema (additive, nullable)**: `KegiatanDesa.fotoSebelumId`/`fotoSesudahId` → `FileStorage` (relasi bernama
  `KegiatanDesaFotoSebelum`/`KegiatanDesaFotoSesudah`, FK `ON DELETE SET NULL`) dan model baru `KegiatanDesaFoto`
  (`kegiatanDesaId`, `fileId`, `urutan`, `createdAt`; FK `CASCADE`; index `[kegiatanDesaId, urutan]`). Migrasi idempoten
  (`IF NOT EXISTS`, FK dalam `DO $$ ... duplicate_object`). Tidak ada data lama yang diubah.
- **Galeri = tabel eksplisit dengan `urutan`** (pola `FotoKegiatanLembaga`), bukan m2m implisit seperti galeri
  Pengumuman: m2m implisit tidak menyimpan urutan, sedangkan urutan tampil galeri progres harus stabil. Ini menyimpang
  dari "ikuti persis Pengumuman" (batas 10 dan validasi tetap sama).
- **Validasi satu sumber** di `src/lib/kegiatan-pembangunan-foto.ts` (fungsi murni): file ada, aktif, mime
  JPG/PNG/WebP; galeri maks 10 (`MAX_FOTO_PROGRES`) dan tanpa id ganda. `foto-check.ts` hanya menambah satu query
  `fileStorage.findMany` (dilewati bila tidak ada rujukan).
- **Kategori selain Pembangunan** selalu mengosongkan foto (sama dengan `resolvePembangunanData`); berkasnya ikut
  dibersihkan. Foto yang dikirim untuk kategori lain diabaikan.
- **Simpan galeri atomik**: bila galeri berubah, `deleteMany` + `createMany` + `kegiatanDesa.update` dalam satu
  `$transaction` interaktif; tanpa perubahan galeri tidak ada transaksi.
- **Pembersihan berkas**: `removeReleasedFiles("KegiatanDesa", sebelum, sesudah)` dipanggil SETELAH simpan sukses,
  hanya untuk field baru (snapshot rujukan dibaca sebelum update, hanya bila ada field foto dikirim). Berkas yang masih
  dirujuk tempat lain dibiarkan.
- **Upload saat Simpan** lewat `unggahGambar` (`POST /api/fileStorage/create`, gambar → WebP, 5 MB per foto), berurutan
  sebelum → sesudah → galeri. Setelah upload sukses, berkas di state diganti id-nya sehingga Simpan ulang (bila simpan
  gagal) tidak mengunggah ulang.
- **Pindah kategori di form**: state foto hidup di hook halaman, terpisah dari kategori. Pindah dari Pembangunan lalu
  kembali sebelum Simpan tidak mengubah foto. Saat Simpan dengan kategori lain, foto tidak diunggah/dikirim dan API
  mengosongkannya; `PeringatanFotoNonPembangunan` memberi tahu admin ("akan dihapus saat Simpan" bila sudah tersimpan,
  "tidak akan diunggah" bila hanya dipilih). Batal/Reset kembali ke foto tersimpan.
- **Reuse lintas domain (ekstraksi minimal)**: `GambarUtamaDropzone` dan `GaleriGambarUploader` (admin Pengumuman)
  mendapat prop opsional `label`/`alt`/`disabled` dengan default lama sehingga pemakai Pengumuman tidak berubah.
  `PENGUMUMAN_FILE_SELECT`, `unggahGambar`, `DokumentasiGaleri` (lightbox publik, `judul={null}`) dipakai apa adanya.
- **Publik**: blok "Dokumentasi Pembangunan" di bawah panel progres, hanya bila minimal satu foto ada. Sebelum/Sesudah
  berdampingan (satu saja bila hanya satu ada; bertumpuk di ponsel), lalu "Galeri Progres" dengan lightbox. `alt`
  bermakna, `loading="lazy"`, token CSS yang sama sehingga dark theme ikut.

## Kontrak API (additive; `/api/desa/kegiatandesa`)
`File` = `{ id, link, realName, mimeType, size }`.

| Method | Path | Perubahan |
|---|---|---|
| POST create, PUT `/:id` | body | opsional `fotoSebelumId`, `fotoSesudahId`: `string \| null`. **undefined = tidak diubah** (PUT); `null`/`""` = hapus; string = set (di-trim). Opsional `fotoProgresIds: string[]`: set final, urutan array = urutan tampil; **undefined = tidak diubah**, `[]` = kosongkan. |
| POST, PUT | error | 400 `{ success: false, message }`: "Foto sebelum/sesudah tidak valid", "Galeri foto progres tidak valid", "...tidak boleh berisi foto yang sama lebih dari sekali", "Maksimal 10 foto progres per kegiatan (dikirim n)", "<Foto ...> tidak ditemukan atau sudah dihapus", "<Foto ...> harus berformat JPG, PNG, atau WebP". |
| POST, PUT, GET `/:id` | respons `data` | tambah `fotoSebelumId`/`fotoSesudahId`, `fotoSebelum: File \| null`, `fotoSesudah: File \| null`, `fotoProgres: File[]` terurut `urutan asc` (create/PUT/GET `/:id`). |
| GET find-many | — | tidak berubah (daftar tetap memakai `image`). |

## Risiko sisa
- Upload sukses + simpan gagal/Batal meninggalkan berkas yatim (sama seperti Pengumuman, Wilayah). Kegagalan di tengah
  upload banyak foto: foto yang sudah terunggah diunggah ulang pada Simpan berikutnya.
- Snapshot rujukan sebelum update dibaca di luar transaksi; dua admin menyimpan bersamaan bisa membuat satu berkas
  lama tidak terbersihkan (tidak pernah menghapus berkas yang masih dirujuk, karena `removeReleasedFiles` memeriksa FK).
- Galeri admin hanya mendukung urutan tambah (tidak ada UI geser) — mengikuti pola galeri yang ada.

## Di luar lingkup
`image` lama (perilaku `imageId: body.imageId || null` dan penghapusan berkas lama; lihat `docs/BACKEND-TODO.md`).
