# API data pribadi warga: GET admin-only (2026-11-17)

## Konteks

Pengecekan prod tanpa login (2026-11-17) menemukan GET publik yang mengirim data pribadi warga: NIK 16 digit dan nomor HP (Ibu Hamil, Balita, kiriman Pengaduan Masyarakat), serta nama, alamat, dan nomor telepon pemohon (kiriman Administrasi Online). Daftar siswa juga mengirim nama anak di bawah umur beserta sekolahnya. Ini melanggar UU PDP dan aspek 8 Lomba Website Desa (Perlindungan Data Pribadi, bobot 15%).

Guard global di `src/app/api/[[...slugs]]/route.ts` hanya menjaga tulis (POST/PUT/DELETE/PATCH) dan beberapa prefix GET (`ADMIN_ONLY_GET_PATHS`), dan hanya memastikan login, bukan role admin.

## Keputusan

- GET list & detail berikut wajib admin (role 0-4) lewat `guardDataPribadi` (`src/app/api/[[...slugs]]/_lib/_data-pribadi/guard.ts`, membungkus `guardAdmin` yang sudah ada): 401 tanpa sesi, 403 untuk akun nonaktif atau user biasa (role 5).
  - `/api/kesehatan/ibuhamil/find-many`, `/api/kesehatan/ibuhamil/:id`
  - `/api/kesehatan/balita/find-many`, `/api/kesehatan/balita/:id`
  - `/api/inovasi/layananonlinedesa/pengaduanmasyarakat/find-many`, `.../pengaduanmasyarakat/:id`
  - `/api/inovasi/layananonlinedesa/administrasionline/find-many`, `.../administrasionline/:id`
  - `/api/pendidikan/infosekolahpaud/siswa/find-many`, `.../siswa/:id`
  - `/api/pendidikan/beasiswa/beasiswapendaftar/findMany`, `.../beasiswapendaftar/:id` (NIK, HP, alamat, data orang tua; prod 2026-11-17: 44 pendaftar)
  - `/api/pendidikan/perpustakaandigital/peminjamanbuku/findMany`, `.../peminjamanbuku/:id` (nama, telepon, alamat peminjam)
  - `/api/ppid/permohonaninformasipublik/find-many`, `.../:id` (nama, NIK, telepon, alamat, email pemohon)
  - `/api/ppid/permohonankeberataninformasipublik/find-many`, `.../:id` (nama, email, telepon)
  - `/api/landingpage/responden/findMany`, `.../:id` (nama responden IKM)
  - `/api/inovasi/ajukanideinovatif/find-many`, `.../:id` (nama & alamat pengaju)
  - `/api/kesehatan/pendaftaran-jadwal-kegiatan/find-many`, `.../:id` (nama anak & orang tua, nomor, alamat)
- Guard dipasang **per rute** (`{ beforeHandle: guardDataPribadi }`), bukan prefix di `ADMIN_ONLY_GET_PATHS`. Prefix akan ikut menutup master data publik di bawah path yang sama (`.../pengaduanmasyarakat/jenispengaduan/*`, `.../administrasionline/jenislayanan/*`) yang dipakai form warga. Guard global juga tidak memeriksa role, sehingga user Google biasa tetap bisa membaca. Hook rute tidak mengubah tipe respons Eden, jadi konsumen admin tidak berubah.
- `POST .../create` publik (pengaduan, administrasi online, peminjaman buku, permohonan & keberatan PPID, responden IKM, ide inovatif, pendaftaran jadwal kegiatan) dan `.../beasiswapendaftar/create` membalas `data: { id }` saja, tidak lagi menggemakan isi form (NIK/HP/alamat/nama). Konsumennya (form publik) hanya memeriksa status. `create()`/`submit()` di state tidak lagi memanggil `findMany.load()` setelah sukses, dan halaman publik pendaftaran jadwal kegiatan tidak lagi memuat daftar saat mount, karena pemanggilnya warga dan daftar itu kini admin-only.
  - `beasiswapendaftar/create` sengaja **tidak** dimasukkan ke `PUBLIC_POST_PATHS` di hotfix ini: perilakunya (butuh login) tidak diubah. Temuan 401 untuk warga anonim tetap di `docs/BACKEND-TODO.md` ("form daftar beasiswa kemungkinan 401"), karena membukanya butuh rate limit + validasi NIK server lebih dulu.
- Pencarian global publik (`_lib/search/findMany.ts`) tidak memuat tipe data per orang warga: `siswa`, `responden` (IKM), `permohonaninformasipublik` (dulu bisa dicari lewat NIK), `permohonaninformasikeberatanpublik`. Tipe itu dibuang dari cabang `type=` maupun pencarian semua modul; model yang GET-nya admin-only di atas tidak pernah terindeks. Nama pejabat, tenaga medis, pengajar, dan pegawai BUMDes tetap terindeks (peran publik). Test: `__tests__/api/search_tanpa_data_pribadi.test.ts`.

## Sengaja tetap publik

- Master data: jenis pengaduan, jenis layanan (opsi form warga).
- Agregat: `/api/kesehatan/ringkasankesehatan/stats` (halaman Posyandu), `/api/pendidikan/ringkasan/stats` (Info Sekolah). Hanya hitungan, tanpa data per orang.
- IKM: `GET /api/landingpage/responden/ringkasan` (baru) untuk grafik beranda & `/ppid/indeks-kepuasan-masyarakat`. Hanya `tanggal`, `createdAt`, dan nama jenis kelamin/rating/kelompok umur, tanpa id & nama responden, maks 1000 baris + `total`. Dipilih ketimbang agregasi penuh di server supaya logika grafik klien (`kepuasan.logic.ts`) tidak berubah; tanpa nama/id baris tidak bisa ditautkan ke orang. Opsi form PPID (`.../permohonaninformasipublik/{jenisInformasi,memperolehInformasi,salinanInformasi}/find-many`) dan master IKM (jenis kelamin, rating, umur) tetap publik.
- Beasiswa: `/api/pendidikan/beasiswa/ringkasan/stats` (hanya jumlah + dana + tahun ajaran) dan `keunggulanprogram/*`; perpustakaan: katalog `dataperpustakaan/*` & `kategoribuku/*`. Halaman publik beasiswa & perpustakaan tidak menampilkan data per pendaftar/peminjam.
- Pengajar (`/api/pendidikan/infosekolahpaud/pengajar/*`): hanya nama + lembaga, tanpa NIK/kontak, dan dipakai direktori pengajar publik Info Sekolah. Nama tenaga pendidik dalam peran profesinya dinilai wajar dipublikasikan; tinjau ulang bila skema menambah field kontak/identitas.

## Belum dicakup (tetap di `docs/BACKEND-TODO.md`)

- Role 5 masih bisa PUT/DELETE karena guard global hanya cek login (T19).

Test: `__tests__/api/data_pribadi_admin_only.test.ts`, `__tests__/api/search_tanpa_data_pribadi.test.ts`.
