# Dashboard Kependudukan satu halaman

Tanggal: 2026-11-17 · Status: diterima (keputusan user)

## Konteks
Lima halaman publik Kependudukan (Dashboard, Data Per Banjar, Dinamika Penduduk, Distribusi Agama, Distribusi Umur) masing-masing berisi sedikit data. Halaman detail memuat `find-many` dengan limit bawaan state 10 tanpa saringan tahun (Data per Banjar kehilangan 2 banjar, Umur & Agama mencampur tahun). Dashboard lama memakai `/api/kependudukan/dashboard/summary` yang terkunci ke tahun kalender berjalan dan menampilkan "Kelahiran Tahun Ini" dari model Kesehatan, bertentangan dengan angka Dinamika di layar yang sama.

## Keputusan
- Satu halaman `/kependudukan/dashboard` dengan section `#banjar`, `#umur`, `#agama`, `#dinamika`.
- Tahun per section (tahun terbaru tiap dataset), tanpa pemilih tahun global: tahun antar-dataset tidak sejalan.
- Data dari 4 endpoint `find-many` publik (limit 100) di frontend; summary tidak dipakai lagi (tidak dihapus, milik backend/admin).
- Angka turunan hanya yang aman: jiwa/KK, pertumbuhan bersih, rasio ketergantungan bersyarat.
- Navbar tetap 5 butir ber-href lama (href submenu = kunci visibilitas menu); rute lama redirect 308 ke `#anchor`.
- Section Agama ikut visibilitas submenu "Distribusi Agama". Migrasi Penduduk tidak tampil publik.

## Akibat
- Menyembunyikan "Distribusi Agama" di admin menyembunyikan section + pil Agama. Rute lamanya tetap redirect (redirect server terjadi sebelum guard 404 client), jadi tautan lama mendarat di puncak dashboard, bukan 404. Menyembunyikan 3 submenu lain hanya menghapus butir navbar; section-nya tetap tampil.
- Ketidakcocokan total antar-dataset (isian admin) kini terlihat berdampingan; Umur & Agama memberi catatan kaki sumber.
- Mitigasi limit 100 + pilih tahun di klien bertahan sampai backend menyediakan daftar tahun tersedia (BACKEND-TODO P2).

## Revisi (2026-11-17, keputusan user)
- Navbar Kependudukan cukup **satu butir** "Dashboard Kependudukan"; submenu Data Per Banjar, Dinamika Penduduk, Distribusi Agama, Distribusi Umur dihapus dari `navbar-list-menu.ts`. Menggantikan butir "Navbar tetap 5 butir ber-href lama" di atas.
- Akibatnya URL lama bukan lagi kunci visibilitas: saklar "Distribusi Agama" hilang, section + pil Agama **selalu** tampil (`isAgamaHidden` dihapus). Menggantikan butir "Section Agama ikut visibilitas" dan butir pertama Akibat.
- Redirect 308 rute lama tetap (bookmark/mesin pencari). Sumber Jenna Kependudukan memakai `menuHref: /kependudukan/dashboard`.
