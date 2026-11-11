# Berita: tanggal terbit yang diatur admin

Tanggal: 2026-11-11 · Migrasi: `20261111120000_berita_tanggal_terbit`

## Konteks
Model `Berita` hanya punya `createdAt` (= waktu klik Simpan). Berita kegiatan Agustus yang diinput hari ini tampil
bertanggal hari ini (bertentangan dengan isinya) dan naik ke urutan teratas karena list diurutkan `createdAt desc`.
22 berita impor dari website lama juga tampil bertanggal 10–11 Nov 2026 padahal aslinya Juli–Oktober 2026.

## Keputusan — tiru `Pengumuman.tanggalTerbit` (`2026-11-10-pengumuman-lampiran.md`)
- **`tanggalTerbit DateTime @default(now())`, NOT NULL**, index `(tanggalTerbit, createdAt)` untuk urutan list.
  Migrasi: kolom nullable → backfill `= createdAt` → `SET DEFAULT` → `SET NOT NULL`, idempoten. Tampilan & urutan
  data lama tidak berubah.
- **Urutan semua list = `tanggalTerbit desc, createdAt desc`** (`BERITA_LIST_ORDER_BY` di `src/lib/berita-data.ts`):
  `find-many`/`find-many-ui`, `find-first`, `find-recent`, modul search (sebelumnya tanpa urutan), dan
  `/api/news/latest` (bagian berita; `timestamp` berita kini `tanggalTerbit`).
- **Helper tanggal dipakai bersama.** Isi `src/lib/pengumuman-tanggal.ts` dipindah ke `src/lib/tanggal-terbit.ts`
  (parse `YYYY-MM-DD` = 00:00 WITA / ISO, format WITA, `tanggalTerbitAtauDibuat`, `tanggalTerbitJikaDiubah`);
  `pengumuman-tanggal.ts` tinggal re-export dengan nama lama, perilaku Pengumuman tidak berubah.
  `formatTanggalTerbit` mendapat parameter opsional `month: "short"` untuk kartu list (`17 Agu 2026`).
- **Tampilan publik memakai zona WITA.** Sebelumnya kartu list memakai `toLocaleDateString` di zona browser; karena
  tanggal terbit disimpan 00:00 WITA, pembaca di WIB akan melihat tanggal sehari lebih awal. Kini semua lewat
  `formatTanggalTerbit`. Halaman detail berita (publik & informasi desa) kini menampilkan tanggal terbit.
- **Form admin**: isian Tanggal Terbit (`type="date"`) default hari ini di tambah; di edit terisi nilai tersimpan dan
  **hanya dikirim bila diubah** supaya jam hasil backfill tidak tertimpa 00:00. Wajib diisi di kedua form.
- **Seeder berita** mengisi `tanggalTerbit` (dan `createdAt`) dari tanggal asli, supaya DB yang di-seed ulang tidak
  mendapat tanggal terbit = waktu seed.

## Kontrak `/api/desa/berita` (additive)
| Method | Path | Perubahan |
|---|---|---|
| POST | `/create` | opsional `tanggalTerbit?: string \| null` (`YYYY-MM-DD` WITA / ISO; kosong = sekarang). Respons `data` = body + `id` + `tanggalTerbit`. Tanggal tidak valid → 400 `{ success: false, message }` sebelum menyentuh DB. |
| PUT | `/:id` | opsional `tanggalTerbit` (kosong = tidak diubah). Tidak valid → 400 sebelum DB/MinIO (gambar lama tidak ikut terhapus). |
| GET | `/:id`, `/find-many`, `/find-many-ui`, `/find-first`, `/find-recent` | tambah `tanggalTerbit`; urutan list kini `tanggalTerbit desc, createdAt desc` (sebelumnya `createdAt desc`). |

## Di luar lingkup
Koreksi tanggal 22 berita impor (via form edit setelah deploy), bagian pengumuman di `/api/news/latest` yang masih
`createdAt`, bug `Berita.deletedAt @default(now())`, dan `findManyUI.ts` yang tidak dirujuk route mana pun
(`/find-many-ui` memakai handler `find-many`) — hanya diberi urutan yang sama.
