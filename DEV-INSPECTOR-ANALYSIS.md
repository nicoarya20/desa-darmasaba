# Dev Inspector - Analisis & Rekomendasi untuk Project Desa Darmasaba

## 📋 Ringkasan Analisis

Dokumen `dev-inspector-click-to-source.md` **TIDAK dapat diterapkan langsung** ke project ini karena perbedaan arsitektur fundamental.

## 🔍 Perbedaan Arsitektur

| Syarat di Dokumen | Project Desa Darmasaba | Status |
|-------------------|------------------------|--------|
| **Vite sebagai bundler** | Next.js 15 (Webpack/Turbopack) | ❌ Tidak kompatibel |
| **Elysia + Vite middlewareMode** | Next.js App Router + Elysia sebagai API handler | ❌ Berbeda |
| **React** | ✅ React 19 | ✅ Kompatibel |
| **Bun runtime** | ✅ Bun | ✅ Kompatibel |

## ✅ Solusi: Next.js Sudah Punya Built-in Click-to-Source

Next.js memiliki fitur **click-to-source bawaan** yang bekerja tanpa setup tambahan:

### Cara Menggunakan

1. **Pastikan dalam development mode:**
   ```bash
   bun run dev
   ```

2. **Klik elemen dengan modifier key:**
   - **macOS**: `Option` + `Click` (atau `⌥` + `Click`)
   - **Windows/Linux**: `Alt` + `Click`

3. **File akan terbuka di editor** pada baris dan kolom yang tepat

### Syarat Agar Berfungsi

1. **Editor harus ada di PATH**
   
   VS Code biasanya sudah terdaftar. Jika menggunakan editor lain, set:
   ```bash
   # Untuk Cursor
   export EDITOR=cursor
   
   # Untuk Windsurf
   export EDITOR=windsurf
   
   # Untuk Sublime Text
   export EDITOR=subl
   ```

2. **Hanya berfungsi di development mode**
   - Fitur ini otomatis tree-shaken di production
   - Zero overhead di production build

3. **Browser DevTools harus terbuka** (beberapa browser memerlukan ini)

## 🎯 Rekomendasi untuk Project Ini

### Opsi 1: Gunakan Built-in Next.js (DIREKOMENDASIKAN)

**Kelebihan:**
- ✅ Zero setup
- ✅ Maintain oleh Vercel
- ✅ Otomatis compatible dengan Next.js updates
- ✅ Zero production overhead

**Kekurangan:**
- ⚠️ Hotkey berbeda (`Option+Click` vs `Ctrl+Shift+Cmd+C`)
- ⚠️ Tidak ada visual overlay/tooltip seperti di dokumen

**Cara:**
Tidak perlu melakukan apapun - fitur sudah aktif saat `bun run dev`.

### Opsi 2: Custom Implementation (JIKA DIPERLUKAN)

Jika ingin visual overlay dan tooltip seperti di dokumen, bisa dibuat custom component dengan pendekatan berbeda:

#### Arsitektur Alternatif untuk Next.js

```
BUILD TIME (Next.js/Webpack):
  .tsx/.jsx file
    → [Custom Webpack Loader] inject data-inspector-* attributes
    → [Next.js internal transform] JSX to React.createElement
    → Browser menerima elemen dengan attributes

RUNTIME (Browser):
  [SAMA seperti dokumen - DevInspector component]
  
BACKEND (Next.js API Route):
  /__open-in-editor → Bun.spawn([editor, '--goto', 'file:line:col'])
```

#### Komponen yang Dibutuhkan:

1. **Custom Webpack Loader** (bukan Vite Plugin)
   - Inject attributes via webpack transform
   - Taruh di `next.config.ts` webpack config

2. **DevInspector Component** (sama seperti dokumen)
   - Browser runtime untuk handle hotkey & klik

3. **API Route `/__open-in-editor`**
   - Buat sebagai Next.js API route: `src/app/api/__open-in-editor/route.ts`
   - HARUS bypass auth middleware

4. **Conditional Import** (sama seperti dokumen)
   ```tsx
   const InspectorWrapper = process.env.NODE_ENV === 'development'
     ? (await import('./DevInspector')).DevInspector
     : ({ children }) => <>{children}</>
   ```

#### Implementasi Steps:

Jika Anda ingin melanjutkan dengan custom implementation, berikut steps:

1. ✅ Buat `src/components/DevInspector.tsx` (copy dari dokumen)
2. ⚠️ Buat webpack loader untuk inject attributes (perlu research)
3. ✅ Buat API route `src/app/api/__open-in-editor/route.ts`
4. ✅ Wrap root layout dengan DevInspector
5. ✅ Set `REACT_EDITOR` di `.env`

**Peringatan:**
- Webpack loader lebih kompleks daripada Vite plugin
- Mungkin ada edge cases dengan Next.js internals
- Perlu maintenance ekstra saat Next.js update

## 📊 Perbandingan

| Fitur | Built-in Next.js | Custom Implementation |
|-------|------------------|----------------------|
| Setup | ✅ Zero | ⚠️ Medium |
| Visual Overlay | ❌ Tidak ada | ✅ Ada |
| Tooltip | ❌ Tidak ada | ✅ Ada |
| Hotkey | `Option+Click` | Custom (bisa disesuaikan) |
| Maintenance | ✅ Vercel | ⚠️ Manual |
| Compatibility | ✅ Guaranteed | ⚠️ Perlu testing |
| Production Impact | ✅ Zero | ✅ Zero (dengan conditional import) |

## 🎯 Kesimpulan

**Rekomendasi: Gunakan Built-in Next.js**

Alasan:
1. ✅ Sudah tersedia - tidak perlu setup
2. ✅ Lebih stabil - maintain oleh Vercel
3. ✅ Lebih simple - tidak ada custom code
4. ✅ Future-proof - otomatis update dengan Next.js

**Custom implementation hanya diperlukan jika:**
- Anda sangat membutuhkan visual overlay & tooltip
- Anda ingin hotkey yang sama persis (`Ctrl+Shift+Cmd+C`)
- Anda punya waktu untuk maintenance

## 🚀 Quick Start - Built-in Feature

Untuk menggunakan click-to-source bawaan Next.js:

1. Jalankan development server:
   ```bash
   bun run dev
   ```

2. Buka browser ke `http://localhost:3000`

3. Tahan `Option` (macOS) atau `Alt` (Windows/Linux)

4. Cursor akan berubah menjadi crosshair

5. Klik elemen mana pun - file akan terbuka di editor

6. **Opsional**: Set editor di `.env`:
   ```env
   # .env.local
   EDITOR=code  # atau cursor, windsurf, subl
   ```

## 📝 Notes

- Fitur ini hanya aktif di development mode (`NODE_ENV=development`)
- Production build (`bun run build`) otomatis menghilangkan fitur ini
- Next.js menggunakan mekanisme yang mirip (source mapping) untuk menentukan lokasi component
- Jika editor tidak terbuka, pastikan:
  - Editor sudah terinstall dan ada di PATH
  - Browser DevTools terbuka (beberapa browser require ini)
  - Anda menggunakan development server, bukan production

## 🔗 Referensi

- [Next.js Documentation - Launching Editor](https://nextjs.org/docs/app/api-reference/config/next-config-js/reactStrictMode)
- [React DevTools - Component Inspection](https://react.dev/learn/react-developer-tools)
- [Original Dev Inspector Document](./dev-inspector-click-to-source.md)
