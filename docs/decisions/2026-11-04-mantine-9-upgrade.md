# ADR 2026-11-04 — Tahap 3: Mantine 8.3.18 → 9.7.4

- **Status:** Selesai di lokal (v0.1.205), QA user lolos. Belum masuk `stg`.
- **Branch:** `tasks/mantine-v9-upgrade/upgrade-mantine-v9/2026-11-04-1946`, stacked di atas tahap 2 (`de72a680`, v0.1.204). Saat masuk `stg`, tahap 1 dan 2 masuk lebih dulu.
- **Basis tim:** `origin/stg` = `11a534b8` (v0.1.204), `origin/main` = `9f460ed5`.
- **Lingkup:** dependency `@mantine/*`, theme publik (`src/app/layout.tsx`), prop `Grid`. Tidak ada perubahan schema/database/API/backend.
- **Induk:** [ADR upgrade UI bertahap](2026-11-04-mantine-8-staged-upgrade.md) (§2 tabel tahap, §7 rencana tahap 3).

## 1. Konteks

Mantine 9 memakai `useEffectEvent`. API itu baru tersedia di React bawaan Next 16 (`next/dist/compiled/react` 19.3.0-canary), sehingga tahap 3 baru bisa jalan setelah tahap 2 ([ADR Next 16](2026-11-04-next-16-upgrade.md)).

Versi dan breaking change diverifikasi dari npm dan `mantine.dev/guides/8x-to-9x` + changelog 9.0.0:
- `@mantine/*` 9.7.4 (2026-10-25), peer `react ^19.2.0` (repo 19.3.1).
- `@mantine/tiptap` butuh `@tiptap/react`/`extension-link >=3.3.0` (repo ^3.32.2).
- `@mantine/charts` butuh `recharts >=3.2.1` (repo 3.8.x). Keduanya tidak di-bump.

## 2. Keputusan

| ID | Keputusan | Alasan |
|---|---|---|
| D21 | `fontWeights.medium` = `'500'` (bukan default v9 `'600'`) | Mempertahankan tampilan lama, konsisten dengan D1 (tampilan tidak berubah). |
| D21-revisi | D21 **ditambah** override `--mantine-font-weight-medium: 600` di `Button` root, `ButtonGroupSection`, dan `ActionIconGroupSection` (`groupSection`) | Di v8, Button memakai 600 sedangkan label Input/Menu/Combobox/Stepper/dll memakai 500. v9 menyatukan keduanya ke satu var `medium`, jadi tidak ada satu nilai yang bisa mereproduksi v8. Override dilakukan pada **var** (bukan `font-weight` langsung) supaya `fw`/`style`/className pemakai tetap menang seperti di v8. Ditulis sebagai objek biasa (bukan `.extend()`) karena `layout.tsx` adalah server component. |
| D22 | Compat look **hanya** di `src/app/layout.tsx` | `src/components/admin/AdminThemeProvider.tsx` tidak punya importer (admin memakai provider root). File itu dibiarkan (follow-up), tidak dihapus. |
| D23 | Terima perilaku react-dropzone 20 (lewat `@mantine/dropzone` 9): ekstensi di bawah MIME wildcard kini dipaksakan. Kode tidak diubah. | `accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}` kini benar-benar hanya menerima 4 ekstensi itu (react-dropzone 18.0.1, [#1220](https://github.com/react-dropzone/react-dropzone/issues/1220); di 20.1.2 `fileAccepted` memakai `inputAcceptAttr` yang membuang wildcard bila ada ekstensi). Dampaknya: gif/heic/svg/avif ditolak, audio `.aac`/`.flac` ditolak, dokumen anti-korupsi di luar daftar ditolak. Dropzone yang memakai `IMAGE_MIME_TYPE` (Data UMKM, Produk UMKM, `/admin/images`) tidak berubah. Bonus: paste file ke dropzone yang fokus kini ikut masuk (react-dropzone 19.2). |

Keputusan tambahan saat eksekusi:
- `@mantine/*` dipin persis `9.7.4`, polanya sama dengan 8.3.18.
- Prefix merge `merge(scope):` mengikuti konvensi repo.

## 3. Breaking change yang dicek

| Breaking change v9 | Repo | Tindakan |
|---|---|---|
| `Grid` `gutter` → `gap`, Grid memakai CSS `gap` native (bukan margin negatif) | 26 file tsx (set identik dengan `3d03aac3`) | Prop di-rename (M2). Lebar dan offset kolom identik secara matematis, tepi negatif hilang. |
| `defaultRadius` `sm` → `md` | provider publik | `defaultRadius: 'sm'` |
| Varian `light` jadi solid | 256 pemakaian | `v8CssVariablesResolver` |
| `fontWeights.medium` 500 → 600 | global komponen Mantine | D21-revisi |
| `Text`/`Anchor` `color` dihapus | 0 sisa (sudah `c=` sejak v8) | – |
| `Collapse in`, `Spoiler`, `positionDependencies`, `useFullscreen`/`useMouse`/`useMutationObserver`/`useLocalStorage`/`useHeadroom`, rename type, `@mantine/form`, Notifications, `Dialog withBorder`, ikon `PasswordInput`, `mod` kebab, `Tree data-hovered`, `TypographyStylesProvider` | 0 pemakaian | – |
| `keepMounted` → React Activity | 34 pemakaian, semuanya `keepMounted={false}` | – |
| `Textarea autosize` tanpa `react-textarea-autosize` (implementasi JS Mantine sendiri) | 4 file | Aman untuk target browser D16; `minRows`/`maxRows` tetap dihormati. |
| react-dropzone 15 → 20 | 73 file Dropzone | D23. `FileRejection`/`ErrorCode` tetap sama. |

## 4. Apa yang berubah

| Commit | Isi |
|---|---|
| `2d6d1ca6` | deps: `@mantine/*` 9.7.4. Lock hanya berisi @mantine dan transitive-nya: react-dropzone 15.0.0 → 20.1.2 (attr-accept 4.0.1, file-selector 5.0.2), `type-fest` nested 5.10.0, dan `react-textarea-autosize` dihapus (beserta `use-composed-ref`, `use-latest`, `use-isomorphic-layout-effect`). Tanpa warning peer. |
| `2924d1d6` | `Grid gutter` → `gap` (26 file, ±32 baris, cherry-pick bersih `3d03aac3`) |
| `ae35dc78` | merge `--no-ff` M2 |
| `69792e13` | compat look di `src/app/layout.tsx` (port manual `439ff012`): `defaultRadius: 'sm'`, `fontWeights.medium: '500'`, override var Button 600, `v8CssVariablesResolver` |
| `37a58c17` | merge `--no-ff` M3 |

## 5. Verifikasi

Pembanding: build tahap 2 (`13a6ee73`, runtime identik dengan `de72a680`; selisihnya hanya docs/CHANGELOG/versi/seed). Gate dijalankan di worktree terpisah (`/tmp/wt-m4-gate`), bukan di checkout utama.

| Gate | Hasil |
|---|---|
| `bun run tsc --noEmit` | 0 error (setelah M1: 32 × TS2322 `gutter`, ditutup M2) |
| ESLint (`--ignore-pattern '.next/**' --ignore-pattern 'next-env.d.ts'`) | 111 problems, identik dengan baseline (diff file+rule+pesan = 0) |
| `bun run test:api` | 38 file / 311 tes lulus |
| `bun run build` (Turbopack) | exit 0, 394 halaman, `ƒ Proxy (Middleware)`, 0 warning |
| Smoke `next start` vs tahap 2 | identik: 16 halaman (status + title, termasuk 12 halaman yang tersentuh Grid, `/admin` 307, halaman 404), 9 endpoint API publik (status + md5 body), `/api/docs/json` 586 path (md5 sama), 401 di 4 path admin, 404 API. `/api/version` berbeda hanya karena nomor versi. Log server identik. |
| `/api/img` | 4 varian (raw 720×540 webp, `?size=200`, `?format=jpeg`, kombinasi) byte-identik dengan tahap 2 |
| Matriks guard proxy | 10/10, identik dengan tahap 2 |
| Review silang | 0 temuan kritis (B atas deps + theme; C atas Grid: 26/26 file identik setelah normalisasi, kesetaraan lebar/offset dibuktikan dari CSS 8.3.18 vs 9.7.4) |
| `bun audit` | byte-identik dengan tahap 2 (tidak ada advisory baru/hilang) |
| QA manual user | aman: Grid desktop + 375px, radius/tombol/badge/label, upload (D23), Textarea autosize |

**Bukti tampilan (CSS efektif SSR).** Nilai efektif = default `styles.css` versi tersebut, ditimpa `<style data-mantine-styles>` hasil SSR. Data diukur di `/login` dan `/darmasaba`:
- 477 var `:root`/light/dark yang ada di kedua versi **identik semua** (0 berubah, 0 hilang).
- Var baru bawaan v9: `--mantine-font-weight-regular` 400 / `-medium` 500 / `-bold` 700, dan `--mantine-color-success`.
- Kontrol negatif: v9 tanpa compat berbeda di **88** var dari v8, mis. `radius-default` 0.5rem vs 0.25rem, `blue-light` `var(--mantine-color-blue-1)` vs `rgba(34,139,230,0.1)`, `medium` 600.
- `<button>` di SSR membawa `--mantine-font-weight-medium:600`.
- Peta font-weight per selector (`styles.css` 8.3.18 vs 9.7.4): semua selector v8 cocok, kecuali Switch (lihat §6). Selector baru v9 (Toolbar, Toggle, EmptyState, Tour, Typography `details > summary`) tidak punya padanan v8.

## 6. Konsekuensi & hutang teknis

- **Label track `Switch` (`m_9307d992`) kini 500, di v8 600.** Tidak di-override karena repo belum memakai `<Switch>` (0 file). Kalau kelak dipakai, tambahkan `Switch` ke override var di `layout.tsx`.
- **`AdminThemeProvider.tsx` adalah file mati tanpa compat** (D22). Kalau kelak dipakai lagi tanpa `defaultRadius`/`v8CssVariablesResolver`/override font-weight, tampilan v9 akan bocor ke admin. Hapus file itu, atau samakan theme-nya dengan `layout.tsx`.
- **Override var Button diwarisi elemen anak.** `--mantine-font-weight-medium: 600` berlaku untuk seluruh isi Button. Saat ini tidak ada komponen ber-`medium` di dalam Button (dicek di 1517 blok SSR), tetapi komponen Mantine ber-`medium` yang kelak ditaruh di dalam Button akan ikut 600.
- **Quirk `getEnv` di build ESM Mantine:** `getEnv()` di build ESM selalu mengembalikan `"development"`, sehingga efek `document.fonts` milik `Textarea autosize` bisa error di jsdom. Masih laten karena belum ada test Textarea. Kalau kelak menulis test, mock `document.fonts`.
- **Compat dihapus saat fondasi tema baru diterapkan**: `defaultRadius`, `v8CssVariablesResolver`, `fontWeights.medium`, dan override var Button di `layout.tsx` (komentar di file menunjuk ke ADR induk, yang memuat pointer ke ADR ini).
- **D23 mengubah perilaku upload.** Pengguna yang dulu mengunggah `.gif`/`.heic`/`.svg`/`.avif` lewat dropzone `image/*` kini ditolak. Kalau format itu perlu didukung, tambahkan ekstensinya ke `accept` di halaman terkait. Fix Safari untuk hidden input (react-dropzone 20.1.4) belum ikut, karena `@mantine/dropzone` 9.7.4 mengunci 20.1.2.
- **Temuan review (bawaan, bukan regresi):** Button di `/darmasaba` me-render `&:hover:[object Object]` di style inline (di luar lingkup), dan `STRUKTUR-PROJEK.md` masih menyebut "Mantine UI v7/v8".

## 7. Rollback

Tahap 3 tidak menyentuh data maupun schema, jadi rollback cukup di level kode/image:
- **Sebelum masuk `stg`:** kembali ke branch tahap 2 (`de72a680`, v0.1.204).
- **Setelah masuk `stg`:** revert merge tahap 3 (tahap 1 dan 2 tetap), atau deploy ulang image 0.1.204.

Setelah rollback, jalankan `bun install` supaya `node_modules` kembali ke Mantine 8.3.18 dan react-dropzone 15, lalu restart dev server.
