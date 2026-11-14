# Backend TODO (temuan dari pekerjaan frontend)

Daftar masalah backend/API/schema/form admin yang **ditemukan saat merombak halaman publik**, tapi sengaja **tidak diperbaiki** di sisi frontend karena backend dikerjakan developer lain. AI yang mengerjakan backend: baca file ini sebelum menyentuh domain terkait, dan **hapus/centang butir yang sudah selesai** (beserta commit-nya) supaya daftar tetap jujur.

Format butir: masalah · lokasi · dampak · usul. "Terverifikasi" = sudah dicek langsung di kode oleh orchestrator; selebihnya dilaporkan sesi frontend dan perlu dicek ulang sebelum dikerjakan.

Ditulis: 2026-11-12 (rombak menu Keamanan v0.1.257, sebagian dari menu Kesehatan v0.1.255).

---

## P1. Keamanan & privasi (kerjakan dulu)

- [x] **XSS tersimpan Laporan Publik** (terverifikasi) — selesai di dua lapis, dikerjakan sisi frontend (P1 Laporan Publik memang dialokasikan ke sini):
  - Render (v0.1.268, `fix/laporan-publik-xss`): detail admin merender `kronologi` & `penanganan[].deskripsi` lewat `sanitizeRichText`. Test: `__tests__/api/laporan_publik_admin_xss.test.tsx`.
  - Simpan (v0.1.269, `fix/laporan-publik-sanitasi-server`): `create.ts` & `updt.ts` menyimpan lewat `sanitizeRichTextForStorage` (`src/lib/rich-text-server.ts`, `sanitize-html` dengan allowlist `RICH_TEXT_TAGS` yang sama, tanpa atribut). Data lama tidak diubah (prod 2026-11-13: 2 laporan, hanya `<p>`). Test: `__tests__/api/laporan_publik_sanitasi_server.test.ts`.

- [x] **Laporan Publik bisa dikirim tanpa auth & tanpa moderasi** (terverifikasi) — selesai v0.1.270 (`feature/laporan-publik-moderasi`), keputusan di `docs/decisions/2026-11-14-laporan-publik-moderasi.md`:
  - Kiriman non-admin ditahan sebagai status `Baru` (tanpa migration) dan tidak tampil di daftar, detail, maupun pencarian publik; admin melihatnya lewat `?moderasi=true` dan menyetujui dengan mengubah status di halaman edit.
  - Batas kiriman non-admin 5 per 10 menit per alamat (429 + `Retry-After`).
  - Sisa (di luar butir ini): user login role 5 masih bisa `PUT`/`DELETE` laporan karena guard global tidak cek role admin (T19 di `docs/penilaian-lomba-website-desa-2027.md`); tanpa captcha.

- [ ] **API publik Balita & Ibu Hamil mengirim data pribadi**
  - Lokasi: `src/app/api/[[...slugs]]/_lib/kesehatan/balita/find-many.ts` (mencari & mengembalikan `nik`, `alamat`, dst.), begitu juga `ibu-hamil`.
  - Dampak: NIK/alamat/HP orang tua bisa diambil siapa pun lewat API. Halaman publik Posyandu sudah tidak memakainya (pakai agregat `ringkasankesehatan/stats`), tapi endpoint tetap terbuka.
  - Usul: wajibkan auth admin untuk find-many/find-unique balita & ibu hamil.

- [ ] **Detail mengabaikan `isActive`**
  - Lokasi: `laporan-publik/findUnique.ts` (terverifikasi: `where: { id }`), `keamanan-lingkungan/findUnique.ts` (terverifikasi), `ekonomi/lowongan-kerja/findUnique.ts` (terverifikasi 2026-11-14: `where: { id }`).
  - Dampak: entri yang dinonaktifkan admin tetap bisa dibuka lewat URL detail (frontend publik kini menganggapnya "tidak ditemukan", tapi API tetap mengirim data).
  - Usul: `where: { id, isActive: true }` untuk endpoint publik.
  - Lowongan Kerja, tambahan (terverifikasi 2026-11-14): `deletedAt` tidak bisa dipakai sebagai penanda hapus. Schema `LowonganPekerjaan.deletedAt DateTime @default(now())` (tidak nullable), jadi selalu terisi saat dibuat (stg: 7/7 lowongan `deletedAt` = `createdAt`), dan `del.ts` melakukan hard delete (`prisma.lowonganPekerjaan.delete`). Halaman detail publik baru (`_com/detail/lowongan-detail.adapter.logic.ts`, `isLowonganTampil`, MITIGASI SEMENTARA(lowongan-detail)) hanya menyaring `isActive` dan sengaja mengabaikan `deletedAt`. Usul: bila ingin soft delete, ubah jadi `deletedAt DateTime?` (migrasi set `NULL` untuk baris yang ada), `del.ts` mengisi `deletedAt`, lalu findMany/findUnique menyaring `deletedAt: null`.

- [ ] **Lowongan Kerja: `deskripsi` & `kualifikasi` (HTML editor) disimpan tanpa sanitasi** (terverifikasi 2026-11-14)
  - Lokasi: `src/app/api/[[...slugs]]/_lib/ekonomi/lowongan-kerja/create.ts` menyimpan `body.deskripsi`/`body.kualifikasi` apa adanya (`updt.ts` berpola sama, perlu dicek). Halaman publik detail `/ekonomi/lowongan-kerja-lokal/[id]` kini menyaring di klien (`sanitizeRichText`, `toRichText` di `_com/detail/lowongan-detail.adapter.logic.ts`) sebelum render; lapis server (saat simpan) tetap belum ada.
  - Dampak: HTML/skrip yang tersimpan dijalankan di halaman publik (XSS tersimpan) bila akun admin disalahgunakan.
  - Usul: simpan lewat `sanitizeRichTextForStorage` (`src/lib/rich-text-server.ts`) seperti Laporan Publik. Sisi render publik sudah disanitasi di halaman detail baru (v0.1.272).

- [ ] **`create()` state Laporan Publik tidak memberi sinyal gagal validasi** (terverifikasi)
  - Debug log `console.log(formData)` & `console.log(res)` sudah dihapus (v0.1.268).
  - Sisa: `src/app/admin/(dashboard)/_state/keamanan/laporan-publik.ts` `create()` hanya memunculkan toast saat validasi gagal tanpa sinyal gagal ke pemanggil (frontend publik kini memvalidasi sendiri).

- [ ] **Endpoint OTP lama masih hidup: siapa pun bisa memicu kiriman WhatsApp** (terverifikasi 2026-11-13)
  - Lokasi: `src/app/api/auth/register/route.ts` tanpa login dan tanpa rate limit (beda dengan `resend` & `send-otp-register` yang memakai `otpSendLimiter`), mengirim kode OTP lewat `wa.wibudev.com` ke nomor apa pun yang belum terdaftar, lalu menulis ke `KodeOtp`. Halaman `/registrasi` (membungkus `admin/(dashboard)/auth/registrasi-admin`) masih memanggilnya, padahal login kini Google-only dan `/validasi` sudah dialihkan ke `/login` (pendaftaran tak pernah bisa selesai).
  - Dampak: gateway WhatsApp desa bisa dipakai untuk spam ke nomor sembarang; baris `KodeOtp` sampah.
  - Usul: pasang `otpSendLimiter` atau matikan route OTP lama di `src/app/api/auth/` bila memang tak dipakai lagi dan alihkan `/registrasi` ke `/login` di `src/proxy.ts` seperti `/validasi`. User menyerahkan ke rekan (2026-11-13): frontend tidak mengubah `/registrasi` maupun `proxy.ts`.

## P2. Kontrak API yang membuat frontend memakai mitigasi

- [ ] **Katalog produk UMKM belum bisa disaring & diurutkan di server** (terverifikasi, 2026-11-13)
  - Lokasi: `src/app/api/[[...slugs]]/_lib/ekonomi/umkm/produk/findMany.ts` + `_where.ts`. Hanya mendukung `search`, `umkmId`, `kategoriId` (satu nilai), dan `unggulan`. Urutan tetap `createdAt desc`, dan tidak ada jumlah produk per kategori/toko.
  - Mitigasi frontend (MITIGASI SEMENTARA): halaman `/ekonomi/umkm` (rombak gaya katalog, v0.1.264) memuat maks 100 produk sekaligus (`KATALOG_LIST_LIMIT`), lalu menyaring (kategori & toko banyak pilihan, rentang harga, unggulan), mengurutkan, dan menghitung di klien. Ada `console.warn` bila total > 100. Data stg 2026-11-13: 7 produk.
  - Usul: `kategoriId` & `umkmId` banyak nilai (`in`), `hargaMin`/`hargaMax`, `sort=terbaru|harga-asc|harga-desc|nama`, dan jumlah (facet) per kategori & toko. Setelah tersedia, frontend kembali ke paginasi server.

- [ ] **Daftar UMKM publik ikut mengirim UMKM nonaktif & tanpa jumlah produk** (terverifikasi: `ekonomi/umkm/findMany.ts:12` `where = { deletedAt: null }`)
  - Dampak: UMKM yang dinonaktifkan admin tetap muncul di tab Toko. Frontend sementara menyaring `isActive` di klien dan menghitung jumlah produk per toko dari daftar produk yang dimuat.
  - Usul: filter `isActive: true` untuk publik (admin tetap butuh semua, jadi pakai param atau endpoint terpisah), dan sertakan `_count.produk` (hanya produk aktif & belum dihapus).

- [ ] **Daftar produk UMKM publik ikut mengirim produk milik UMKM nonaktif** (terverifikasi: `ekonomi/umkm/produk/_where.ts` `buildProdukWhere`, 2026-11-13)
  - Where hanya `deletedAt: null, isActive: true` milik produk; status UMKM pemiliknya tidak dicek. UMKM yang dinonaktifkan atau dihapus (`del.ts` juga mengeset `isActive: false`) produknya tetap terkirim, dan `total` ikut menghitungnya.
  - Mitigasi frontend (sementara): `isProdukTampil` (`(public)/(pages)/ekonomi/umkm/_com/katalog/katalog-adapter.logic.ts`) membuang produk milik UMKM `isActive: false` di klien, dipakai katalog `/ekonomi/umkm` dan rel "Produk serupa" di detail produk. Akibatnya jumlah per halaman dari server tidak sama dengan yang tampil, jadi paginasi server belum bisa dipakai.
  - Usul: tambah `umkm: { isActive: true, deletedAt: null }` ke where publik. Endpoint ini juga dipakai state admin (`admin/(dashboard)/_state/ekonomi/umkm/umkmState/produk.ts`), jadi cek dulu apakah admin perlu melihat produk dari UMKM nonaktif. Setelah tersedia, `isProdukTampil` bisa dihapus.

- [ ] **Detail produk UMKM publik mengirim produk terhapus/nonaktif, data penjualan, dan tanpa foto UMKM** (terverifikasi: `ekonomi/umkm/produk/findUnique.ts:9-22`, 2026-11-13)
  - `where: { id }` saja: produk yang `deletedAt`/`isActive: false`, atau milik UMKM nonaktif, tetap bisa dibuka lewat URL.
  - Include `penjualan` (10 transaksi terakhir: jumlah, harga, total) ikut terkirim ke publik padahal halaman publik tidak memakainya.
  - Tidak ditemukan dibalas HTTP 200 `{ success: false }`, sama bentuknya dengan galat server; frontend membedakan lewat teks pesan "tidak ditemukan".
  - `umkm: true` tanpa `image`, jadi panel Penjual di detail memakai inisial, bukan foto UMKM.
  - Mitigasi frontend (MITIGASI SEMENTARA umkm-detail): `/ekonomi/umkm/produk/[id]` menampilkan "Produk tidak ditemukan" untuk produk terhapus/nonaktif/UMKM nonaktif dan untuk pesan "tidak ditemukan".
  - Usul: endpoint publik memfilter `deletedAt: null, isActive: true, umkm: { isActive: true }`, membuang `penjualan` (admin pakai endpoint sendiri), membalas 404 untuk tidak ditemukan, dan menyertakan `umkm.image`.

- [ ] **Detail UMKM publik mengirim UMKM nonaktif/terhapus dan produk nonaktif** (terverifikasi: `ekonomi/umkm/findUnique.ts:8-17`, 2026-11-13)
  - `where: { id }` saja, dan `produk` hanya disaring `deletedAt: null`, jadi produk `isActive: false` ikut terkirim. Produk tidak membawa relasi kategori (hanya `kategoriProdukId`). Tidak ditemukan juga dibalas HTTP 200 `{ success: false }`.
  - Mitigasi frontend (MITIGASI SEMENTARA umkm-detail-toko): `/ekonomi/umkm/[id]` menampilkan "Toko tidak ditemukan" untuk UMKM terhapus/nonaktif dan pesan "tidak ditemukan", serta menyembunyikan produk nonaktif.
  - Usul: endpoint publik memfilter `deletedAt: null, isActive: true` untuk UMKM dan produknya, menyertakan `kategoriProduk` per produk, dan membalas 404 untuk tidak ditemukan.

- [ ] **Pencegahan Kriminalitas find-many tanpa offset/skip**
  - Halaman publik mengeluarkan item sorotan dari daftar, jadi butuh offset. Sementara: muat `limit=100` sekali lalu paginasi klien (ditandai MITIGASI SEMENTARA di `(public)/(pages)/keamanan/pencegahan-kriminalitas/_com/pencegahan.meta.ts`, `console.warn` bila total > 100).
  - Usul: dukung `?offset=` (atau `skip`). Setelah ada, hapus mitigasinya.

- [ ] **Program Kesehatan tercampur entri indikator**
  - Entri indikator seed (persentase > 0 tanpa foto) disaring di klien; daftar memuat limit 100 lalu paginasi klien.
  - Usul: parameter `?jenis=indikator|kegiatan` di find-many program-kesehatan.

- [ ] **Pencarian mencocokkan tag HTML**
  - Lokasi: find-many `keamananlingkungan` & `menutipskeamanan` mencari `contains` di kolom `deskripsi` HTML mentah; kata kunci "li"/"p" mencocokkan semua entri.
  - Usul: simpan/cari versi teks polos, atau cari di judul saja.

- [ ] **`/api/keamanan/cctv/stats` tidak berguna untuk publik**
  - Tidak ada jumlah offline dan ikut menghitung laporan publik minggu ini. Frontend menghitung sendiri dari find-many.

- [ ] **Penamaan endpoint tidak konsisten**
  - Kategori kontak darurat keamanan memakai `GET /api/keamanan/kontakdaruratkeamanan/findMany` (camelCase), domain lain `find-many`.

- [ ] **Daftar Lowongan Kerja: saring, urut, dan jumlah per pilihan dihitung di klien** (terverifikasi 2026-11-14)
  - Lokasi: `src/app/api/[[...slugs]]/_lib/ekonomi/lowongan-kerja/findMany.ts` hanya punya `search` + paginasi, urut `createdAt desc`.
  - Frontend: halaman `/ekonomi/lowongan-kerja-lokal` (panel Filter kiri) memuat sekali `limit=100` lalu menyaring tipe pekerjaan, gaji minimal, pemberi kerja, waktu tayang, dan mengurutkan di klien (`MITIGASI SEMENTARA(lowongan-filter)`, entri ke-101 dst. tidak tampil). Stg 2026-11-14: 7 lowongan.
  - Usul: parameter `tipe`, `gajiMin`, `pemberi`, `sejak`, `urut` + jumlah per pilihan (facet) di find-many, lalu frontend kembali ke paginasi server. Butuh `gaji` berupa angka (lihat P3).

## P3. Schema & form admin

- [ ] **Rating produk UMKM tidak punya sumber data** (terverifikasi, 2026-11-13)
  - Lokasi: `PasarDesa.rating Float @default(0)` di `prisma/schema.prisma`. Tidak ada input di form admin produk dan tidak ada model ulasan. Nilai di stg (4,2–4,6) berasal dari seed, bukan penilaian warga.
  - Frontend: kartu katalog `/ekonomi/umkm` menampilkan slot rating "Belum ada ulasan" dan **sengaja tidak membaca `rating`** (keputusan user 2026-11-13).
  - Usul: putuskan sumber rating (ulasan warga + moderasi, atau input admin), lalu kirim `rating` + `jumlahUlasan` di find-many/findUnique produk. Reset nilai seed ke 0 supaya tidak tampil sebagai penilaian asli begitu frontend membacanya.
  - Detail produk `/ekonomi/umkm/produk/[id]` (v0.1.266) sudah punya bagian **Ulasan** gaya Decathlon (nilai rata-rata, jumlah ulasan, bar distribusi 5→1, tombol "Tulis ulasan") yang sengaja kosong dan tombolnya nonaktif (`TODO(umkm-ulasan)`). Bentuk data yang ditunggu frontend: `{ rataRata: number | null, jumlah: number, distribusi: { 1..5: number } }` + daftar ulasan berpaginasi.
  - Usul lanjutan: model `UlasanProduk` (produkId, nama/penanda pengulas, bintang 1–5, teks, status moderasi), endpoint kirim ulasan dengan anti-spam, dan antrean moderasi di admin sebelum tampil.

- [ ] **Produk UMKM hanya bisa punya satu foto** (terverifikasi: `PasarDesa.imageId` tunggal di `prisma/schema.prisma`, 2026-11-13)
  - Frontend: galeri detail produk sudah mendukung banyak foto (foto utama + strip thumbnail dengan panah), tapi strip baru muncul bila foto ≥2. Kini selalu satu foto.
  - Usul: relasi foto berurutan (mis. tabel `PasarDesaFoto { produkId, fileStorageId, urutan }`), unggah banyak foto di form admin produk, dan kirim `fotos[]` (urut) di findUnique. Foto pertama tetap jadi sampul kartu katalog.

- [ ] **Form admin Polsek mewajibkan semua field** (terverifikasi)
  - Lokasi: `_state/keamanan/polsekTerdekat/polsek-terdekat.ts:9-12` (`z.string().min(1)` untuk nomorTelepon, jamOperasional, dst.).
  - Dampak: admin terpaksa mengisi "-" (contoh: Pos Polisi Ahmad Yani). Frontend publik menyembunyikan "-".
  - Usul: jadikan opsional. Juga: `jarakKeDesa` teks bebas tanpa koordinat (urutan jarak di-parse dari teks); relasi ganda `layananPolsekId` + `LayananToPolsek` (frontend menggabung & dedupe).

- [ ] **Form admin Pencegahan Kriminalitas mewajibkan `linkVideo`** (terverifikasi: `_state/keamanan/pencegahan-kriminalitas.ts:12`)
  - Halaman publik sudah siap untuk entri tanpa video. Usul: opsional.

- [ ] **Relasi kategori Kontak Darurat Keamanan hanya menyimpan item pertama** (terverifikasi: `kontak-darurat-keamanan/create.ts:22` `kategoriId: body.kategoriId[0]`)
  - Frontend mengabaikan relasi ini dan memakai daftar item.

- [ ] **Keamanan Lingkungan butuh tanggal kegiatan yang diisi admin** (permintaan user 2026-11-12, terverifikasi di schema)
  - Lokasi: `model KeamananLingkungan` hanya punya `createdAt`; halaman publik `/keamanan/keamanan-lingkungan-pecalang-patwal` (daftar + detail) kini menampilkan `createdAt`, yang berarti kapan entri dibuat, bukan kapan kegiatan berlangsung.
  - Usul: ikuti preseden `docs/decisions/2026-11-11-berita-tanggal-terbit.md`. Tambah kolom mis. `tanggalKegiatan DateTime @default(now())` dengan migration idempotent (tambah nullable → backfill = `createdAt` → set default → set NOT NULL), lalu field `type="date"` di form admin create/edit, sertakan di find-many/findUnique. Setelah tersedia, frontend publik mengganti `createdAt` dengan kolom ini (format WITA).

- [ ] **`PenangananLaporanPublik` tanpa `createdAt`** (terverifikasi di schema)
  - Linimasa detail laporan tidak bisa menampilkan waktu tiap penanganan. Usul: tambah `createdAt DateTime @default(now())` (migration + backfill).

- [ ] **Enum `StatusLaporan` punya `Baru`, tapi default `Proses` dan form admin hanya Selesai/Proses/Gagal**
  - Relevan dengan moderasi di P1: `Baru` bisa jadi status "menunggu persetujuan".

- [ ] **Lowongan Kerja: `gaji` dan `tipePekerjaan` teks bebas; tidak ada batas lamaran, wilayah, maupun logo** (terverifikasi di schema & form admin, 2026-11-14)
  - Lokasi: `model LowonganPekerjaan` (`prisma/schema.prisma`), form `src/app/admin/(dashboard)/ekonomi/lowongan-kerja-lokal/create/page.tsx` (semua `TextInput`).
  - `gaji String`: stg berisi `"2.500.000"` dan `"2000000"`. Frontend publik hanya membaca teks yang memuat tepat satu angka; rentang ("2.000.000 - 3.000.000"), ribuan berspasi, atau angka dengan keterangan berangka tampil "Gaji tidak dicantumkan" (`lowongan-adapter.logic.ts`). Usul: `Int` (rupiah per bulan) + isian angka; `gajiMaks` opsional untuk rentang.
  - `tipePekerjaan String`: stg berisi "Full Time", "Freelance", dan "Menjaga Toko" (itu deskripsi kerja, bukan tipe). Pilihan filter publik diturunkan dari nilai ini, jadi salah isi langsung jadi pilihan filter. Usul: `Select` berisi pilihan tetap (Penuh waktu, Paruh waktu, Lepas, Harian, Magang) atau enum.
  - Tidak ada tanggal batas lamaran: lowongan lama (stg: April 2026) tetap tampil sampai admin menonaktifkan manual. Usul: `batasLamaran DateTime?` + sembunyikan otomatis setelah lewat.
  - Tidak ada wilayah/banjar: `lokasi` alamat teks bebas. Filter publik "Lokasi kerja" (di dalam/di luar desa) kini menebak dari kata "Darmasaba" di alamat (`DESA_KATA_KUNCI` di `lowongan-adapter.logic.ts`, MITIGASI SEMENTARA lowongan-wilayah); stg 2026-11-14: "Toko Bangunan KBSM Jl. Antasura No.22" terbaca luar desa. Usul: kolom wilayah (`Select` banjar desa atau "Luar desa") di samping alamat, kirim di find-many, lalu frontend membacanya.
  - Tidak ada logo/foto pemberi kerja: kartu publik memakai inisial nama. Usul: `imageId` opsional.
  - `tanggalPosting` tidak pernah diisi form (selalu sama dengan `createdAt`); frontend memakai `createdAt`. Usul: hapus salah satu atau jadikan isian admin.

- [ ] **`deletedAt DateTime @default(now())` di banyak model** (118 kolom di schema)
  - Semua baris tercatat "terhapus" sejak dibuat; filter memakai `isActive`. Tidak berdampak ke tampilan, tapi menyesatkan. Usul: `DateTime?` tanpa default (migration hati-hati).

## Isi data (urusan admin konten, bukan kode)

- UMKM: ada 2 kategori produk/usaha bernama sama "Makanan" (`KategoriProdukUmkm` id `4b95bge6-012e-5ged-9552-4d8g65d44959` dan `cmoi3j4iy0000mk1daifarcnt`, stg 2026-11-13). Halaman `/ekonomi/umkm` sementara menggabungkannya berdasarkan nama (MITIGASI SEMENTARA umkm-kategori-ganda). Usul: gabungkan jadi satu kategori di admin dan pindahkan produk/UMKM-nya, lalu hapus mitigasi itu.
- Pencegahan Kriminalitas: "PROFIL DESA DARMASABA" bukan program keamanan (dan jadi sorotan karena terbaru); "Maling Motor…" ringkasan & isi tertukar; video "Mencegah Pencurian…" sudah tidak tersedia di YouTube.
- Laporan Publik: "LAPORAN REALISASI APBDES SEMESTER I" bukan laporan keamanan; penanganan ganda identik di "Aksi Penanganan … Sampah Liar"; "WIB" seharusnya WITA.
- Kontak Darurat Keamanan (stg): kategori uji "Chtvfyy"; item yatim "Test 0852…"; nomor Polsek Darmasaba 0361123456 / Polres 0361123999 tampak nomor contoh; BPBD & Damkar memakai nomor sama 0361900113.
- Tips Keamanan (stg): dua foto berupa gambar bertuliskan "No image"; entri "Keamanan Lingkungan Tanggungjawab Bersama" isinya berita, bukan tips.
- CCTV: status Online/Offline & `lastActive` diisi manual (data Feb 2026); "RS Kapal" di luar Desa Darmasaba; kode "CCTV - 09" beda format.
- Lowongan Kerja (stg 2026-11-14): 5 dari 7 lowongan tertanggal April 2026 (data awal/seed, nomor kontak sama 089647037426) dan mungkin sudah tidak berlaku; tipe pekerjaan "Menjaga Toko" pada lowongan Toko Bangunan KBSM seharusnya tipe kerja (mis. Full Time).
