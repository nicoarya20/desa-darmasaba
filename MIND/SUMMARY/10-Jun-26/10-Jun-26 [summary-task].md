# Summary: Fix Login 503 + UMKM UI — Card Image & Product Detail

**Tanggal:** 10 Juni 2026  
**Versi:** 0.1.77  
**Branch:** tasks/umkm-ui/fix-card-image-product-detail/10-Jun-26

---

## Perubahan 1 — Fix Login 503 (WA OTP Response Format)

**File:** `src/app/api/auth/login/route.ts` (line 45)

**Masalah:** Endpoint POST `/api/auth/login` selalu return 503 saat user yang terdaftar mencoba login. WA OTP terkirim ke WhatsApp tapi backend tetap reject.

**Akar masalah:** Kode lama mengecek `sendWa.status !== "success"`, padahal WA server `otp.wibudev.com` mengembalikan `{ "success": true }` — bukan `{ status: "success" }`. Field `sendWa.status` selalu `undefined`, sehingga kondisi selalu `true` → selalu return 503.

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

**Masalah:** Card produk di grid memiliki tinggi berbeda-beda karena:
1. `height={160}` (HTML attribute) tidak enforce CSS height dengan benar
2. `motion.div` dan `Card` tidak stretch ke tinggi row grid

**Perbaikan:**
- Ganti `height={160}` → `h={160} w="100%" fit="cover"` (Mantine CSS props)
- Tambah `style={{ height: '100%' }}` pada `motion.div` dan `Card`

---

## Perubahan 3 — UMKM Product Detail: Layout 2 Kolom

**File:** `src/app/darmasaba/(pages)/ekonomi/umkm/produk/[id]/page.tsx`

**Masalah:** Image produk stretch full-width container tanpa constraint — terlalu besar dan mengambil hampir seluruh layar.

**Perbaikan:** Refactor layout menjadi 2 kolom menggunakan Mantine `Grid`:
- **Kiri (5/12):** Image dengan `h={260}` mobile / `h={360}` desktop + `fit="cover"`
- **Kanan (7/12):** Nama produk, harga, badge stok, divider, deskripsi, tombol pesan
- Mobile tetap stacked (base: 12)

---

## Yang Tidak Diubah

- Logic order/WA message — tidak berubah
- State management (`umkmState`) — tidak berubah
- API endpoints — tidak berubah

---

## Deployment

- Fix login 503 sudah di-deploy ke STG pada v0.1.77
- UMKM UI fix (perubahan 2 & 3) belum di-deploy, menunggu deploy berikutnya
