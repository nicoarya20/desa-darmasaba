# Checklist Testing — Desa Darmasaba (Staging → Production)

**Target:** `desa-darmasaba-stg.wibudev.com/darmasaba` → domain production
**Tanggal pengujian:** _______________
**Tested by:** _______________

---

## 1. Navigasi & Struktur Halaman
- [ ] Menu "PPID" berfungsi dan mengarah ke halaman yang benar
- [ ] Menu "Desa" berfungsi
- [ ] Menu "Kesehatan" berfungsi
- [ ] Menu "Keamanan" berfungsi
- [ ] Menu "Ekonomi" berfungsi
- [ ] Menu "Inovasi" berfungsi
- [ ] Menu "Lingkungan" berfungsi
- [ ] Menu "Kependudukan" berfungsi
- [ ] Menu "Pendidikan" berfungsi
- [ ] Menu "Musik" berfungsi
- [ ] Tidak ada dead link / 404 di seluruh submenu
- [ ] Breadcrumb konsisten di tiap halaman (jika ada)
- [ ] Tombol "Detail" (section Layanan) berfungsi
- [ ] Tombol "Selengkapnya" (Desa Anti Korupsi) berfungsi
- [ ] Tombol "Lihat Semua Penghargaan" berfungsi
- [ ] Tombol "Lihat Semua Potensi" berfungsi
- [ ] Tombol "Jelajahi Semua Tujuan SDGs Desa" berfungsi
- [ ] Tombol "Lihat Semua Prestasi" berfungsi

## 2. Konten Dinamis / Empty States
- [ ] State kosong ("Belum ada penghargaan/layanan/potensi/prestasi") memang data kosong yang wajar, bukan bug fetch
- [ ] Tampilan saat data **ada** sudah dites (card, gambar, pagination) — bukan cuma state kosong
- [ ] Data SDGs Desa tampil benar saat sudah diisi

## 3. Form & Interaksi
- [ ] Form "Berlangganan Info" — validasi format email
- [ ] Form "Berlangganan Info" — pesan sukses & error tampil dengan benar
- [ ] Form "Berlangganan Info" — email benar-benar masuk ke database/mailing list
- [ ] Form pengaduan/kritik-saran — validasi input wajib
- [ ] Form pengaduan/kritik-saran — response server setelah submit benar

## 4. Media
- [ ] Video `award.mp4` loading dengan baik
- [ ] Fallback text video tampil di browser yang tidak support
- [ ] Ukuran file video tidak terlalu berat
- [ ] Semua gambar (logo, icon desa, og:image) load dengan benar, tidak broken
- [ ] Alt text tersedia di semua gambar

## 5. Autentikasi (Better Auth + Google OAuth)
- [ ] Login Google OAuth berjalan mulus di domain **production**
- [ ] Redirect URI sudah didaftarkan ulang di Google Cloud Console untuk domain production
- [ ] Session persist setelah login
- [ ] Logout berfungsi dengan benar

## 6. SEO & Meta Tag
- [ ] `og:image`, `og:url`, `twitter:card` sudah mengarah ke domain production (bukan `cld-dkr-staging-desa-darmasaba.wibudev.com`)
- [ ] Canonical URL sudah benar
- [ ] Meta robots sesuai kebutuhan (staging `noindex`, production `index, follow`)
- [ ] Sitemap disiapkan dan siap disubmit ke Google Search Console

## 7. Environment & Config
- [ ] Environment variable (API base URL, auth secret, database) mengarah ke instance production
- [ ] Link internal footer (Administrasi Kependudukan, Layanan Sosial, Pengaduan Masyarakat, Informasi Publik) tidak hardcode ke domain `-stg`
- [ ] Link "Tautan Penting" (Portal Badung, E-Government, Transparansi) mengarah ke domain production
- [ ] Konfigurasi PM2 production sudah benar (port, cluster mode, auto-restart)

## 8. Performa
- [ ] Lighthouse / PageSpeed Insights dijalankan, skor performance memadai
- [ ] Skor accessibility memadai
- [ ] Skor SEO memadai
- [ ] Waktu load halaman utama < 3 detik
- [ ] Sudah dites dengan throttle koneksi lambat (3G)

## 9. Responsif & Cross-browser
- [ ] Tampilan mobile sudah dites
- [ ] Tampilan tablet sudah dites
- [ ] Tampilan desktop sudah dites
- [ ] Chrome — tidak ada masalah layout
- [ ] Safari — retest bug grid/flexbox yang sebelumnya diperbaiki
- [ ] Firefox — tidak ada masalah layout
- [ ] Edge — tidak ada masalah layout

## 10. Keamanan
- [ ] HTTPS aktif dengan certificate valid di domain production
- [ ] Header keamanan (CSP, X-Frame-Options, dll) sudah dikonfigurasi
- [ ] Tidak ada API key/secret yang ter-expose di client-side bundle

## 11. Link Eksternal
- [ ] Link Facebook mengarah ke akun resmi dan aktif
- [ ] Link Instagram mengarah ke akun resmi dan aktif
- [ ] Link YouTube mengarah ke akun resmi dan aktif
- [ ] Link TikTok mengarah ke akun resmi dan aktif

## 12. Rollback Plan
- [ ] Plan rollback ke staging/versi sebelumnya sudah disiapkan
- [ ] Backup database production sebelum deploy sudah dibuat

---

**Catatan tambahan:**
_______________________________________________
_______________________________________________
_______________________________________________