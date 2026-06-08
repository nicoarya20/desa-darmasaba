# Summary: Fix OTP — Ganti Math.random() dengan CSPRNG

**Tanggal**: 2026-06-08  
**Branch**: tasks/auth/fix-otp-csprng/20260608

---

## Apa yang Diubah

**File**: `src/app/api/auth/_lib/randomOTP.ts`

### Sebelum
```ts
export function randomOTP() {
  const random = Math.floor(Math.random() * (9000 - 1000)) + 1000
  return random;
}
```

### Sesudah
```ts
import { randomInt } from "crypto";

export function randomOTP() {
  return randomInt(1000, 10000);
}
```

---

## Mengapa Diubah

`Math.random()` adalah PRNG (Pseudorandom Number Generator) yang **tidak kriptografis aman**. Output-nya dapat diprediksi jika penyerang mengetahui seed atau pola output sebelumnya. OTP yang dapat diprediksi membuka celah serangan brute-force yang terarah atau bahkan prediksi langsung.

`crypto.randomInt` dari Node.js built-in `crypto` module menggunakan CSPRNG (Cryptographically Secure Pseudorandom Number Generator) yang sesuai standar keamanan untuk keperluan otentikasi.

---

## Dampak

- Tidak ada perubahan antarmuka/kontrak fungsi — return type tetap `number`, range tetap 4 digit (1000–9999).
- Tidak ada breaking change pada konsumen `randomOTP()`.
- Peningkatan keamanan pada alur OTP login pengguna.

---

## Referensi

- Node.js docs: [`crypto.randomInt(min, max)`](https://nodejs.org/api/crypto.html#cryptorandomintmin-max-callback)
- OWASP: [Insecure Randomness](https://owasp.org/www-community/vulnerabilities/Insecure_Randomness)
