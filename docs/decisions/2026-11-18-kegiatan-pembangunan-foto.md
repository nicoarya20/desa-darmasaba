# Kegiatan Desa Pembangunan: foto sebelum & foto sesudah (multi-foto, maks 5)

Tanggal: 2026-11-18 · Migrasi: `20261118100000_kegiatan_pembangunan_foto`

## Konteks
Kegiatan Desa kategori Pembangunan (`KATEGORI_PEMBANGUNAN_ID`) hanya punya satu `image`. Kebutuhan desa: dokumentasi
foto sebelum dan sesudah pembangunan. Semua foto baru **opsional** (0–5 per kelompok); input "Gambar Sampul (Opsional)"
lama tetap untuk semua kategori dan tidak berubah (total di form Pembangunan: Gambar Sampul + Foto Sebelum + Foto Sesudah).

**Desain awal diganti sebelum rilis.** Rancangan pertama memakai satu foto sebelum, satu foto sesudah
(`KegiatanDesa.fotoSebelumId`/`fotoSesudahId`) dan galeri progres (maks 10). Atas keputusan user galeri progres dihapus
dan kedua kelompok menjadi multi-foto maks 5. Karena fitur belum pernah dirilis/di-push dan migrasinya belum dijalankan di
DB mana pun, migrasi yang sama ditulis ulang di tempat (tanpa migrasi susulan) dan semua kode `fotoProgres*`,
`fotoSebelumId`, `fotoSesudahId` dihapus.

## Keputusan
- **Schema**: tabel `KegiatanDesaFoto` (`id`, `kegiatanDesaId`, `fileId`, `jenis`, `urutan`, `createdAt`; FK `CASCADE`
  ke `KegiatanDesa` dan `FileStorage`; index `[kegiatanDesaId, jenis, urutan]`). Tidak ada kolom baru di `KegiatanDesa`.
  `jenis` = `String` `"sebelum"` | `"sesudah"` (pola enum String repo; divalidasi di API/lib, konstanta `JENIS_FOTO`).
  `urutan` dihitung per jenis (0..4). Migrasi idempoten (`CREATE TABLE/INDEX IF NOT EXISTS`, FK dalam `DO $$ ... duplicate_object`).
- **Relasi: satu `KegiatanDesa.foto KegiatanDesaFoto[]`** (bukan dua relasi bernama `fotoSebelum`/`fotoSesudah`).
  Prisma tidak bisa menyaring dua relasi bernama atas FK yang sama dengan `where` berbeda dalam satu `include`; satu
  relasi berarti satu `include` (`orderBy: [jenis, urutan]`) dan satu `deleteMany({ jenis: { in } })`. Lib memecahnya
  menjadi `fotoSebelum`/`fotoSesudah` di respons (`bentukFotoRespons`), sehingga kontrak API tetap bersih.
- **Galeri = tabel eksplisit dengan `urutan`** (pola `FotoKegiatanLembaga`), bukan m2m implisit seperti galeri
  Pengumuman: m2m implisit tidak menyimpan urutan tampil.
- **Validasi satu sumber** di `src/lib/kegiatan-pembangunan-foto.ts` (fungsi murni): `MAX_FOTO_PER_JENIS = 5`; file ada,
  aktif, mime JPG/PNG/WebP; tanpa id ganda dalam satu kelompok; tanpa id yang sama di kedua kelompok **bila keduanya
  dikirim dalam request yang sama** (untuk request satu kelompok, memeriksa kelompok lain butuh query DB tambahan;
  berkas yang sama di dua kelompok tidak merusak data, hanya tidak diinginkan). `foto-check.ts` hanya menambah satu query
  `fileStorage.findMany` (dilewati bila tidak ada rujukan).
- **Kategori selain Pembangunan** selalu mengosongkan kedua kelompok (sama dengan `resolvePembangunanData`); berkasnya
  ikut dibersihkan. Foto yang dikirim untuk kategori lain diabaikan.
- **Simpan atomik**: untuk setiap kelompok yang dikirim, `deleteMany` (jenis itu) + `createMany` + `kegiatanDesa.update`
  dalam satu `$transaction` interaktif; kelompok yang tidak dikirim tidak disentuh. Tanpa foto lama dan tanpa foto baru
  di kelompok yang dikirim, update biasa tanpa transaksi. Create memakai nested `foto.create`.
- **Pembersihan berkas**: `removeReleasedFiles("KegiatanDesa", lama, baru)` dipanggil SETELAH simpan sukses untuk
  gabungan kedua kelompok (snapshot rujukan dibaca sebelum update, hanya bila ada kelompok dikirim atau kategori non-
  Pembangunan). Berkas yang masih dirujuk tempat lain dibiarkan.
- **Upload saat Simpan** lewat `unggahGambar` (`POST /api/fileStorage/create`, gambar → WebP, 5 MB per foto), berurutan
  sebelum → sesudah. Setelah upload sukses, berkas di state diganti id-nya sehingga Simpan ulang (bila simpan gagal)
  tidak mengunggah ulang.
- **Pindah kategori di form**: state foto hidup di hook halaman, terpisah dari kategori. Pindah dari Pembangunan lalu
  kembali sebelum Simpan tidak mengubah foto. Saat Simpan dengan kategori lain, foto tidak diunggah/dikirim dan API
  mengosongkannya; `PeringatanFotoNonPembangunan` memberi tahu admin ("akan dihapus saat Simpan" bila sudah tersimpan,
  "tidak akan diunggah" bila hanya dipilih). Batal/Reset kembali ke foto tersimpan.
- **Reuse lintas domain**: `GaleriGambarUploader` (admin Pengumuman) mendapat prop opsional `label`/`disabled` dengan
  default lama sehingga pemakai Pengumuman tidak berubah (dipakai dua kali, `max=5`). `PENGUMUMAN_FILE_SELECT`,
  `unggahGambar`, `DokumentasiGaleri` (lightbox publik, `judul={null}`) dipakai apa adanya.
- **Publik**: blok "Dokumentasi Pembangunan" di bawah panel progres, hanya bila minimal satu foto ada. Dua kolom berlabel
  "Sebelum" dan "Sesudah" berdampingan (satu kolom penuh bila hanya satu kelompok berisi; kelompok kosong tidak
  ditampilkan; bertumpuk di ponsel ≤734px). Tiap kolom = grid 1–5 foto dengan lightbox ukuran penuh. `alt` bermakna per
  kelompok, `loading="lazy"`, token CSS yang sama sehingga dark theme ikut.

## Kontrak API (additive; `/api/desa/kegiatandesa`)
`File` = `{ id, link, realName, mimeType, size }`.

| Method | Path | Perubahan |
|---|---|---|
| POST create, PUT `/:id` | body | opsional `fotoSebelumIds`, `fotoSesudahIds`: `string[]`, maks 5 masing-masing, tanpa duplikat, tanpa id yang sama di kedua kelompok (bila keduanya dikirim). **undefined = tidak diubah** (PUT); `[]` = kosongkan; urutan array = urutan tampil; id di-trim. |
| POST, PUT | error | 400 `{ success: false, message }`: "Foto sebelum/sesudah tidak valid", "Foto sebelum/sesudah tidak boleh berisi foto yang sama lebih dari sekali", "Maksimal 5 foto sebelum/sesudah per kegiatan (dikirim n)", "Foto yang sama tidak boleh dipakai di foto sebelum dan foto sesudah", "<Foto ...> tidak ditemukan atau sudah dihapus", "<Foto ...> harus berformat JPG, PNG, atau WebP". |
| POST, PUT, GET `/:id` | respons `data` | tambah `fotoSebelum: File[]` dan `fotoSesudah: File[]`, masing-masing terurut `urutan asc` (kosong = `[]`). Tidak ada field `foto` mentah. |
| GET find-many | — | tidak berubah (daftar tetap memakai `image`). |

## Risiko sisa
- Upload sukses + simpan gagal/Batal meninggalkan berkas yatim (sama seperti Pengumuman, Wilayah). Kegagalan di tengah
  upload banyak foto: foto yang sudah terunggah diunggah ulang pada Simpan berikutnya.
- Snapshot rujukan sebelum update dibaca di luar transaksi; dua admin menyimpan bersamaan bisa membuat satu berkas
  lama tidak terbersihkan (tidak pernah menghapus berkas yang masih dirujuk, karena `removeReleasedFiles` memeriksa FK).
- Admin hanya mendukung urutan tambah (tidak ada UI geser) — mengikuti pola galeri yang ada.
- `jenis` adalah String tanpa constraint DB (mengikuti pola enum String repo); nilai di luar `sebelum`/`sesudah` hanya
  bisa masuk lewat SQL langsung dan tidak akan tampil di respons.

## Di luar lingkup
`image` lama (perilaku `imageId: body.imageId || null` dan penghapusan berkas lama; lihat `docs/BACKEND-TODO.md`).
