# Backend TODO (temuan dari pekerjaan frontend)

Daftar masalah backend/API/schema/form admin yang **ditemukan saat merombak halaman publik**, tapi sengaja **tidak diperbaiki** di sisi frontend karena backend dikerjakan developer lain. AI yang mengerjakan backend: baca file ini sebelum menyentuh domain terkait, dan **hapus/centang butir yang sudah selesai** (beserta commit-nya) supaya daftar tetap jujur.

Format butir: masalah · lokasi · dampak · usul. "Terverifikasi" = sudah dicek langsung di kode oleh orchestrator; selebihnya dilaporkan sesi frontend dan perlu dicek ulang sebelum dikerjakan.

Ditulis: 2026-11-12 (rombak menu Keamanan v0.1.257, sebagian dari menu Kesehatan v0.1.255).

---

## P1. Keamanan & privasi (kerjakan dulu)

- [x] **T19: API user & role tidak cek role admin** (terverifikasi 2026-11-16; T19 di `docs/penilaian-lomba-website-desa-2027.md:224`). Selesai v0.1.286 (`tasks/t19-admin-role-guard/...`, commit `d9794c60`):
  - Guard bersama `requireRole` di `_lib/guard.ts`; `requireDeveloper` kini membungkusnya.
  - Router `/user` memakai `.resolve(resolveUserManager)` (role 0/1). Mutasi role memakai `beforeHandle`; GET role tetap terbuka.
  - `denyDeveloperAccountChange` melindungi akun role 0.
  - `session.deleteMany` dipanggil saat role berubah atau akun dinonaktifkan. `delUser` sudah tercakup cascade.
  - Test: `__tests__/api/user_role_admin_guard.test.ts` (66 test).
  - Lokasi: guard global `src/app/api/[[...slugs]]/route.ts` (`onBeforeHandle`) hanya memanggil `requireAuth()`; `_lib/user/index.ts` (`findMany`, `findUnique`, `del`, `updt`, `delUser`) dan `_lib/user/role/index.ts` (`create`, `put`, `del`) tanpa cek role.
  - Dampak: user Google mana pun (role 5) bisa `PUT /api/user/updt` dengan `roleId: "1"` untuk dirinya sendiri (naik jadi SUPER ADMIN), menghapus user lain, dan membaca daftar email staf. Ubah role/nonaktifkan juga tidak mencabut sesi Better Auth (`updt.ts` hanya menghapus `userSession` lama), jadi sesi lama tetap jalan sampai 7 hari.
  - Keputusan (user, 2026-11-16): API user & role hanya untuk role 0/1 (sama dengan `canManageMenuAccess` dan menu User & Role di `dynamicNavbar.ts:20`); hanya Developer yang boleh memberi role 0 atau mengubah/menghapus akun role 0; sesi Better Auth dicabut saat role berubah atau akun dinonaktifkan.
- [ ] **Sisa T19: mutasi admin lain masih hanya `requireAuth()`** (mis. Laporan Publik `PUT`/`DELETE`). User role 5 masih bisa mengubah/menghapus konten admin.
  - Usul: guard global `isAdminRole` (role ≤ 4) di `onBeforeHandle` `route.ts` untuk semua mutasi non-publik.
  - **Belum aman dipasang langsung**: tiga POST Elysia di luar `PUBLIC_POST_PATHS` dipanggil halaman publik, jadi warga login/role 5 akan kena 403:
    - `/api/pendidikan/beasiswa/beasiswapendaftar/create` (`src/app/(public)/(pages)/pendidikan/beasiswa-desa/_com/beasiswa.source.ts:42`);
    - `/api/ppid/permohonaninformasipublik/create` (`ppid/permohonan-informasi-publik/page.tsx:128`);
    - `/api/ppid/permohonankeberataninformasipublik/create` (`ppid/permohonan-keberatan-informasi-publik/page.tsx:122`).
  - Ketiganya perlu masuk `PUBLIC_POST_PATHS` (atau allowlist role 5) dulu. Daftar ditemukan lewat grep pemanggil frontend, jadi panggilan multi-baris bisa terlewat; cek ulang sebelum dikerjakan.

- [x] **XSS tersimpan Laporan Publik** (terverifikasi) — selesai di dua lapis, dikerjakan sisi frontend (P1 Laporan Publik memang dialokasikan ke sini):
  - Render (v0.1.268, `fix/laporan-publik-xss`): detail admin merender `kronologi` & `penanganan[].deskripsi` lewat `sanitizeRichText`. Test: `__tests__/api/laporan_publik_admin_xss.test.tsx`.
  - Simpan (v0.1.269, `fix/laporan-publik-sanitasi-server`): `create.ts` & `updt.ts` menyimpan lewat `sanitizeRichTextForStorage` (`src/lib/rich-text-server.ts`, `sanitize-html` dengan allowlist `RICH_TEXT_TAGS` yang sama, tanpa atribut). Data lama tidak diubah (prod 2026-11-13: 2 laporan, hanya `<p>`). Test: `__tests__/api/laporan_publik_sanitasi_server.test.ts`.

- [x] **Laporan Publik bisa dikirim tanpa auth & tanpa moderasi** (terverifikasi) — selesai v0.1.270 (`feature/laporan-publik-moderasi`), keputusan di `docs/decisions/2026-11-14-laporan-publik-moderasi.md`:
  - Kiriman non-admin ditahan sebagai status `Baru` (tanpa migration) dan tidak tampil di daftar, detail, maupun pencarian publik; admin melihatnya lewat `?moderasi=true` dan menyetujui dengan mengubah status di halaman edit.
  - Batas kiriman non-admin 5 per 10 menit per alamat (429 + `Retry-After`).
  - Sisa (di luar butir ini): user login role 5 masih bisa `PUT`/`DELETE` laporan karena guard global tidak cek role admin (T19 di `docs/penilaian-lomba-website-desa-2027.md`); tanpa captcha.

- [x] **API publik Balita & Ibu Hamil mengirim data pribadi** — selesai 2026-11-17 (`fix/lomba1117-a-data-pribadi`), keputusan di `docs/decisions/2026-11-17-api-data-pribadi-admin-only.md`:
  - `GET /api/kesehatan/{balita,ibuhamil}/find-many` & `/:id` kini lewat `guardDataPribadi` (`_lib/_data-pribadi/guard.ts`): 401 tanpa sesi, 403 bukan admin (role 0-4). Halaman publik Posyandu tetap memakai agregat `ringkasankesehatan/stats` (tetap publik). Test: `__tests__/api/data_pribadi_admin_only.test.ts`.

- [x] **API publik kiriman Pengaduan Masyarakat & Administrasi Online mengirim data pribadi** (terverifikasi prod 2026-11-17: NIK & HP pelapor, nama/alamat/telepon pemohon) — selesai 2026-11-17, keputusan yang sama:
  - `GET .../layananonlinedesa/{pengaduanmasyarakat,administrasionline}/find-many` & `/:id` admin-only (guard yang sama). Master data `jenispengaduan/*` & `jenislayanan/*` tetap publik (dipakai form warga).
  - `POST .../create` (publik) kini membalas `data: { id }` saja, tidak lagi menggemakan NIK/HP/alamat; `create()` state tidak lagi memuat ulang daftar kiriman setelah submit warga.

- [ ] **Detail mengabaikan `isActive`**
  - Lokasi: `laporan-publik/findUnique.ts` (terverifikasi: `where: { id }`), `keamanan-lingkungan/findUnique.ts` (terverifikasi), `ekonomi/lowongan-kerja/findUnique.ts` (terverifikasi 2026-11-14: `where: { id }`), `lingkungan/program-penghijauan/findUnique.ts` (terverifikasi 2026-11-16: `findUnique({ where: { id } })`, padahal find-many menyaring `isActive: true`; `datalingkungandesa/:id` dilaporkan sama, belum dipakai halaman publik), `kesehatan/puskesmas/findUnique.ts` (PUSTU, terverifikasi 2026-11-16: `where: { id }`; dipakai juga form edit admin, jadi perlu parameter khusus admin bila disaring).
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

- [ ] **`/api/tts` tanpa auth & rate limit: biaya ElevenLabs bisa disalahgunakan** (terverifikasi 2026-11-13)
  - Lokasi: `src/app/api/tts/route.ts:4-25` — `POST` publik (di luar Elysia dan matcher `src/proxy.ts`), teks ≤ 500 karakter langsung diteruskan ke ElevenLabs dengan `ELEVENLABS_API_KEY`. Tidak ada pemanggil di `src/` (mode baca suara memakai `window.speechSynthesis`).
  - Dampak: siapa pun bisa menghabiskan kuota/biaya ElevenLabs desa.
  - Usul: hapus route bila memang tak dipakai; bila dipakai, wajibkan sesi + `createLimiter` (`src/lib/rate-limit.ts`).

- [ ] **`/api/subscribe` tanpa rate limit** (terverifikasi 2026-11-13)
  - Lokasi: `src/app/api/subscribe/route.ts:4-40` — `POST` publik mengirim email lewat nodemailer Gmail (`EMAIL_USER`) ke alamat apa pun; dipanggil form footer (`src/app/(public)/_com/Footer.tsx:113`).
  - Dampak: spam email atas nama desa, kuota/reputasi akun Gmail habis.
  - Usul: rate limit per IP (`createLimiter`) + honeypot/Origin check seperti `src/app/api/jenna/_lib/http.ts`.

- [ ] **CORS Elysia tanpa domain production** (terverifikasi 2026-11-13)
  - Lokasi: `src/app/api/[[...slugs]]/route.ts:37-50` — `origin` hanya localhost:3000/3001 + 3 domain stg, `credentials: true`.
  - Dampak: permintaan lintas-origin dari domain prod ditolak (same-origin tidak terdampak); daftar juga tidak didokumentasikan.
  - Usul: tambah domain prod (dari env, bukan hardcode) atau hapus CORS bila API hanya dipakai same-origin.

- [ ] **Tidak ada header Content-Security-Policy / security headers** (terverifikasi 2026-11-13)
  - Lokasi: `next.config.ts:33-45` — `headers()` hanya `Cache-Control` untuk `/assets/:path*`.
  - Dampak: tidak ada lapis kedua bila ada XSS (mis. butir Laporan Publik di atas; jawaban Jenna sudah dirender tanpa HTML mentah).
  - Usul: CSP dasar (mulai `Content-Security-Policy-Report-Only`), plus `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors`.

- [x] **Pendidikan: daftar pendaftar beasiswa & peminjam buku terbuka tanpa login** (terverifikasi stg 2026-11-15; prod 2026-11-17: 44 pendaftar dengan NIK + nomor HP) — selesai 2026-11-17 (`fix/lomba1117-a-data-pribadi`), keputusan di `docs/decisions/2026-11-17-api-data-pribadi-admin-only.md`:
  - `GET /api/pendidikan/beasiswa/beasiswapendaftar/findMany` & `/:id`, `GET /api/pendidikan/perpustakaandigital/peminjamanbuku/findMany` & `/:id` kini lewat `guardDataPribadi` (401 tanpa sesi, 403 bukan admin). `ringkasan/stats`, `keunggulanprogram/*`, dan katalog `dataperpustakaan/*` tetap publik.
  - `POST .../create` keduanya membalas `data: { id }` saja; `create()` di `_state/pendidikan/beasiswaDesa/beasiswa-pendaftar.ts` & `_state/.../peminjaman-buku.ts` tidak lagi memanggil `findMany.load()`.

- [x] **PPID, IKM, Ide Inovatif & Pendaftaran Jadwal Kesehatan: GET publik kiriman warga memuat data pribadi** (temuan kode + W-B prod 2026-11-17) — selesai 2026-11-17, keputusan di `docs/decisions/2026-11-17-api-data-pribadi-admin-only.md`:
  - `GET /api/ppid/permohonaninformasipublik/{find-many,:id}` (nama, NIK, telepon, alamat, email), `/api/ppid/permohonankeberataninformasipublik/{find-many,:id}` (nama, email, telepon), `/api/landingpage/responden/{findMany,:id}` (nama responden), `/api/inovasi/ajukanideinovatif/{find-many,:id}` (nama, alamat), `/api/kesehatan/pendaftaran-jadwal-kegiatan/{find-many,:id}` (nama anak & orang tua, alamat) kini lewat `guardDataPribadi`. Opsi form PPID (`jenisInformasi`/`memperolehInformasi`/`salinanInformasi`) tetap publik.
  - Grafik IKM publik (beranda & `/ppid/indeks-kepuasan-masyarakat`) pindah ke `GET /api/landingpage/responden/ringkasan` (publik, hanya tanggal + nama kategori, tanpa id/nama, maks 1000) lewat `main-page/kepuasan/kepuasan.source.ts`.
  - `POST .../create` kelimanya membalas `data: { id }` saja; form publik ide inovatif & pendaftaran jadwal tidak lagi memuat daftar (saat mount / setelah submit).

- [x] **Permohonan surat (Ajukan Permohonan): GET publik memuat nama, NIK, alamat, nomor KK** (temuan kode 2026-11-17) — selesai 2026-11-17, keputusan yang sama:
  - `GET /api/desa/ajukanpermohonan/findMany` & `/:id` lewat `guardDataPribadi`; `POST .../create` (publik) membalas `data: { id }`; `create()` state tidak lagi memuat ulang daftar.

- [ ] **Pendidikan: XSS tersimpan lewat catatan peminjaman buku** (terverifikasi 2026-11-15)
  - Lokasi: `POST /api/pendidikan/perpustakaandigital/peminjamanbuku/create` (publik, `PUBLIC_POST_PATHS` di `src/lib/auth-policy.ts:158`) menyimpan `catatan` apa adanya tanpa validasi; admin `src/app/admin/(dashboard)/pendidikan/perpustakaan-digital/peminjam/[id]/page.tsx:186` merendernya lewat `dangerouslySetInnerHTML`.
  - Dampak: penyerang anonim cukup POST langsung untuk menjalankan skrip di sesi admin. Mengganti editor di form publik tidak menutup celah.
  - Usul: simpan teks polos / `sanitizeRichTextForStorage`, render teks polos di admin; validasi server (panjang, telepon, bukuId aktif, tanggal) + batas kiriman seperti Laporan Publik.

- [x] **Pendidikan: nama siswa (anak di bawah umur) publik** (dilaporkan sesi 64) — selesai 2026-11-17:
  - [x] `GET /api/pendidikan/infosekolahpaud/siswa/find-many` & `/:id` kini admin-only (`guardDataPribadi`, lihat `docs/decisions/2026-11-17-api-data-pribadi-admin-only.md`); publik hanya agregat `/api/pendidikan/ringkasan/stats`. Pengajar sengaja tetap publik (hanya nama + lembaga, dipakai direktori pengajar Info Sekolah).
  - [x] Pencarian global (`_lib/search/findMany.ts`): tipe `siswa` dibuang dari cabang `type=` dan pencarian semua modul, beserta URL-nya di `searchUrl.tsx`. Sekalian dibuang tipe data pribadi lain yang ikut terindeks (T20): `responden` (IKM), `permohonaninformasipublik` (bisa dicari lewat NIK), `permohonaninformasikeberatanpublik`. Pendaftar beasiswa, peminjam buku, ibu hamil, balita, pengaduan, dan administrasi online tidak pernah terindeks. Test: `__tests__/api/search_tanpa_data_pribadi.test.ts`.
  - Kecil: total siswa/pengajar publik = jumlah `perJenjang`, bukan `stats.jumlahPengajar` (beda bila ada lembaga nonaktif).

- [ ] **Pendidikan: form daftar beasiswa kemungkinan 401 untuk warga anonim** (terverifikasi statis 2026-11-15, belum diuji POST)
  - Lokasi: `/api/pendidikan/beasiswa/beasiswapendaftar/create` tidak ada di `PUBLIC_POST_PATHS` (`src/lib/auth-policy.ts`), guard `route.ts:113-122` → 401.
  - Tambahan: `nik @unique` padahal berisi NIK orang tua (kakak-adik tidak bisa mendaftar, 409); validasi server hanya tipe.
  - Usul: whitelist + rate limit + validasi server (NIK 16 digit, dst.), meniru Laporan Publik; tinjau `@unique` nik.

- [ ] **Program Kemiskinan: create/update/hapus program hanya dijaga "sudah login"** (terverifikasi 2026-11-16, sesi penerima program kemiskinan)
  - Lokasi: `src/app/api/[[...slugs]]/_lib/ekonomi/program-kemiskinan/{create,updt,del}.ts` tanpa cek role; guard global `route.ts` hanya memastikan sesi. Endpoint penerima baru (`penerima/*`) sudah memakai `guardAdmin` (role 0–4).
  - Dampak: user login role 5 bisa menghapus program, dan sejak 2026-11-16 penghapusan program ikut menghapus seluruh penerimanya (FK cascade).
  - Usul: pasang `guardAdmin` (`_lib/landing_page/desa-anti-korupsi/admin-guard.ts`) di ketiga handler; pertimbangkan soft delete program.

- [ ] **`/api/upl-csv` & `/api/upl-csv-single` mencetak isi berkas CSV ke log** (terverifikasi 2026-11-16)
  - Lokasi: `src/app/api/[[...slugs]]/_lib/upl-csv.ts`, `upl-csv-single.ts` (`console.log` isi teks berkas), dipakai halaman uji `src/app/admin/csv/page.tsx` (`UploadCsv`). Tidak menyimpan apa pun.
  - Dampak: bila dipakai untuk berkas data warga (mis. BNBA bantuan), NIK/nama masuk log server (Rule 12). Impor penerima Program Kemiskinan sengaja tidak memakainya.
  - Usul: hapus route + halaman `admin/csv` bila hanya sisa uji coba, atau buang log isinya.

- [ ] **Inovasi: daftar kiriman Administrasi Online & Pengaduan Masyarakat terbaca tanpa login** (terverifikasi statis 2026-11-16, rombak Inovasi v0.1.283)
  - Lokasi: `GET /api/inovasi/layananonlinedesa/administrasionline/find-many` dan `GET /api/inovasi/layananonlinedesa/pengaduanmasyarakat/find-many`, juga `/:id` masing-masing. Guard `src/app/api/[[...slugs]]/route.ts:100` hanya memasukkan `/api/user`, `/api/role`, `/api/fileStorage`, `/api/imgs`, `/api/developer` ke `ADMIN_ONLY_GET_PATHS`.
  - Dampak: siapa pun bisa mengunduh data warga. Sesi ce mengecek stg 2026-11-16 (hanya nama field, nilai tidak dicetak): administrasi memuat `name`, `alamat`, `nomorTelepon` (10 baris); pengaduan memuat `name`, `nik`, `email`, `nomorTelepon`, `lokasiKejadian`, `deskripsiPengaduan`, `image` (9 baris).
  - Usul: jadikan find-many & `/:id` kiriman admin-only per path, **bukan** prefix `/administrasionline`: master data `.../administrasionline/jenislayanan/find-many` dan `.../pengaduanmasyarakat/jenispengaduan/find-many` harus tetap publik (dropdown formulir warga). Periksa juga find-many endpoint kiriman warga lain di `PUBLIC_POST_PATHS` (ajukan ide, peminjaman buku, responden IKM, ajukan permohonan, pendaftaran jadwal kesehatan, penjualan UMKM, laporan publik).
  - Frontend: state admin `administrasiOnline.create.create()` memanggil `findMany.load()` setelah sukses, jadi formulir publik lama ikut menarik daftar data pribadi ke peramban warga. Halaman publik baru memakai `administrasi.source.ts` sendiri yang tidak memanggil find-many kiriman.

- [ ] **Inovasi: XSS tersimpan di detail admin Ajukan Ide** (terverifikasi statis 2026-11-16)
  - Lokasi: `src/app/admin/(dashboard)/inovasi/ajukan-ide-inovatif/[id]/page.tsx:79,89` merender `alamat` dan `deskripsi` lewat `dangerouslySetInnerHTML` tanpa sanitize. `POST /api/inovasi/ajukanideinovatif/create` publik (`src/lib/auth-policy.ts:151`) tanpa validasi.
  - Dampak: siapa pun bisa POST `<img onerror>` langsung ke API, lalu skripnya jalan di sesi admin yang membuka detail.
  - Frontend publik baru sudah meng-escape `alamat` dan mengirim `deskripsi` sebagai `<p>` ter-escape, tapi itu tidak melindungi dari POST langsung.
  - Usul: pola Laporan Publik: `sanitizeRichText` (`src/lib/rich-text.ts`) di halaman admin (`alamat` cukup teks polos), dan `sanitizeRichTextForStorage` di create.

- [ ] **Struktur organisasi: API publik mengirim alamat rumah, email, telepon & tanggal masuk pengurus** (terverifikasi 2026-11-17, rombak Ekonomi v0.1.292)
  - Lokasi: `PEGAWAI_SELECT` di `src/app/api/[[...slugs]]/_lib/_struktur-organisasi/http.ts:59-74` (`tanggalMasuk`, `email`, `telepon`, `alamat`), dipakai find-many & `/:id` pegawai **BUMDes, PPID, dan Perangkat Desa**.
  - Dampak: siapa pun bisa membaca data pribadi pengurus/perangkat lewat API, walau halaman publik tidak menampilkannya (detail BUMDes kini hanya foto, nama, gelar, jabatan; PPID/Perangkat menampilkan email/telepon).
  - Usul: select publik terpisah (`id`, `namaLengkap`, `gelarAkademik`, `image`, `posisi`, `isActive`); field pribadi hanya untuk rute admin. Putuskan dengan user apakah email/telepon kantor perangkat memang ingin publik.
- [ ] **Ekonomi: HTML dari admin disimpan tanpa sanitasi & `linkVideo` tanpa validasi** (terverifikasi 2026-11-17: tidak ada `sanitize` di `_lib/ekonomi/`)
  - Lokasi: create/updt `sektor-unggulan-desa` (`description`), `kesejahteraan-masyarakat` (`deskripsi`, `content`, `linkVideo`), `program-kemiskinan` (`deskripsi`).
  - Halaman publik baru menyaring di klien (`sanitizeRichText`) dan video lewat `VideoFacade` (iframe hanya setelah klik, YouTube/Vimeo saja), tapi halaman admin dan konsumen API lain tidak terlindungi.
  - Usul: `sanitizeRichTextForStorage` (`src/lib/rich-text-server.ts`) di create/updt; validasi `linkVideo` hanya URL https YouTube/Vimeo.

- [ ] **Migrasi Penduduk: GET publik membuka data per orang** (terverifikasi orchestrator di stg 2026-11-17, rombak Dashboard Kependudukan)
  - Lokasi: `src/app/api/[[...slugs]]/_lib/kependudukan/migrasi-penduduk/index.ts`. `GET /api/kependudukan/migrasipenduduk/find-many` dan `GET /:id` tanpa `beforeHandle`, dan tidak masuk `ADMIN_ONLY_GET_PATHS` di `route.ts`.
  - Dampak: tanpa login, siapa pun bisa mengunduh `nama`, `jenis` (MASUK/KELUAR), `tanggal`, `asal`/`tujuan`, `alasan` pindah tiap warga. stg: 7 baris (6 seed, **1 isian admin** 2026-09-24). Prod belum dicek. Jenna sudah mengecualikannya (`src/lib/jenna/knowledge/sources.ts:22`), API-nya masih terbuka.
  - Pemakai: hanya admin (`_state/kependudukan/migrasi-penduduk.ts`, `/admin/kependudukan/migrasi-penduduk/*`). Rute publik 404; Dashboard Kependudukan tidak memakainya (keputusan user 2026-11-17).
  - Usul: `{ beforeHandle: guardDataPribadi }` di `find-many` dan `/:id`, pola sama dengan `docs/decisions/2026-11-17-api-data-pribadi-admin-only.md`; tambah kasus ke `__tests__/api/data_pribadi_admin_only.test.ts`. `/:id` memakai `Request` mentah + `Response.json`, ubah ke `context` sekalian.
  - Sekalian (P3) di `migrasi-penduduk/findMany.ts`: `limit` tanpa batas atas; `where: any` + `eslint-disable`; galat dibalas `success:false` HTTP 200; filter tahun `lte: '${tahun}-12-31'` membuang rekaman 31 Des (pakai `lt: '${tahun+1}-01-01'`); `totalPages` 0 saat kosong.

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

- [ ] **Pendidikan (2026-11-15, dilaporkan sesi rombak)**
  - `find-by-id` 8 handler (program-pendidikan-anak ×2, bimbingan-belajar-desa ×3, pendidikan-non-formal ×3) membaca `context.params.slugs[0]` padahal state mengirim `?id=edit` → selalu `findFirst()` tanpa where/orderBy/isActive (uji sesi 33: `?id=tidak-ada` tetap mengembalikan baris). Usul: baca `context.query.id`. `updt.ts` yang sama menyimpan `deskripsi` HTML tanpa sanitasi.
  - `dataperpustakaan/:id` tanpa filter `isActive`, tidak ditemukan = 200 + `success:false`; `kategoribuku/findManyAll` tanpa filter `isActive` bawaan; filter kategori memakai nama, search findMany hanya judul.
  - Info Sekolah: filter `jenjangPendidikanId` berisi NAMA (siswa memakai `jenjangPendidikanName`); lembaga tanpa `_count` siswa/pengajar; `ringkasan/stats.perJenjang` tidak terurut & memuat jenjang kosong; siswa/pengajar find-many dan `stats.jumlahPengajar` tidak menyaring `lembaga.isActive`.
  - Beasiswa: `ringkasan/stats.jumlahPenerima` = jumlah semua pendaftar (belum ada status seleksi); `BeasiswaConfig` tanpa periode/jadwal pendaftaran (frontend terpaksa tanpa tanggal).
  - Data Pendidikan: `findMany` count `total` mengabaikan filter search.

- [ ] **Daftar Program Kemiskinan publik: deskripsi tanpa sanitasi & grafik statistik hanya dari halaman aktif** (terverifikasi 2026-11-16)
  - Lokasi: `src/app/(public)/(pages)/ekonomi/program-kemiskinan/page.tsx` merender `deskripsi` lewat `dangerouslySetInnerHTML` tanpa `sanitizeRichText` (halaman detail baru sudah menyaring), memuat `limit=2` per halaman, dan grafik "Statistik Kemiskinan" dibangun dari program di halaman itu saja (statistik program di halaman lain tidak ikut).
  - Usul: endpoint statistik tersendiri (semua `StatistikKemiskinan` urut tahun) + sanitasi deskripsi; `create/updt` program menyimpan lewat `sanitizeRichTextForStorage`.

- [ ] **Inovasi (2026-11-16, dilaporkan sesi rombak v0.1.283)**
  - Kolaborasi: filter `year` di `inovasi/kolaborasi-inovasi/findMany.ts` menyaring `createdAt`, padahal model punya `tahun Int` (stg: entri `tahun` 2025 dibuat 2026-04-14 → muncul di `year=2026`); nilai non-angka (`year:2025` dari halaman lama) → `parseInt` NaN → `Invalid Date`. Usul: `where.tahun = Number(year)` bila bilangan bulat, 400 bila tidak. Frontend kini memuat sekali (limit 100) dan menyaring `tahun` di klien.
  - Program Kreatif `GET /:id`: id tak ada → HTTP 200 + `success:false`; galat Prisma juga 200 + `error.message` mentah ke klien. Frontend memetakan "tidak ditemukan" dari isi pesan (`isNotFoundMessage` di `program-kreatif.logic.ts`, MITIGASI SEMENTARA). Usul: 404 / 500 tanpa membocorkan pesan, lalu hapus pemetaan.
  - findUnique Desa Digital & Program Kreatif tidak menyaring `isActive` (pola butir P1 "Detail mengabaikan `isActive`").
  - Ajukan Ide `create.ts`: tanpa try/catch (galat Prisma → 500 mentah), tanpa batas panjang (kolom `Text`), selalu `success: true` + menggemakan body; endpoint publik tanpa batas laju/anti-spam (pola Laporan Publik: rate limit per IP + honeypot). State admin `create()` memanggil `findMany.load()` (admin-only) → 401 bila dipakai dari halaman publik; halaman publik kini memakai `ajukan-ide.source.ts` sendiri.

- [ ] **Lingkungan (2026-11-16, rombak menu Lingkungan v0.1.285)**
  - Cari global `type: "gotongRoyong"` (terverifikasi: `src/app/api/[[...slugs]]/_lib/search/findMany.ts` ±1153) memuat **semua** `kegiatanDesa`: tanpa saring kategori, tanpa `isActive: true`, tanpa `include: { kategoriKegiatan }`. Akibat: kegiatan Olahraga/PKK dst. muncul sebagai hasil "Gotong Royong". Dulu `searchUrl.tsx` membentuk `/lingkungan/gotong-royong/undefined/{id}`; kini frontend memakai segmen cadangan `lingkungan` dan detail menerima kegiatan kategori apa pun (`gotong-royong/[kategori]/[id]/page.tsx`). Kegiatan Desa tidak punya tipe cari sendiri. Usul: tipe `kegiatanDesa` (→ `/pemerintahan/kegiatan-desa/{kategori}/{id}`) untuk semua kegiatan, `gotongRoyong` hanya kategori Lingkungan/Kebersihan, `isActive: true`, sertakan `kategoriKegiatan`.
  - Dua endpoint untuk tabel kegiatan yang sama berbeda perilaku: `/api/desa/kegiatandesa/find-many` (kategori `contains`, cari judul+lokasi, urut `tanggal asc`) vs `/api/lingkungan/kegiatandesa/find-many` (kategori `equals`, cari judul+deskripsi+kategori, urut `createdAt desc`); `kategori` hanya menerima satu nama sehingga Gotong Royong memanggil sekali per kategori (limit 100) lalu menggabung & mempaginasi di klien. Usul: terima beberapa nama (`kategori=Lingkungan,Kebersihan`) dengan `equals`, lalu frontend kembali ke paginasi server. `GET /api/lingkungan/kegiatandesa/:id` melempar Error saat id tidak ada (bukan `success:false` seperti endpoint desa); publik memakai endpoint desa.
  - Edukasi Lingkungan & Konservasi Adat Bali: pola sama dengan butir Pendidikan di atas. `find-by-id` 6 handler (terverifikasi untuk 3 handler konservasi: `context?.params?.slugs?.[0]`) mengabaikan `?id=edit` → selalu `findFirst()` tanpa where. `updt.ts` keenamnya menyimpan `judul`/`deskripsi` HTML tanpa sanitasi (publik menyaring lewat `sanitizeRichText`). Nama folder `materi-edukasi-lingkunga` & file `findUnqiue.ts` salah ketik (kosmetik, jangan rename tanpa koordinasi).
  - Program Penghijauan `GET /:id`: id tak ada → HTTP 200 + `success:false` berbentuk sama dengan galat server. Frontend membedakan lewat pesan (`isNotFoundMessage` di `program-penghijauan/_com/penghijauan.logic.ts`, MITIGASI SEMENTARA). Usul: 404 / 500, lalu hapus pemetaan pesan.
  - Bank Sampah `pengelolaansampah/find-many` & `keteranganbankterdekat/find-many`: `catch` membalas HTTP 200 + `success:false` + `data:[]` saat query gagal (frontend membaca `success`, tapi monitoring melihatnya sukses). Usul: 500.

- [ ] **Detail Program Inovasi: program nonaktif ikut terkirim & id tak ada → 500** (terverifikasi: `landing_page/profile/program-inovasi/findUnique.ts`, 2026-11-16)
  - `GET /api/landingpage/programinovasi/:id` tidak menyaring `isActive` (findMany menyaring `isActive: true`), jadi tautan lama/dibagikan ke program yang dinonaktifkan admin tetap tampil. Mitigasi frontend (MITIGASI SEMENTARA): overlay beranda `/?program={id}` menganggap `isActive === false` sebagai tidak ditemukan (`landing-page/program-overlay/program-overlay.source.ts`).
  - Id tidak ditemukan → `throw new Error` → HTTP 500, bukan 404 / `success:false`. Overlay tidak bisa membedakan "tidak ditemukan" dari galat server, jadi memakai satu kalimat netral.
  - Usul: `findFirst({ where: { id, isActive: true } })`; tidak ditemukan → `set.status = 404; return { success: false, message: "Program inovasi tidak ditemukan" }`.
  - Info: stg belum mengirim `images` di findUnique (fitur galeri dokumentasi belum ter-deploy); galeri overlay muncul otomatis begitu terkirim.

- [ ] **Ekonomi: find-many memakai limit bawaan 10 & urutan yang memotong data terbaru** (terverifikasi 2026-11-17, rombak Ekonomi v0.1.292)
  - Lokasi: `jumlah-pengangguran/detail-data-pengangguran/findMany.ts:31,37` (`orderBy year asc` + take limit, lalu diurut ulang per bulan saja → tahun terbaru tak pernah termuat, paginasi rusak); demografi-pekerjaan, sektor-unggulan-desa, jumlah-penduduk-miskin, kesejahteraan-masyarakat (tanpa offset) memakai limit bawaan 10.
  - Mitigasi frontend (MITIGASI SEMENTARA): halaman publik meminta limit eksplisit (100, pengangguran 120) dan mengurutkan di klien, `console.warn` bila `total` > termuat.
  - Usul: `orderBy` terbaru dulu (tahun desc, bulan desc), paginasi konsisten, batas limit wajar.
- [ ] **Ekonomi: detail & daftar publik mengabaikan `isActive`** (dilaporkan sesi 85/fc/f0)
  - Lokasi: `_struktur-organisasi/pegawai.read.ts:58` (detail pegawai; frontend BUMDes menganggap nonaktif "tidak ditemukan", MITIGASI SEMENTARA), `bumdes/unit-usaha/findUnique.ts:10`, `kesejahteraan-masyarakat/find-by-id.ts:29`, `program-kemiskinan` findUnique; demografi-pekerjaan search tanpa `isActive`.
  - Usul: `where: { id, isActive: true, deletedAt: null }` untuk rute publik.
- [ ] **PADesa: menu admin terpisah tidak dipakai publik lagi** (keputusan user 2026-11-16)
  - Halaman `/ekonomi/PADesa-pendapatan-asli-desa` kini membaca APBDes pos `4.1` (`/api/landingpage/apbdes/findMany`). Model `ApbDesa`/`Pendapatan`/`Belanja`/`Pembiayaan` + menu admin PADesa jadi duplikat.
  - Usul: pensiunkan menu admin PADesa (atau arahkan ke APBDes). Bila dipertahankan: `apbdesa/findMany.ts:14-18` search memakai field yang tidak ada (`success:false`, cari admin rusak); komentar "tahun unik → 409" tanpa `@@unique` di schema; `value Int` tidak muat Rp 21,4 M; MultiSelect form hanya memuat 10 item.
  - APBDes: `APBDesItem.totalRealisasi`/`persentase` tidak ikut diperbarui saat realisasi berubah (lokal 2025 pos 4.1 = 0 padahal `realisasiItems` Rp 132 jt). Publik menghitung dari `realisasiItems`.

- [ ] **Kependudukan: belum ada daftar tahun tersedia; summary terkunci tahun berjalan** (terverifikasi 2026-11-17, Dashboard Kependudukan)
  - `find-many` `databanjar`/`distribusiagama`/`distribusiumur` sudah menerima `?tahun=`, tetapi tidak ada cara mengetahui tahun terbaru/tersedia. Dashboard memuat semua tahun (`limit=100`) lalu memilih di klien: MITIGASI SEMENTARA(kependudukan-limit), `kependudukan/_com/data/kependudukan-data.logic.ts`. DataBanjar tumbuh 12 baris/tahun.
  - `dashboard/summary.ts` memakai `currentYear` hardcode dan selalu mengembalikan objek angka → Januari tahun baru tampil 0 sebagai fakta; `totalKelahiran` (`summary.ts:31-39`) menghitung model `Kelahiran` (Kesehatan, 3 di stg) padahal Dinamika 2026 = 45.
  - Summary + `_state/kependudukan/dashboard.ts` kini tidak dipakai halaman publik (sengaja tidak dihapus). Usul: `tahunTersedia` (aditif) di find-many atau summary + `?tahun=` di summary; `totalKelahiran` dibuang atau diambil dari `DinamikaPenduduk`; putuskan summary dipertahankan untuk admin atau dihapus. Setelah ada, hapus mitigasinya.
- [ ] **DataBanjar `miskin` tak bisa "belum diisi"**: kolom `Int` NOT NULL, form admin bawaan 0 → stg 2026 12 × 0 (Ekonomi › Penduduk Miskin 2026 = 5). Frontend MITIGASI SEMENTARA: semua 0 = belum diisi (`banjarTotals.miskinTerisi`). Usul: kolom nullable + form kosong bawaan.
- [ ] **`dinamikapenduduk/find-many` tanpa `updatedAt`** (`findMany.ts:17` `select`), jadi Dinamika tidak bisa menulis "Data diperbarui …". Usul: tambah `updatedAt: true` (aditif). `findUnique.ts` juga tidak menyaring `isActive`.

## P3. Schema & form admin

- [ ] **Posyandu: telepon wajib di form admin, padahal data desa tidak punya nomor per posyandu** (terverifikasi 2026-11-16, sesi konten Posyandu)
  - Lokasi: `_state/kesehatan/posyandu/posyandu.ts` (`templateForm.nomor` min 1), `_state/kesehatan/posyandu/posyandu.form.ts` (`cekFormPosyandu`), schema `Posyandu.nomor String` (NOT NULL).
  - Dampak: admin harus mengisi nomor rekaan untuk 12 posyandu banjar dari dokumen desa (yang hanya berisi nama, alamat, foto).
  - Usul: jadikan nomor opsional di form & state (kolom tetap NOT NULL, simpan ""; halaman publik sudah menampilkan "Nomor belum diisi").

- [ ] **Posyandu find-many mengirim baris `FileStorage` lengkap ke publik** (terverifikasi 2026-11-16: `kesehatan/posyandu/find-many.ts` `include: { image: true }`)
  - Dampak: `path`, `realName`, `mimeType` berkas ikut terkirim di direktori publik (bukan data pribadi, tapi detail server).
  - Usul: `image: { select: { id: true, name: true, link: true } }` (pola `IMAGE_SELECT`); cek pemakai admin `findMany.data` dulu.

- [ ] **Ganti gambar Kegiatan Desa tidak menghapus berkas lama** (terverifikasi 2026-11-16: `desa/kegiatan-desa/updt.ts` tanpa `removeReleasedFiles`)
  - Konteks: API Lingkungan → Gotong Royong (dihapus 2026-11-16, `docs/decisions/2026-11-16-gotong-royong-kategori-kegiatan.md`) dulu menghapus permanen gambar lama saat diganti; jalur Kegiatan Desa yang kini satu-satunya tidak. Dampak: berkas yatim menumpuk di MinIO.
  - Usul: ikuti pola menu lain di `docs/decisions/2026-11-12-sampah.md` (ambil `imageId` sebelum update, panggil `removeReleasedFiles("KegiatanDesa", [lama])` setelah update sukses bila berubah). Hapus kegiatan tetap soft delete (gambar dipertahankan).

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

- [ ] **Musik Desa: tidak ada model playlist, artis, maupun album** (terverifikasi di schema, 2026-11-14)
  - Lokasi: `model MusikDesa` (`prisma/schema.prisma`) hanya punya `artis String` dan `genre String?` teks bebas; tidak ada tabel playlist/artis/album. Endpoint publik hanya `GET /api/desa/musik/find-many` (+ findUnique).
  - Frontend: halaman publik `/musik/musik-desa` (v0.1.273, gaya TIDAL) sudah punya menu dan halaman **Playlist** yang sengaja kosong ("Belum ada playlist", `TODO(musik-playlist)`). Playlist **dikurasi admin**; pengunjung tidak bisa membuat playlist (keputusan user 2026-11-14).
  - Usul playlist: `PlaylistMusik { id, judul, deskripsi?, coverImageId?, isActive, urutan, createdAt }` + `PlaylistMusikItem { playlistId, musikId, urutan }` (unik per pasangan), CRUD + susun urutan lagu di admin `/admin/musik`, endpoint publik find-many playlist (judul, sampul, jumlah lagu) dan findUnique (lagu berurutan, include audio & sampul).
  - Artis: frontend menurunkan daftar artis dari teks `artis` (huruf kecil, spasi dirapikan); kolaborasi "Kadek Wira & Darmasaba Band" terhitung satu artis, salah ketik membuat artis ganda. Genre sama: stg berisi "Pop" dan "pop". Usul: model `ArtisMusik { id, nama, fotoId?, bio? }` + relasi banyak-ke-banyak ke lagu, dan genre sebagai pilihan tetap (`Select`) di form admin.
  - `durasi String` ("MM:SS"): form admin create/edit sudah menghitungnya dari file (`getAudioDuration`), tapi kolomnya tetap bisa diketik ulang, gagal baca file diam-diam jadi `"0:00"`, dan data seeder memakai format lain (stg: `"5:24"` dari admin vs `"05:18"` dari seeder). Usul: simpan detik (`Int`) dari file di server, jangan dari input teks.
  - Mesin pemutar memuat `limit=50` sekali (tanpa paginasi); bila lagu > 50, sisanya tidak tampil (frontend memberi `console.warn`). Usul: endpoint ringkas tanpa batas kecil untuk daftar putar, atau paginasi kursor.

- [ ] **Musik Desa: seeder membuat lagu tanpa audio secara diam-diam** (terverifikasi, 2026-11-14)
  - Lokasi: `prisma/_seeder_list/desa/musik-desa/seed_musik_desa.ts` — bila `audioFileName`/`coverImageName` tidak ditemukan di `FileStorage`, id dibiarkan `null` tanpa peringatan dan lagu tetap dibuat aktif.
  - Dampak: di stg 3 dari 7 lagu (Tri Hita Karana, Mekar di Badung, Darmasaba Swara) tanpa audio; halaman publik menampilkannya redup + "Audio belum tersedia" dan pemutar melewatinya. Padahal API `create`/`updt` mewajibkan `audioFileId: t.String()` dan form admin mewajibkan file audio, jadi kondisi ini hanya lahir dari seeder.
  - Usul: seeder gagal/`warn` keras bila file tidak ada (atau lewati lagunya); unggah audio ketiga lagu itu lewat admin. Bila lagu tanpa audio memang tidak boleh ada, jadikan `audioFileId` wajib di schema setelah data dibereskan.
  - Kecil: `src/app/admin/(dashboard)/musik/create/page.tsx` masih berisi 5 `console.log`/`console.error` debug unggahan (Rule 12: hapus sebelum rilis).

- [ ] **`deletedAt DateTime @default(now())` di banyak model** (118 kolom di schema)
  - Semua baris tercatat "terhapus" sejak dibuat; filter memakai `isActive`. Tidak berdampak ke tampilan, tapi menyesatkan. Usul: `DateTime?` tanpa default (migration hati-hati).

- [ ] **Pendidikan (2026-11-15)**: `DataPendidikan.jumlah` String (usul Int + NumberInput, + kolom tahun/keterangan); ~~`Lembaga` hanya nama + jenjang~~ (selesai 2026-11-16: deskripsi, alamat, kontak, medsos, titik + link Google Maps, foto sekolah, bagan, pengurus, foto kegiatan — `docs/KONTEN-BERSAMA.md`; NPSN/status sekolah belum ada); buku perpustakaan tanpa penulis/tahun/ketersediaan; Bimbingan Belajar tanpa field terstruktur tempat/jadwal/kontak/cara daftar; editor admin program (Link/Highlight/TextAlign/heading) melebihi allowlist sanitasi publik.

- [ ] **Inovasi (2026-11-16)**
  - find-many Desa Digital & Program Kreatif tanpa `offset`/`skip`: publik memuat sekali `limit=100` lalu paginasi di klien (`console.warn` bila lebih). Kolaborasi sama (limit 100).
  - Cari: Program Kreatif tidak mencari `slug` (= deskripsi singkat yang tampil di ubin); Kolaborasi hanya `name` + `slug`, tanpa `kolaborator`. Frontend Kolaborasi mencari di klien.
  - Kolaborasi: kolom `slug` dipakai sebagai ringkasan (komentar skema "deskripsi singkat"), tapi entri stg "Forum Inovasi Desa (Tes)" berisi slug sungguhan. Frontend menyembunyikan ringkasan berpola kebab-case (`isSlugLike` di `kolaborasi.logic.ts`, MITIGASI SEMENTARA; ringkasan sah satu kata bertanda hubung ikut tersembunyi). Usul: ganti nama kolom (`ringkasan`) + validasi form admin.
  - Mitra kolaborasi: `find-many` saat galat tanpa `data/page/totalPages` (beda dengan kolaborasi); tanpa kolom urutan tampil (logo mitra utama tak bisa didahulukan).
  - Program Kreatif: kolom `icon` String bebas; kunci di luar `IconKey` (admin `_com/iconMap.tsx`) tampil sebagai ikon tanda tanya. Usul: validasi `t.Union` di create/update.
  - Administrasi Online `create.ts`: body hanya `t.String()` (tanpa batas panjang, pola telepon, cek `jenisLayananId`); id jenis salah → galat FK Prisma mentah. Usul: `minLength` nama/alamat, `^[0-9]{10,13}$` telepon, 400/422 jelas. Jenis layanan find-many bawaan limit 10 (stg 7; publik baru memuat limit 100).
  - Jenis layanan: keterangan campur HTML editor & teks polos yang mengulang nama. Usul: satu jenis isian teks polos singkat berisi syarat/lama proses.
  - Ajukan Ide: skema `AjukanIdeInovatif` tanpa kontak (telepon/email) → desa tidak bisa menindaklanjuti pengusul. Usul kolom opsional.
  - Gambar: `image.link` Info TTG & logo mitra menunjuk varian acak (`-mobile` 720px, `-desktop` 500px; varian `-desktop` logo mitra berupa PNG 1,6 KB). Publik menampilkan foto TTG maks 560px agar tidak buram.

- [ ] **Lingkungan (2026-11-16)**
  - `deletedAt DateTime @default(now())` juga di Pengelolaan Sampah, Keterangan Bank Sampah, Program Penghijauan, Data Lingkungan (stg: `deletedAt` = `createdAt`); pola butir Lowongan Kerja.
  - Bank Sampah: urutan langkah = `createdAt ASC` (tanpa kolom urutan; admin tak bisa menyusun ulang tanpa hapus-buat ulang). `linkPetunjukArah` teks bebas tanpa validasi URL (publik hanya menerima http(s), selain itu rute dari lat/lng); usul validasi `https://` di form + API. `name` dan `namaTempatMaps` identik di stg; jelaskan bedanya di form admin atau hapus salah satu.
  - Data Lingkungan: `jumlah` String bebas (stg "1 paket kegiatan", "100"); halaman lama menambah "±", kini tampil apa adanya. Bila desa ingin angka sorotan, perlu kolom angka + satuan terpisah. Cari find-many: Penghijauan hanya `name` + `judul`, Data Lingkungan `name` + `deskripsi` (publik mencari di klien, tidak terdampak).
  - Kategori kegiatan: "Sosial" tercatat dua kali di `kategorikegiatan` (stg).

- [ ] **Ekonomi: schema & form admin** (rombak Ekonomi v0.1.292, 2026-11-17; dilaporkan sesi pekerja, cek ulang sebelum dikerjakan)
  - Kemiskinan: `StatistikKemiskinan.tahun @unique` global (`prisma/schema.prisma:1814`, terverifikasi) → dua program tidak bisa punya data di tahun sama; `program-kemiskinan/del.ts:7-12` meninggalkan statistik yatim yang mengunci tahun itu selamanya (tanpa try/catch); `updt.ts` program + statistik tidak dalam transaksi; label form "Ikon Program Kreatif Desa" (create:128, edit:208). Arti angka statistik (20/30/20) belum jelas, publik menyembunyikannya sampai jelas.
  - Pengangguran: `year` tanpa validasi rentang (stg ada 9999); `percentageChange` 0 vs null & tidak dihitung ulang (publik menghitung sendiri); update duplikat bulan+tahun membalas 200 (create 409); model sebaran usia/pendidikan berkolom String tanpa periode/tahun, tanpa jenjang "Tidak sekolah"/SMK.
  - Demografi Pekerjaan: hapus permanen (`del.ts:27`) padahal ada `isActive`; zod `min(1)` menolak 0; `t.Number` tanpa batas → 500; tanpa kolom tahun/sumber data.
  - Sektor Unggulan: zod `value min(1)` menolak 0 & desimal; label form "Jumlah" ambigu (tanpa satuan/arti); `formatSektorValue`/`resolveChartUnit`/`LEGACY_CHART_UNIT` (`src/lib/sektor-unggulan.ts`) kini hanya dipakai test & seed.
  - Kesejahteraan: `del.ts` membalas `{status:404}` dengan HTTP 200; `deletedAt @default(now())` padahal hapus permanen; form admin mewajibkan `imageId` padahal schema opsional; belum masuk cari global (`search/findMany.ts`).
  - BUMDes: belum ada model/endpoint dokumen (SK pengurus, Perdes, AD/ART, laporan). Publik sudah menyiapkan `DokumenBumdes` (tersembunyi selama kosong); isi `loadDokumen` di `bumdes.source.ts` dengan bentuk `{ id, judul, keterangan, href }` (`TODO(bumdes-dokumen)`).

- [ ] **Kependudukan: schema, seed & form admin** (Dashboard Kependudukan 2026-11-17; skema umur terverifikasi orchestrator, sisanya dilaporkan sesi pekerja)
  - **Distribusi Umur, dua skema kelompok bertabrakan (prioritas tinggi)**: seeder (`prisma/_seeder_list/kependudukan/seed_distribusi_umur.ts`) + komentar schema memakai `0-14/15-24/25-54/55-64/65+`, form admin create & edit (`admin/(dashboard)/kependudukan/distribusi-umur/{create,[id]}/page.tsx`) hanya `0-5/6-12/13-17/18-25/26-35/36-45/46-55/56-65/65+` (bertumpuk di umur 65). stg 2026: `0-14` dan `6-12` berdampingan (jumlah 4.305, padahal 4.215); baris seed tampil kosong di form edit. Publik menyembunyikan total & persen bila tumpang tindih. Usul: satu skema resmi berbatas 15 & 65, opsi form disamakan, data lama dirapikan.
  - Tanpa unique: `DistribusiUmur (tahun, rentangUmur)`, `DataBanjar (nama, tahun)`; `DataBanjar.nama` teks bebas (model `Banjar` berisi 8 nama rekaan, bukan 12 banjar dinas).
  - Distribusi Umur: `findMany` hanya menyaring `isActive`, `del` hard delete (tak konsisten dengan `deletedAt`).
  - Seeder Dinamika (`seed_dinamika_penduduk.ts:12-20`) upsert dengan cabang `update` berisi angka seed → seed ulang menimpa koreksi admin. Usul: `update: {}`.
  - Seed lokal DataBanjar (`prisma/data/kependudukan/data-banjar/data-banjar.json`): nama + angka rekaan (4.200) ≠ stg (10.254, 12 banjar).
  - Form admin Distribusi Agama: opsi `KRISTEN` umum berdampingan dengan Protestan/Katolik.
  - Admin Data Banjar `page.tsx:291`: Pagination `load(newPage, 10, search)` membuang filter tahun.

## Jenna publik (tindak lanjut)

Konteks: `docs/decisions/2026-11-13-jenna-public-chat.md`.

- [ ] **Captcha (Turnstile) saat spam muncul**
  - v1 sengaja tanpa captcha (Origin + honeypot + rate limit + kuota + budget). Pantau `/dev/jenna/percakapan`; bila spam lolos, tambah Turnstile di `src/app/api/jenna/chat/route.ts` (butuh env secret baru → diskusi dulu).

- [ ] **Verifikasi endpoint hangup sesi suara di stg**
  - Lokasi: `src/lib/jenna/voice/voice.relay.ts` (`hangupLiveSession`) memanggil `POST {baseUrl}/live/sessions/{id}/hangup`; endpoint belum terkonfirmasi dari dokumentasi resmi gateway.
  - Cek: setelah beberapa sesi suara di stg, lihat kolom `JennaVoiceSession.hangupStatus` dan log `[jenna-voice] hangup`. 2xx = benar; 404/405 = endpoint salah → sesi gateway hanya berakhir oleh timeout gateway (biaya gateway bisa berjalan lebih lama dari menit yang ditagih ke pengunjung).

- [ ] **Limiter start sesi suara in-memory**
  - Lokasi: `src/lib/jenna/voice/voice.deps.ts` (3 start/menit/IP di `globalThis`). Aman untuk 1 instance; bila stack di-scale ke beberapa replika, batas jadi per replika. Kuota menit (DB) tetap berlaku global.

## Isi data (urusan admin konten, bukan kode)

- UMKM: ada 2 kategori produk/usaha bernama sama "Makanan" (`KategoriProdukUmkm` id `4b95bge6-012e-5ged-9552-4d8g65d44959` dan `cmoi3j4iy0000mk1daifarcnt`, stg 2026-11-13). Halaman `/ekonomi/umkm` sementara menggabungkannya berdasarkan nama (MITIGASI SEMENTARA umkm-kategori-ganda). Usul: gabungkan jadi satu kategori di admin dan pindahkan produk/UMKM-nya, lalu hapus mitigasi itu.
- Pencegahan Kriminalitas: "PROFIL DESA DARMASABA" bukan program keamanan (dan jadi sorotan karena terbaru); "Maling Motor…" ringkasan & isi tertukar; video "Mencegah Pencurian…" sudah tidak tersedia di YouTube.
- Laporan Publik: "LAPORAN REALISASI APBDES SEMESTER I" bukan laporan keamanan; penanganan ganda identik di "Aksi Penanganan … Sampah Liar"; "WIB" seharusnya WITA.
- Kontak Darurat Keamanan (stg): kategori uji "Chtvfyy"; item yatim "Test 0852…"; nomor Polsek Darmasaba 0361123456 / Polres 0361123999 tampak nomor contoh; BPBD & Damkar memakai nomor sama 0361900113.
- Tips Keamanan (stg): dua foto berupa gambar bertuliskan "No image"; entri "Keamanan Lingkungan Tanggungjawab Bersama" isinya berita, bukan tips.
- CCTV: status Online/Offline & `lastActive` diisi manual (data Feb 2026); "RS Kapal" di luar Desa Darmasaba; kode "CCTV - 09" beda format.
- Musik Desa (stg 2026-11-14): lagu uji "Lagu Tes" oleh artis "Tes" (tanpa tahun) tampil di publik; sampul 3 lagu seeder berupa gambar bertuliskan "No image"; genre "Pop" vs "pop" (frontend sudah menyatukannya saat tampil); 3 lagu belum punya file audio (lihat P3).
- Lowongan Kerja (stg 2026-11-14): 5 dari 7 lowongan tertanggal April 2026 (data awal/seed, nomor kontak sama 089647037426) dan mungkin sudah tidak berlaku; tipe pekerjaan "Menjaga Toko" pada lowongan Toko Bangunan KBSM seharusnya tipe kerja (mis. Full Time).
- Pendidikan (2026-11-15): Non Formal bagian ke-3 berjudul "Tempat Kegiatan" (seharusnya "Jenis Program yang Diselenggarakan"; seed `jenis-program-yang-diselenggarakan.json` + stg); `pengajar.json` = salinan `siswa.json` (dummy); Data Pendidikan stg "SD" ganda (874 & 90); judul buku ganda "Seni Berpikir Kritis"; seeder non formal mencetak log "fasilitas bimbingan belajar desa seeded".
- Inovasi (stg 2026-11-16): logo "BRI Peduli" berlatar hampir putih (bukan transparan) sehingga tampak kotak samar di dinding mitra; unggah PNG/WebP transparan. Kolaborasi berisi entri uji "Forum Inovasi Desa (Tes)".
- Lingkungan (stg 2026-11-16): langkah Bank Sampah ke-6 "Pilih sampah sesai jenisnya (Tes )" (id `cmrbohsmq0000nr0rjvdv3gqa`) adalah data uji; Data Lingkungan berisi entri uji "Test QA Data Lingkungan" (ikon `icon-test`); judul Konservasi "Filosofi Tri Hita Karuna" seharusnya "Karana".
- Ekonomi (stg 2026-11-16): Pengangguran ada tahun 9999 (kartu "bulan terbaru" jadi "Februari 9999") dan 2021; Penduduk Miskin 2026 = 5 orang (turun dari 390, tampak data uji); Demografi Pekerjaan berisi "Test QA Pekerjaan"; PADesa "tes" 950 jt + "Penanggulangan Bencana…" ganda; hierarki jabatan BUMDes janggal (Direktur/Bendahara/Sekretaris/Pengawas di bawah Penasihat, Penasihat & Kepala Unit tanpa induk) dan 0 pengurus; Kesejahteraan 6 program tanpa foto/galeri/video; usia kerja menganggur 2 baris sebaran tanpa periode.
- Kependudukan (stg 2026-11-17): Distribusi Agama = data seed (id `cmk-agama-00x`, total 4.215 ≈ 41% dari total banjar 10.254) + satu baris "LAINNYA 10" tahun 2020 (tampak uji coba); Dinamika Penduduk 100% seed (id `cmk-dinamika-00x`, termasuk 2026); Distribusi Umur 2026 mencampur kelompok seed & form admin. Hanya Data per Banjar yang tampak isian asli.
