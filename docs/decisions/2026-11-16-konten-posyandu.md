# Konten Posyandu: deskripsi umum, kegiatan per klaster, posyandu per banjar

Tanggal: 2026-11-16

## Konteks
Dokumen Bidang Kesehatan desa (bagian 2) berisi satu deskripsi Posyandu untuk seluruh desa + fungsi/kegiatan utama,
tiga klaster sasaran (Balita 09.00, Lansia & PROLANIS 16.00, Remaja 18.00 WITA) yang berjalan bulanan di 12 banjar,
dan per banjar: nama, alamat, foto lokasi, foto kader/kegiatan. Model lama `Posyandu` hanya punya deskripsi per
posyandu dan satu gambar, tanpa alamat atau galeri.

## Keputusan (user)
Isi create/update/detail Posyandu = **deskripsi umum (singleton)**, **kegiatan klaster Balita/Remaja/Lansia**, dan
**tempat posyandu di tiap banjar**. Migrasi `20261116160000_konten_posyandu` (additive, idempoten):

- `ProfilPosyandu` singleton ber-id tetap `profil-posyandu` (pola `ProfilBumDes`): `deskripsi` (teks kaya, wajib),
  `fungsiKegiatan` (teks kaya, opsional). Teks kaya dibersihkan `sanitizeRichTextForStorage` saat disimpan.
- `KlasterPosyandu`: `sasaran` unik dibatasi `balita | remaja | lansia` (zod `sasaranKlasterSchema` + CHECK
  `KlasterPosyandu_sasaran_check`), `judul`, `deskripsi` (fokus layanan, teks polos), `jamPelayanan?`, `imageId?`
  (SET NULL), `urutan`. Migrasi mengisi 3 baris default dari dokumen desa (`ON CONFLICT DO NOTHING`), jadi admin
  mengubah klaster, tidak menambah/menghapus.
- `Posyandu.alamat` (nullable) + `FotoKegiatanPosyandu` (galeri foto lokasi & kader, fondasi
  `docs/KONTEN-BERSAMA.md`, hapus permanen). Banjar wajib dipilih di form admin; API tetap menerima kosong agar data
  lama tidak rusak. Keterangan per posyandu (`Posyandu.deskripsi`) jadi opsional di form karena deskripsi umum kini
  di profil.

## Kontrak API (additive)
| Endpoint | Isi |
|---|---|
| `GET /api/kesehatan/posyandu/profil` | `{ profil: { deskripsi, fungsiKegiatan } \| null, klaster: KlasterPosyanduItem[] }` (publik) |
| `PUT /api/kesehatan/posyandu/profil` | admin; `{ deskripsi, fungsiKegiatan?, klaster?: [{ sasaran, judul, deskripsi, jamPelayanan?, imageId? }] }`, satu transaksi; gambar klaster yang diganti dihapus permanen |
| `GET\|POST /api/kesehatan/posyandu/:id/foto-kegiatan`, `PUT …/urutan`, `PUT\|DELETE …/:itemId` | galeri (helper bersama) |
| `GET /api/kesehatan/posyandu/:id` | + `alamat`, `fotoKegiatan[]` |
| `POST /create`, `PUT /:id` | + `alamat?` (tidak dikirim = tidak diubah) |

Tipe & validasi: `src/lib/posyandu/posyandu-konten.{validation,types}.ts`.

## Tampilan
- Admin: tab baru **Profil & Klaster** (`/admin/kesehatan/posyandu/profil-klaster`, masih di bawah menu
  `kesehatan.posyandu`, ID menu tidak berubah); form tambah/edit posyandu memakai `posyandu.form-page` +
  `posyandu.form-fields` bersama, edit memuat galeri. Tab Balita/Ibu Hamil/Ringkasan Kesehatan tidak diubah.
- Publik `/kesehatan/posyandu`: tab Ringkasan menampilkan deskripsi umum + 3 kartu klaster di atas panel statistik
  (agregat, tidak berubah); direktori menampilkan alamat; detail menampilkan alamat + galeri.
- Privasi: endpoint balita/ibu hamil tidak disentuh (butir P1 di `docs/BACKEND-TODO.md` tetap terbuka). Data
  kader/warga dari dokumen desa tidak disalin ke kode, seed, maupun test.
