# Plan Testing — Admin CMS CRUD (Desa Darmasaba)

**Target:** `/admin/*` (staging: `desa-darmasaba-stg.wibudev.com/admin`)
**Tanggal pengujian:** _______________
**Tested by:** _______________
**Login test:** akun role apa yang dipakai → _______________ (isi role: super admin / admin / operator, dll)

---

## 0. Cara Pakai Dokumen Ini

Admin punya **~70 modul CRUD** yang polanya seragam (lihat `docs/DESIGN.md` §9–10). Daripada tulis
checklist detail 70x, dokumen ini punya:

1. **Template CRUD generik** (section 1) — checklist yang dijalankan **per modul**.
2. **Daftar modul** (section 2) — dikelompokkan per domain, dicentang setelah template di atas dijalankan
   untuk modul tsb. Kolom "Catatan" isi kalau ada perilaku khusus (relasi wajib, upload gambar, rich text,
   dsb) atau bug yang ditemukan.
3. **Cross-cutting** (section 3 dst) — hal yang bukan per-modul: auth admin, role & permission, upload,
   dark mode, responsive.

Tips: uji dulu 1 modul per domain secara menyeluruh pakai template, baru sisanya cukup smoke-test
(Create 1 data → cek muncul di List → Edit → Detail → Hapus) kecuali modul itu punya relasi/upload/rich
text yang beda dari modul lain di domain yang sama.

---

## 1. Template CRUD Generik (jalankan per modul)

### Create
- [ ] Form muncul sesuai pola (`docs/DESIGN.md` §10), field sesuai domain
- [ ] Validasi required field — submit kosong menampilkan error, tidak nge-hit API
- [ ] Validasi format (email, nomor telepon, angka, tanggal) sesuai field yang ada
- [ ] Upload gambar (jika ada): preview muncul, bisa dihapus (tombol X), reject file >5MB, reject non-image
- [ ] Rich text editor (jika ada, lihat `docs/DESIGN.md` §17): format Bold/Italic/List/Link tersimpan
      dengan benar setelah reload
- [ ] Select/dropdown relasi (jika ada, mis. kategori) — data ke-load dan bisa dipilih
- [ ] Tombol "Simpan" disabled saat form invalid / saat `isSubmitting`
- [ ] Loading state (`Loader` di button) muncul saat submit
- [ ] `toast.success(...)` muncul setelah sukses, lalu redirect ke list/detail
- [ ] `toast.error(...)` muncul kalau API gagal (test dengan network throttling/offline)
- [ ] Data yang baru dibuat benar-benar muncul di List (bukan cuma toast sukses tapi data hilang)
- [ ] Tombol "Reset" mengosongkan form dengan benar

### Read / List
- [ ] Data ter-load dan tampil sesuai jumlah asli di DB (cek lewat Prisma Studio kalau perlu)
- [ ] Search/filter (kalau ada `HeaderSearch`) — hasil sesuai keyword, termasuk keyword tanpa hasil
- [ ] Pagination — pindah halaman benar, jumlah item per halaman konsisten, halaman terakhir tidak error
- [ ] Empty state tampil wajar saat data kosong (bukan crash/blank)
- [ ] Tabel desktop (`visibleFrom="md"`) dan kartu mobile (`hiddenFrom="md"`) sama-sama menampilkan data
      yang benar
- [ ] Sorting (jika ada) berfungsi
- [ ] Tab (jika modul punya tab, lihat `docs/DESIGN.md` §11) — tiap tab load data yang benar & URL
      berubah sesuai tab aktif

### Detail
- [ ] Semua field tampil dengan benar (bandingkan dengan data yang diinput saat Create)
- [ ] Gambar/file yang diupload tampil benar (bukan broken image)
- [ ] Tombol "Edit" mengarah ke halaman edit yang benar
- [ ] Tombol "Hapus" memunculkan `ModalKonfirmasiHapus`

### Update
- [ ] Data lama ter-load dengan benar saat halaman edit dibuka (termasuk gambar preview & rich text)
- [ ] Tombol "Batal" mengembalikan ke `originalData` (bukan `Reset` kosong)
- [ ] Setelah simpan, perubahan benar-benar tersimpan (reload halaman detail untuk verifikasi, bukan
      cuma percaya toast)
- [ ] Ganti gambar — gambar lama ke-replace, tidak numpuk/orphan file di storage
- [ ] `toast.success('... berhasil diperbarui!')` muncul

### Delete
- [ ] Modal konfirmasi muncul sebelum hapus (tidak langsung hapus on-click)
- [ ] Tombol "Batal" di modal membatalkan tanpa efek
- [ ] Setelah hapus, data hilang dari List tanpa perlu refresh manual
- [ ] Soft delete (`deletedAt`) — cek di Prisma Studio apakah row benar hilang secara soft delete, bukan
      hard delete (sesuai `docs/DATABASE.md`), dan data tidak lagi muncul di public site
- [ ] Hapus data yang sedang dipakai relasi lain (mis. kategori yang masih punya item) — pastikan tidak
      menyebabkan orphan data atau crash di sisi lain

---

## 2. Daftar Modul per Domain

> Centang kolom **Full** kalau semua item template section 1 sudah dites. Centang **Smoke** kalau cuma
> Create→List→Edit→Delete cepat. Isi **Catatan** untuk relasi/upload/rich-text/bug.

### Desa
| Modul | Full | Smoke | Catatan |
|---|---|---|---|
| Profil Desa (profil-desa, profil-perbekel, profil-perbekel-dari-masa-ke-masa) | [ ] | [ ] | |
| Banjar | [ ] | [ ] | |
| Berita (list-berita + kategori-berita) | [ ] | [ ] | cek relasi kategori |
| Event Budaya | [ ] | [ ] | cek juga tampil di Kalender Event Budaya publik |
| Gallery (foto & video) | [ ] | [ ] | upload video, cek ukuran file |
| Kegiatan Desa (list + kategori) | [ ] | [ ] | cek relasi kategori |
| Layanan (ajukan permohonan, non-permanent, perizinan berusaha, surat keterangan, telunjuk sakti) | [ ] | [ ] | banyak sub-form, cek masing2 |
| Penghargaan | [ ] | [ ] | |
| Pengumuman (list + kategori) | [ ] | [ ] | cek relasi kategori |
| Potensi (list + kategori) | [ ] | [ ] | cek relasi kategori |

### Ekonomi
| Modul | Full | Smoke | Catatan |
|---|---|---|---|
| Demografi Pekerjaan | [ ] | [ ] | |
| Jumlah Penduduk Miskin | [ ] | [ ] | |
| Jumlah Pengangguran (+ berdasarkan pendidikan/usia) | [ ] | [ ] | sub-tab |
| Kesejahteraan Masyarakat | [ ] | [ ] | |
| Lowongan Kerja Lokal | [ ] | [ ] | |
| PADesa (apbdesa, belanja, pembiayaan, pendapatan) | [ ] | [ ] | cek grafik publik ikut update |
| Program Kemiskinan | [ ] | [ ] | |
| Sektor Unggulan Desa | [ ] | [ ] | |
| Struktur Organisasi & SK BUMDes (pegawai, posisi, struktur) | [ ] | [ ] | relasi pegawai↔posisi |
| UMKM (data-umkm, kategori-produk, produk, penjualan, dashboard) | [ ] | [ ] | modul paling kompleks, cek dashboard angka sinkron |

### Kesehatan
| Modul | Full | Smoke | Catatan |
|---|---|---|---|
| Data Kesehatan Warga: artikel, fasilitas (+ dokter, tarif), jadwal kegiatan, penderita penyakit, kelahiran/kematian, peserta jadwal | [ ] | [ ] | banyak sub-modul relasi |
| Info Wabah Penyakit | [ ] | [ ] | |
| Kontak Darurat | [ ] | [ ] | |
| Penanganan Darurat | [ ] | [ ] | |
| Posyandu (balita, ibu hamil, list-posyandu, ringkasan) | [ ] | [ ] | cek ringkasan auto-hitung dari balita/ibu hamil |
| Program Kesehatan | [ ] | [ ] | |
| Puskesmas | [ ] | [ ] | |

### Keamanan
| Modul | Full | Smoke | Catatan |
|---|---|---|---|
| CCTV | [ ] | [ ] | |
| Kontak Darurat (item + keamanan) | [ ] | [ ] | |
| Keamanan Lingkungan (Pecalang/Patwal) | [ ] | [ ] | |
| Laporan Publik | [ ] | [ ] | cek status laporan (pending/proses/selesai) jika ada |
| Pencegahan Kriminalitas | [ ] | [ ] | |
| Polsek Terdekat (daftar + layanan) | [ ] | [ ] | |
| Tips Keamanan | [ ] | [ ] | |

### Lingkungan
| Modul | Full | Smoke | Catatan |
|---|---|---|---|
| Data Lingkungan Desa | [ ] | [ ] | |
| Edukasi Lingkungan (kegiatan, materi, tujuan) | [ ] | [ ] | halaman edit-only (single record?), cek |
| Gotong Royong (kategori + kegiatan) | [ ] | [ ] | |
| Konservasi Adat Bali (bentuk, filosofi, nilai) | [ ] | [ ] | edit-only |
| Pengelolaan Sampah/Bank Sampah (keterangan + list) | [ ] | [ ] | |
| Program Penghijauan | [ ] | [ ] | |

### Kependudukan
| Modul | Full | Smoke | Catatan |
|---|---|---|---|
| Data Banjar | [ ] | [ ] | |
| Distribusi Agama | [ ] | [ ] | cek chart publik ikut update |
| Distribusi Umur | [ ] | [ ] | cek chart publik ikut update |
| Migrasi Penduduk | [ ] | [ ] | |

### Pendidikan
| Modul | Full | Smoke | Catatan |
|---|---|---|---|
| Beasiswa Desa (config + pendaftar + keunggulan) | [ ] | [ ] | cek approve/reject pendaftar jika ada |
| Bimbingan Belajar Desa (fasilitas, lokasi-jadwal, tujuan) | [ ] | [ ] | edit-only |
| Data Pendidikan | [ ] | [ ] | |
| Info Sekolah (jenjang, lembaga, pengajar, siswa) | [ ] | [ ] | relasi lembaga↔pengajar↔siswa |
| Pendidikan Non Formal (jenis program, tempat, tujuan) | [ ] | [ ] | edit-only |
| Perpustakaan Digital (data, kategori buku, peminjam) | [ ] | [ ] | cek status pinjam/kembali |
| Program Pendidikan Anak (unggulan, tujuan) | [ ] | [ ] | edit-only |

### Inovasi
| Modul | Full | Smoke | Catatan |
|---|---|---|---|
| Ajukan Ide Inovatif | [ ] | [ ] | |
| Desa Digital / Smart Village | [ ] | [ ] | |
| Info Teknologi Tepat Guna | [ ] | [ ] | |
| Kolaborasi Inovasi (list + mitra) | [ ] | [ ] | |
| Layanan Online Desa (administrasi, jenis layanan, jenis pengaduan, pengaduan masyarakat) | [ ] | [ ] | cek status pengaduan |
| Program Kreatif Desa | [ ] | [ ] | |

### PPID
| Modul | Full | Smoke | Catatan |
|---|---|---|---|
| Daftar Informasi Publik | [ ] | [ ] | |
| Dasar Hukum | [ ] | [ ] | edit-only |
| Indeks Kepuasan Masyarakat (grafik + responden) | [ ] | [ ] | shared dgn landing-page? cek dobel data |
| Permohonan Informasi Publik | [ ] | [ ] | cek status permohonan |
| Permohonan Keberatan Informasi Publik | [ ] | [ ] | cek status |
| Profil PPID | [ ] | [ ] | |
| Struktur PPID (pegawai, posisi, struktur organisasi) | [ ] | [ ] | |
| Visi Misi PPID (+ misi/visi sub) | [ ] | [ ] | edit-only |

### Landing Page
| Modul | Full | Smoke | Catatan |
|---|---|---|---|
| APBDes | [ ] | [ ] | cek grafik landing page ikut update |
| Desa Anti Korupsi (kategori + list) | [ ] | [ ] | |
| Indeks Kepuasan Masyarakat (grafik + responden) | [ ] | [ ] | bandingkan dgn versi di PPID — apakah data sama/terpisah |
| Prestasi Desa (kategori + list) | [ ] | [ ] | |
| Profil (media sosial, pejabat desa, program inovasi) | [ ] | [ ] | |
| SDGs | [ ] | [ ] | cek fallback gambar SDGS (baru saja di-fix, lihat commit `ed7a6a3b`) |

### Musik
| Modul | Full | Smoke | Catatan |
|---|---|---|---|
| Musik (list, create, edit) | [ ] | [ ] | cek upload audio/file musik |

### User & Role
| Modul | Full | Smoke | Catatan |
|---|---|---|---|
| User | [ ] | [ ] | cek create user baru → bisa login |
| Role | [ ] | [ ] | cek assign permission |
| Menu Access | [ ] | [ ] | cek efeknya ke sidebar user dengan role tsb |

---

## 3. Auth Admin
- [ ] Login admin (`auth/login-admin`) — kredensial salah menampilkan error yang jelas
- [ ] Registrasi admin (`auth/registrasi-admin`) — validasi input, cek approval flow (kalau ada)
- [ ] Validasi admin (`auth/validasi-admin`) — flow OTP/validasi email sesuai `docs/DATABASE.md` §Auth
- [ ] Session persist setelah refresh halaman admin
- [ ] Logout menghapus session (`UserSession`) dan redirect ke login
- [ ] Akses halaman admin tanpa login → redirect ke login (cek `src/proxy.ts`)
- [ ] Token/session expired → redirect ke login, bukan error blank/500

## 4. Role-Based Access Control
- [ ] Login dengan minimal 2 role berbeda (mis. super admin vs operator) — sidebar menu berbeda sesuai
      `menuIds`/role (`docs/DESIGN.md` §7 — `role1`, `role2`, `role3`)
- [ ] Akses langsung via URL ke modul yang **tidak** ada di menu role tsb — harus diblok (403/redirect),
      bukan cuma disembunyikan dari sidebar
- [ ] Perubahan di "Menu Access" untuk suatu role langsung berefek ke user dengan role tsb (perlu re-login
      atau langsung update session — cek yang mana)

## 5. Upload & File Storage (cross-modul)
- [ ] Upload gambar tersimpan dan bisa diakses via MinIO (satu-satunya storage backend, lihat
      `docs/DATABASE.md`)
- [ ] Hapus data dengan gambar — cek apakah file storage-nya ikut terhapus atau orphan (informasi ini
      penting untuk housekeeping storage, tanyakan ke user kalau perilaku saat ini tidak jelas)
- [ ] Reupload/replace gambar di form Edit tidak menyebabkan broken image sementara
- [ ] File besar mendekati limit (~5MB) — cek pesan error yang muncul jelas, bukan crash

## 6. Dark Mode (Admin)
- [ ] Toggle dark mode berfungsi di semua halaman CRUD (list, create, edit, detail)
- [ ] Tabel, form, modal, toast — semua komponen readable di dark mode (kontras cukup)
- [ ] Preferensi dark mode persist setelah reload/logout-login

## 7. Responsive Admin
- [ ] Sidebar admin: burger menu mobile berfungsi, AppShell navbar desktop fixed
- [ ] Tabel list — beralih ke card mobile dengan benar di breakpoint `md`
- [ ] Form create/edit — layout `w="50%"` desktop vs `w="100%"` mobile
- [ ] Modal konfirmasi hapus tetap usable di mobile (tidak overflow)

## 8. Error Handling & Edge Cases
- [ ] Submit form dengan koneksi mati — toast error muncul, tidak stuck loading selamanya
- [ ] Double-submit (klik "Simpan" 2x cepat) — tidak membuat data duplikat
- [ ] Input karakter khusus (`<script>`, emoji, teks sangat panjang) — tidak crash, ter-escape dengan benar
      saat ditampilkan di publik (cek XSS di rich text editor terutama)
- [ ] Buka halaman edit/detail dengan `id` yang tidak ada — 404 yang wajar, bukan crash
- [ ] Hapus record yang jadi induk relasi (kategori dengan child item) tanpa menyebabkan child jadi orphan
      atau publik site error

## 9. Sinkronisasi Admin ↔ Publik
- [ ] Setelah Create/Update/Delete di admin, cek halaman publik terkait (`/darmasaba/*`) langsung
      merefleksikan perubahan (tanpa cache basi — cek header cache di `next.config.ts`)
- [ ] Data yang di-soft-delete di admin benar-benar hilang dari halaman publik

---

## Bug Report Template

Salin blok ini tiap kali nemu bug saat testing:

```
### [Modul] — [Create/Read/Update/Delete/lainnya]
- **Langkah reproduksi:**
- **Expected:**
- **Actual:**
- **Screenshot/error log:**
- **Severity:** blocker / major / minor
```

---

**Catatan tambahan:**
_______________________________________________
_______________________________________________
_______________________________________________
