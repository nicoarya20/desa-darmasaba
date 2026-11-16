# Konten bersama: galeri, media sosial, kontak, struktur pengurus, lokasi

Fondasi yang dipakai berulang oleh entri domain yang punya halaman/modal detail (Bank Sampah dan PUSTU sudah memakai;
Lembaga Sekolah, Posyandu menyusul). Keputusan: **tabel per domain** (FK aman, cascade jelas),
**kode bersama** (UI, validasi, helper API, state). Jangan salin komponen ke domain; pakai yang di bawah.

## Lokasi kode

| Lapis | Lokasi | Isi |
|---|---|---|
| Logika murni | `src/lib/konten-bersama/` | `media-sosial.model.ts` (platform, label, ikon, `lengkapiUrlMedsos`), `media-sosial.validation.ts` (`mediaSosialListSchema`, `bacaMediaSosial`), `tautan.validation.ts` (`isHttpUrl`, `urlHttpSchema`), `kontak.link.ts` (`tautanKontak` → `tel:`/wa.me), `lokasi.logic.ts` (`linkGoogleMapsSchema`, `linkGoogleMaps`, `linkRuteKoordinat`, `PUSAT_PETA_DEFAULT`), `galeri.validation.ts` (`buatSkemaGaleri`), `pengurus.validation.ts` (`buatSkemaPengurus`), `daftar-anak.validation.ts` (`skemaUrutan`), `teks.validation.ts`, `urutan.logic.ts`, `konten-bersama.types.ts` (`FotoGaleriItem`, `PengurusItem`) |
| API | `src/app/api/[[...slugs]]/_lib/_konten-bersama/` | `daftar-anak.config.ts` (`galeriConfig`, `pengurusConfig`, select bersama), `daftar-anak.handlers.ts` (`createDaftarAnakHandlers`: list, create, update, remove permanen + hapus berkas, reorder), `daftar-anak.routes.ts` (`createDaftarAnakRoutes`) |
| State admin | `src/app/admin/(dashboard)/_state/konten-bersama/` | `daftar-anak.state.ts` (`createDaftarAnakState`), `unggah-gambar.ts` (`unggahGambar`, `hapusUnggahanYatim`) |
| Komponen admin | `src/app/admin/(dashboard)/_com/konten-bersama/` | `media-sosial.input`, `lokasi.input` (peta + link Google Maps), `gambar.field` / `gambar.dropzone`, `galeri-foto.admin` (+ `-grid`, `-card`), `struktur-pengurus.admin` (+ `pengurus.form-modal`) |
| Komponen publik | `src/app/(public)/_com/konten-bersama/` | `media-sosial.links`, `kontak.link`, `lokasi.tombol` ("Buka di Google Maps"), `galeri-foto.grid` (grid + pratinjau), `struktur-pengurus.view` (bagan lalu kartu pengurus), `konten-kosong` |

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

Test acuan: `__tests__/api/konten_bersama_*.test.ts`, `bank_sampah_detail_{api,ui}.test.*`, `bank_sampah_admin_form.test.tsx`.

PUSTU (`Puskesmas`): pemasangan sama (API `_lib/kesehatan/puskesmas/pustu.anak.ts`, state
`_state/kesehatan/puskesmas/pustu.anak.state.ts`, admin `kesehatan/puskesmas/_com/pustu.anak-admin.tsx`), tanpa koordinat:
tombol peta hanya dari link Google Maps. Field khusus PUSTU (jam per rentang hari, layanan unggulan, prosedur, tarif) ada di
`src/lib/pustu/` — lihat `docs/decisions/2026-11-16-pustu-konten.md`. Test: `__tests__/api/pustu_*.test.*`.
BUMDes memakai komponen galeri/gambar yang sama (perilaku & panel Sampah BUMDes tidak berubah).
