# PUSTU (Puskesmas Pembantu): label + konten lengkap

Tanggal: 2026-11-16 · Migrasi: `prisma/migrations/20261116150000_konten_pustu/`

## Keputusan

- **Hanya label yang berganti.** Semua teks UI menu Kesehatan → Puskesmas menjadi "PUSTU (Puskesmas Pembantu)" /
  "PUSTU" (`src/lib/pustu/pustu.label.ts`). Kontrak tetap: model/tabel `Puskesmas`, URL `/kesehatan/puskesmas`,
  API `/api/kesehatan/puskesmas/*`, ID menu `kesehatan.puskesmas`, kunci pencarian `puskesmas`.
- **Konten memakai fondasi bersama** (`docs/KONTEN-BERSAMA.md`): `mediaSosial Json?`, `linkPetunjukArah`
  (tombol peta, hanya host Google), `fotoBaganStrukturId`, tabel anak `PengurusPustu` + `FotoKegiatanPustu`
  (galeri: foto lokasi, fasilitas, kegiatan; hapus permanen). Foto kepala PUSTU = foto pengurus. NIP tidak punya kolom.
- **Layanan unggulan = kolom `Json`** `[{ judul, deskripsi }]`, bukan tabel anak: daftar kecil, selalu dibaca utuh
  bersama barisnya, diubah lewat form induk (bukan CRUD per item). Validasi `layananUnggulanListSchema`
  (judul wajib ≤120, deskripsi ≤500, maks 20); dibaca dengan `bacaLayananUnggulan` (entri rusak dibuang).
- **Prosedur & tarif = teks kaya** (`prosedurPendaftaran`, `tarifBpjs`, `tarifUmum`): editor admin `CreateEditor`,
  disanitasi saat simpan (`sanitizeRichTextForStorage`) dan saat tampil (`sanitizeRichText`). Isi kosong `<p></p>` → NULL.
- **Jam operasional = daftar `{ hari, jam }`** di kolom baru `JamOperasional.jadwal` (relasi `Puskesmas.jam` tetap).
  Kolom lama `workDays` (jam buka), `weekDays` (jam tutup), `holiday` (teks akhir pekan) hanya punya dua slot tetap
  dan tidak bisa memuat format desa ("Senin – Kamis 08.00 – 14.00", "Jumat – Sabtu 08.00 – 12.00"). Kolom lama
  dijadikan nullable dan **tidak dihapus**; migrasi menyalin isinya ke `jadwal` persis seperti halaman lama menampilkannya
  ("Senin – Jumat: buka – tutup", "Sabtu – Minggu / Hari Libur: …", placeholder "-"/"–" dilewati).
  Bentuk ini sengaja berbeda dari `jadwalPelayanan` Posyandu (`src/lib/jadwal-pelayanan.ts`) yang hari-nya enum tetap.
- **Kontak**: `KontakPuskesmas` semua kolom nullable; `kontakUGD` berlabel "Kontak Darurat / Ambulans".
  `facebook` tidak ditulis/dikirim lagi: migrasi menyalin nilainya ke `Puskesmas.mediaSosial` (`{ platform: "facebook" }`)
  dengan aturan `lengkapiUrlMedsos` (URL http(s), "facebook.com/…", atau nama akun). Isian yang tidak bisa jadi URL
  aman (email, teks berspasi, "-") dilewati dan tetap tersimpan di kolom lama.

## Kontrak API yang berubah (konsumen di repo ikut diperbarui)

- Body POST `/create` & PUT `/:id`: nama + alamat wajib; field lain opsional (`undefined` = tidak diubah), `jadwal`
  menggantikan `jam`, `kontak` tanpa `facebook`, `imageId` opsional. Validasi zod → 400 `{ success:false, message }`.
- Respons find-many/find-unique: `jadwal` (hasil baca) menggantikan objek `jam`; `kontak` tanpa `facebook`;
  `image` tanpa path server. find-many tetap berpaginasi (limit dibatasi 50) dan ringan.
- Snapshot `__tests__/api/__snapshots__/jenna_knowledge_registry.test.ts.snap` diperbarui: `JamOperasional.jadwal`
  menggantikan tiga kolom jam lama; sumber PUSTU membaca `layananUnggulan`, `tarifBpjs`, `tarifUmum`.
