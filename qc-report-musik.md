# QC Report — Menu Musik (STG)

- **Target:** https://desa-darmasaba-stg.wibudev.com/ (versi STG `0.1.202`)
- **Tanggal:** 2 November 2026
- **Scope:** menu **Musik** saja, termasuk player bar global (`FixedPlayerBar`) yang tampil di halaman lain (sesuai `MIND/PLAN/plan-qc-1-Nov.md`)
- **Tool:** `playwright-cli -s=qc-musik` (Chromium headless), `curl`, `ffprobe`. Mode baca saja: tidak ada form yang di-submit dan tidak ada data yang diubah
- **Ukuran layar:** 375x812 (HP), 768x1024 (tablet), 1440x900 (desktop)

## Menu Musik

### Halaman yang dites

| No | Halaman | URL |
|---|---|---|
| 1 | Index Musik | `/darmasaba/musik` |
| 2 | Musik Desa (daftar putar + player halaman) | `/darmasaba/musik/musik-desa` |
| 3 | Player bar global (FixedPlayerBar) di halaman lain | `/darmasaba`, `/darmasaba/desa/layanan` (setelah memutar lagu dari Musik Desa) |
| 4 | URL tidak ada (uji 404) | `/darmasaba/musik/halaman-tidak-ada-qc` |
| 5 | ID detail tidak valid | `/darmasaba/musik/musik-desa/id-tidak-ada` (menu Musik **tidak punya** halaman detail, jadi ini sekaligus uji 404) |
| 6 | API | `GET /api/desa/musik/find-many?page=1&limit=50` (+ `&search=`), file audio `/api/fileStorage/findUnique/*.mp3`, cover `/api/img/*` |

---

### Ringkasan

| Keparahan | Jumlah |
|---|---|
| Kritis | 0 |
| Tinggi | 5 |
| Sedang | 7 |
| Rendah | 10 |
| **Total** | **22** |

**Yang lolos:**
- **Durasi tampil = durasi audio asli** (dicek pakai `ffprobe`): Waktu Yang Salah 5:24 = 324 dtk, Menggapai langit 2:34 = 154,8 dtk, Bersama Darmasaba Bisa 4:06 = 246,7 dtk, Lagu Tes 4:06 = 246,7 dtk. Label durasi di player (`audio.duration`) juga cocok.
- Ke-4 file audio termuat: `206 Partial Content`, `audio/mpeg`, mendukung range request, jadi seek berjalan. Ke-7 cover mengembalikan `200` (lihat No. 6 untuk 3 cover yang ternyata fallback).
- Play/pause (kartu, player halaman, bar global), Next, Previous, Previous saat > 3 detik (lagu diulang dari 0), seek (klik 50% → `currentTime` 164 dtk dari 324), Repeat (di akhir lagu, lagu yang sama diulang), slider volume (mengubah `audio.volume`) semuanya berjalan.
- Badge "Memutar" dan border kartu aktif sesuai lagu yang sedang diputar.
- Pencarian lagu: jumlah hasil UI sama dengan `total` API untuk "fiersa" (1), "POP" (4, tidak case-sensitive), "gamelan" (2), "darmasaba" (4), "zzzqqq" (0, muncul pesan "Tidak ada musik yang ditemukan").
- Navigasi lewat navbar (`router.push`, mis. logo ke Beranda): musik tetap berputar dan bar global tetap tampil.
- Tidak ada scroll horizontal di level halaman pada 3 ukuran layar. Tidak ada console error/pageerror. Tidak ada teks `undefined` / `null` / `NaN` / `[object Object]` (dicek case-sensitive).
- Status 404 sudah benar untuk URL yang tidak ada dan ID tidak valid (bukan soft-404).
- HTTP diarahkan ke HTTPS (301). Tidak ada pola token/API key di HTML.
- Data API ↔ UI sama: 7 lagu (`total: 7`), judul, artis, dan durasi di kartu sama dengan API.

---

### Tabel Temuan

| No | Halaman/URL | Kategori | Ukuran layar/browser | Deskripsi | Langkah reproduksi | Hasil yang diharapkan | Keparahan | Bukti |
|---|---|---|---|---|---|---|---|---|
| 1 | Footer (semua halaman `/darmasaba/*`) | Fungsional / Player global | Semua / Chromium | Klik link footer (mis. "Administrasi Kependudukan" → `/darmasaba/desa/layanan`) memicu **full page reload**. Musik langsung berhenti, posisi hilang, dan bar global hilang. Marker `window` hilang setelah navigasi, jadi ini benar-benar reload, bukan navigasi client-side. Lewat navbar musik tetap jalan, jadi perilakunya tidak konsisten. Dugaan: `<Anchor href={item.link}>` tanpa `component={Link}` di `src/app/darmasaba/_com/Footer.tsx:181,190` (juga `:163`). | Putar lagu di Musik Desa → scroll ke footer → klik "Administrasi Kependudukan" | Navigasi client-side, musik tetap berputar dan bar tetap tampil | **Tinggi** | — (diukur via script: sebelum `paused:false t=2`, sesudah `src:"" paused:true`) |
| 2 | Bar global + toast (semua halaman) | Fungsional / UI | Semua (terukur di 1440) | Toast "Audio lagu ini belum tersedia." muncul di **bottom-center**, tepat di atas tombol Previous/Play/Next bar global (toast 560–880 px × 804–868 px; `elementFromPoint` di tombol Next = progress bar toast). Selama ±5 detik tombol tidak bisa diklik. Klik Next berulang tidak berpindah lagu. Karena 3 lagu tanpa audio berurutan di akhir daftar, pengguna terjebak menunggu toast hilang di setiap lagu. Dugaan: `ToastContainer position="bottom-center"` + `zIndex: 9999` (`src/app/layout.tsx:110-114`) dan bar `zIndex: 1`. | Putar lagu ke-1 → pilih "Darmasaba Swara" (tanpa audio) → langsung klik Next di bar bawah | Toast tidak menutupi kontrol (mis. `top-center`), dan Next bisa langsung diklik | **Tinggi** | `qc-screenshots/musik-toast-menutupi-kontrol.png` |
| 3 | `/musik/musik-desa` + bar global | Fungsional / Audio | Semua / Chromium | **Mute tidak tersinkron:** klik Mute → `audio.muted=true`. Lalu geser slider volume ke 80%: UI kembali menampilkan ikon volume normal, title "Mute", dan "85%", tetapi `audio.muted` **tetap true**, jadi lagu tetap tanpa suara. Pengguna tidak tahu kenapa tidak ada suara. Dugaan: `setVolume` hanya `setIsMuted(false)` tanpa `audio.muted = false` (`src/app/context/music/useAudioEngine.ts:217-224`). | Putar lagu → klik ikon speaker (Mute) → geser slider volume | Menggeser volume membatalkan mute dan suara kembali, atau UI tetap menampilkan status mute | **Tinggi** | — (state audio via script: `vol:0.85, muted:true`, tombol title "Mute") |
| 4 | `/musik/musik-desa` (player di halaman) | UI / Layout | HP 375 | Panel player di bawah daftar putar rusak: `Flex` 3 kolom tanpa wrap diperas ke 311 px. Kontrol (shuffle, prev, play, next, repeat) jadi bertumpuk vertikal, slider seek hanya **57 px**, teks "Tidak ada lagu" patah 3 baris, dan volume terpisah ke kanan. Dugaan: `src/app/darmasaba/(pages)/musik/musik-desa/page.tsx:224` (`<Flex align="center" justify="space-between">` tanpa layout responsif). | Buka halaman di 375px → scroll ke panel player di bawah Daftar Putar | Layout bertumpuk rapi (info lagu, kontrol horizontal, seek full width) | **Tinggi** | `qc-screenshots/musik-desa-hp-player-halaman.png` |
| 5 | `/musik/musik-desa` | Konten / Legal | Semua | Lagu komersial **"Waktu Yang Salah" – Fiersa Besari** (tag ID3: "Waktu Yang Salah (feat. Thantri Sundari)") di-stream penuh (5,5 MB, 5:24) di website resmi pemerintah desa. Berisiko pelanggaran hak cipta. "Menggapai langit – Scooby" juga perlu dicek lisensinya. | `ffprobe https://…/api/fileStorage/findUnique/XkFrQcVp2ihH8VgNy4NS8.mp3` | Hanya lagu milik/berlisensi desa (gamelan, lagu desa) yang dipublikasikan | **Tinggi** | `qc-screenshots/musik-desa-desktop.png` |
| 6 | `/musik/musik-desa` | Konten / Data / Gambar | Semua | 3 lagu seed ("Tri Hita Karana", "Mekar di Badung", "Darmasaba Swara", id `cmk-musik-00x`) **tidak punya file audio** (`audioFile: null`). Cover-nya juga file yang sama, yaitu gambar fallback "No image" 174×148 (PNG 1.624 B). Fallback ini disajikan dengan status **200** dan `content-type: image/jpeg` walau URL berakhiran `.webp`, sehingga tidak terdeteksi sebagai gambar rusak. Hampir separuh daftar putar tidak bisa diputar. | Buka halaman → lihat 3 kartu terakhir; `curl -I /api/img/Gc79mlIlGuoRQuTqskFj--mobile.webp` | Semua lagu aktif punya audio dan cover asli, atau lagu tanpa audio di-nonaktifkan | **Sedang** | `qc-screenshots/musik-desa-desktop.png`, `musik-desa-tablet-sedang-diputar.png` |
| 7 | `/musik/musik-desa` | Konten / Data dummy | Semua | Data tes tampil publik: **"Lagu Tes" – artis "Tes"**, cover kosong bergaris, tahun rilis null. File audionya identik dengan "Bersama Darmasaba Bisa" (ukuran sama 5.922.200 byte, durasi 246,69 dtk), jadi lagu yang sama tampil dua kali dengan judul berbeda. | Buka halaman → kartu ke-4 | Data tes dihapus/dinonaktifkan | **Sedang** | `qc-screenshots/musik-desa-desktop.png` |
| 8 | Bar global (semua halaman) | UI / Layout | HP 375 (juga 768 & 1440 untuk tombol scroll-to-top) | Di HP tinggi bar **139 px** dan kontrol pecah 2 baris (Shuffle/Prev/Play di atas, Next/Repeat di bawah). Spacer cuma 80 px (`FixedPlayerBar.tsx:299`), jadi saat scroll paling bawah teks "© 2025 Desa Darmasaba…" dan bagian berita tertutup bar. Tombol scroll-to-top kanan bawah juga tertutup bar di **semua** ukuran (375: top 744 vs bar 673; 1440: top 832 vs bar 831). Judul lagu terpotong jadi "Menggapai …". Dugaan: `Group gap="xs" flex={2}` tanpa `wrap="nowrap"` (`FixedPlayerBar.tsx:159`) dan spacer statis. | Putar lagu → buka Beranda di 375px → scroll ke paling bawah | Kontrol 1 baris di HP, spacer setinggi bar, scroll-to-top di atas bar | **Sedang** | `qc-screenshots/musik-bar-footer-375.png`, `musik-bar-footer-768.png`, `musik-bar-footer-1440.png` |
| 9 | `/musik/musik-desa` | UI / UX konsistensi | Semua | Ada **dua player sekaligus** di halaman (panel player halaman + bar global) dengan gaya ikon berbeda. Di panel halaman, ikon shuffle saat **off** adalah **X** (`IconX`, `page.tsx:251`), padahal ikon yang sama dipakai bar global untuk "tutup/minimize", jadi terlihat seperti tombol close. | Buka halaman → putar lagu → bandingkan dua kontrol | Satu player (atau panel halaman tanpa duplikasi), ikon shuffle off = shuffle redup | **Sedang** | `qc-screenshots/musik-toast-menutupi-kontrol.png`, `musik-desa-desktop-playing.png` |
| 10 | Bar global | Fungsional / UX | Semua | Tombol **X** ("Minimize player") hanya menyembunyikan bar. Musik **tetap berputar** (`paused:false`, waktu terus berjalan) dan tidak ada cara menghentikan/menutup player selain pause. Tombol musik melayang (kiri tengah layar, 74×42 px) tidak punya `aria-label`/title, dan di HP menutupi konten (judul "Sedang Diputar"/kartu). Dugaan: `FixedPlayerBar.tsx:72-117, 272-280`. | Putar lagu → klik X di bar → amati audio & tombol melayang | X = stop + tutup (atau ada tombol stop terpisah), tombol melayang berlabel dan tidak menutupi konten | **Sedang** | `qc-screenshots/musik-floating-minimized-hp.png`, `musik-desa-minimized.png` |
| 11 | `/darmasaba/musik`, `/musik/<apa-saja>`, `/musik/musik-desa/<id>` | State 404 / Navigasi | Semua | Status 404 benar, tetapi halaman 404 polos tanpa navbar, footer, dan tombol kembali, dengan teks **bahasa Inggris** "Not Found / This is the not found page" (`src/app/not-found.tsx`). Index `/darmasaba/musik` juga tidak ada (404), padahal menu "Musik" adalah grup menu. Komponen 404 bersifat global, jadi di luar scope menu Musik. | Buka `/darmasaba/musik` | Halaman 404 bermerek, berbahasa Indonesia, ada link ke Beranda/Musik Desa; atau `/darmasaba/musik` redirect ke `/musik/musik-desa` | **Sedang** | `qc-screenshots/musik-index-404.png` |
| 12 | `/musik/musik-desa` | Aksesibilitas | Semua | Kartu lagu adalah `div` dengan `onClick` tanpa `tabIndex`/role (`page.tsx:172-181`), jadi lagu **tidak bisa dipilih/diputar dengan keyboard**. Urutan Tab langsung melompat dari input pencarian ke viewport ScrollArea, lalu ke tombol player. 14 ActionIcon di panel player halaman tidak punya `aria-label`/title (12 tombol tanpa label di halaman). 8 cover (`Avatar`) tanpa `alt`. | Navigasi dengan Tab dari input "Cari lagu..." | Kartu fokusable (button/role="button" + Enter/Space), semua tombol ikon berlabel, cover punya alt | **Sedang** | — (tab order via script) |
| 13 | Bar global | UI | Tablet 768 / HP 375 | Bar `zIndex: 1` (`FixedPlayerBar.tsx:133-134`) lebih rendah dari elemen konten. Thumb slider dari panel player halaman (bulatan biru) **tembus tampil di atas** bar global. | Putar lagu di 768px → scroll sampai panel player halaman lewat di belakang bar | Bar selalu di atas konten (z-index lebih tinggi) | Rendah | `qc-screenshots/musik-desa-tablet-sedang-diputar.png` (titik di x≈645 & x≈338 dalam bar) |
| 14 | `/musik/musik-desa` | Format / Data | Semua | Format durasi tidak konsisten: "5:24", "2:34" vs "05:18", "03:45" (data seed). Penulisan genre juga tidak konsisten: "Pop" vs "pop", dan kapitalisasi judul "Menggapai langit". | Lihat kartu daftar putar | Satu format "m:ss", genre & judul Title Case | Rendah | `qc-screenshots/musik-desa-desktop.png` |
| 15 | `/musik/musik-desa` | UI / Layout | Tablet 768 & desktop 1440 | Badge "AUDIO BELUM TERSEDIA" memakan ruang sehingga judul terpotong parah ("Tri Hit…", "Mekar…", "Darmasaba Sw…") dan tinggi kartu tidak rata (nama artis pecah 3 baris). | Buka di 768/1440 → lihat kartu tanpa audio | Badge di baris sendiri/ikon kecil, judul terbaca, kartu rata | Rendah | `qc-screenshots/musik-desa-tablet-sedang-diputar.png`, `musik-toast-menutupi-kontrol.png` |
| 16 | `/musik/musik-desa` | UI / Layout | Semua | Daftar Putar (`ScrollArea.Autosize mah={400}`) punya overflow horizontal 8 px (scrollWidth 1182 vs 1174, efek margin negatif `Grid gutter`), jadi **scrollbar horizontal** abu-abu tampil di bawah kartu. Di HP ada scroll bertingkat: area 400 px di dalam halaman yang juga di-scroll, dan hanya ±3 kartu yang terlihat. Dugaan: `page.tsx:168-169`. | Buka halaman → lihat bawah grid Daftar Putar | Tanpa scrollbar horizontal; di HP daftar mengalir tanpa nested scroll | Rendah | `qc-screenshots/musik-desa-desktop.png`, `musik-desa-tablet-sedang-diputar.png` |
| 17 | `/musik/musik-desa` | Teks / Konten | Semua | Judul "**Selamat Datang Kembali**" memberi kesan pengguna sudah login, padahal ini halaman publik. Cover fallback tidak konsisten: gambar stok eksternal Unsplash (`page.tsx:185,227`, dependensi pihak ketiga) vs `/mp3-logo.png` (`page.tsx:127`) vs kosong (`FixedPlayerBar.tsx:142`). Saat belum ada lagu, panel player menampilkan foto DJ stok dengan teks "Tidak ada lagu". | Buka halaman tanpa memutar lagu | Judul netral, mis. "Musik Desa Darmasaba"; satu placeholder lokal yang konsisten | Rendah | `qc-screenshots/musik-desa-hp.png`, `musik-desa-hp-player-halaman.png` |
| 18 | `/musik/musik-desa` | Fungsional (dugaan dari kode) | Semua | Mode shuffle memakai `Math.floor(random() * length)` tanpa mengecualikan lagu saat ini (`src/app/context/music/musicNavigation.ts:10`), jadi Next bisa memutar ulang lagu yang sama. Previous saat shuffle juga kembali ke urutan list, bukan riwayat putar. | Aktifkan Shuffle → tekan Next berkali-kali | Next saat shuffle selalu memilih lagu lain | Rendah | — |
| 19 | `/musik/musik-desa` + semua halaman publik | Performa | Desktop / Chromium | Load halaman (networkidle) **~4,4 detik**; halaman 404 ~1,2–1,9 detik. `find-many?limit=50` dipanggil **2x** saat halaman dibuka (engine global + `useEffect` halaman, `page.tsx:38-40`), dan dipanggil di **setiap** halaman publik walau player tidak dipakai. Pemanggilan ulang di halaman juga memicu `isLoading=true`, sehingga seluruh halaman sempat berkedip "Memuat data musik..." walau data sudah ada. TTFB range request mp3 ±1,3–1,6 detik untuk 1 KB. | Buka halaman, ukur network | 1x fetch (pakai data context), < 3 detik | Rendah | — |
| 20 | `/musik/musik-desa` | Pencarian | Semua | Query berisi spasi saja ("  ") menampilkan "Tidak ada musik yang ditemukan" karena input tidak di-trim (`page.tsx:43-49`). Seharusnya semua lagu tetap tampil. | Ketik 2 spasi di "Cari lagu..." | Spasi diabaikan, daftar lengkap tampil | Rendah | — |
| 21 | `/musik/musik-desa` | State error (dugaan dari kode) | Semua | Jika API gagal, `loadMusikData` hanya `console.error` (`useAudioEngine.ts:63-65`) dan UI menampilkan "Tidak ada musik yang ditemukan", seolah-olah memang tidak ada data. Tidak ada pesan error atau tombol coba lagi. | (Tidak dites live, mode baca saja) simulasi API 500 | Pesan "Gagal memuat musik" + tombol coba lagi | Rendah | — |
| 22 | `/musik/musik-desa` | SEO | Semua | Judul tab "Desa Darmasaba" dan meta description sama dengan semua halaman lain. | Lihat `<title>` & meta | Mis. "Musik Desa – Desa Darmasaba" + deskripsi spesifik | Rendah | — |

---

### Tidak bisa dites & alasannya

| Item | Alasan |
|---|---|
| **WebKit/Safari** | Playwright WebKit diketahui crash (**Bus error**) di mesin ini, jadi tidak dicoba lagi sesuai brief. Safari MCP tidak dipakai. Layout kartu/player perlu dites manual di Safari/iOS, termasuk kebijakan autoplay iOS. |
| Suara yang benar-benar terdengar | Chromium headless tidak punya output audio. Pemutaran diverifikasi lewat state elemen `Audio` (`paused`, `currentTime`, `volume`, `muted`), bukan lewat pendengaran. |
| Halaman detail lagu | Menu Musik tidak punya route detail. ID tidak valid hanya bisa dites sebagai URL tak dikenal (404 benar). |
| State error API (No. 21) | Tidak bisa memicu kegagalan API di staging tanpa mengubah server/data. Temuan berdasarkan pembacaan kode. |
| Kebenaran data vs sumber acuan | Plan belum mengisi "Sumber acuan data". Yang dicek hanya API ↔ UI ↔ file audio asli (durasi). |
| Dark mode | Halaman publik tidak punya dark mode (`.claude/DESIGN.md` §13). |
| Admin CMS musik (create/edit) | Butuh login dan di luar scope. |
| Submit form footer (subscribe) | Dilarang (mode baca saja). |

### Catatan Teknis
- Branch lokal `stg` (`0.1.196`) **tertinggal** dari STG (`0.1.202`). Rujukan file:baris memakai kode lokal, jadi berstatus "dugaan" dan bisa sedikit bergeser.
- Script QC ada di scratchpad worker (`qc.js`, `inter2.js`, `inter3.js`, `nav.js`, `nav2.js`, `shots.js`, `min.js`, `pp.js`). Elemen `Audio` di-hook lewat `addInitScript` untuk membaca state player.
