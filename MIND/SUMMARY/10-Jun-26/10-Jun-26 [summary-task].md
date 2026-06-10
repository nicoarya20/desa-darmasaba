# Summary: Fix Login 503 + UMKM UI + Deploy-STG Optimization

**Tanggal:** 10 Juni 2026  
**Versi:** 0.1.77  
**Branch:** tasks/umkm-ui/fix-card-image-product-detail/10-Jun-26

---

## Perubahan 1 — Fix Login 503 (WA OTP Response Format)

**File:** `src/app/api/auth/login/route.ts` (line 45)

**Masalah:** Endpoint POST `/api/auth/login` selalu return 503 saat user yang terdaftar mencoba login. WA OTP terkirim ke WhatsApp tapi backend tetap reject.

**Akar masalah:** Kode lama mengecek `sendWa.status !== "success"`, padahal WA server `otp.wibudev.com` mengembalikan `{ "success": true }` — bukan `{ status: "success" }`. Field `sendWa.status` selalu `undefined`.

**Perbaikan:**
```ts
// Sebelum
if (sendWa.status !== "success")

// Sesudah
if (!sendWa.success)
```

---

## Perubahan 2 — UMKM Katalog Produk: Card Image Uniform

**File:** `src/app/darmasaba/(pages)/ekonomi/umkm/page.tsx` (TabProdukUmkm)

**Masalah:** Card produk di grid memiliki tinggi berbeda-beda karena `height={160}` (HTML attribute) tidak enforce CSS height dengan benar, dan `motion.div`/`Card` tidak stretch ke tinggi row grid.

**Perbaikan:**
- Ganti `height={160}` → `h={160} w="100%" fit="cover"` (Mantine CSS props)
- Tambah `style={{ height: '100%' }}` pada `motion.div` dan `Card`

---

## Perubahan 3 — UMKM Product Detail: Layout 2 Kolom

**File:** `src/app/darmasaba/(pages)/ekonomi/umkm/produk/[id]/page.tsx`

**Masalah:** Image produk stretch full-width container tanpa constraint — terlalu besar.

**Perbaikan:** Layout 2 kolom dengan Mantine `Grid`:
- **Kiri (5/12):** Image `h={260}` mobile / `h={360}` desktop + `fit="cover"`
- **Kanan (7/12):** Nama produk, harga, badge stok, divider, deskripsi, tombol pesan
- Mobile tetap stacked

---

## Perubahan 4 — Hapus `bun run build` dari Skill deploy-stg

**File:** `.claude/commands/deploy-stg.md`

**Alasan:** `bun run build` di Langkah 3 memakan banyak waktu dan menguras context window (token). Build tetap terjadi di dalam Docker saat `publish.yml` dijalankan di GitHub Actions — tidak ada fungsionalitas yang hilang.

**Perbaikan:** Hapus Langkah 3 (Build Check), renumber langkah berikutnya:
- Langkah 0–2: tetap sama
- ~~Langkah 3 (bun run build)~~: dihapus
- Langkah 3: Commit & Push (sebelumnya 4)
- Langkah 4: Trigger publish.yml (sebelumnya 5)
- Langkah 5: Trigger re-pull.yml (sebelumnya 6)
- Langkah 6: Verifikasi versi (sebelumnya 7)

---

## Yang Tidak Diubah

- Logic order/WA message UMKM — tidak berubah
- State management (`umkmState`) — tidak berubah
- API endpoints — tidak berubah
- GitHub Actions workflows (`.github/workflows/`) — tidak berubah

---

## Deployment

- Fix login 503 sudah di-deploy ke STG pada v0.1.77
- UMKM UI fix (perubahan 2 & 3) + deploy-stg optimization belum di-deploy, menunggu deploy berikutnya
