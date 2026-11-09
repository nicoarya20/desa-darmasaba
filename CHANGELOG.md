# Changelog

## [0.1.225] - 2026-11-09
### Changed
- **Tampilan section SDGs Desa di beranda diperbarui** agar senada dengan section Kabar Desa dan APBDes: latar abu muda, kartu putih datar tanpa bayangan, ikon resmi tiap tujuan SDGs, nama tujuan rata kiri, dan skor besar dengan keterangan "Skor". Skor di semua kartu kini sejajar walaupun panjang nama tujuannya berbeda. Di layar ponsel, kartu tampil sebagai baris (ikon di kiri, nama dan skor di kanan) sehingga nama tujuan yang panjang tetap mudah dibaca.
- Di atas kartu kini ada keterangan "Tujuan dengan skor tertinggi", karena beranda hanya menampilkan empat tujuan berskor tertinggi.
- Tombol "Jelajahi semua tujuan SDGs Desa" kini berbentuk pil yang sama dengan tombol section lain.
- Selama data dimuat, tampil kerangka kartu abu-abu; bila data kosong atau gagal dimuat, tampil satu pesan singkat.
### Fixed
- Urutan empat tujuan berskor tertinggi kini memperhitungkan angka di belakang koma (sebelumnya 35,47 dan 35,75 dianggap sama). Skor yang ditulis dengan koma desimal (mis. "52,62") juga terbaca dengan benar, dan tujuan tanpa skor tidak ikut tampil.

## [0.1.223] - 2026-11-07
### Fixed
- **Data hasil seed tidak lagi tampil dobel setelah data contoh diganti.** Sebelumnya, data contoh versi lama tetap tersimpan saat isi seed diperbarui, sehingga tampil berdampingan dengan data baru. Saat seed dijalankan, data lama berikut kini dibersihkan otomatis:
  - 18 berita lama (sebelum diganti berita Okt–Nov 2026)
  - 22 jabatan perangkat desa dan 8 nama pengurus lama di Struktur Organisasi BUMDes
  - kategori kegiatan "Sosial" yang muncul dua kali
  - buku "Seni Berpikir Kritis" yang tercatat dua kali di Perpustakaan Digital
- Data yang sudah diubah admin (judul/nama berbeda dari data contoh lama) tidak ikut terhapus. Kegiatan yang memakai kategori "Sosial" lama otomatis dipindah ke kategori "Sosial" yang tersisa. Jabatan BUMDes lama yang masih dipakai pengurus buatan admin juga dibiarkan.

## [0.1.222] - 2026-11-07
### Added
- **Halaman Peta Informasi** (`/darmasaba/peta-informasi`): semua halaman website Desa Darmasaba dalam satu tempat, dikelompokkan per menu (PPID, Desa, Kesehatan, Keamanan, Ekonomi, Inovasi, Lingkungan, Kependudukan, Pendidikan, Musik, Transparansi, Layanan Online Desa), termasuk halaman yang tidak ada di menu seperti APBDes dan Grafik Penyakit. Ketik di kotak "Saring halaman" untuk langsung menyaring daftar, misalnya "apbdes" atau "posyandu". Setiap tautan bisa dibuka di tab baru.
- Peta Informasi bisa dibuka dari footer (bagian "Tautan Penting"), dicari lewat kotak pencarian ("peta informasi"), dan muncul sebagai tautan "Buka Peta Informasi" saat pencarian tidak menemukan hasil.
### Fixed
- Tombol kembali (ikon panah) di halaman publik kini punya label "Kembali ke halaman sebelumnya", sehingga terbaca oleh pembaca layar dan menampilkan keterangan saat disorot mouse.

## [0.1.221] - 2026-11-06
### Added
- **Nama menu dan submenu website kini bisa dicari.** Ketik nama halaman di kotak pencarian, misalnya "Polsek Terdekat", "Struktur PPID", atau cukup potongannya seperti "polsek", dan halamannya langsung muncul di bagian "Halaman" paling atas, lengkap dengan letaknya di menu (contoh: "Keamanan › Polsek Terdekat"). Mengetik nama menu utama, misalnya "Keamanan", menampilkan submenu di dalamnya. Hasil ini muncul seketika saat mengetik, di atas hasil pencarian konten seperti biasa.
- Halaman yang tidak ada di menu juga bisa dicari dengan cara yang sama: APBDes, Desa Anti Korupsi, SDGs Desa, Struktur Perangkat Desa, Galeri Video, Administrasi Online (Ajukan Surat), Pengaduan Masyarakat, Informasi Desa, serta Fasilitas Kesehatan, Artikel Kesehatan, Jadwal Kegiatan Kesehatan, dan Grafik Penyakit. Contoh: ketik "apbdes" atau "ajukan surat".
- Untuk kata kunci umum seperti "kesehatan" atau "desa", bagian "Halaman" menampilkan 5 halaman teratas dulu. Tekan "Tampilkan N halaman lainnya" untuk membuka semua halaman yang cocok tanpa meninggalkan kotak pencarian; tidak ada halaman yang terpotong.

## [0.1.220] - 2026-11-06
### Fixed
- **Hasil pencarian kini membuka halaman yang benar.** Sebelumnya sebagian besar hasil pencarian di website publik (misalnya galeri foto, pasar desa, program kesehatan, pelayanan, dan banyak modul lain) malah membawa pengunjung kembali ke beranda.
- Hasil pencarian Visi Misi PPID, Profil PPID, Galeri Foto/Video, dan Potensi Desa tidak lagi membuka halaman kosong.
- Hasil pencarian produk pasar desa kini membuka halaman detail produk UMKM.
- Hasil pencarian Indeks Kepuasan Masyarakat, kategori berita, Pelayanan Penduduk Non Permanen, serta Dokter dan Tenaga Medis kini membuka halamannya masing-masing. Hasil media sosial langsung membuka akun media sosial desa.

## [0.1.219] - 2026-11-06
### Added
- **Dokumen Perencanaan** (RPJM Desa, RKP Desa, Berita Acara Musyawarah): admin mengelola dokumen (PDF, nomor Perdes, ringkasan, periode/tahun) lewat tab baru di admin Kegiatan Desa. Publik melihatnya di section baru pada halaman Monev & Pembangunan, dan ada tautan dari PPID > Daftar Informasi Publik. Kegiatan pembangunan kini berlabel "Bersumber dari RKP Desa {tahun}" dengan tautan ke dokumennya bila ada. Periode RPJM bebas (tahun mulai/selesai) sehingga 6 atau 8 tahun sama-sama bisa. Tabel baru `DokumenPerencanaan`.
- **Waktu & Biaya Pelayanan**: setiap layanan desa punya "Estimasi Waktu" dan "Biaya (Rp)" opsional; tampil sebagai badge di kartu dan halaman detail ("1 hari kerja • Gratis"). Biaya kosong = belum diisi, 0 = Gratis. Kolom baru di empat tabel pelayanan.
- **Agenda & Kalender Desa** (sebelumnya "Kalender Event Budaya", alamat halaman tidak berubah): agenda punya kategori (Budaya, Pemerintahan, Musyawarah, Kepemudaan, PKK & Perempuan, Pertanian & Peternakan, Lainnya), tanggal selesai opsional, filter tahun/bulan/kategori, penanda "Akan datang"/"Selesai", dan ringkasan jumlah acara per bulan.
- **Link Toko Online di produk UMKM**: satu produk bisa punya hingga 5 link (Shopee, Tokopedia, TikTok Shop, Blibli, Lazada, atau lainnya) yang tampil sebagai tombol di samping tombol WhatsApp. Hanya URL https yang diterima dan domainnya divalidasi sesuai platform. Tabel baru `LinkTokoOnline`.
- **Sektor Unggulan Desa**: nilai kini bisa disertai Satuan (mis. ton, kg, ha) dan Periode; grafik dan label mengikuti satuan.
- **Ajukan Ide Inovatif**: blok pengantar yang menjelaskan ide warga dapat dibawa ke Musyawarah Desa/Musrenbangdes, dengan tautan ke Agenda & Kalender dan Dokumen Perencanaan.
- **Kategori Kegiatan Desa** baru: "Kepemudaan" dan "PKK & Pemberdayaan Perempuan" (ditambahkan lewat migrasi sehingga ikut ke staging/produksi).

### Changed
- **Seed berita** diganti dengan 8 berita terbaru Desa Darmasaba (Okt–Nov 2026) lengkap dengan gambar di `public/assets/images/berita-terbaru/` dan tautan sumber di tiap berita. Seed hanya berpengaruh pada database yang di-seed ulang; staging/produksi perlu input lewat admin atau seed ulang.
- **Seed agenda** ditambah agenda 2026 dari riset publik (HUT Sekaa Teruna Putra Laksana, Musdes/Musrenbangdes/MMD) dan seluruh agenda lama diberi kategori Budaya.

### Notes untuk operator
- 5 migrasi baru (`20261106100100`–`20261106100500`), semuanya idempoten dan dapat dijalankan ulang; tidak ada data lama yang diubah.
- **Estimasi waktu/biaya layanan di seed adalah PERKIRAAN** ("1 hari kerja", Gratis) dan belum diverifikasi dengan Dokumen Standar Pelayanan (Kepbek 53/2022). Ganti lewat admin sebelum dianggap resmi.
- Data nyata yang masih harus diinput lewat admin: dokumen RPJM/RKP, satuan dan periode sektor unggulan, link toko online produk, serta tanggal agenda yang belum pasti (mis. Gerakan Kulkul PKK & Posyandu).

## [0.1.218] - 2026-11-06
### Changed
- **Jarak antar section di beranda kini seragam, sekitar 100px di layar lebar dan 72px di ponsel.** Sebelumnya jaraknya berbeda-beda: Kabar Desa ke APBDes terlalu jauh, sedangkan Prestasi ke Layanan dan Potensi Desa terlalu rapat. Judul "Desa Anti Korupsi" juga tidak lagi menempel ke tepi atas latar birunya.

## [0.1.217] - 2026-11-06
### Added
- **Section "Kabar Desa" di beranda**, tepat di bawah bagian pembuka. Berita terbaru tampil besar dengan foto, kategori, tanggal, dan ringkasan, diikuti tiga berita berikutnya dalam kartu foto. Di bawahnya ada tiga pengumuman terbaru. Klik kartu atau baris mana pun untuk membuka detailnya, atau pakai tautan "Lihat semua berita" di samping judul dan "Semua pengumuman" di panel pengumuman.
- Di ponsel, tiga kartu berita bisa digeser ke samping.

### Removed
- Panel melayang "Berita & Pengumuman" beserta tombol loncengnya. Panel ini tidak lagi terbuka sendiri dan menutupi bagian pembuka beranda. Isinya kini ada di section Kabar Desa.

## [0.1.216] - 2026-11-06
### Changed
- **Prestasi Desa dan Penghargaan Desa kini menjadi satu: "Prestasi dan Penghargaan Desa".** Di beranda, section ini dibuka dengan video penghargaan yang sama seperti sebelumnya, berisi judul, kalimat pengantar, dan tombol "Selengkapnya". Daftar kartu penghargaan di atas video diganti grid berisi **4 prestasi atau penghargaan terbaru** dengan foto besar dan judul di pojok kiri bawah. Klik di mana saja pada foto untuk membuka detailnya. Entri yang baru ditambahkan admin langsung muncul paling depan.
- Video kini hanya berputar saat terlihat di layar. Video bisa dijeda dan diputar lagi lewat tombol di pojok kanan bawah, dan tidak berputar otomatis bila pengguna mengaktifkan "kurangi gerakan".
- **Halaman "Prestasi dan Penghargaan Desa"** (`/darmasaba/prestasi-desa`) kini menampilkan prestasi dan penghargaan sekaligus dalam grid foto yang sama dengan beranda, lengkap dengan pencarian dan halaman bernomor. Alamat lama `/darmasaba/penghargaan` otomatis diarahkan ke halaman ini, dan halaman detail setiap prestasi atau penghargaan tetap bisa dibuka seperti biasa.
- Menu navbar "Penghargaan" berganti nama menjadi "Prestasi dan Penghargaan".
- Urutan section beranda: Prestasi dan Penghargaan kini tepat di bawah APBDes, dan Indeks Kepuasan Masyarakat pindah ke paling bawah.

### Fixed
- Hasil pencarian untuk penghargaan tidak lagi membuka halaman yang tidak ada (`/darmasaba/desa/penghargaan`).

## [0.1.215] - 2026-11-06
### Changed
- **Halaman "Lihat semua data APBDes" tampil baru**, senada dengan section APBDes di beranda: tombol tahun, tanggal "Data diperbarui", tiga kartu ringkasan, grafik pagu dan realisasi, lalu rincian anggaran per kategori yang langsung terbuka.
- Rincian di halaman ini menambah kolom **Lebih/(Kurang)**, yaitu sisa anggaran setiap pos (anggaran dikurangi realisasi).
- Dokumen APBDes (gambar dan tautan unduh) kini tampil satu panel untuk tahun yang dipilih. Panel ini hanya muncul bila admin sudah mengunggah dokumen untuk tahun itu. Grid kartu per tahun dan teks "jumlah" isian bebas tidak ditampilkan lagi.
- Di ponsel, rincian tersusun ke bawah tanpa tabel yang perlu digeser ke samping.

### Fixed
- **Total di halaman APBDes tidak lagi dihitung berlipat** pada rincian bertingkat. Baris "JUMLAH" lama yang mencampur pendapatan, belanja, dan pembiayaan juga dihapus; total setiap kategori kini tertulis di judul kategorinya.

## [0.1.214] - 2026-11-06
### Changed
- **Section APBDes di beranda tampil baru dan lebih ringkas.** Kini dibuka dengan tiga kartu ringkasan (Pendapatan, Belanja, Pembiayaan) berisi pagu dalam angka besar yang mudah dibaca (misalnya "Rp 23,14 M") beserta nilai lengkapnya, bilah realisasi, dan persennya. Di bawahnya ada grafik pagu dan realisasi, lalu rincian anggaran per kategori yang bisa dibuka-tutup. Tombol "Lihat semua data APBDes" pindah ke bagian bawah.
- Tahun APBDes kini dipilih lewat tombol tahun di tengah (sebelumnya kotak pilihan).
- Di bawah pilihan tahun kini tertulis tanggal terakhir data APBDes diperbarui, sehingga warga tahu seberapa baru angka yang ditampilkan.
- Setiap pos di rincian anggaran kini punya bilah progres realisasi beserta persen dan nominalnya, jadi kemajuan penggunaan anggaran per pos langsung terlihat.
- Ikon emoji diganti ikon garis yang seragam dengan bagian lain website.
- Bila realisasi suatu tahun belum diinput, kartu menulis "Belum ada realisasi" (sebelumnya semua tampil merah dengan peringatan "Realisasi rendah, perlu perhatian khusus").

### Fixed
- **Total APBDes tidak lagi dihitung berlipat** pada tahun yang rinciannya bertingkat (misalnya "4 Pendapatan Desa" → "4.1 Pendapatan Asli Desa" → "4.1.1 Hasil Usaha Desa"). Sebelumnya induk dan anaknya dijumlahkan bersama sehingga total 2025 tampil berlipat: pendapatan sekitar dua kali (Rp 3,35 M, seharusnya Rp 1,5 M) dan belanja tiga kali (Rp 4,5 M, seharusnya Rp 1,5 M).
- Di ponsel, tabel APBDes tidak lagi terpotong di sisi kanan dan nominal anggaran terbaca utuh.
- Warna legenda grafik kini sesuai dengan batangnya, dan satuan sumbu memakai Jt/M/T (sebelumnya "B").

## [0.1.213] - 2026-11-05
### Changed
- **Layar pembuka website baru: gerbang Candi Bentar.** Saat pertama kali membuka website, pengunjung kini disambut siluet Candi Bentar di tepi air pada malam menjelang fajar: logo dan tulisan "Pemerintah Desa Darmasaba" muncul di celah gerbang, lalu kamera seolah melangkah menembus celah — gerbang terbuka ke samping, cahaya fajar memenuhi layar, dan beranda tampil. Durasi sekitar 2,5 detik (sebelumnya layar logo diam selama 3 detik), dan bisa dilewati dengan klik/tap atau tombol Escape.
- Layar pembuka hanya tampil sekali per tab dan hanya bila beranda adalah halaman pertama yang dibuka; membuka halaman lain langsung (misalnya dari tautan berita) tidak memunculkannya. Pengguna yang mengaktifkan "kurangi animasi" di perangkatnya mendapat versi tanpa gerakan (hanya fade).
- Membuka alamat utama website (`/`) kini langsung diarahkan ke beranda tanpa menunggu.

## [0.1.212] - 2026-11-05
### Fixed
- **Desa - Profil**: peta di section "Letak & Batas Wilayah" tidak lagi meluber keluar kartu dan menimpa logo/judul "Lambang Desa"; tinggi peta kini menyesuaikan ukuran layar (300px ponsel, 380px tablet, 450px desktop).

## [0.1.211] - 2026-11-05
### Added
- **Pesanan produk UMKM kini bisa dibuat warga tanpa login** lewat endpoint publik baru. Setelah pesanan dibuat, muncul jendela konfirmasi "Pesanan Dibuat" dengan tautan WhatsApp yang diklik warga sendiri. Harga dihitung server dari data produk dan stok berkurang secara atomik.
- **Batas panjang "alasan keberatan"** pada Permohonan Keberatan Informasi Publik (PPID): maksimal 2000 karakter, dengan penghitung karakter dan tombol kirim yang nonaktif bila melebihi batas. Server juga menolak input yang terlalu panjang.
- **Galeri Foto**: klik kartu foto membuka jendela detail berisi foto utuh, deskripsi lengkap, dan tanggal.

### Fixed
- Warga yang belum login tidak bisa mengirim **Laporan Publik** (Keamanan) karena ditolak 401; kini bisa mengirim laporan.
- Pesanan **UMKM** di ponsel gagal dengan pesan error umum, dan di laptop muncul "nomor WhatsApp tidak terdaftar" padahal pesanan tersimpan; keduanya diperbaiki, termasuk format nomor kontak yang tidak seragam.
- **Beranda**: kotak input email di footer tidak lagi menutupi popup berita.
- **Galeri Foto**: ukuran foto kini seragam (rasio 4:3).
- **Desa - Layanan**: jarak judul dan deskripsi Pelayanan Telunjuk Sakti, tinggi kartu, dan jarak antar baris deskripsi pelayanan penduduk dirapikan.
- **Struktur PPID**: bagan dan panel kontrol kini terpusat di desktop maupun ponsel.

## [0.1.210] - 2026-11-05
### Changed
- **Footer di ponsel bergaya apple.com**: padding kiri-kanan footer di ponsel kini 16px (sebelumnya sekitar 80px sehingga teks sangat sempit). Grup link "Layanan Desa" dan "Tautan Penting" di ponsel tampil sebagai daftar lipat dengan panah — ketuk judul untuk membuka link-nya, dipisahkan garis tipis. Tampilan laptop/desktop tidak berubah.

## [0.1.209] - 2026-11-05
### Changed
- **Footer halaman publik bergaya apple.com**: tepi kiri-kanan footer kini sejajar dengan konten "Komitmen Layanan Kami" dan "Visi Kami" di atasnya (sebelumnya melebar hampir selebar layar). Card berbayang di sekitar bagian Komitmen Layanan sampai "Desa Kuat, Warga Sejahtera!" dihapus; bagian itu kini dipisahkan dari daftar link cukup dengan garis tipis. Jarak vertikal seluruh footer kini seragam dan lebih rapat: 32px antar blok (termasuk di atas dan di bawah setiap garis pemisah) dan 10px antar baris di dalam blok, logo slogan sedikit diperkecil. Kolom "Layanan Desa" dan "Tautan Penting" tampil di baris atas; "Tentang Darmasaba" (beserta ikon media sosial) dan "Berlangganan Info" pindah ke baris di bawahnya. Ada garis tipis di atas daftar link dan di atas copyright, dan copyright kini rata kiri.

## [0.1.208] - 2026-11-05
### Changed
- **Section Layanan dan Potensi Desa di beranda digabung** menjadi satu galeri bergaya apple.com berjudul "Layanan dan Potensi Desa": baris atas berisi layanan (kartu besar di tengah, kartu sebelahnya mengintip), baris bawah berisi potensi desa (kartu lebih kecil). Setiap 5 detik kedua baris bergeser satu kartu ke kiri dan berhenti dengan kartu aktif di tengah, berputar terus tanpa ujung. Kartu kini bersudut kotak, klik kartu membuka halaman detailnya.
- Di ponsel kartu tampil tegak (potret) dengan judul dan tombol di tengah bawah, dan baris bisa digeser dengan jari.
- Di laptop, galeri bisa digeser dengan dua jari di trackpad saat kursor berada di atas baris (satu gerakan = satu kartu), tanpa lagi memicu kembali ke halaman sebelumnya.
- Kedua baris selalu bergerak bersama: menggeser baris layanan atau potensi, maupun mengklik titik penanda, menggeser layanan dan potensi sekaligus.
- Penanda posisi berupa 5 titik dengan titik panjang selalu di tengah. Titik panjang berfungsi sebagai progress bar yang terisi hitam selama 5 detik sebelum galeri maju, lalu titik di sebelahnya bergeser ke tengah. Ada tombol jeda; gerak otomatis juga berhenti saat menavigasi kartu dengan keyboard, saat tab tidak aktif, atau bila perangkat mengaktifkan "kurangi animasi".
- Potensi desa di beranda kini menampilkan hingga 10 potensi (sebelumnya 4).

### Removed
- Paragraf penjelasan di bawah judul Layanan dan Potensi Desa, tombol "Detail" ke daftar layanan, dan tombol "Lihat Semua Potensi" di beranda (halaman daftarnya tetap bisa dibuka dari navbar).

## [0.1.207] - 2026-11-05
### Changed
- **Navbar desktop halaman publik bergaya apple.com**: saat cursor diarahkan ke menu, panel submenu kini mengembang halus dari bawah navbar, teks submenu muncul bertahap, dan konten halaman di belakangnya di-blur. Sebelumnya submenu muncul tiba-tiba tanpa animasi. Pindah antar menu langsung mengganti isi panel dengan tinggi yang menyesuaikan halus; panel tertutup saat cursor keluar dari navbar, tombol Escape, klik area blur, atau berpindah halaman. Pencarian memakai panel yang sama.
- Submenu kini berupa link biasa: bisa dibuka di tab baru dan dinavigasi dengan keyboard. Pengguna yang mengaktifkan "kurangi animasi" di perangkatnya mendapat versi tanpa gerakan (hanya fade).
- **Navbar mobile bergaya apple.com**: tombol menu membuka panel kaca yang mengembang halus dan mem-blur halaman di belakangnya. Panel awalnya hanya menampilkan menu utama; submenu dibuka per menu (geser masuk) dengan tombol "Kembali", jadi daftar tidak lagi panjang sekaligus. Halaman di belakang tidak ikut ter-scroll selama menu terbuka.

### Fixed
- Tombol "Kembali ke Admin" di navbar desktop kini muncul/hilang sesuai status login terkini (sebelumnya hanya dibaca sekali saat halaman dimuat).
- Efek hover menu navbar desktop yang sebelumnya tidak pernah aktif.
- Efek kaca buram (blur) yang hilang di Chrome sejak upgrade Next 16 kini kembali, termasuk pada kartu profil berlatar kaca.

## [0.1.206] - 2026-11-04
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

## [0.1.205] - 2026-11-04
### Changed
- **Library UI Mantine naik dari 8.3.18 ke 9.7.4** (tahap terakhir upgrade UI bertahap): seluruh paket Mantine (`core`, `hooks`, `dates`, `dropzone`, `tiptap`, `charts`) kini di 9.7.4. Tampilan halaman publik dan admin dipertahankan sama seperti sebelumnya: radius sudut default, warna varian `light`/`outline`, serta ketebalan teks tombol (600) dan label input/menu (500) tetap seperti di Mantine 8.
- **Upload file kini benar-benar membatasi ekstensi yang terdaftar.** Sebelumnya `image/*` di daftar format membuat semua jenis gambar lolos, padahal yang tercantum hanya 4 ekstensi. Sekarang:
  - gambar hanya `.jpg`, `.jpeg`, `.png`, dan `.webp`, sehingga `.gif`, `.heic`, `.svg`, dan `.avif` ditolak. Ini berlaku di hampir semua form upload gambar. Form Data UMKM, Produk UMKM, dan halaman `/admin/images` tidak berubah, karena dari awal memakai daftar format gambar bawaan Mantine yang memang menerima semua format di atas;
  - musik hanya `.mp3`, `.wav`, `.ogg`, dan `.m4a`, sehingga misalnya `.aac` dan `.flac` ditolak;
  - dokumen Desa Anti Korupsi hanya `.pdf`, `.doc`/`.docx`, `.xls`/`.xlsx`, dan `.ppt`/`.pptx`.

  File yang ditolak diperlakukan sama seperti file lain yang formatnya tidak didukung.
- **Paste file ke area upload**: menempelkan file (Ctrl/Cmd+V) ke area upload yang sedang fokus kini diterima seperti file yang diseret ke sana. Aturan format dan ukuran filenya sama.

### Fixed
- **Grid tidak lagi melebar keluar tepi container**: Mantine 9 memakai jarak antar kolom berbasis CSS `gap`, bukan margin negatif, sehingga scroll horizontal kecil yang kadang muncul di layar HP bisa hilang. Lebar dan jarak kolom tetap sama.

Tidak ada perubahan schema/database/API.

## [0.1.204] - 2026-11-04
### Changed
- **Framework naik dari Next.js 15.5.14 ke 16.4.5, React ke 19.3.1**: fungsi halaman publik maupun admin tidak berubah. QA mencatat sedikit perubahan tampilan, dan ini akan dipoles setelah seluruh tahap upgrade UI selesai. Build dan dev server sekarang memakai Turbopack (bawaan Next 16), dan `next dev` menulis output ke `.next/dev`. Jumlah halaman hasil build kini 394 (sebelumnya 395) karena Next 16 tidak lagi membuat halaman `_app`/`_document`/`_error` Pages Router untuk project yang hanya memakai App Router. Daftar halaman aplikasi tidak berubah.
- **Guard halaman admin pindah dari `src/middleware.ts` ke `src/proxy.ts`** (konvensi baru Next 16, selalu berjalan di runtime Node.js). Aturan aksesnya tidak berubah: `/admin`, `/validasi`, dan `/waiting-room` tetap mewajibkan login, dan akun non-admin tetap diarahkan ke `/profile`. Matcher-nya kini dikunci dengan unit test.
- **Browser minimum naik** mengikuti default Next 16: Safari/iOS 16.4, serta Chrome, Edge, dan Firefox 111. Browser yang lebih lama bisa tidak memuat situs dengan benar.
- **Image Docker dikunci ke `oven/bun:1.4.4-debian`** (sebelumnya tag floating `1-debian`). Saat ini keduanya menunjuk image yang sama persis (digest `sha256:93d5032f…`), jadi hasil build tidak berubah. Bedanya, rilis Bun baru tidak lagi ikut terpasang diam-diam.
- **`next dev` tidak lagi mengubah `AGENTS.md`**: fitur `agentRules` Next 16, yang otomatis menyisipkan blok ke file itu, dimatikan karena file tersebut di-track git.
- **ESLint tetap memakai `eslint-config-next` 15.5.12.** Versi 16 membutuhkan penulisan ulang config dan membawa aturan React Compiler yang bentrok dengan pola Valtio di sekitar 210 file. Upgrade lint dikerjakan sebagai task terpisah.

### Fixed
- **Akses dev server dari HP/perangkat lain di jaringan lokal**: `allowedDevOrigins` sebelumnya diisi URL lengkap (`http://192.168.1.82:3000`), padahal Next hanya mencocokkan hostname, sehingga entri itu tidak pernah berlaku. Sekarang ditulis `192.168.1.82`. `localhost` sudah diizinkan secara default.
- **Keamanan: 28 advisory Next.js tertutup** (3 critical, 12 high, 11 moderate, 2 low pada 15.5.14). Di antaranya RCE tanpa autentikasi di Image Optimization API untuk file SVG ([GHSA-2464-fhr4-w9xw](https://github.com/advisories/GHSA-2464-fhr4-w9xw)) dan AVIF ([GHSA-2xp9-vwfh-vxw4](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4)), RCE di server Windows ([GHSA-p293-qw3h-jr36](https://github.com/advisories/GHSA-p293-qw3h-jr36)), serta beberapa celah bypass middleware/proxy ([GHSA-492v-c6pp-mqqv](https://github.com/advisories/GHSA-492v-c6pp-mqqv), [GHSA-267c-6grr-h53f](https://github.com/advisories/GHSA-267c-6grr-h53f), [GHSA-26hh-7cqf-hhc6](https://github.com/advisories/GHSA-26hh-7cqf-hhc6)).
- **Keamanan: pengolah gambar `sharp` naik dari 0.34.5 ke 0.35.5** (libvips 8.17.3 → 8.18.7). Ini menutup 3 advisory high di libvips, libheif, dan librsvg ([GHSA-f88m-g3jw-g9cj](https://github.com/advisories/GHSA-f88m-g3jw-g9cj), [GHSA-rgj7-g3m4-5g8c](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c), [GHSA-wq5f-xc86-pv6w](https://github.com/advisories/GHSA-wq5f-xc86-pv6w)), dan sekaligus menjadi mitigasi yang direkomendasikan untuk GHSA-2464-fhr4-w9xw. `sharp` dipakai untuk `/api/img` dan upload gambar, termasuk upload pengaduan publik. Gambar yang dihasilkan identik byte-per-byte dengan sebelumnya, dan salinan ganda `sharp` di dalam Next ikut hilang.

Tidak ada perubahan schema/database/API.

## [0.1.203] - 2026-11-04
### Changed
- **Library UI Mantine naik dari 7.17 ke 8.3.18**: seluruh paket Mantine (`core`, `hooks`, `dates`, `dropzone`, `tiptap`, `charts`) kini di satu versi yang sama, 8.3.18. Sebelumnya versinya campur (core 7.17, sedangkan dates/dropzone sudah 8.x), sehingga ada ketidakcocokan peer dependency. Tampilan halaman publik dan admin tidak berubah. Prop `color` pada `Text` yang sudah deprecated diganti `c` (19 halaman admin) tanpa efek visual.
- **Editor teks (admin & form publik) pindah ke Tiptap 3**: semua editor rich text memakai Tiptap 3. Isi yang sudah tersimpan tetap sama persis, dan di halaman edit tombol Simpan/Batal tidak menganggap konten berubah sebelum benar-benar diketik. Satu perilaku baru dari Tiptap 3: menekan Backspace/Delete di awal atau akhir item list kini menggabungkan item atau mengangkatnya keluar dari list.

### Fixed
- **Keamanan editor teks**: lockfile sebelumnya menyimpan salinan lama `prosemirror-view` 1.41.8 yang rentan XSS saat menempel (paste) konten ([GHSA-c8x8-7fp4-3x9w](https://github.com/advisories/GHSA-c8x8-7fp4-3x9w)). Sekarang hanya ada satu salinan, 1.42.9, yang sudah diperbaiki. Salinan ganda paket inti editor (`prosemirror-model`/`-transform`/`-view`) juga dihapus.

### Removed
- **Paket yang tidak terpakai**: `@mantine/form`, `@mantine/modals`, `@mantine/carousel`, `embla-carousel`, `embla-carousel-autoplay`, `embla-carousel-react`, dan `@tiptap/extension-underline` (fitur underline sudah termasuk di StarterKit Tiptap 3).
- **10 komponen editor duplikat yang tidak pernah dipakai** di halaman mana pun.
- **Lockfile biner lama `bun.lockb`**: sudah basi sejak April 2026 dan tidak dipakai lagi. Satu-satunya lockfile sekarang `bun.lock`.

Tidak ada perubahan schema/database/API.

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
