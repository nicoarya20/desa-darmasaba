# Impor CSV Data UMKM (admin Ekonomi > UMKM & Pasar Desa > Data UMKM)

Tanggal: 2026-11-18

## Konteks
Data UMKM hanya bisa diisi satu per satu lewat form "Tambah UMKM". Desa memegang daftar UMKM dalam spreadsheet, jadi
admin butuh impor massal. Pola yang dipakai sama dengan impor penerima program kemiskinan
(`docs/decisions/2026-11-16-penerima-program-kemiskinan.md`): berkas diparse di browser, server memvalidasi ulang
semuanya. Pola lama `upl-csv*.ts` dan `/admin/csv` tidak dipakai (handler itu mencetak isi berkas ke log).

## Keputusan
- **Kolom.** Header tidak peka huruf besar/kecil dan alias dinormalkan. Wajib: `nama` (alias "nama umkm", "nama usaha"),
  `pemilik` ("nama pemilik"), `kategori` ("kategori produk", "kategori umkm"). Opsional: `deskripsi`, `alamat`,
  `kontak` ("telepon", "no hp", "no telepon", "whatsapp"). Kolom lain dibuang di browser sebelum dikirim. Gambar tidak
  diimpor (unggah lewat Ubah UMKM) dan `isActive` tidak diimpor (UMKM baru = aktif). Header ganda untuk kolom yang sama
  (termasuk dua alias) menolak berkas, karena kolom mana yang dipakai jadi tebakan.
- **Kategori dicocokkan by-nama, tanpa membuat otomatis.** Nama dinormalkan (NFC, huruf kecil, spasi dirapikan) dan
  dicocokkan ke `KategoriProdukUmkm` aktif (`isActive`, `deletedAt: null`). Kategori tak dikenal = galat baris yang
  menyebut nama kategorinya (admin membuatnya dulu di tab Kategori Produk). Dua kategori aktif bernama sama = galat
  "ambigu" (kondisi nyata di stg: dua "Makanan").
- **Kunci duplikat = nama + pemilik** (dinormalkan seperti di atas) terhadap UMKM `deletedAt: null`. Mode:
  - `lewati` (bawaan): yang sudah ada dilewati dan dihitung; kategorinya tidak dinilai.
  - `perbarui`: memperbarui `kategoriId`, `deskripsi`, `alamat`, `kontak`; **sel kosong tidak menimpa**. Bila di DB ada
    beberapa UMKM berkunci sama, hanya yang terlama (`createdAt`, `id`) diperbarui.
  - Tidak ada mode "ganti semua": menghapus seluruh UMKM akan memutus relasi produk (`PasarDesa`).
  - Kunci kembar di dalam berkas = galat mulai kemunculan kedua ("sama dengan baris N"), tidak digabung diam-diam.
- **Dry-run lalu semua-atau-tidak-sama-sekali.** Browser memanggil endpoint dengan `dryRun: true` (tanpa tulis) untuk
  pratinjau hitungan, galat, dan peringatan. Impor sungguhan membaca ulang kategori/UMKM dan menulis dalam satu
  `prisma.$transaction` (timeout 30 dtk; `createMany` per ≤ 1000, `update` per baris untuk `perbarui`). Ada satu
  galat saja = 400 dan tidak ada yang tersimpan.
- **Sumber validasi tunggal** di `src/lib/umkm/` (murni, dipakai browser dan server): `umkm-impor.rules.ts` (batas,
  normalisasi, validasi baris), `umkm-impor-csv.ts` (parser + template), `umkm-impor-rencana.ts` (rencana impor),
  `umkm-impor-pratinjau.ts` (pemetaan nomor baris). Batas: 1000 baris dan 2 MB per berkas. Batas panjang: `nama` 150,
  `pemilik` 150, `kategori` 100, `alamat` 255, `deskripsi` 2000 karakter, `kontak` angka saja maks 13 digit
  (**sama dengan form**; form hanya membatasi `kontak`, sisanya batas dipilih wajar dan ada di aturan itu).
  Karakter kontrol dan lebar-nol dibuang; spasi dirapikan.
- **Deskripsi disimpan sebagai HTML.** Form admin memakai editor rich-text dan halaman publik merender HTML
  (disanitasi adapter), jadi teks CSV di-escape lalu dibungkus `<p>` per paragraf. Tanpa ini `<` di CSV tampil rusak.
- **Kontak.** Pemisah umum (spasi, `+-().`) dibuang; huruf = galat baris. Kontak 9–13 digit murni berawalan "8"
  memunculkan **peringatan** (bukan galat) karena Excel biasa membuang angka 0 di depan nomor; tidak pernah diperbaiki
  otomatis (bisa saja bukan nomor Indonesia).
- **Parser CSV dipisah jadi modul generik** `src/lib/csv/parse-csv.ts` (BOM, `,`/`;`, kutip RFC 4180, CRLF). `penerima-csv.ts`
  memakainya tanpa perubahan perilaku maupun ekspor (`program_kemiskinan_penerima_csv.test.ts` tetap hijau tanpa diubah).
  Tambahan yang hanya dipakai impor UMKM: deteksi kutip tak tertutup, ukuran dalam byte UTF-8, baris kosong dilewati
  diam-diam (nomor baris berkas tetap benar), jumlah sel tak sama dengan header tidak membuat crash, dan `hitungKolom`.
- **Privasi.** Nama, pemilik, dan kontak tidak pernah di-log. Galat tak terduga hanya mencatat kelas galat dan kode
  Prisma (pesan Prisma bisa memuat nilai kolom). Pesan galat ke admin hanya memuat nomor baris dan nama kolom/kategori.

## Kontrak API
`POST /api/ekonomi/umkm/import` (aditif; hanya admin role 0-4 lewat `guardAdmin`; bukan path POST publik; tanpa sesi 401,
bukan admin 403).

Body: `{ mode: "lewati" | "perbarui", dryRun?: boolean, rows: [{ nama, pemilik, kategori, deskripsi?, alamat?, kontak? }] }`,
`rows` 1..1000 (`kategori` dikirim sebagai **nama**). Nomor baris di respons = indeks di `rows` + 1; browser memetakannya
kembali ke nomor baris berkas (1 = header).

| Kasus | Respons |
|---|---|
| `dryRun: true` | 200 `{ success: true, message, data: { ditambah, diperbarui, dilewati, galat: [{ baris, alasan }] (maks 50), totalGalat, peringatan: [...] (maks 50), totalPeringatan } }`; galat dilaporkan di `data`, bukan lewat status |
| Impor berhasil | 200 `{ success: true, message, data: { ditambah, diperbarui, dilewati } }` |
| Ada baris galat | 400 `{ success: false, message, galat: [...] (maks 50), totalGalat }`, tidak ada yang tersimpan |
| `rows` kosong / skema salah | 400 / 422 dari validasi skema |
| Galat tak terduga | 500 `{ success: false, message: "Gagal mengimpor data UMKM" }` |

## Admin UI
Tombol sekunder "Impor CSV" di samping "Tambah UMKM" (`data-umkm/page.tsx`); modal di `data-umkm/_com/`, state Valtio
`imporUmkm` (`_state/ekonomi/umkm/umkmState/umkm-impor.ts`). Alur: petunjuk + "Unduh template CSV" (dibuat di
browser, UTF-8 BOM, pemisah `;`, 2 baris contoh) → pilih mode dan berkas `.csv` (≤ 2 MB) → parse + dry-run → pratinjau
(hitungan, 10 baris pertama, galat dan peringatan dengan nomor baris berkas; tombol Impor nonaktif bila ada galat atau
0 baris) → konfirmasi. Saat mengimpor modal tidak bisa ditutup. Galat jaringan/server tampil sebagai pesan merah
di modal (tanpa toast ganda); sukses = satu toast ringkasan, modal tutup, daftar dimuat ulang dari halaman 1. Tab
Produk dan Kategori tidak diubah.

## Risiko sisa
- **Duplikat karena impor/penambahan bersamaan.** `Umkm` tidak punya unique index `(nama, pemilik)` dan migrasi tidak
  termasuk lingkup ini; pengecekan duplikat berupa baca-lalu-tulis dalam transaksi (isolasi bawaan Postgres tidak
  mencegah dua transaksi paralel menyisipkan kunci yang sama). Dicatat di `docs/BACKEND-TODO.md`.
- **Nomor telepon kehilangan angka 0** saat berkas dibuka dan disimpan ulang di Excel; hanya diberi peringatan (lihat
  atas). Template memakai nomor berawalan 0 dan pemisah `;` agar Excel Indonesia membukanya benar, tetapi sel yang
  diformat sebagai angka tetap bisa membuang 0.
- **Gambar tidak diimpor**; UMKM hasil impor tampil tanpa foto sampai diunggah lewat Ubah UMKM.
- **Kategori "Makanan" ganda di stg** membuat baris berkategori itu ditolak "ambigu" sampai kategori digabung (lihat
  bagian Isi data di BACKEND-TODO).
- **Duplikat lama di DB**: mode `perbarui` hanya menyentuh satu (terlama); mode `lewati` menganggap kunci itu sudah ada.
- **Belum diuji di browser sungguhan**: unduh template, dropzone/pemilih berkas, dan berkas hasil Excel asli.
  Markup modal diuji lewat `renderToStaticMarkup` (jsdom rusak di repo ini).
