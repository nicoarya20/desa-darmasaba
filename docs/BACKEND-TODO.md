# Backend TODO (temuan dari pekerjaan frontend)

Daftar masalah backend/API/schema/form admin yang **ditemukan saat merombak halaman publik**, tapi sengaja **tidak diperbaiki** di sisi frontend karena backend dikerjakan developer lain. AI yang mengerjakan backend: baca file ini sebelum menyentuh domain terkait, dan **hapus/centang butir yang sudah selesai** (beserta commit-nya) supaya daftar tetap jujur.

Format butir: masalah · lokasi · dampak · usul. "Terverifikasi" = sudah dicek langsung di kode oleh orchestrator; selebihnya dilaporkan sesi frontend dan perlu dicek ulang sebelum dikerjakan.

Ditulis: 2026-11-12 (rombak menu Keamanan v0.1.257, sebagian dari menu Kesehatan v0.1.255).

---

## P1. Keamanan & privasi (kerjakan dulu)

- [ ] **XSS tersimpan di detail admin Laporan Publik** (terverifikasi)
  - Lokasi: `src/app/admin/(dashboard)/keamanan/laporan-publik/[id]/page.tsx:123` (`kronologi`) dan `:134` (`penanganan[].deskripsi`) dirender dengan `dangerouslySetInnerHTML` tanpa sanitasi; `src/app/api/[[...slugs]]/_lib/keamanan/laporan-publik/create.ts` menyimpan HTML mentah dari publik.
  - Dampak: siapa pun bisa mengirim laporan berisi skrip yang berjalan di sesi admin yang membukanya.
  - Usul: sanitasi di `create.ts` (allowlist tag teks dasar) **dan** di detail admin. Halaman publik sudah menyanitasi (`sanitizePotensiHtml`), admin belum.

- [ ] **Laporan Publik bisa dikirim tanpa auth & tanpa moderasi** (terverifikasi)
  - Lokasi: `POST /api/keamanan/laporanpublik/create` (laporan-publik/index.ts `.post("/create")`), schema `LaporanPublik.isActive @default(true)`.
  - Dampak: kiriman publik langsung tampil di `/keamanan/laporan-publik` → spam/fitnah. Stg sudah berisi kiriman publik ("Sampah berserakan", 5 Nov 2026).
  - Usul: kiriman publik masuk dengan status tertahan (mis. `isActive=false` atau status `Baru` yang tidak ditampilkan) sampai disetujui admin; tambah rate limit/captcha. Frontend publik saat ini menampilkan catatan privasi di form.

- [ ] **API publik Balita & Ibu Hamil mengirim data pribadi**
  - Lokasi: `src/app/api/[[...slugs]]/_lib/kesehatan/balita/find-many.ts` (mencari & mengembalikan `nik`, `alamat`, dst.), begitu juga `ibu-hamil`.
  - Dampak: NIK/alamat/HP orang tua bisa diambil siapa pun lewat API. Halaman publik Posyandu sudah tidak memakainya (pakai agregat `ringkasankesehatan/stats`), tapi endpoint tetap terbuka.
  - Usul: wajibkan auth admin untuk find-many/find-unique balita & ibu hamil.

- [ ] **Detail mengabaikan `isActive`**
  - Lokasi: `laporan-publik/findUnique.ts` (terverifikasi: `where: { id }`), `keamanan-lingkungan/findUnique.ts` (terverifikasi).
  - Dampak: entri yang dinonaktifkan admin tetap bisa dibuka lewat URL detail (frontend publik kini menganggapnya "tidak ditemukan", tapi API tetap mengirim data).
  - Usul: `where: { id, isActive: true }` untuk endpoint publik.

- [ ] **Debug log mencetak isi laporan** (terverifikasi)
  - Lokasi: `src/app/admin/(dashboard)/_state/keamanan/laporan-publik.ts:78` (`console.log("Sending form data:", formData)`) dan `:94`.
  - Usul: hapus. Sekalian: `create()` hanya memunculkan toast saat validasi gagal tanpa sinyal gagal ke pemanggil (frontend publik kini memvalidasi sendiri).

## P2. Kontrak API yang membuat frontend memakai mitigasi

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

## P3. Schema & form admin

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

- [ ] **`deletedAt DateTime @default(now())` di banyak model** (118 kolom di schema)
  - Semua baris tercatat "terhapus" sejak dibuat; filter memakai `isActive`. Tidak berdampak ke tampilan, tapi menyesatkan. Usul: `DateTime?` tanpa default (migration hati-hati).

## Isi data (urusan admin konten, bukan kode)

- Pencegahan Kriminalitas: "PROFIL DESA DARMASABA" bukan program keamanan (dan jadi sorotan karena terbaru); "Maling Motor…" ringkasan & isi tertukar; video "Mencegah Pencurian…" sudah tidak tersedia di YouTube.
- Laporan Publik: "LAPORAN REALISASI APBDES SEMESTER I" bukan laporan keamanan; penanganan ganda identik di "Aksi Penanganan … Sampah Liar"; "WIB" seharusnya WITA.
- Kontak Darurat Keamanan (stg): kategori uji "Chtvfyy"; item yatim "Test 0852…"; nomor Polsek Darmasaba 0361123456 / Polres 0361123999 tampak nomor contoh; BPBD & Damkar memakai nomor sama 0361900113.
- Tips Keamanan (stg): dua foto berupa gambar bertuliskan "No image"; entri "Keamanan Lingkungan Tanggungjawab Bersama" isinya berita, bukan tips.
- CCTV: status Online/Offline & `lastActive` diisi manual (data Feb 2026); "RS Kapal" di luar Desa Darmasaba; kode "CCTV - 09" beda format.
