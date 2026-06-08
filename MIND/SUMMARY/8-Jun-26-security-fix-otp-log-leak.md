# Security Fix: OTP Log Leak & WA Failure Fallback

**Tanggal:** 8 Juni 2026  
**Tipe:** Security Fix  
**Versi:** 0.1.70 → 0.1.71

---

## Masalah yang Ditemukan

Ditemukan celah keamanan di 4 endpoint auth yang mengekspos OTP dan nomor HP ke log server:

### 1. OTP + Nomor HP Bocor ke Log (PII Leak)
Setiap endpoint auth mencetak nomor HP dan nilai OTP aktif ke stdout:
```
console.log(`🔑 DEBUG SEND-OTP-REGISTER [${nomor}]: ${codeOtp}`)
console.log(`🔑 DEBUG REGISTER OTP [${nomor}]: ${codeOtp}`)
console.log(`🔑 DEBUG OTP [${nomor}]: ${codeOtp}`)
console.log(`🔑 DEBUG RESEND OTP [${nomor}]: ${codeOtp}`)
```
Siapapun dengan akses log container/server bisa membaca OTP aktif dan menyalahgunakannya.

### 2. Backdoor Intentional via WA Failure Fallback
Saat WA service gagal, semua endpoint melanjutkan proses (return 200 success) dengan reasoning:
```
"Continuing since OTP is logged"
```
Artinya: jika WA down, admin bisa baca OTP dari log — desain backdoor yang disengaja.

### 3. OTP Bocor di Response Body (login)
`login/route.ts` menyertakan `codeOtp` di response body untuk environment non-production:
```js
debug: { codeOtp, waErrorMessage, note: "Hanya muncul di development/staging..." }
```
Di staging (NODE_ENV bukan "production"), OTP terekspos ke siapa saja yang intercept response.

---

## Perubahan yang Dilakukan

### File yang Diubah

| File | Perubahan |
|---|---|
| `src/app/api/auth/send-otp-register/route.ts` | Hapus `console.log` debug OTP; WA gagal → return 503 |
| `src/app/api/auth/register/route.ts` | Hapus `console.log` debug OTP; WA gagal → return 503 |
| `src/app/api/auth/login/route.ts` | Hapus `console.log` debug OTP + "Use this OTP"; hapus `debug.codeOtp` di response; hapus `waSuccess` dari response; WA gagal → return 503 |
| `src/app/api/auth/resend/route.ts` | Hapus `console.log` debug OTP; WA gagal → return 503 |

### Perilaku Baru saat WA Gagal
Sebelumnya: lanjut proses, return 200 success, OTP tersimpan di DB tanpa user tahu.  
Sesudahnya: return 503 error, OTP **tidak** disimpan ke DB, user diminta coba lagi.

```
HTTP 503 – { success: false, message: "Gagal mengirim kode verifikasi. Silakan coba lagi." }
```

---

## Dampak

- Tidak ada breaking change pada kontrak API yang normal (happy path).
- Jika WA service down: sebelumnya silent failure → sekarang explicit error ke user.
- Log server tidak lagi mengandung nomor HP atau nilai OTP.
- Response body tidak lagi menyertakan OTP dalam kondisi apapun.

---

## Referensi

- Analisis awal: `MIND/MEMO-PROMPT/memo-test.md`
