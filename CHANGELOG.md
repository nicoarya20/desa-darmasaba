# Changelog

## [0.1.203] - 2026-11-04
### Added
- **Letak & Batas Wilayah di Profil Desa** (`/darmasaba/desa/profil`): section baru menampilkan batas utara/selatan/timur/barat, luas wilayah (hektar), keterangan, dan peta embed (hanya URL https). Diisi admin lewat tab "Letak & Batas Wilayah" di admin Profil Desa; bila belum diisi tampil empty-state. Model baru `WilayahDesa` (satu baris) + endpoint `GET /api/desa/profile/wilayah` (publik) dan `PUT` (admin). Tidak ada data wilayah di seed — wajib diisi lewat admin.
- **Halaman BUMDes dengan profil dan unit usaha**: model baru `ProfilBumDes` dan `UnitUsahaBumDes`, endpoint API + admin CRUD (profil BUMDes dan daftar unit usaha). Halaman publik kini berurutan: profil BUMDes, unit usaha, lalu struktur pengurus & SK, masing-masing dengan empty-state.
- **Produk Unggulan Desa di katalog UMKM**: kolom `PasarDesa.isUnggulan` (default false), parameter opsional `unggulan=true` pada list produk, toggle di form admin produk, badge "Unggulan" dan filter "Produk Unggulan" di katalog publik.
- **Kegiatan Pembangunan dan halaman Monev & Pembangunan**: field opsional pada `KegiatanDesa` (`anggaran`, `progres` 0–100, `statusPembangunan` rencana/berjalan/selesai, `sumberDana`), kategori "Pembangunan", kartu dengan progress bar di Kegiatan Desa, halaman baru `/darmasaba/desa/monev-pembangunan` (ringkasan per status, total anggaran, rata-rata progres, tautan ke APBDes), dan entri menu "Monev & Pembangunan" di grup Desa.
- **Seed data contoh untuk fitur baru**: wilayah desa (4 batas bertanda "data contoh", luas dan peta dikosongkan karena belum ada data resmi), profil dan 2 unit usaha BUMDes (teks diturunkan dari seed Potensi), 2 produk ditandai unggulan, dan 3 kegiatan Pembangunan contoh (rencana/berjalan/selesai). Semua seeder idempoten; tidak ada perubahan schema.
### Changed
- Menu `Ekonomi > Struktur Organisasi dan SK Pengurus BUMDesa` berlabel **"BUMDes"** (URL tetap sama agar link lama tidak putus).
- Seed `struktur-bumdes` tidak lagi memuat perangkat desa (Kades, Sekdes, Kaur, Kadus); hanya jabatan generik tanpa nama orang.
### Catatan operator
- 4 migrasi baru (idempoten, tabel/kolom baru, tidak menghapus data): `20261103090747_add_wilayah_desa`, `20261103100000_add_profil_dan_unit_usaha_bumdes`, `20261103100200_add_produk_unggulan_flag`, `20261103100300_add_pembangunan_fields_kegiatan_desa`.
- Data pegawai BUMDes lama yang berisi perangkat desa di DB staging/produksi TIDAK dihapus oleh rilis ini; pembersihan adalah keputusan terpisah.
- Data batas wilayah, profil/unit usaha BUMDes, dan produk unggulan harus diinput lewat admin (tidak ada data karangan di seed).

## [0.1.196] - 2026-09-21
### Added
- **Seed data untuk submenu Ekonomi > Kesejahteraan Masyarakat**: menambahkan 6 entri data program/kegiatan kesejahteraan masyarakat (BLT Dana Desa, verifikasi PKH, penyaluran BPNT/Kartu Sembako, bedah rumah RTLH, pendampingan PBI JKN-KIS, sosialisasi PIP) yang dikontekskan ke Desa Darmasaba, mengacu ke program bansos nasional yang benar-benar berjalan di level desa. Sebelumnya submenu ini (model `KesejahteraanMasyarakat`, fitur sudah ada di admin/API/public) tidak punya data seed sehingga tampil kosong di setup baru. Tidak ada perubahan schema/migration.

## [0.1.189] - 2026-09-01
### Changed
- **Input "Jadwal Pelayanan" Posyandu (`/admin/kesehatan/posyandu/list-posyandu` create & edit) diganti dari rich text editor menjadi pemilih terstruktur**: admin kini memilih hari (Senin–Jumat / Sabtu–Minggu / Libur) dan jam buka–tutup lewat komponen `JadwalPelayananInput`, bisa menambah/menghapus beberapa baris jadwal. Data disimpan sebagai JSON string di kolom `jadwalPelayanan` yang sudah ada — **tanpa migrasi database**. Data lama berbentuk HTML tetap ditampilkan lewat jalur *legacy* (fallback) di halaman detail admin, kartu & detail publik sehingga tidak ada data yang hilang. Tampilan render dipusatkan di komponen `JadwalPelayananView` (multi-baris) dan helper `jadwalToText` (ringkas satu baris untuk kartu). Helper murni di `src/lib/jadwal-pelayanan.ts` disertai unit test (`__tests__/api/posyandu_jadwal_pelayanan.test.ts`, 26 test).

## [0.1.181] - 2026-08-31
### Fixed
- **Tombol "Batal" pada Edit APBDes (`/admin/landing-page/apbdes/[id]/edit`) tidak mengembalikan daftar item**: `handleReset` hanya memulihkan field top-level (tahun/nama/deskripsi/dll) tetapi mempertahankan array `items` yang sedang diedit (`items: [...form.items] // keep existing items`). Akibatnya penambahan, penghapusan, atau perubahan baris item TIDAK ikut ter-reset saat admin klik Batal. Diperbaiki: item awal di-*snapshot* saat load, dan Batal kini memulihkan seluruh form termasuk `items` dari snapshot lewat helper murni `buildResetForm()` — item dipulihkan sebagai salinan independen sehingga editan berikutnya tak memutasi snapshot (dan sebaliknya). Tidak ada perubahan schema/database.

## [0.1.180] - 2026-08-31
### Fixed
- **Riwayat realisasi APBDes hilang permanen saat Edit (`/admin/landing-page/apbdes/[id]/edit`)**: handler update (`updt.ts`) memakai pola *delete-all-then-recreate* — semua `APBDesItem` dihapus lalu dibuat ulang, dan realisasi yang di-preserve dicocokkan lewat string `kode` yang mutable, tanpa transaksi. Dua skenario kehilangan data: (a) admin mengubah kode item (mis. `4.1` → `4.1a`) memutus link ke realisasi; (b) admin menghapus baris item memicu cascade delete yang menghapus fisik `RealisasiItem`. Diperbaiki tanpa menyentuh schema database: item dicocokkan lewat `id` yang STABIL (bukan kode), di-*update in-place* sehingga link realisasi tak pernah putus walau kode berubah; item yang dihapus admin di-*soft-delete* (`isActive=false`) sehingga cascade tak pernah kebakar dan riwayat tetap tersimpan; seluruh mutasi item + header dibungkus satu `$transaction` agar atomik. Field baru `id` (opsional) ditambahkan ke body request update dan dialirkan dari frontend (state + halaman edit) — backward-compatible: klien lama tanpa `id` tetap jalan via fallback pencocokan by kode.

## [0.1.174] - 2026-08-28
### Fixed
- **Hapus SDGs Desa (`/admin/landing-page/SDGs/[id]`) menyembunyikan kegagalan**: `handleHapus` memanggil delete tanpa `await` lalu langsung `router.push` ke halaman List, dan `<ModalKonfirmasiHapus>` tidak diberi prop `loading`. Akibatnya admin ter-redirect ke List sebelum request DELETE selesai — bila gagal (network/server error), `toast.error` tetap muncul tapi di halaman lain sehingga mudah tidak disadari. Diperbaiki: `sdgsDesa.delete.byId` kini mengembalikan `boolean` (sukses/gagal), `handleHapus` jadi `async` + `await` dan hanya redirect saat sukses, serta modal diberi `loading={sdgsState.delete.loading}` agar tombol "Yakin Hapus" menampilkan state proses. Tidak ada perubahan schema/database.

## [0.1.173] - 2026-08-27
### Fixed
- **Link/No. Telepon di card mobile admin Media Sosial tidak bisa di-tap**: teks link/kontak dibungkus `<a href={item.link}>`, padahal field `link` tidak pernah ada di model `MediaSosial` (schema hanya punya `iconUrl`) — href selalu kosong walau teksnya tampil normal. Tabel desktop tidak memakai anchor sama sekali sehingga tidak terdampak.
- **Klik icon media sosial di footer publik salah arah**: `SosmedView.tsx` memakai `router.push(item.iconUrl)` (navigasi SPA internal) untuk semua tipe tanpa membedakan URL sosmed vs nomor telepon.
- **Gambar/icon di halaman Detail Media Sosial (`/admin/landing-page/profil/media-sosial/[id]`) tampil raksasa tidak proporsional, di desktop maupun mobile**: `Image` tidak diberi ukuran (`w`/`h`), sehingga dirender di resolusi native-nya tanpa batasan — beda dengan halaman List (thumbnail 50×50/40×40) dan Create/Edit (`maxHeight: 200`) yang sudah membatasi ukuran preview. Ditambahkan batas ukuran tetap 160×160 dengan border dan radius, konsisten dengan pola preview gambar di halaman lain.

### Changed
- **Entry Media Sosial bertipe Telephone/WhatsApp kini diarahkan ke wa.me**: nomor dinormalisasi (awalan `0`/`62` → `62xxx`) lalu dibuka via `https://wa.me/<nomor>` — otomatis membuka WhatsApp Web di desktop dan aplikasi WhatsApp di mobile. Tipe lain (Facebook/Instagram/TikTok/YouTube/dst) tetap memakai `iconUrl` apa adanya. Logic dipusatkan di `getSosmedHref()` (`_lib/sosmed.ts`) dan dipakai baik di list admin maupun footer publik.

## [0.1.172] - 2026-08-26
### Fixed
- **Deskripsi/teks panjang tumpang tindih (overlap) khusus di Safari iPhone X pada 33 halaman list admin lain** (desa, ekonomi, inovasi, keamanan, kesehatan, landing-page, lingkungan, pendidikan, ppid) — bug WebKit yang sama dengan fix Program Inovasi di `0.1.171`: `Text` dengan `lineClamp` me-render langsung HTML rich-text (`dangerouslySetInnerHTML`) yang berisi tag blok (heading, paragraf, list), dan WebKit gagal meng-clamp konten seperti itu sehingga teks penuh muncul dan overlap dengan elemen di bawahnya. Diperbaiki dengan pola yang sama: meratakan field jadi plain text (`toPlainText()`) sebelum di-`lineClamp`, di tabel desktop maupun kartu mobile setiap halaman. `dangerouslySetInnerHTML` di luar sel yang di-clamp (mis. tampilan detail penuh) tidak disentuh.

## [0.1.171] - 2026-08-26
### Fixed
- **Deskripsi Program Inovasi (admin, `/admin/landing-page/profil/program-inovasi`) tampil tumpang tindih (overlap) khusus di Safari iPhone X, aman di device lain**: `Text` dengan `lineClamp` sebelumnya me-render langsung HTML rich-text (`dangerouslySetInnerHTML`) dari field deskripsi yang berisi heading/list (mis. "Tujuan Program", "Sasaran Program"). WebKit (Safari/iOS) gagal meng-clamp konten yang berisi elemen blok bersarang, sehingga teks penuh muncul dan overlap dengan elemen di bawahnya. Diperbaiki dengan meratakan deskripsi jadi plain text sebelum di-clamp (pola sama dengan fix serupa di halaman Perpustakaan Digital publik) — berlaku untuk tabel desktop maupun kartu mobile.

## [0.1.141] - 2026-08-20
### Fixed
- **Gambar berformat WebP tidak pernah tampil di Safari versi lama (pra-Safari 14, sebelum September 2020)**: berbeda dari mitigasi retry di 0.1.140 (yang menangani kegagalan intermiten karena bug WebKit/QUIC), ini kegagalan yang selalu terjadi — Safari lama memang tidak punya kemampuan decode format WebP sama sekali, jadi gambar apa pun akan gagal diulang berapa kali pun. Ditambahkan fallback format: browser mendeteksi sendiri ketidakmampuannya decode WebP (feature-detect via canvas, tanpa request jaringan), lalu meminta ulang gambar yang sama ke `/api/img/:name` dengan parameter `?format=jpeg`. Server mengonversi on-the-fly dari WebP ke JPEG (atau PNG jika gambarnya punya transparansi) lewat `sharp` — tanpa migrasi data, tanpa file kedua tersimpan. Murni opt-in lewat query param: browser modern (termasuk Safari versi baru) tidak pernah mengirim param ini, jadi tidak ada perubahan perilaku atau performa untuk mereka.

## [0.1.140] - 2026-08-19
### Fixed
- **Gambar gagal dimuat (ikon rusak) di Safari, padahal normal di Chrome**: seluruh gambar di situs publik kadang tampil sebagai ikon gambar rusak khusus di Safari. Diverifikasi lewat Safari asli: error-nya "An SSL error has occurred and a secure connection to the server cannot be made", dan file yang gagal terbukti valid saat diakses langsung (curl 200 OK) — akar masalahnya adalah bug WebKit/Safari yang intermiten saat negosiasi HTTP/3 (QUIC) dengan Cloudflare (setting berlaku di seluruh domain, di luar akses project ini). Karena setting Cloudflare tidak bisa diubah dari sini, ditambahkan mitigasi sisi client: gambar yang gagal load di-retry otomatis (maks 3x, delay bertahap 400ms/1s/2s) lewat listener `error` capture-phase di level `document` pada layout publik (`/darmasaba/*`), sehingga otomatis mencakup semua gambar tanpa menyentuh tiap halaman satu per satu. Bukan fix akar — hanya mengurangi dampaknya di sisi pengunjung.

## [0.1.139] - 2026-08-18
### Fixed
- **Slider durasi musik tidak mengikuti posisi drag**: menggeser slider durasi ke posisi tertentu tidak lompat ke titik yang diinginkan. Penyebabnya endpoint pengambil file audio (`/api/fileStorage/findUnique/:name`) belum mendukung HTTP Range request, sehingga browser tidak bisa seek ke bagian audio yang belum ter-buffer. Kini endpoint mendukung `Range` header dan merespons `206 Partial Content` dengan `Content-Range`/`Accept-Ranges` sesuai standar.
- **Slider volume di player musik (pojok bawah) tidak bisa digeser naik/turun**: slider sebelumnya diberi tinggi (`h={100}`) untuk terlihat vertikal, padahal komponen Slider yang dipakai tidak punya mode vertikal sama sekali sehingga drag tidak berefek. Diganti jadi slider horizontal yang benar-benar interaktif.
- **Popup volume hilang saat kursor terlalu lama di area hover**: popup berbasis hover mudah tertutup sebelum sempat digeser (ada celah antar ikon speaker dan popup) dan sama sekali tidak bisa dipakai di perangkat sentuh/mobile. Diganti slider volume permanen di sebelah ikon speaker (tampil di desktop, disembunyikan di mobile karena perangkat sudah punya kontrol volume hardware).
- **Card detail struktur organisasi (PPID, Struktur Perangkat Desa, Struktur BUMDes) teks jabatan/nama menumpuk & jarak ke tombol Detail terlalu mepet**: diperbaiki pada 3 halaman yang memakai layout struktur organisasi yang sama.
- **Pindah halaman pagination Lowongan Kerja Lokal saat sedang mencari kehilangan filter pencarian**: tombol pagination sebelumnya memuat ulang data tanpa menyertakan kata kunci pencarian dan jumlah data per halaman.

### Added
- Akses publik (tanpa login) untuk mengambil bytes file lewat `/api/fileStorage/findUnique/:name` — diperlukan agar audio musik bisa diputar oleh pengunjung yang belum login. Endpoint fileStorage lainnya (daftar, tambah, hapus) tetap butuh login admin.

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
