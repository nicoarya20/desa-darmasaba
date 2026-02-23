# 🎨 Unified Styling System - Admin Dashboard

Sistem styling terpusat untuk admin dashboard Darmasaba dengan dukungan **dark mode**.

**Berdasarkan spesifikasi:** `darkMode.md`

---

## 📋 Daftar Isi

- [Konsep Utama](#konsep-utama)
- [Dark Mode Palette](#dark-mode-palette)
- [Struktur File](#struktur-file)
- [Cara Menggunakan](#cara-menggunakan)
- [Mengedit Style](#mengedit-style)
- [Dark Mode Toggle](#dark-mode-toggle)
- [Contoh Penggunaan](#contoh-penggunaan)

---

## 🎯 Konsep Utama

**Satu File Edit = Semua Halaman Terupdate**

Sebelumnya:
- ❌ Style tersebar di 493 file `.tsx`
- ❌ Hardcode warna di setiap komponen
- ❌ Tidak ada konsistensi
- ❌ Sulit maintain

Sekarang:
- ✅ Edit di **1 file** = semua halaman update
- ✅ Component reusable
- ✅ Konsisten di seluruh aplikasi
- ✅ Dark mode otomatis sesuai spesifikasi `darkMode.md`

---

## 🌙 Dark Mode Palette

### Background Layers (Dark Mode)
| Layer | Token | Warna | Fungsi |
|------|------|------|------|
| Base | `bg.base` | `#0B1220` | Background utama aplikasi |
| App | `bg.app` | `#0F172A` | Area sidebar |
| Card | `bg.card` | `#162235` | Card / container |
| Surface | `bg.surface` | `#1E2A3D` | Table header, tab, input |

### Text Colors (Dark Mode)
| Jenis | Token | Warna |
|-----|------|------|
| Primary | `text.primary` | `#E5E7EB` |
| Secondary | `text.secondary` | `#9CA3AF` |
| Muted | `text.muted` | `#6B7280` |

### Accent & Actions (Dark Mode)
| Fungsi | Warna |
|------|------|
| Primary Action | `#3B82F6` |
| Hover | `#2563EB` |
| Active | `#1D4ED8` |
| Link | `#60A5FA` |

### Borders (Dark Mode)
| Token | Warna |
|-----|------|
| `border.default` | `#2A3A52` |
| `border.soft` | `#22314A` |

> **Catatan:** Light mode menggunakan palette original yang lebih terang

---

## 📁 Struktur File

```
src/
├── utils/
│   └── themeTokens.ts          # 📦 PUSAT SEMUA STYLE (edit di sini!)
├── state/
│   └── darkModeStore.ts        # 🌙 State management dark mode
├── components/admin/
│   ├── DarkModeToggle.tsx      # 🌓 Toggle button
│   ├── AdminThemeProvider.tsx  # 🎨 Theme provider wrapper
│   ├── UnifiedTypography.tsx   # 📝 Text components (Title, Text)
│   ├── UnifiedSurface.tsx      # 📦 Card, Paper components
│   └── README_UNIFIED_STYLING.md # 📖 Dokumentasi ini
├── app/admin/
│   ├── layout.tsx              # ✅ Sudah diupdate dengan dark mode
│   └── (dashboard)/
│       └── _com/
│           ├── header.tsx      # ✅ Sudah diupdate
│           ├── judulList.tsx   # ✅ Sudah diupdate
│           └── judulListTab.tsx # ✅ Sudah diupdate
└── darkMode.md                 # 📐 Spesifikasi lengkap dark mode
```

---

## 🚀 Cara Menggunakan

### 1. **Untuk Developer: Edit Style Global**

Edit file: `src/utils/themeTokens.ts`

```typescript
export const themeTokens = (isDark: boolean = false): ThemeTokens => {
  const darkColors = {
    bgBase: '#0B1220',        // ← Edit warna dark mode di sini
    bgCard: '#162235',
    textPrimary: '#E5E7EB',
    primaryAction: '#3B82F6',
    // ... dan lainnya
  };
  
  return {
    colors: {
      primary: current.primaryAction,
      bg: {
        base: current.bgBase,
        card: current.bgCard,
        // ...
      },
      // ...
    },
  };
};
```

### 2. **Menggunakan Components di Halaman**

#### A. Typography Components

```tsx
import { UnifiedTitle, UnifiedText } from '@/components/admin/UnifiedTypography';

// Heading - otomatis dark mode
<UnifiedTitle order={1}>Judul Halaman</UnifiedTitle>
<UnifiedTitle order={2}>Sub Judul</UnifiedTitle>
<UnifiedTitle order={3}>Section Title</UnifiedTitle>
<UnifiedTitle order={4}>Card Title</UnifiedTitle>

// Text dengan color semantic
<UnifiedText size="body" color="primary">Teks primary</UnifiedText>
<UnifiedText size="body" color="secondary">Teks secondary</UnifiedText>
<UnifiedText size="body" color="muted">Teks muted</UnifiedText>
<UnifiedText size="body" color="link">Link text</UnifiedText>
<UnifiedText size="body" color="brand">Brand color</UnifiedText>

// Dengan weight
<UnifiedText weight="bold">Teks bold</UnifiedText>
<UnifiedText weight="medium">Teks medium</UnifiedText>
```

#### B. Surface Components

```tsx
import UnifiedCard, { UnifiedDivider } from '@/components/admin/UnifiedSurface';

// Card sederhana - border dan warna otomatis dark mode
<UnifiedCard>
  <p>Isi card</p>
</UnifiedCard>

// Card dengan sections
<UnifiedCard>
  <UnifiedCard.Header>
    <UnifiedTitle order={4}>Header</UnifiedTitle>
  </UnifiedCard.Header>
  
  <UnifiedCard.Body>
    <p>Body content</p>
  </UnifiedCard.Body>
  
  <UnifiedCard.Footer>
    <Button>Action</Button>
  </UnifiedCard.Footer>
</UnifiedCard>

// Divider dengan variant
<UnifiedDivider variant="soft" />  {/* Default */}
<UnifiedDivider variant="default" />
<UnifiedDivider variant="strong" />
```

#### C. Page Header Component

```tsx
import { UnifiedPageHeader } from '@/components/admin/UnifiedTypography';

<UnifiedPageHeader
  title="Daftar Berita"
  subtitle="Kelola semua berita di sini"
  action={
    <Button onClick={handleCreate}>
      <IconPlus /> Tambah Baru
    </Button>
  }
/>
```

### 3. **Menggunakan Theme Tokens Langsung**

```tsx
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';

function MyComponent() {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);

  return (
    <div style={{
      backgroundColor: tokens.colors.bg.card,
      color: tokens.colors.text.primary,
      padding: tokens.spacing.md,
      borderRadius: tokens.radius.lg,
      border: `1px solid ${tokens.colors.border.default}`,
    }}>
      <p style={{ fontSize: tokens.typography.body.fz }}>
        Konten dengan styling konsisten
      </p>
    </div>
  );
}
```

---

## 🌓 Dark Mode Toggle

### Otomatis di Header

Dark mode toggle sudah terintegrasi di header admin dashboard. User bisa toggle dengan klik tombol 🌙/☀️.

### Manual Toggle

```tsx
import { useDarkMode } from '@/state/darkModeStore';
import { DarkModeToggle } from '@/components/admin/DarkModeToggle';

function MyComponent() {
  const { isDark, toggle } = useDarkMode();
  
  return (
    <div>
      <p>Current mode: {isDark ? 'Dark' : 'Light'}</p>
      
      {/* Gunakan component toggle */}
      <DarkModeToggle />
      
      {/* Atau manual */}
      <button onClick={toggle}>Toggle</button>
    </div>
  );
}
```

### Persistensi

Dark mode preference disimpan di `localStorage` dengan key `darmasaba-admin-dark-mode`.
Preference akan tetap ada saat user refresh halaman atau kembali nanti.

---

## 📝 Contoh Penggunaan Lengkap

### Contoh 1: List Page dengan Table

```tsx
'use client'
import { UnifiedPageHeader, UnifiedText } from '@/components/admin/UnifiedTypography';
import UnifiedCard from '@/components/admin/UnifiedSurface';
import { useDarkMode } from '@/state/darkModeStore';
import { themeTokens } from '@/utils/themeTokens';
import { Button, Table, TableTr, TableTh, TableTd } from '@mantine/core';

export default function DaftarBerita() {
  const { isDark } = useDarkMode();
  const tokens = themeTokens(isDark);

  return (
    <div>
      {/* Header Halaman */}
      <UnifiedPageHeader
        title="Daftar Berita"
        subtitle="Kelola semua berita yang diterbitkan"
        action={
          <Button 
            bg={tokens.colors.primary}
            style={{
              background: `linear-gradient(135deg, ${tokens.colors.primary}, ${isDark ? '#60A5FA' : '#4facfe'})`,
            }}
          >
            + Tambah Berita
          </Button>
        }
      />

      {/* Card untuk Table */}
      <UnifiedCard>
        <Table>
          <TableThead>
            <TableTr>
              <TableTh style={{ backgroundColor: tokens.colors.bg.surface }}>
                <UnifiedText size="label" color="secondary">Judul</UnifiedText>
              </TableTh>
              <TableTh style={{ backgroundColor: tokens.colors.bg.surface }}>
                <UnifiedText size="label" color="secondary">Kategori</UnifiedText>
              </TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {data.map((item) => (
              <TableTr 
                key={item.id}
                style={{
                  '&:hover': {
                    backgroundColor: tokens.colors.bg.hover,
                  },
                }}
              >
                <TableTd>
                  <UnifiedText size="body">{item.judul}</UnifiedText>
                </TableTd>
                <TableTd>
                  <UnifiedText size="small" color="secondary">
                    {item.kategori}
                  </UnifiedText>
                </TableTd>
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </UnifiedCard>
    </div>
  );
}
```

### Contoh 2: Detail Page

```tsx
import { UnifiedTitle, UnifiedText } from '@/components/admin/UnifiedTypography';
import UnifiedCard, { UnifiedDivider } from '@/components/admin/UnifiedSurface';

export default function DetailBerita({ data }) {
  return (
    <UnifiedCard>
      <UnifiedCard.Header>
        <UnifiedTitle order={3} color="brand">{data.judul}</UnifiedTitle>
      </UnifiedCard.Header>

      <UnifiedCard.Body>
        <Box mb="md">
          <UnifiedText size="label" color="muted">Kategori</UnifiedText>
          <UnifiedText size="body" weight="medium">{data.kategori}</UnifiedText>
        </Box>

        <UnifiedDivider variant="soft" />

        <Box my="md">
          <UnifiedText size="label" color="muted">Deskripsi</UnifiedText>
          <UnifiedText size="body">{data.deskripsi}</UnifiedText>
        </Box>

        <UnifiedDivider variant="soft" />

        <Box mt="md">
          <UnifiedText size="label" color="muted">Konten</UnifiedText>
          <div dangerouslySetInnerHTML={{ __html: data.content }} />
        </Box>
      </UnifiedCard.Body>

      <UnifiedCard.Footer>
        <Group justify="right">
          <Button color="red">Hapus</Button>
          <Button color="green">Edit</Button>
        </Group>
      </UnifiedCard.Footer>
    </UnifiedCard>
  );
}
```

---

## 🎨 Mengedit Style

### Edit Warna Dark Mode

File: `src/utils/themeTokens.ts`

```typescript
const darkColors = {
  // Background Layers
  bgBase: '#0B1220',        // ← Edit di sini
  bgApp: '#0F172A',
  bgCard: '#162235',
  bgSurface: '#1E2A3D',
  
  // Text
  textPrimary: '#E5E7EB',   // ← Edit di sini
  textSecondary: '#9CA3AF',
  
  // Accent
  primaryAction: '#3B82F6', // ← Edit primary color
};
```

### Edit Warna Light Mode

```typescript
const lightColors = {
  bgBase: '#f6f9fc',
  bgCard: '#ffffff',
  textPrimary: '#1a1b1e',
  primaryAction: baseColors['blue-button'], // Dari colors.ts
};
```

### Edit Typography

```typescript
typography: {
  h1: {
    fz: '2rem',       // ← Edit ukuran
    fw: 700,          // ← Edit weight
    lh: 1.2,          // ← Edit line height
  },
  body: {
    fz: '1rem',
    fw: 400,
    lh: 1.5,
  },
}
```

### Edit Spacing & Radius

```typescript
spacing: {
  xs: '0.625rem',    // 10px
  sm: '1rem',        // 16px
  md: '1.5rem',      // 24px
  lg: '2rem',        // 32px
}

radius: {
  sm: '0.5rem',      // 8px
  md: '0.75rem',     // 12px
  lg: '1rem',        // 16px
}
```

---

## ✅ Checklist Migrasi

Komponen yang sudah diupdate dengan dark mode:

- ✅ `src/app/admin/layout.tsx`
- ✅ `src/app/admin/(dashboard)/_com/header.tsx`
- ✅ `src/app/admin/(dashboard)/_com/judulList.tsx`
- ✅ `src/app/admin/(dashboard)/_com/judulListTab.tsx`
- ✅ `src/components/admin/UnifiedTypography.tsx`
- ✅ `src/components/admin/UnifiedSurface.tsx`
- ✅ `src/components/admin/DarkModeToggle.tsx`
- ✅ `src/utils/themeTokens.ts`

Komponen yang perlu diupdate (TODO):

- [ ] Komponen di `src/app/admin/(dashboard)/desa/`
- [ ] Komponen di `src/app/admin/(dashboard)/ppid/`
- [ ] Komponen di `src/app/admin/(dashboard)/kesehatan/`
- [ ] Komponen di `src/app/admin/(dashboard)/pendidikan/`
- [ ] Komponen di `src/app/admin/(dashboard)/ekonomi/`
- [ ] Dan lain-lain...

---

## 📚 Referensi

- [Dark Mode Specification](../../../darkMode.md) - Spesifikasi lengkap dark mode
- [Mantine Theme System](https://mantine.dev/theming/theme-object/)
- [Mantine Dark Mode](https://mantine.dev/theming/dark-mode/)
- [Valtio State Management](https://github.com/pmndrs/valtio)

---

## 💡 Tips

1. **Selalu gunakan unified components** untuk konsistensi dark/light mode
2. **Edit di `themeTokens.ts`** untuk perubahan global
3. **Test dark mode** setelah perubahan style
4. **Gunakan color semantic** (`primary`, `secondary`, `muted`) bukan hex langsung
5. **Jangan hardcode shadow** di dark mode (spec: "Jangan pakai shadow hitam")
6. **Border harus terlihat** di dark mode (opacity > 20%)

---

## 🆘 Troubleshooting

### Style tidak berubah setelah edit themeTokens.ts?

1. Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)
2. Restart dev server: `bun run dev`
3. Pastikan komponen menggunakan unified components

### Dark mode tidak berfungsi?

1. Cek `darkModeStore.ts` sudah diimport
2. Pastikan `useDarkMode()` hook digunakan
3. Clear localStorage: `localStorage.clear()`
4. Cek console untuk error

### Border tidak terlihat di dark mode?

Pastikan menggunakan `tokens.colors.border.default` atau `tokens.colors.border.soft`, bukan hardcode warna.

### Component tidak re-render?

1. Pastikan `'use client'` ada di file component
2. Gunakan `useSnapshot()` jika menggunakan Valtio di non-event handler
3. Cek console untuk error

---

## 📐 Spesifikasi Dark Mode

Untuk spesifikasi lengkap dark mode (layout rules, table styles, button rules, dll), lihat:
**[`darkMode.md`](../../../darkMode.md)**

Highlights:
- ✅ Background layers berbeda (base, app, card, surface)
- ✅ Border wajib terlihat (tidak flat)
- ✅ Active state dengan accent bar (2-3px)
- ✅ Tidak pakai shadow hitam
- ✅ Hover state dengan background soft
- ✅ Text kontras terbaca

---

**Last Updated:** February 20, 2026  
**Version:** 2.0.0 (Dark Mode Ready)  
**Based on:** darkMode.md specification
