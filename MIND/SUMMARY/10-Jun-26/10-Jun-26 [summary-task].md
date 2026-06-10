# Summary: Security Review — Validasi Upload File (upl-img-single)

**Tanggal:** 10 Juni 2026  
**Versi:** 0.1.74  
**Branch:** tasks/security/validasi-upload-upl-img-single/10-06-26

---

## Konteks

Analisis temuan security review terhadap beberapa endpoint auth dan file upload. Dari 4 temuan yang dianalisis:

| Temuan | Status |
|---|---|
| OTP log leak di `send-otp-register` | Sudah diperbaiki sebelumnya (v0.1.71) — tidak applicable |
| Rate limiting tidak ada di endpoint OTP | Sudah ada `otpSendLimiter` + `otpVerifyLimiter` — tidak applicable |
| `force-dynamic` di `layout.tsx` | Tidak ada di file aktual — tidak applicable |
| Validasi upload `upl-img-single.ts` | **Applicable — diperbaiki di rilis ini** |

---

## Perubahan

### `src/app/api/[[...slugs]]/_lib/upl-img-single.ts`

**Masalah:** Tidak ada validasi ekstensi maupun MIME type. File apapun bisa diupload, dengan `Content-Type` sepenuhnya dari client (`file.type || "image/jpeg"`). Error handling mengembalikan string `"error"` alih-alih throw, sehingga caller tidak bisa detect kegagalan.

**Perbaikan:**
- Tambah `ALLOWED_EXTENSIONS` whitelist: `jpg, jpeg, png, gif, webp`
- Tambah `ALLOWED_MIMES` whitelist: `image/jpeg, image/png, image/gif, image/webp`
- Validasi ekstensi dari nama file sebelum upload
- Validasi MIME dari `file.type` sebelum upload
- Ganti `return "error"` → `throw new Error(...)` agar konsisten dengan `upl-img.ts`
- Perbaiki ekstraksi ekstensi menggunakan `.replace(".", "")` agar format konsisten dengan whitelist

**Pola disalin dari:** `upl-img.ts` yang sudah memiliki validasi serupa — tidak ada dependency baru.

---

## Yang Tidak Diubah

- `upl-img.ts` — sudah punya whitelist, hanya kurang magic bytes (risiko minim karena `img.ts` serve handler menentukan Content-Type dari ekstensi server-side, dan `sharp` bertindak sebagai implicit validator)
- `fileStorage/_lib/create.ts` — path gambar sudah diproses `sharp` (implicit magic bytes), audio/document low priority

---

## Dampak

- Semua caller `uplImgSingle` yang selama ini mengabaikan return value `"error"` sekarang perlu wrap dengan try/catch jika belum
- Tidak ada breaking change pada interface — parameter tidak berubah
