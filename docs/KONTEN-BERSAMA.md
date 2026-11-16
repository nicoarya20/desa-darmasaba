# Konten bersama: galeri, media sosial, kontak, struktur pengurus, lokasi

Fondasi yang dipakai berulang oleh entri domain yang punya halaman/modal detail (Bank Sampah dan Lembaga
Sekolah sudah memakai; PUSTU, Posyandu menyusul). Keputusan: **tabel per domain** (FK aman, cascade jelas),
**kode bersama** (UI, validasi, helper API, state). Jangan salin komponen ke domain; pakai yang di bawah.

## Lokasi kode

| Lapis | Lokasi | Isi |
|---|---|---|
| Logika murni | `src/lib/konten-bersama/` | `media-sosial.model.ts` (platform, label, ikon, `lengkapiUrlMedsos`), `media-sosial.validation.ts` (`mediaSosialListSchema`, `bacaMediaSosial`), `tautan.validation.ts` (`isHttpUrl`, `urlHttpSchema`), `kontak.link.ts` (`tautanKontak` → `tel:`/wa.me), `lokasi.logic.ts` (`linkGoogleMapsSchema`, `linkGoogleMaps`, `linkRuteKoordinat`, `PUSAT_PETA_DEFAULT`, `lintangSchema`/`bujurSchema` + `koordinatBerpasangan` untuk titik opsional), `galeri.validation.ts` (`buatSkemaGaleri`), `pengurus.validation.ts` (`buatSkemaPengurus`), `daftar-anak.validation.ts` (`skemaUrutan`, `imageIdWajib`, `imageIdOpsional` untuk foto opsional induk), `media-sosial.validation.ts` juga `mediaSosialDariInput` (baris form → body), `teks.validation.ts`, `urutan.logic.ts`, `konten-bersama.types.ts` (`FotoGaleriItem`, `PengurusItem`) |
| API | `src/app/api/[[...slugs]]/_lib/_konten-bersama/` | `daftar-anak.config.ts` (`galeriConfig`, `pengurusConfig`, select bersama), `daftar-anak.handlers.ts` (`createDaftarAnakHandlers`: list, create, update, remove permanen + hapus berkas, reorder), `daftar-anak.routes.ts` (`createDaftarAnakRoutes`), `media-sosial.data.ts` (`kolomMediaSosial`: kosong → NULL, tidak dikirim → tidak diubah) |
| State admin | `src/app/admin/(dashboard)/_state/konten-bersama/` | `daftar-anak.state.ts` (`createDaftarAnakState`), `detail-entri.state.ts` (`createDetailEntriState`: find-unique dengan `loading`/`gagal`, respons id lama diabaikan), `kirim-entri.ts` (`kirimEntri`: POST `/create` / PUT `/:id`, galat berpesan server), `unggah-gambar.ts` (`unggahGambar`, `hapusUnggahanYatim`) |
| Komponen admin | `src/app/admin/(dashboard)/_com/konten-bersama/` | `media-sosial.input`, `lokasi.input` (peta + link Google Maps), `gambar.field` / `gambar.dropzone`, `galeri-foto.admin` (+ `-grid`, `-card`), `struktur-pengurus.admin` (+ `pengurus.form-modal`), `form-entri.frame` (kerangka halaman tambah/edit: kembali, judul, Reset/Simpan), `daftar-anak.admin-section` (pengurus + galeri di halaman edit) |
| Komponen publik | `src/app/(public)/_com/konten-bersama/` | `media-sosial.links`, `kontak.link`, `lokasi.tombol` ("Buka di Google Maps"), `galeri-foto.grid` (grid + pratinjau), `struktur-pengurus.view` (bagan lalu kartu pengurus), `lokasi.peta` (`PetaLokasi`, peta baca-saja satu titik), `konten-kosong` |

Aturan isi: URL media sosial wajib http/https (skema lain ditolak, data rusak dibuang saat dibaca);
link Google Maps hanya host Google (`maps.app.goo.gl`, `goo.gl`, `g.page`, `google.*`), kosong = rute ke
koordinat. Hapus foto galeri / pengurus = **hapus permanen** (baris + berkas MinIO), tanpa panel Sampah.

## Memasang ke domain baru (contoh: Bank Sampah)

1. **Schema** (migrasi offline, idempoten): di tabel induk tambah kolom nullable `deskripsi String? @db.Text`,
   `kontak String?`, `mediaSosial Json?`, `fotoBaganStrukturId String?` (FK `FileStorage`, `onDelete: SetNull`).
   Buat tabel anak `Pengurus<Domain>` (nama, jabatan, imageId?, urutan) dan `FotoKegiatan<Domain>`
   (imageId, keterangan?, urutan), FK induk `onDelete: Cascade`, `@@index([indukId, urutan])`.
   Contoh: `prisma/migrations/20261116110000_detail_bank_sampah/`.
2. **API**: satu file tipis seperti
   `_lib/lingkungan/pengelolaan-sampah/keterangan-bank-sampah/bank-sampah.anak.ts` —
   `createDaftarAnakHandlers(galeriConfig({ delegate, parentKey, parentExists, parentNotFound, fileOwner, max }))`
   lalu `.use(createDaftarAnakRoutes("/foto-kegiatan", "galeri", handlers, { tag, logTag }))` di modul induk.
   Rute jadi `GET|POST /:id/foto-kegiatan`, `PUT /:id/foto-kegiatan/urutan`, `PUT|DELETE /:id/foto-kegiatan/:itemId`
   (sama untuk `/pengurus`). Body create/update induk: validasi `mediaSosialListSchema`, `linkGoogleMapsSchema`;
   saat membaca kirim `bacaMediaSosial(row.mediaSosial)`. Detail (find-unique) meng-include `GALERI_SELECT` /
   `PENGURUS_SELECT` urut `URUTAN_ANAK`; find-many tetap ringan (omit kolom berat).
3. **State admin**: `createDaftarAnakState<FotoGaleriItem>({ url: (id) => ".../foto-kegiatan", label, tag })`
   (contoh `_state/lingkungan/bank-sampah/bank-sampah.anak.state.ts`).
4. **Admin**: form induk memakai `MediaSosialInput`, `LokasiInput`, `GambarField` (bagan, `onHapusTersimpan`);
   halaman edit memasang `StrukturPengurusAdmin` + `GaleriFotoAdmin` dengan state di atas (butuh id induk,
   jadi di halaman tambah tampilkan info "simpan dulu").
5. **Publik**: `MediaSosialLinks`, `KontakLink`, `TombolGoogleMaps`, `StrukturPengurusView`, `GaleriFoto`
   (+ `KontenKosong` untuk tab tanpa data). Bila galeri berada di dalam `Modal`, teruskan `onPreviewChange`
   dan set `closeOnEscape={!pratinjauTerbuka}` di modal induk agar Escape hanya menutup pratinjau.

Domain kedua: **Lembaga Sekolah** (Info Sekolah) — migrasi `20261116140000_detail_lembaga_pendidikan`, API
`_lib/pendidikan/info-sekolah-paud/lembaga/lembaga.{data,anak}.ts`, skema `src/lib/lembaga-pendidikan/`, state
`_state/pendidikan/infoSekolahPaud/lembaga.{form,anak.state}.ts`, halaman detail publik
`/pendidikan/info-sekolah/lembaga/[id]` (bagian kosong disembunyikan, bukan state kosong). Titik peta di sini
opsional (`koordinatBerpasangan`) dan link Google Maps disimpan apa adanya (`linkGoogleMaps`, kosong = rute ke titik).

Test acuan: `__tests__/api/konten_bersama_*.test.ts`, `bank_sampah_detail_{api,ui}.test.*`, `bank_sampah_admin_form.test.tsx`,
`lembaga_detail_{api,ui,admin}.test.*`.
BUMDes memakai komponen galeri/gambar yang sama (perilaku & panel Sampah BUMDes tidak berubah).
