# ADR 2026-11-04 — Upgrade UI bertahap: Mantine 8 → Next 16 → Mantine 9

- **Status:** Tahap 1 selesai (v0.1.203), Tahap 2 selesai di lokal (v0.1.204, lihat [ADR Next 16](2026-11-04-next-16-upgrade.md)), Tahap 3 belum dimulai
- **Branch tahap 1:** `tasks/mantine-v8-migration/upgrade-mantine-v8/2026-11-04-1435`
- **Lingkup:** dependency UI + editor teks. Tidak ada perubahan schema/database/API/middleware.
- **Catatan versi:** tahap 1 awalnya dibangun di atas `main` lokal yang basi (`c7de9c75`, versi 0.1.181). Branch kemudian disinkronkan dengan `origin/main` `9f460ed5` (v0.1.202) lewat merge `06c3fa4b`, sehingga versinya menjadi 0.1.203. Semua angka gate di §4 diukur setelah sinkron.

## 1. Konteks

Tujuan awal: upgrade Mantine 7.17 langsung ke Mantine 9 untuk modernisasi UI.

Saat dicoba, Mantine 9 membuat SSR error 500 (`useEffectEvent is not a function`). Penyebabnya:

- Next.js App Router **tidak memakai** `node_modules/react`. Ia memakai React bawaan di `node_modules/next/dist/compiled/react`.
- Next 15.5.x membawa React `19.2.0-canary-0bdb9206`, yang belum punya `useEffectEvent`. Hook Mantine 9 memakai API itu.
- Next 16.4.5 membawa React `19.3.0-canary`, yang sudah punya `useEffectEvent`.

> Cek kompatibilitas library React dengan versi React **bawaan Next**, bukan yang ada di `package.json`:
> `cat node_modules/next/dist/compiled/react/package.json | grep version`

## 2. Keputusan

Upgrade dipecah jadi tiga tahap. Tiap tahap punya branch, QA manual, dan persetujuan merge sendiri:

| Tahap | Isi | Status |
|---|---|---|
| 1 | Mantine **8.3.18** + Tiptap 3 (tetap Next 15) | ✅ v0.1.203 |
| 2 | Next **16.4.5** (menyentuh backend, sudah disetujui tim backend) | ✅ v0.1.204 (lokal), lihat [ADR Next 16](2026-11-04-next-16-upgrade.md) |
| 3 | Mantine **9.7.4** | ⬜ |

## 3. Tahap 1 — Apa yang berubah

### Dependency
- `@mantine/{core,hooks,dates,dropzone,tiptap,charts}` dipin ke `8.3.18`.
- `@tiptap/*` naik ke `^3.32.2`. Dedupe prosemirror (`prosemirror-view` 1.42.9) menutup GHSA-c8x8-7fp4-3x9w (XSS lewat paste).
- Dihapus karena 0 import: `@mantine/form`, `@mantine/modals`, `@mantine/carousel`, `embla-carousel`, `embla-carousel-autoplay`, `embla-carousel-react`, `@tiptap/extension-underline`.
- `bun.lockb` dihapus. File itu basi sejak April (masih berisi Mantine 7.17.0 / Next 15.1.6), dan prioritasnya terhadap `bun.lock` tidak terdokumentasi oleh bun. Sumber install tunggal sekarang `bun.lock`.

### Editor teks (Tiptap 2 → 3)
Ada 9 editor yang aktif. `createEditor` dan `editEditor` dipakai sekitar 100 halaman admin. Lainnya: `editPPIDEditor`, `PPIDTextEditor`, dan 5 editor `_lib` di lingkungan/pendidikan. Pola yang sama dipakai di semua editor:

```ts
useEditor({
  extensions: [
    // Tiptap 3: Underline & Link sudah termasuk StarterKit.
    // link: false   → Link tetap dari @mantine/tiptap (shortcut Ctrl+K), tidak terdaftar dua kali.
    // trailingNode: false → v3 menambah <p></p> di akhir dokumen; dimatikan agar HTML tersimpan
    //                       sama dengan v2 dan form edit tidak dianggap "berubah" sebelum diketik.
    StarterKit.configure({ link: false, trailingNode: false }),
    Link, Highlight, TextAlign.configure({ types: ['heading', 'paragraph'] }), Superscript, SubScript,
  ],
  // Default v3 = false; tanpa ini state aktif tombol toolbar tidak ikut berubah saat kursor pindah.
  shouldRerenderOnTransaction: true,
})

// Default v3 emitUpdate = true (v2: false). Sinkronisasi dari prop tidak boleh memicu onChange.
editor.commands.setContent(value, { emitUpdate: false })
```

**Perilaku baru (disengaja):** StarterKit 3 membawa `listKeymap`. Backspace/Delete di awal atau akhir item list sekarang menggabung atau mengangkat item. HTML yang tersimpan tidak berubah.

Selain itu, 10 komponen editor tanpa pemanggil dihapus (desa, berita, keamanan, kesehatan, ppid).

### Komponen
- `<Text color="dimmed">` diganti `<Text c="dimmed">` di 19 file admin (24 baris, dihitung terhadap `origin/main`; dua baris lain sudah ditulis ulang upstream di `ebbf99bf` dan `a44078af`). Prop `color` pada Text deprecated di v8 dan dihapus di v9.
- Import `@mantine/carousel/styles.css` dihapus dari `src/app/globals.css`.
- `Portal reuseTargetNode` dan `Popover hideDetached` (default baru v8) sudah dianalisis. Tidak perlu perubahan.

## 4. Verifikasi tahap 1

Baseline pembanding: `origin/main` `9f460ed5` (v0.1.202). Hasil branch identik dengan baseline di setiap gate.

| Gate | Hasil |
|---|---|
| `bun run tsc --noEmit` | 0 error |
| ESLint (`--ignore-pattern '.next/**' --ignore-pattern 'next-env.d.ts'`) | 111 problems (1 error bawaan `prefer-const` di `prisma/_seeder_list/ekonomi/seed_apbdes.ts:11`, 110 warning), identik per baris dengan baseline |
| `bun run test:api` | 37 file / 298 tes lulus, exit 0 |
| `bun run build` | sukses, 395 halaman |
| SSR halaman publik / login | 200, `/admin` → 307 ke `/login` |
| Review silang pasca-merge | 0 temuan kritis |
| QA manual | lolos ulang di 0.1.203 setelah sinkron dengan `origin/main` (editor admin + halaman publik) |

## 5. Masalah yang diketahui (sudah ada sejak `main`, bukan akibat upgrade)

- **Overlay dev "TimeoutError: Transition was aborted because of timeout in DOM update".** Sumbernya `next-view-transitions` 0.3.5 (`<ViewTransitions>` di `src/app/layout.tsx`, dipakai 38 file). Di mode dev, compile pertama sebuah halaman bisa lebih dari 4 detik, sehingga browser membatalkan animasi transisi. Library tidak menangani rejection itu, jadi muncul di overlay. Navigasinya sendiri tetap selesai. Di produksi tidak terlihat oleh pengguna. Rencananya diganti dengan view transition bawaan di Tahap 2.
- **ESLint memindai `.next/`** setelah build, sehingga muncul ribuan problem palsu. Jalankan dengan `--ignore-pattern '.next/**'`.
- **1 error lint** `prefer-const` di `prisma/_seeder_list/ekonomi/seed_apbdes.ts:11`.
- **CHANGELOG tidak punya entry untuk setiap rilis.** Antara 0.1.174 dan 0.1.202, entry hanya ada untuk 0.1.180, 0.1.181, 0.1.189, dan 0.1.196. Versi 0.1.197–0.1.202, termasuk 0.1.202 yang sedang di stg/main, tidak tercatat.
- **Base image Docker** `oven/bun:1-debian` memakai tag floating (saat ini bun 1.4.4).

## 6. Rencana Tahap 2 — Next 16.4.5

> **Sudah dikerjakan di v0.1.204.** Hasil, keputusan (D15–D20), gate, dan hutang teknis tercatat di [ADR Next 16](2026-11-04-next-16-upgrade.md). Rencana di bawah dipertahankan sebagai catatan historis. Butir 3 (`eslint-config-next` 16) dan butir 4 (ganti `next-view-transitions`) ditunda ke task terpisah.

Hasil cek statis: 15 pemanggilan `cookies()`/`headers()` sudah `await`, `params` sudah Promise, tidak ada webpack custom, `next lint` tidak dipakai, dan `eslint.config.mjs` sudah flat config.

Yang perlu dikerjakan:
1. Ganti nama `src/middleware.ts` menjadi `src/proxy.ts`. Runtime berubah dari edge ke node. Matcher: `/admin/:path*`, `/validasi`, `/waiting-room`.
2. Pastikan Elysia (`src/app/api/[[...slugs]]/route.ts`) jalan di Turbopack, yang menjadi bundler default Next 16. Cek `serverExternalPackages`.
3. Upgrade `eslint-config-next` ke 16.
4. Pertimbangkan mengganti `next-view-transitions` dengan view transition bawaan Next/React (lihat §5).
5. Gate tambahan: endpoint API via curl, login OTP, session/JWT, dan upload file, dibandingkan dengan `main`. Tahap ini juga menutup CVE critical Next 15 (< 15.5.24).

## 7. Rencana Tahap 3 — Mantine 9.7.4

Breaking change yang relevan untuk repo ini:
- `Grid gutter` → `gap` (26 file).
- Default radius `sm` → `md`, dan varian `light` jadi solid. Untuk mempertahankan tampilan lama: `defaultRadius: 'sm'` + `v8CssVariablesResolver` di **kedua** provider (`src/app/layout.tsx` dan `src/components/admin/AdminThemeProvider.tsx`).
- `fontWeights.medium` 500 → 600. Perlu keputusan visual.

Pekerjaan awal untuk v9 tersimpan di branch `tasks/mantine-v9-migration/*` (commit `3d03aac3` gutter→gap, `439ff012` compat look).

## 8. Rollback

Tahap 1 tidak menyentuh data maupun schema. Untuk rollback, deploy ulang image versi 0.1.202 (versi stg/main sebelum 0.1.203), atau revert merge ke `stg`. Jangan rollback ke 0.1.180: 22 rilis upstream akan ikut mundur, termasuk fix handler Elysia `0793cbf2` dan `d802a48a`.
