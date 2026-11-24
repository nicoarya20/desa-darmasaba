# Program Inovasi: gambar sisipan di tengah deskripsi (2026-11-24)

## Konteks

Dokumen program dari desa (mis. `DAVEST (DARMASABA VILLAGE FESTIVAL).docx`) menaruh gambar di tengah teks:
logo di atas, empat paragraf, lalu gambar maskot "DAVEST III" di tengah, baru Tujuan/Sasaran/Ruang Lingkup.
Editor admin (`_com/createEditor.tsx`, `_com/editEditor.tsx`, tiptap StarterKit) tidak punya gambar, dan
penyaring render membuang `<img>`. Logo (`imageId`) dan galeri dokumentasi (`images`) selalu tampil di posisi tetap.

## Keputusan (pilihan A, disetujui user)

- **Editor**: ekstensi resmi `@tiptap/extension-image@^3.32.2` (MIT, versi sama dengan `@tiptap/core` terpasang),
  blok (`inline: false`), base64 ditolak. Aktif hanya bila editor diberi prop `onPickImage`; saat ini hanya form
  create/edit Program Inovasi. Editor admin lain tidak berubah.
- **Unggah saat Simpan, bukan saat sisip**: gambar masuk editor sebagai URL preview `blob:`; `useGambarSisipan.unggah`
  mengunggahnya ke FileStorage (WebP, MinIO) saat Simpan lalu mengganti src dengan `/api/img/<nama>`. Admin yang
  batal tidak meninggalkan berkas yatim (pola sama dengan logo/galeri).
- **Relasi `ProgramInovasi.gambarSisipan`** (m2m implisit `_ProgramInovasiGambarSisipan`) diturunkan server dari isi
  deskripsi di setiap create/update (`program-inovasi/gambar-sisipan.ts`, dicari lewat `FileStorage.name`). Alasannya:
  - berkas yang hanya dirujuk lewat HTML tidak terlihat oleh `isFileReferenced` (cek FK), jadi bisa terhapus oleh
    pembersihan lain; dengan relasi, rujukannya tercatat lewat FK;
  - pembersihan memakai pola yang sudah ada (`removeReleasedFiles` sebelum/sesudah): gambar yang dihapus dari teks
    dan gambar milik program yang dihapus ikut dibersihkan.
- **Render**: hanya src `/api/img/<nama>` (tanpa host/query/path lain) yang lolos. Halaman detail lewat
  `sanitizeArticleHtml` (server); overlay beranda lewat `sanitizeRichTextWithImages` (DOMPurify +
  `rapikanGambarSisipan`). Alt kosong diisi nama program. Batas: 10 gambar per deskripsi, 5 MB per berkas.

## Alternatif yang ditolak

- **Pilih dari galeri Dokumentasi (B)**: gambar tampil dua kali (di teks dan galeri) atau galeri harus menyaring.
- **Isian "gambar setelah paragraf ke-N" (C)**: kaku (satu gambar) dan admin harus menghitung paragraf.
- **Unggah langsung saat sisip**: sederhana, tapi setiap batal/sisip ulang meninggalkan berkas yatim.
- **Tanpa relasi (cocokkan link saja)**: berkas tidak terlindung cek rujukan FK.
