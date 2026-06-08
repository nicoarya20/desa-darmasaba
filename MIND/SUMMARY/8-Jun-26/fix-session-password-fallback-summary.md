# Summary: Fix SESSION_PASSWORD Fallback — Security Hardening

**Tanggal**: 8 Juni 2026  
**Branch**: `tasks/auth/fix-session-password-fallback/20260608`  
**File diubah**: `src/lib/session.ts`

---

## Permasalahan

Baris 33 di `src/lib/session.ts` menggunakan operator `||` sebagai fallback:

```ts
password: process.env.SESSION_PASSWORD || 'default-password-change-in-production',
```

Jika env var `SESSION_PASSWORD` tidak di-set, iron-session **diam-diam** memakai string `'default-password-change-in-production'` sebagai kunci enkripsi session cookie. String ini diketahui publik karena ada di source code. Siapa pun yang mengetahui nilai tersebut dapat memalsukan session cookie dan masuk sebagai user mana pun tanpa autentikasi.

Risikonya:
- Aplikasi tetap berjalan normal tanpa peringatan apapun
- Deployment yang lupa set env var langsung rentan session forgery
- Tidak ada fail-fast — masalah baru terdeteksi setelah ada insiden

---

## Perubahan

**File**: `src/lib/session.ts` (baris 31–35)

**Sebelum**:
```ts
const SESSION_OPTIONS = {
  cookieName: 'desa-session',
  password: process.env.SESSION_PASSWORD || 'default-password-change-in-production',
  ...
};
```

**Sesudah**:
```ts
const sessionPassword = process.env.SESSION_PASSWORD;
if (!sessionPassword) {
  throw new Error('SESSION_PASSWORD env var is not set. Set it to a random string of at least 32 characters.');
}

const SESSION_OPTIONS = {
  cookieName: 'desa-session',
  password: sessionPassword,
  ...
};
```

---

## Dampak

- Jika `SESSION_PASSWORD` tidak di-set, server **langsung crash** saat startup dengan pesan error yang jelas.
- Tidak ada deployment yang bisa berjalan tanpa password yang valid.
- Tidak ada perubahan fungsional untuk environment yang sudah set env var dengan benar.

---

## Kategori

- **Security fix** — menghilangkan hardcoded fallback password di session config
- **Fail-fast pattern** — error eksplisit saat startup lebih aman dari silent default
