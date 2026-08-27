# QC Checklist — Landing Page &gt; Profil Desa

**Halaman:** `/admin/landing-page/profil/*` (Program Inovasi, Pejabat Desa, Media Sosial)

**Dibuat:** 27 Agustus 2026 · **Branch saat dibuat:** `tasks/fix-lineclamp-safari-batch/strip-html-before-lineclamp-33-pages/...`

**Device wajib dites:** 💻 Desktop (≥992px) · 🤖 Android Chrome · 🍎 iOS Safari

**Cara pakai:** centang `[x]` kalau sudah dicek &amp; hasilnya OK. Kalau nemu masalah → JANGAN dicentang, tulis catatan di bawah baris itu pakai format `qc-admin-mobile-26-08-26.md` (kode + prioritas + device + halaman + temuan + repro), lalu pindahkan ke sana biar semua bug tracking di satu tempat.

Legend prioritas kalau nemu masalah: 🔴 Critical · 🟠 High · 🔵 Medium · ⚪ Low

---

## 0. Struktur — baca dulu sebelum testing

3 tab di bawah `Profile Desa` **tidak seragam** pola CRUD-nya — jangan kaget:


| Tab             | List        | Detail             | Create      | Edit                             | Hapus         |
| --------------- | :-----------: | :------------------: | :-----------: | :--------------------------------: | :-------------: |
| Program Inovasi | ✅           | ✅ `/[id]`          | ✅ `/create` | ✅ `/[id]/edit`                   | ✅ (di Detail) |
| Media Sosial    | ✅           | ✅ `/[id]`          | ✅ `/create` | ✅ `/[id]/edit`                   | ✅ (di Detail) |
| Pejabat Desa    | ❌ singleton | ❌ digabung ke Edit | ❌           | ✅ `/[id]` *(bukan `/[id]/edit`)* | ❌             |


Pejabat Desa cuma 1 data (Perbekel), jadi wajar tanpa List/Create/Hapus. Tapi rute editnya ada di `/[id]` langsung (bukan `/[id]/edit` seperti 2 tab lain) dan halamannya campur Preview+Edit jadi satu — cek apakah ini bikin bingung admin baru (item 3.0 di bawah).

---

## 1. Program Inovasi

### 1.1 List — `/admin/landing-page/profil/program-inovasi`

- [x] 💻 Tabel tampil rapi ≥992px, kolom Nama/Deskripsi/Link/Aksi tidak overflow horizontal
- [x] 🤖🍎 &lt;992px otomatis ganti ke card (bukan tabel di-scroll-in)
- [x] 🍎 **Deskripsi (rich text) di-clamp rapi 1 baris (desktop) / 2 baris (mobile), tidak overlap ke elemen bawah** — sudah pernah bug WebKit lineClamp, sudah di-fix commit `1126fc04`/`966c9e51`, tinggal reverifikasi di Safari asli (bukan cuma responsive mode Chrome). Kalau yang iphone masih berantakan
- [x] Search jalan dengan debounce (1 detik, cek di kode `useDebouncedValue(search, 1000)`), tidak fetch tiap huruf
- [x] Empty state "Belum ada data program inovasi" tampil kalau search tidak ada hasil
- [x] Pagination jalan, halaman ganti + scroll ke atas
- [x] 🤖🍎 Tombol "Tambah Program" &amp; "Detail" nyaman ditekan jari (touch target ≥44px)

### 1.2 Detail — `/admin/landing-page/profil/program-inovasi/[id]`

- [x] Gambar tampil proporsional, tidak pecah/stretch
- [x] Deskripsi HTML (DOMPurify + `dangerouslySetInnerHTML`) render sesuai formatting asli (bold/list/heading)
- [x] Link eksternal buka tab baru
- [x] 🤖🍎 Tombol Edit &amp; Hapus (icon-only) tidak ketumpuk/kekecilan di layar sempit
- [x] Modal konfirmasi hapus muncul, tombol "Yakin Hapus" ada loading state, tidak bisa double-klik

### 1.3 Create — `/admin/landing-page/profil/program-inovasi/create`

- [x] 🤖🍎 Dropzone bisa di-tap (buka file picker), bukan cuma drag desktop
- [x] 🤖🍎 Foto dari kamera HP (potret) tidak ke-rotate salah — sudah di-fix commit `a7f8efca` (EXIF auto-rotate), reverifikasi pakai foto asli dari HP
- [x] Preview gambar + tombol X hapus preview berfungsi
- [x] 🤖🍎 Toolbar rich text editor tidak ketutup keyboard virtual saat fokus ke body teks
- [x] Tombol Simpan disabled selama gambar belum dipilih (field wajib)
- [x] Tombol Simpan pakai Loader saat submit, tidak bisa double-submit

### 1.4 Edit — `/admin/landing-page/profil/program-inovasi/[id]/edit`

- [x] Data lama ke-load benar (nama, deskripsi, link, preview gambar)
- [x] Tombol "Batal" balikin form ke data original, bukan kosong
- [x] Ganti gambar baru → preview update; submit tidak re-upload kalau tidak ganti gambar

---

## 2. Media Sosial

### 2.1 List — `/admin/landing-page/profil/media-sosial`

- [x] 💻 Tabel rapi, thumbnail icon 50×50 tidak pecah
- [x] 🤖🍎 Card mobile, thumbnail 40×40 muncul
- [x] 🔴 **Wajib di-tap manual di HP:** teks Link/No. Telepon di card mobile dibungkus `<a href={item.link}>`, tapi field `link` **tidak ada** di model `MediaSosial` (schema cuma punya `iconUrl`). Kemungkinan `href` selalu kosong/`undefined` walau teksnya kelihatan normal. Desktop table tidak pakai anchor sama sekali → aman.
- [x] Icon default (Facebook/IG/dst) vs custom upload tampil beda tapi ukuran konsisten
- [x] Search &amp; pagination jalan sama seperti Program Inovasi

### 2.2 Detail / Create / Edit

- [x] 🤖🍎 Pemilihan icon (`SelectSosialMedia`) touch-friendly (dropdown gampang dibuka &amp; dipilih di layar sentuh)
- [x] Custom icon wajib upload — tombol Simpan disabled kalau belum ada file
- [x] Halaman Edit: icon default (bukan custom) tetap muncul preview-nya, tidak blank
- [ ] Detail: gambar/icon tampil proporsional

---

## 3. Pejabat Desa

### 3.0 Struktur (opini, bukan bug teknis)

- [x] Alur Preview → Edit langsung (tanpa Detail terpisah, tanpa Hapus) dites ke user/admin sungguhan: apakah membingungkan dibanding 2 tab lain yang punya List+Detail+Edit+Hapus lengkap?

### 3.1 Preview — `/admin/landing-page/profil/pejabat-desa`

- [x] Foto Perbekel tampil; fallback `/perbekel.png` muncul kalau gambar gagal load
- [x] 🔵 **Cek visual overlap badge nama:** ada elemen dengan `style={{ mt: -30, ... }}` — `mt` bukan CSS property valid (harusnya `marginTop`), jadi efek overlap badge-ke-foto yang dimaksud kemungkinan **tidak muncul sama sekali**. Bandingkan dengan pola serupa di `desa/profil/profil-perbekel` atau `ppid/profil-ppid` yang pakai class `.glass3` yang sama, lihat apakah memang seharusnya ada efek negative-margin.
- [x] 🤖🍎 Tombol "Edit" nyaman ditekan, tidak menempel ke tepi layar

### 3.2 Edit — `/admin/landing-page/profil/pejabat-desa/[id]`

- [x] Data lama ke-load (nama, posisi, foto)
- [x] ⚪ Ada 2 preview gambar sekaligus di halaman ini (preview inline di bawah Dropzone + box "Preview Gambar" 200×200 terpisah) — cek apakah ini disengaja (redundan) atau bisa disederhanakan
- [x] Validasi nama &amp; posisi (wajib diisi) jalan, tombol Simpan disabled kalau kosong
- [x] Setelah Simpan sukses, redirect balik ke halaman Preview dengan data ter-update

---

## 4. Navigasi Tab (`layoutTabs.tsx`)

- [x] 💻 Tab pills tidak kepotong di lebar layar standar
- [x] 🤖🍎 Tab bisa di-swipe horizontal dengan jari
- [x] Tab aktif ke-highlight sesuai halaman yang sedang dibuka (termasuk saat masuk langsung via URL, bukan cuma klik tab)
- [x] Pindah tab tidak ninggalin scroll position aneh (misal residual scroll dari tab sebelumnya)

---

## 5. Catatan Umum Lintas Halaman (3 tab di atas)

- [ ] 🌙 Dark mode admin: semua Paper/Text di 3 halaman ini kebaca jelas (jangan cuma dites di light mode)
- [ ] 📱 Layar terkecil: iPhone SE (375px) &amp; Android compact (360px) — pastikan tidak ada horizontal scroll di body
- [ ] Toast success/error (react-toastify) posisinya tidak ketutup keyboard virtual saat submit form mobile
- [x] Reload halaman di tengah Create/Edit tidak nyisain state form yang salah (mis. preview gambar dari sesi sebelumnya)

---

**Setelah checklist ini selesai:** kalau ada temuan (khususnya item 🔴/🟠 di atas yang sudah ditandai), pindahkan ke `qc-admin-mobile-26-08-26.md` bagian **A. Landing Page** biar semua bug tracking desa Darmasaba tetap di satu file.