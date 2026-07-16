# Changelog

## [0.1.135] - 2026-07-16
### Fixed
- **Field NIS & Nomor KK masih menerima huruf**: kolom NIS (form Beasiswa Desa publik — halaman utama & "pelajari lebih lanjut") dan Nomor KK (admin Ajukan Permohonan) sebelumnya memakai `type="number"`, yang di keyboard fisik masih meloloskan karakter `e`, `+`, `-`, `.` dan berisiko kehilangan angka nol di depan. Kini ketiganya memakai pola yang sama dengan perbaikan NIK/telepon sebelumnya: memfilter karakter non-digit (`replace(/\D/g, '')`) plus `inputMode="numeric"`, dengan batas maksimal NIS 18 digit dan Nomor KK 16 digit. Tanpa perubahan schema/migration.

## [0.1.133] - 2026-07-15
### Fixed
- **Kursor "loncat" saat mengetik di form admin (create & edit)**: mengetik di kolom teks pada banyak halaman admin membuat karakter meleset posisi — misal mengetik `a(y)am` jadi `a(ya)m`, paling terasa saat menyisipkan karakter di tengah kata. Penyebabnya kolom terkontrol membaca nilai dari state Valtio yang me-render ulang secara asinkron (satu microtask), sehingga `<input>` sempat commit dengan nilai lama dan browser memindahkan kursor ke akhir. Kini state sumber nilai memakai `{ sync: true }` agar render ulang terjadi sinkron di event yang sama — kursor tetap di tempat. Cakupan tambahan pada 32 halaman yang terlewat dari perbaikan sebelumnya: 4 halaman edit (Musik, CCTV, Event Budaya, APBDes) dan 28 halaman create (Banjar, Berita, Event Budaya, Galeri Foto/Video, Kegiatan Desa, Pengumuman, Potensi, Profil Perbekel, PADesa Belanja/Pembiayaan, UMKM Data/Kategori/Produk, Mitra Kolaborasi, Jenis Pengaduan, CCTV, Pencegahan Kriminalitas, Polsek Terdekat & Layanan, Tarif Layanan, Kelahiran, Kematian, Prestasi Desa, Musik, Daftar Informasi Publik). Tanpa perubahan schema/migration.

## [0.1.123] - 2026-07-15
### Fixed
- **Input nomor telepon menerima huruf & tanpa batas panjang di banyak form**: kolom nomor telepon/HP/kontak di berbagai halaman (admin & publik) masih bisa diisi huruf dan menerima digit melebihi panjang wajar — dilaporkan pertama pada form Lowongan Kerja Lokal. Kini seluruh field nomor telepon memfilter karakter non-digit dan membatasi maksimal 13 digit (rentang nomor HP Indonesia, konsisten dengan perbaikan UMKM 0.1.121), serta memakai `inputMode="numeric"` agar keyboard angka muncul di perangkat mobile. Cakupan: Lowongan Kerja Lokal, Pegawai BUMDes, Pegawai PPID, Kontak Darurat (kesehatan & keamanan), Polsek Terdekat, Puskesmas (kontak & UGD), Posyandu (No. HP balita/ibu hamil & telepon posyandu), Peminjam Perpustakaan, Layanan Online (administrasi & pengaduan), Beasiswa Desa, Jadwal Kegiatan, dan Permohonan Informasi/Keberatan PPID. Tanpa perubahan schema/migration.

## [0.1.122] - 2026-07-14
### Fixed
- **Edit Polsek Terdekat (admin) menampilkan notif ganda & data tidak tersimpan**: saat mengubah data Polsek Terdekat lalu menekan Simpan, muncul pesan error "[layananPolsekId] required" sekaligus notifikasi "berhasil diperbarui" — padahal data tidak tersimpan. Penyebabnya dua hal: (1) input yang diisi pengguna hanya masuk ke state form halaman, tetapi proses simpan memvalidasi & mengirim state form lain yang tidak pernah terisi; (2) saat memuat data untuk diedit, daftar layanan diambil dari field yang tidak ada di respons server (server mengirim relasi, bukan field langsung), sehingga validasi selalu gagal namun tombol Simpan tetap menampilkan notifikasi sukses. Kini input pengguna disinkronkan ke state yang benar sebelum disimpan, daftar layanan dibaca dari relasi yang tepat, dan notifikasi sukses/redirect hanya muncul bila penyimpanan benar-benar berhasil. Tanpa perubahan schema/migration.

## [0.1.120] - 2026-07-14
### Fixed
- **Hapus Data Pendidikan (admin) gagal dengan error 400 "Bad Request"**: menekan hapus pada daftar Data Pendidikan menampilkan error dan data tidak terhapus. Penyebabnya sama seperti perbaikan Info Sekolah (0.1.114): permintaan hapus dikirim dengan header `Content-Type: application/json` padahal tanpa isi, sehingga server menolak lebih dulu (400) sebelum masuk ke proses hapus, dan respons non-JSON memicu error parsing di layar. Kini penghapusan memakai mekanisme API yang konsisten (Eden client) yang tidak memasang header itu untuk permintaan tanpa isi dan membaca respons sesuai tipenya. Tanpa perubahan schema/migration.

## [0.1.119] - 2026-07-14
### Fixed
- **Data Pendidikan (admin) lambat muncul setelah tambah data, harus refresh manual**: setelah menyimpan data pendidikan baru, daftar sering lama menampilkan data terbaru sampai halaman di-refresh manual. Penyebabnya alur setelah simpan memicu dua pemuatan daftar yang saling balapan (satu dari proses simpan, satu saat halaman daftar dibuka) plus satu permintaan detail yang tidak terpakai — semuanya menahan tampilan di kondisi loading. Kini setelah simpan langsung diarahkan ke halaman daftar yang memuat data segar satu kali saja, tanpa permintaan berlebih. Tanpa perubahan schema/migration.

## [0.1.118] - 2026-07-14
### Fixed
- **Data duplikat di menu Prestasi Desa & APBDes**: sistem sebelumnya mengizinkan penambahan data yang sama berkali-kali tanpa validasi, sehingga terjadi redundansi. Kini saat menambah/mengubah: Prestasi Desa ditolak bila namanya sudah dipakai (tidak peduli besar/kecil huruf), dan APBDes ditolak bila tahunnya sudah punya data aktif. Muncul pesan jelas seperti "APBDes untuk tahun 2025 sudah ada". Validasi di sisi handler API; tanpa perubahan schema/migration.

## [0.1.117] - 2026-07-14
### Fixed
- **Halaman Kependudukan (Dashboard & Dinamika Penduduk) error / blank di STG**: kedua halaman publik gagal dirender (React error #31 — mencoba menampilkan objek data sebagai teks). Penyebabnya di endpoint dashboard summary: daftar query paralel punya satu query berlebih (data kelahiran) yang tidak terpakai, sehingga hasil setiap query setelahnya bergeser satu posisi — akibatnya angka "Pindah Masuk" justru terisi daftar data kematian, dan data agama/umur/banjar ikut tertukar. Query berlebih dihapus agar setiap angka kembali ke tempatnya. Tanpa perubahan schema/migration.
- **Menu Posyandu di sidebar admin membuka halaman 404**: alamat menu memiliki potongan berlebih di ujung sehingga sistem mengira nama menu adalah ID data dan mencari data posyandu bernama "list_posyandu" yang tidak ada (404). Alamat diperbaiki agar langsung membuka daftar posyandu.

## [0.1.116] - 2026-07-14
### Fixed
- **Hapus kategori/master induk gagal (error 500) di 8 halaman admin**: melanjutkan perbaikan Info Sekolah (0.1.114), pola yang sama diterapkan ke kategori/master induk sejati — Kategori Pengumuman, Kategori Kegiatan Gotong Royong, Pendaftaran Jadwal Kegiatan, tiga master responden Indeks Kepuasan (Jenis Kelamin, Umur, Pilihan Rating), Kategori Desa Anti Korupsi, dan Kategori Prestasi. Menghapus data ini saat masih dipakai data lain sebelumnya membuat server error 500 (relasi wajib) atau menelantarkan data anak. Kini memakai mekanisme nonaktif (soft-delete) seperti Data Banjar: bila masih dipakai muncul pesan jelas seperti "tidak dapat dihapus karena masih digunakan oleh 3 pengumuman"; bila aman, data disembunyikan dari daftar.
- **Hapus Data Kelahiran & Kematian error 500**: berbeda dari kategori di atas, Data Kelahiran/Kematian adalah data mentah — data statistik Persentase Kelahiran/Kematian yang menunjuk ke sana. Menghapus row yang sudah dipakai statistik sebelumnya melempar error 500. Kini penghapusan langsung menghapus data beserta baris statistik pasangannya dalam satu transaksi (atomik), sehingga angka statistik otomatis menyesuaikan — sesuai perilaku yang diharapkan ("hapus ya hapus").
- Penghapusan di frontend untuk semua halaman di atas disamakan ke mekanisme API yang konsisten (Eden client). Tanpa perubahan schema/migration.

## [0.1.114] - 2026-07-13
### Fixed
- **Hapus Jenjang Pendidikan & Lembaga (Info Sekolah) gagal dengan error 500**: menghapus jenjang pendidikan yang masih memiliki lembaga (atau lembaga yang masih memiliki siswa/pengajar) membuat server error dengan status 500, dan di layar hanya muncul "Terjadi kesalahan" tanpa penjelasan. Penyebabnya penghapusan bersifat permanen sehingga ditolak database karena data masih terkait. Kini penghapusan memakai mekanisme nonaktif (soft-delete) seperti halaman Data Banjar: data disembunyikan dari daftar, dan bila masih dipakai muncul pesan jelas seperti "tidak dapat dihapus karena masih digunakan oleh 3 lembaga". Berbeda dengan perbaikan Inovasi/Lingkungan sebelumnya (yang menangani error 400 header salah), perbaikan ini menangani error 500 akibat relasi data. Penghapusan di frontend juga disamakan ke mekanisme API yang konsisten (Eden client).

## [0.1.113] - 2026-07-13
### Fixed
- **Hapus data Lingkungan gagal dengan error "Bad Request" (400)**: pada 3 halaman Lingkungan — Pengelolaan Sampah, Program Penghijauan, dan Data Lingkungan Desa — tombol Hapus mengirim permintaan penghapusan dengan header yang salah (mengklaim berisi data JSON padahal tidak ada isi), sehingga server di STG menolak dengan status 400 sebelum permintaan sampai ke proses hapus. Kini penghapusan memakai mekanisme pemanggilan API yang sama dengan halaman lain yang sudah berfungsi (Inovasi Program Kreatif), sehingga data bisa dihapus dengan benar.

## [0.1.111] - 2026-07-10
### Added
- **Endpoint agregat "Riwayat Kesehatan Warga"** (`GET /api/kesehatan/riwayatwarga/find-many`): satu panggilan mengambil 3 dataset sekaligus — Ibu Hamil, Balita, dan Penderita Penyakit — plus daftar banjar untuk dropdown, dengan filter banjar terpadu (`?banjarId=`), pencarian (`?search=`), dan pagination (`?page=`, `?limit=`) yang berlaku ke ketiga dataset. Dirancang untuk komponen UI 3-tab "Riwayat Kesehatan Warga". Filter banjar menyesuaikan relasi tiap model: Ibu Hamil & Balita lewat relasi posyandu (`{ posyandu: { banjarId } }`, mengikuti pola `ringkasan-kesehatan/stats.ts`), Penderita Penyakit lewat `banjarId` langsung. Saat banjar dipilih, data Ibu Hamil/Balita yang belum terhubung ke posyandu otomatis terkecuali (banjar tak dapat ditentukan) — konsisten dengan perilaku ringkasan kesehatan yang sudah ada. Kegagalan salah satu dataset tidak menggagalkan keseluruhan: blok yang gagal dikembalikan kosong dan disertai field `errors`, sisanya tetap tampil. Bersifat aditif — 3 endpoint lama (`/ibuhamil`, `/balita`, `/grafikkepuasan`) tidak diubah.

## [0.1.108] - 2026-07-08
### Fixed
- **Hapus data Inovasi gagal dengan error "Bad Request" (400)**: pada 4 halaman detail Inovasi — Program Kreatif Desa, Desa Digital / Smart Village, Info Teknologi Tepat Guna, dan Kolaborasi Inovasi — tombol Hapus mengirim permintaan penghapusan dengan header yang salah (mengklaim berisi data JSON padahal tidak), sehingga server menolak dengan status 400. Kini penghapusan memakai mekanisme pemanggilan API yang sama dengan halaman lain yang sudah berfungsi (Program Inovasi di Landing Page), sehingga data bisa dihapus dengan benar.

## [0.1.106] - 2026-07-08
### Fixed
- **Hapus data Inovasi tampak gagal (item terhapus masih muncul di daftar)**: pada 4 halaman detail Inovasi — Program Kreatif Desa, Desa Digital / Smart Village, Info Teknologi Tepat Guna, dan Kolaborasi Inovasi — tombol Hapus menjalankan proses penghapusan tanpa menunggu selesai, lalu langsung pindah ke halaman daftar. Akibatnya daftar dimuat mendahului penghapusan yang belum tuntas di server → item yang baru dihapus masih tampil (seolah gagal), padahal sebenarnya terhapus. Kini aplikasi menunggu penghapusan selesai sebelum pindah halaman; jika gagal, tetap di halaman detail dengan notifikasi error. Penghapusan Desa Digital & Info Teknologi juga kini memvalidasi respons sukses dengan benar (bukan sekadar status HTTP).

## [0.1.104] - 2026-07-07
### Added
- **Satuan produk UMKM (kg/ekor/pcs)**: produk `PasarDesa` kini punya field `satuan` (opsional). Admin mengisi satuan tiap produk lewat Autocomplete (preset kg/ons/ekor/ikat/butir/pcs/… atau ketik bebas). Tampil di halaman publik: harga `Rp X / satuan`, badge `Stok: 12 ekor`, label `Jumlah (ekor)` di modal pesan, dan pesan WhatsApp `Jumlah: 2 ekor`. Sebelumnya jumlah/stok tampil angka telanjang ("1") — ambigu untuk produk seperti ayam. Migration `add_satuan_pasar_desa` (ADD COLUMN nullable — produk lama tetap valid, UI fallback tanpa satuan bila kosong). Seeder mengisi 4 produk pasar desa (warung→paket, jajanan→bungkus, sayur→ikat, ayam→ekor).
- **Validasi No Telp form peminjaman Perpustakaan Digital**: kolom No Telp kini prefix `+62` statis, hanya menerima digit (huruf/simbol/0-depan otomatis dibuang), dibatasi 10–13 digit (format lokal). Sebelumnya bisa diisi huruf & tanpa batas panjang.

### Fixed
- **Admin tiba-tiba logout saat masih aktif**: middleware `/admin/*` sebelumnya hanya membaca cookie cache Better Auth (TTL 60 detik) — begitu cache kedaluwarsa, user ditendang ke `/login` padahal sesi (token 7 hari + session DB) masih valid. Kini middleware fallback ke `session_token`: selama belum logout & token belum kedaluwarsa, admin tetap masuk; role/status tetap fresh 60 detik dari cookie cache. Logout hanya terjadi saat benar-benar logout, token habis 7 hari, atau akun dinonaktifkan.
- **Redesign halaman Informasi Desa (Inovasi › Layanan Online)**: perbaiki ruang kosong & tata letak, tinggi gambar seragam (fix `height`→`h` Mantine v7), judul di card berita terbaru, tanggal Bahasa Indonesia ("2 bulan lalu"), badge kategori tak mepet tepi, loading skeleton + empty state, tombol "Baca selengkapnya".

## [0.1.93] - 2026-07-03
### Changed
- **Menu admin UMKM kembali jadi satu entri sidebar (revert nested submenu 0.1.91)**: submenu nested (Dashboard/Data UMKM/Produk/Penjualan) di sidebar ternyata redundant — halaman UMKM (`Manajemen UMKM`) sudah punya navigasi Tabs internal sendiri (Dashboard, Data UMKM, Produk, Penjualan, Kategori Produk). Sidebar kini cukup satu item "UMKM" → membuka halaman ber-tab. Tetap konsisten antar-role (dev, admin, user dengan menuIds) karena ketiga array menu (devBar/navBar/role1) diseragamkan ke satu entri.
- `layout.tsx` dikembalikan ke render 2-level (render grandchild 3-level dari 0.1.91 dibuang — tak terpakai lagi).
- Frontend-only, tanpa perubahan schema/migration.

## [0.1.92] - 2026-07-03
### Changed
- Rilis staging UMKM nested submenu (kemudian direvert di 0.1.93). Version bump untuk deploy STG.

## [0.1.91] - 2026-07-03
### Changed
- **Menu admin Ekonomi > UMKM jadi sub-group nested & konsisten antar-role**: sebelumnya sub-menu UMKM tampil berbeda tergantung role yang login — dev (roleId 0) melihat satu entri "UMKM", sedangkan admin (roleId 1 / user dengan menuIds) melihat 4 entri flat sejajar ("UMKM - Dashboard", "UMKM - Data UMKM", dst). Kini seragam: UMKM adalah grup yang bisa di-expand berisi Dashboard, Data UMKM, Produk, Penjualan — sama untuk semua role. Perubahan di data menu (`list_PageAdmin.tsx`, array devBar/navBar/role1) + render sidebar 3-level (`layout.tsx`).
- Efek samping positif: item aktif sub-menu UMKM kini ter-highlight benar. Entri flat lama (`"UMKM - Dashboard"`) tak pernah cocok dengan URL segment sehingga tak pernah aktif; nama grandchild baru ("Dashboard", "Data UMKM", dst) cocok dengan segment path → active-state jalan.
- Frontend-only, tanpa perubahan schema/migration.

## [0.1.90] - 2026-07-02
### Fixed
- **Dropdown Select kategori kosong / pilihan tak nyangkut (intermiten, paling sering di STG)**: 38 halaman membaca state Valtio dari **raw proxy** langsung di JSX, bukan lewat snapshot `useProxy()`. Akibatnya komponen tidak subscribe ke perubahan proxy → saat data async (`findManyAll.load()`) selesai, komponen tak re-render → dropdown kosong. Race lebih lebar di STG (fetch via Cloudflare lebih lambat) daripada localhost. Fix: setiap cabang state yang dibaca untuk display kini di-snapshot lewat `useProxy()`; assignment `onChange`/`onClick` & pemanggilan `.load()`/`.delete()` tetap di raw proxy.
- **Halaman publik detail layanan (`desa/layanan/[id]`): kategori tampil tapi tak bisa dipilih**: options diambil dari `findManyAll` tapi `onChange` mencari item di `findMany` (sumber berbeda) → `kategoriId` tak pernah ter-set. Kini `data` & `onChange` sama-sama membaca `findManyAll` (snapshot & sumber konsisten).
- Cakupan domain: desa, ekonomi (umkm/bumdes), pendidikan (perpustakaan/info-sekolah), ppid, landing-page, kesehatan, keamanan, lingkungan, dan cluster indeks-kepuasan-masyarakat. Frontend-only, tanpa perubahan schema/migration.

## [0.1.89] - 2026-07-02
### Changed
- Rilis staging lanjutan dari 0.1.88 (pembersihan route custom Google OAuth). Tidak ada perubahan behavior; version bump untuk deploy STG.

## [0.1.88] - 2026-07-02
### Removed
- **Route custom Google OAuth** (`GET /api/auth/google` & `/api/auth/google/callback`) beserta helper `_lib/google/*` dan test-nya — kode mati sejak migrasi ke Better Auth (tidak ada caller dari UI; login admin memakai `authClient.signIn.social`). Logika redirect-by-role tetap hidup di `src/lib/auth-policy.ts` (`defaultRouteForRole`) via gateway `/auth/callback`.
- Env var `GOOGLE_REDIRECT_URI` tidak lagi dipakai — Better Auth merakit redirect URI dari `BETTER_AUTH_URL` (`/api/auth/callback/google`). Cukup set `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`. Authorized redirect URI lama (`/api/auth/google/callback`) boleh dicabut dari Google Console.

## [0.1.87] - 2026-07-01
### Fixed
- **`/admin/*` selalu hang/timeout di STG** (lanjutan 0.1.85/0.1.86): fetch `get-session` dari dalam middleware — baik via origin publik, loopback, maupun proxy — selalu menggantung di container. Middleware kini membaca sesi dari **cookie cache** (`getCookieCache`) yang di-decode lokal **tanpa HTTP call**. `session.cookieCache` diaktifkan (TTL 60 dtk) agar `roleId`/`isActive` tersedia di cookie; validasi penuh sesi tetap di server (`getSession`/`requireAuth`). Perubahan role/isActive berlaku maksimal ~60 dtk.

## [0.1.86] - 2026-07-01
### Fixed
- **`/admin/*` timeout intermiten (HTTP 524/hang) di STG**: setelah fix TLS 0.1.85, middleware memanggil `get-session` via `X-Forwarded-Host` (domain publik) sehingga container memanggil dirinya sendiri lewat Cloudflare (round-trip eksternal) → kadang hang >25s. Diganti ke loopback internal `http://127.0.0.1:PORT` — validasi sesi tetap jalan, tanpa keluar ke proxy, tanpa masalah TLS localhost.

## [0.1.85] - 2026-07-01
### Fixed
- **500 Internal Server Error di `/admin/*` pada STG**: middleware memanggil `get-session` memakai `request.nextUrl.origin` yang di dalam container ter-resolve ke `https://localhost:3000` → fetch HTTPS ke localhost gagal validasi TLS (`ERR_TLS_CERT_ALTNAME_INVALID`) → guard melempar 500 di tiap akses admin. Origin kini diambil dari header `X-Forwarded-*` proxy (`publicOriginFromHeaders`), dan `getSession` yang gagal me-redirect ke `/login` alih-alih 500.

## [0.1.84] - 2026-07-01
### Fixed
- Login Google user lama (`account_not_linked`): user yang dibuat sistem manual (`emailVerified=false`) kini bisa login — `accountLinking` dengan `trustedProviders: ["google"]` + `requireLocalEmailVerified: false`.
- Redirect setelah login mengikuti role lagi: gateway `/auth/callback` membaca sesi server-side lalu mengarahkan admin ke dashboard sesuai role, user Google ke `/profile` (sebelumnya semua ke `/`).

### Changed
- Untrack file junk/generated dari repo (MIND/, QC/, test-results/, dll) + perluas `.gitignore`.

## [0.1.83] - 2026-07-01
### Added
- Migrasi autentikasi ke **Better Auth** (Google OAuth saja), menyelaraskan dengan standar tim (`base-template2`). Session store di PostgreSQL, **tanpa Redis** (rate-limit storage `database`). Handler di `/api/auth/*` via `toNextJsHandler` — Elysia catch-all `/api/[[...slugs]]` tak berubah.
- Model Better Auth: `session`, `account`, `verification`, `rate_limit`, plus kolom `emailVerified` pada `users`. Field `name`/`image` dipetakan ke `username`/`avatarUrl` existing; `roleId`/`isActive` sebagai custom field (tak bisa di-set dari client).
- `src/lib/auth-policy.ts`: kebijakan role murni (user Google baru → `roleId "5"`, email di `SUPER_ADMIN_EMAIL` → `roleId "1"`, gate admin `roleId <= 4`), dengan unit + contract test.

### Changed
- Login admin: tombol Google memakai `authClient.signIn.social` (Better Auth), form OTP dihapus dari tampilan.
- Guard: `requireAuth` (API), `middleware.ts` (route), `/api/auth/me` & `/api/auth/logout` kini memakai sesi Better Auth. Bentuk return `requireAuth` dipertahankan (kontrak internal).
- User Google baru langsung `isActive: true` → diarahkan ke `/profile` tanpa perlu approval admin.

### Notes
- **Env baru wajib**: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (lihat `.env.example`). Redirect URI Google console: `<BETTER_AUTH_URL>/api/auth/callback/google`.
- **Cutover**: cookie sesi berganti → semua user perlu login ulang sekali (Google, 1 klik).
- Kode OTP/iron-session/manual-Google lama masih ada (dorman) — penghapusan & drop tabel legacy (`user_sessions`, `KodeOtp`, kolom `googleId`) ditunda ke pekerjaan terpisah karena masih dipakai modul non-auth (user management, health check).

## [0.1.82] - 2026-06-30
### Fixed
- Login Google: setelah memilih akun, user tidak lagi dilempar ke `https://localhost:3000/...`. Semua redirect callback (termasuk jalur sukses) kini memakai origin publik dari header `X-Forwarded-Proto`/`X-Forwarded-Host` yang di-set proxy (Cloudflare → Portainer), bukan `req.url` yang ter-resolve ke host internal container.
- Login Google `oauth_failed`: role `USER` (id `5`) di-seed lewat migration idempotent, karena entrypoint produksi hanya menjalankan `prisma migrate deploy` tanpa `db seed` sehingga role bisa absen di STG/prod dan membuat pembuatan user Google kena FK violation.

### Changed
- Bootstrap admin via Google: email `SuperAdmin-Nico` diisi lewat migration (hanya bila masih kosong) agar login Google ter-match by email dan role admin (0) dipertahankan.

## [0.1.81] - 2026-06-30
### Fixed
- `GET /api/auth/google` tidak lagi mengembalikan 500 buram saat env `GOOGLE_*` belum di-set. Base URL redirect fallback kini diambil dari origin request (`req.url`), bukan `NEXT_PUBLIC_BASE_URL` yang bernilai `/` (membuat `new URL()` melempar `TypeError`). Saat config kurang, user diarahkan rapi ke `/login?error=oauth_config`.

## [0.1.79] - 2026-06-30
### Added
- Login dengan Google (OAuth Authorization Code Flow, manual tanpa library) — route `GET /api/auth/google` & `GET /api/auth/google/callback`.
- Halaman profil publik `/darmasaba/profile` untuk user non-admin, dengan tombol keluar.
- Role baru `USER` (id `5`) untuk user publik hasil login Google.
- Field `email`, `googleId`, `avatarUrl` pada user; admin bootstrap via seeder (cocokkan akun Google by email, role admin dipertahankan).

### Changed
- Tombol "Login dengan Google" di halaman login kini mengarah ke alur OAuth (sebelumnya placeholder).
- Middleware `/admin/*` kini menolak user non-admin (roleId > 4) dan mengalihkan ke halaman profil.
- `/api/auth/me` ikut mengembalikan `email` dan `avatar`.
- Kolom `nomor` pada user jadi opsional (user Google tidak punya nomor HP).
