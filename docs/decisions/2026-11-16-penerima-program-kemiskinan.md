# Penerima Program Pengentasan Kemiskinan (PKH, CPP, BLT Desa) per tahun

Tanggal: 2026-11-16

## Konteks
Desa mengirim daftar penerima bantuan (BNBA) per program per tahun: PKH, CPP, dan BLT Desa untuk 2025/2026. Berkas
aslinya memuat NIK, tanggal lahir, jenis kelamin, nomor KK, pekerjaan, dan kolom lain. Model lama `ProgramKemiskinan`
hanya punya nama/deskripsi/ikon + relasi 1-1 `StatistikKemiskinan`, tanpa tempat untuk penerima.

## Keputusan
- **Hanya nama + alamat (keputusan user).** Tabel baru `PenerimaProgramKemiskinan` (`programId` FK cascade, `tahun`,
  `nama`, `alamat`, `urutan`, `isActive`, index `(programId, tahun)`), migrasi
  `20261116130000_penerima_program_kemiskinan`. Kolom lain BNBA sengaja tidak punya kolom, jadi tidak bisa tersimpan.
  Validasi di boundary API (`src/lib/program-kemiskinan/penerima.rules.ts`): nama & alamat wajib, spasi dirapikan,
  nama ≤ 150, alamat ≤ 200 karakter, tahun bulat 2000..tahun berjalan + 1. Nama penerima tidak pernah di-log.
- **Impor CSV di browser.** Admin (detail program → panel Penerima Bantuan) memilih tahun, mode **tambah** atau
  **ganti seluruh data tahun X**, lalu berkas CSV (≤ 2 MB, ≤ 5000 baris). Berkas diparse di browser
  (`penerima-csv.ts`: pemisah `,`/`;`, kutip RFC 4180, BOM): header wajib memuat `nama` dan `alamat` (alias BNBA
  `NAMA_PENERIMA`, `NAMA KEPALA KELUARGA`, `NAMA KRT`, `NAMA KPM` diterima), kolom lain dibuang **sebelum** dikirim,
  baris tanpa nama/alamat ditolak dan ditampilkan di pratinjau. Server memvalidasi ulang semua baris; satu baris tidak
  valid menolak seluruh impor (400), dan mode ganti berjalan dalam satu transaksi (hapus lalu isi). Pola lama
  `upl-csv*.ts` tidak dipakai (handler itu mencetak isi berkas ke log).
- **Publik.** `/ekonomi/program-kemiskinan` tetap menampilkan kartu program + grafik statistik; tiap kartu menaut ke
  `/ekonomi/program-kemiskinan/{slug atau id}`: deskripsi, pilihan tahun, jumlah penerima, rekap per alamat/banjar
  (maks 30 alamat terbanyak + "Lainnya"), dan daftar nama + alamat berpaginasi (20 per halaman) dengan pencarian.
- **Perlindungan dari mesin pencari.** Halaman detail diberi meta `robots: noindex, follow`, dan semua respons API
  `/api/ekonomi/programkemiskinan/publik/*` membawa header `X-Robots-Tag: noindex, nofollow`. Kenapa: daftar nama
  warga penerima bantuan boleh dibaca warga untuk transparansi, tetapi tidak perlu muncul saat nama seseorang dicari
  di Google. Tidak memakai `Disallow` di robots.txt, karena crawler yang diblokir tidak membaca `noindex` dan URL-nya
  tetap bisa terindeks tanpa isi. Penerima juga tidak dimasukkan ke pencarian global maupun pengetahuan Jenna.
- **Slug opsional.** `ProgramKemiskinan.slug` (unik, nullable) untuk URL terbaca (`pkh`, `cpp`, `blt-desa` di seed).
  Program baru dari admin mendapat slug otomatis dari nama; program lama tanpa slug dibuka lewat id.
- **Statistik jadi opsional.** Form & API create/update program menerima statistik kosong (tahun dan jumlah dua-duanya
  kosong), karena program bantuan tidak selalu punya statistik kemiskinan tahunan (relasi lama 1-1, tahun unik).
  Update tanpa statistik tidak menghapus statistik yang sudah terhubung. Kontrak lama tetap diterima (aditif).

## Kontrak API
Publik (tanpa login, hanya program & penerima aktif):

| Endpoint | Isi |
|---|---|
| `GET /api/ekonomi/programkemiskinan/publik/:key` | `{ id, slug, nama, deskripsi, icon, tahun: [{ tahun, jumlah }] }` (terbaru dulu); 404 bila tidak ada/nonaktif |
| `GET /api/ekonomi/programkemiskinan/publik/:key/penerima?tahun=&page=&limit=&search=` | `data: [{ nama, alamat, tahun }]` + `page, limit, total, totalPages`; `tahun` wajib, `limit` ≤ 50 |
| `GET /api/ekonomi/programkemiskinan/publik/:key/rekap?tahun=` | `{ tahun, data: [{ alamat, jumlah }], lainnya, total }` |

Admin (role admin 0–4, dicek di handler lewat `guardAdmin` karena GET di luar `ADMIN_ONLY_GET_PATHS`):
`GET /penerima/admin?programId=` (termasuk nonaktif, `limit` ≤ 100, + jumlah per tahun), `POST /penerima/create`,
`PUT /penerima/:id`, `DELETE /penerima/del/:id` (hapus permanen), `POST /penerima/import`
(`{ programId, tahun, mode: "tambah"|"ganti", rows: [{ nama, alamat }] }`), semuanya di bawah
`/api/ekonomi/programkemiskinan`.

## Akibat
- Data penerima diisi admin lewat impor CSV; seed tidak berisi data warga.
- Mengubah alamat menjadi banjar baku (bukan teks bebas) akan membuat rekap lebih rapi; kini rekap mengelompokkan teks
  alamat yang sama persis (setelah spasi dirapikan), jadi "BR. BUCU" dan "Br Bucu" terhitung terpisah.
