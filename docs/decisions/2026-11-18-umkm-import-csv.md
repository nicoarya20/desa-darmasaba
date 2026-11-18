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
Kategori tidak diubah; tab Produk mendapat impor sendiri (bagian Impor Produk di bawah).

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

---

# Impor Produk (admin Ekonomi > UMKM & Pasar Desa > Produk)

Tanggal: 2026-11-18 (lanjutan, branch yang sama)

Produk UMKM (`PasarDesa`) juga hanya bisa diisi satu per satu. Impor CSV Produk memakai pola yang sama dengan impor
Data UMKM di atas (parse di browser, dry-run, semua-atau-tidak-sama-sekali, tanpa log isi data); bagian ini hanya
mencatat yang berbeda.

## Keputusan
- **Kolom.** Wajib: `nama` ("nama produk"), `umkm` ("nama umkm", "toko", "nama toko"), `kategori` ("kategori produk"),
  `harga`. Opsional: `pemilik` ("pemilik umkm"), `stok` (kosong = 0), `satuan`, `deskripsi`, `unggulan` ("produk
  unggulan"; ya/tidak, true/false, 1/0, y/n, tak peka huruf besar/kecil), dan satu kolom link per platform:
  `link_shopee`, `link_tokopedia`, `link_tiktok_shop`, `link_blibli`, `link_lazada`, `link_lainnya` (alias: nama
  platform saja, "link <platform>", "tiktok", "toko online lainnya"). Gambar, rating, dan `isActive` tidak diimpor
  (produk baru = aktif, rating 0). Kolom lain dibuang di browser.
- **Kunci duplikat = `umkmId` + nama produk ternormalisasi**, hanya `deletedAt: null`. Link tidak ikut kunci. Mode
  `lewati` (bawaan) dan `perbarui` (memperbarui `kategoriProdukId`, `harga`, `stok`, `satuan`, `deskripsi`,
  `isUnggulan`; sel kosong tidak menimpa; nama dan UMKM tidak pernah diubah). Tidak ada "ganti semua". Kunci kembar di
  dalam berkas = galat mulai kemunculan kedua.
- **UMKM dicocokkan by nama, tidak ada yang dibuat otomatis.** Hanya UMKM `deletedAt: null`. UMKM nonaktif = galat
  baris. Nama kembar: kolom `pemilik` mempersempit; tanpa pemilik (atau pemilik pun kembar) = galat "ambigu", pemilik
  yang tidak cocok = galat. Kategori dicocokkan seperti impor UMKM (aktif, tidak ambigu; kode bersama
  `src/lib/umkm/impor-kategori.ts`).
- **Angka rupiah.** `harga` dan `stok` bilangan bulat ≥ 0: "15000", "15.000", "Rp 15.000", "Rp15.000,-" diterima;
  desimal bernilai, notasi ilmiah (hasil Excel), negatif, huruf, dan "15,000" (ambigu) ditolak dengan pesan yang
  menyebut kolomnya. Titik = ribuan, koma = desimal (kebiasaan Indonesia). Batas atas: harga 2.000.000.000, stok
  1.000.000. Harga 0 diterima (form juga menerima). Harga < 100 hanya **peringatan** (kemungkinan "15.000" terpotong
  Excel jadi 15); nilai tidak pernah diubah otomatis.
- **Batas panjang** (form tidak membatasi, jadi dipilih wajar): `nama` 150, `umkm` 150, `pemilik` 150, `kategori` 100,
  `satuan` 30, `deskripsi` 2000. Deskripsi disimpan sebagai HTML seperti impor UMKM (escape + `<p>`).
- **Link toko online (opsional).** Divalidasi dengan util resmi form (`validateLinkTokoOnline(List)`): hanya https,
  host harus cocok platform (kecuali `LAINNYA`), tanpa userinfo, ≤ 2048 karakter, maksimal 5 per produk; galat menyebut
  nama kolomnya. Sel kosong diabaikan; URL tanpa skema = galat (tidak ditambah `https://` otomatis).
  - *Penyimpanan:* `createMany` tidak mengembalikan id, jadi produk baru **berlink** dibuat satu per satu dengan nested
    `linkTokoOnline.create` (atomik dalam transaksi yang sama); produk tanpa link tetap `createMany` per ≤ 1000.
  - *Mode `perbarui`:* semua sel link kosong = link lama tidak disentuh; ≥ 1 sel terisi = **seluruh daftar link produk
    itu diganti** (hapus lalu buat, pola `produk/updt.ts`). Pratinjau menampilkan "N produk akan diganti daftar link toko
    onlinenya" dan modal menjelaskannya. Mode `lewati` tidak menyentuh link baris yang dilewati.
- **Ekstraksi bersama (tanpa copy-paste).** Dipindah/dibuat generik agar UMKM dan Produk berbagi kode:
  `src/lib/csv/parse-impor.ts` (parser tabel→baris, `buatBerkasCsv`), `src/lib/umkm/impor-kategori.ts` (pencocokan
  kategori), `nilai-impor.ts` (angka & ya/tidak), `umkm-impor-pratinjau.ts` (jadi generik), handler server
  `_lib/ekonomi/umkm/_impor-handler.ts` (`buatHandlerImpor`: guard admin, dry-run, transaksi, 400/500), state
  `umkmState/buat-state-impor.ts`, serta UI `ekonomi/umkm/_com/import/` (`ImporBody`, `ImporModal`, `unduhCsv`).
  `UmkmImportBody`/`UmkmImportModal` tinggal konfigurasi tipis di atasnya; perilaku UMKM tidak berubah (pesan, kontrak
  API, dan tes lama sama).

## Kontrak API
`POST /api/ekonomi/umkm/produk/import` (aditif; admin role 0-4 lewat `guardAdmin`; bukan path POST publik).
Body: `{ mode: "lewati" | "perbarui", dryRun?: boolean, rows: [{ nama, umkm, kategori, harga: number, pemilik?, stok?: number, satuan?, deskripsi?, unggulan?: boolean, link?: { shopee?, tokopedia?, tiktok_shop?, blibli?, lazada?, lainnya? } }] }`,
`rows` 1..1000; `umkm`/`kategori` dikirim sebagai **nama**, `link` berisi URL per platform (kunci = kode platform huruf
kecil). Bentuk respons sama dengan impor UMKM; `data` dry-run mendapat field aditif `linkDiganti` (jumlah produk yang
daftar link tokonya diganti). Pesan sukses `N produk ditambah, N diperbarui, N dilewati`; 500: `Gagal mengimpor data produk`.

## Admin UI
Tombol sekunder "Impor CSV" di samping "Tambah Produk" (`produk/page.tsx`); modal `produk/_com/ProdukImportModal.tsx`,
state `imporProduk` (`umkmState/produk-impor.ts`). Template: `nama;umkm;pemilik;kategori;harga;stok;satuan;deskripsi;unggulan`
+ enam kolom link, 2 contoh (nama UMKM/kategori contoh bertanda "CONTOH"). Modal mengingatkan "Excel: format kolom
harga/stok sebagai Teks atau Angka tanpa desimal". Pratinjau: hitungan, 10 baris pertama (nama, UMKM, kategori, harga
berformat Rupiah, stok, penanda "N link", bukan URL penuh), galat dengan nomor baris berkas. Setelah sukses daftar
produk dimuat ulang (pencarian dipertahankan).

## Risiko sisa
- **Tanpa unique index `(umkmId, nama)`** di `PasarDesa`: duplikat dicegah lewat baca-lalu-tulis dalam transaksi;
  impor/penambahan paralel tetap bisa membuat kembar. Juga `create.ts` tidak memvalidasi UMKM/kategori aktif
  (BACKEND-TODO).
- **Harga terpotong Excel** (mis. "15.000" jadi 15) hanya diberi peringatan, bukan galat, karena harga kecil bisa sah.
- **Link lama hilang** pada `perbarui` bila baris mengisi ≥ 1 link: daftar diganti seluruhnya, tidak digabung. Admin
  diberi peringatan di pratinjau, tetapi tidak ada daftar per produk.
- **Gambar tidak diimpor**; produk hasil impor tampil tanpa foto sampai diunggah lewat Ubah Produk.
- **Belum diuji di browser sungguhan**: unduh template, pemilih berkas, dan berkas Excel asli.
