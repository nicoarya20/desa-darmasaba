# DESIGN.md — Desa Darmasaba Design System

Dokumen ini mencatat UI/UX conventions, design tokens, komponen, dan pola yang dipakai di seluruh codebase. Tujuan: AI dan developer baru langsung paham "bahasa visual" project ini tanpa perlu baca semua file satu per satu.

---

## 1. Tech Stack UI

| Paket | Versi | Kegunaan |
|---|---|---|
| `@mantine/core` | 9.7.4 | Komponen utama (AppShell, Paper, Button, Input, dll) |
| `@mantine/dates` | 9.7.4 | Date picker |
| `@mantine/dropzone` | 9.7.4 | Upload file/gambar |
| `@mantine/tiptap` | 9.7.4 | Rich text editor (wrapper custom di `_com/createEditor.tsx`) |
| `@tiptap/*` | ^3.32.2 | Engine rich text editor (StarterKit, Highlight, TextAlign, Superscript, Subscript; Link via `@mantine/tiptap`) — lihat §17 |
| `@mantine/charts` | 9.7.4 | BarChart, PieChart, dll |
| `@tabler/icons-react` | ^3.30.0 | Semua ikon (Tabler Icons) |
| `framer-motion` | ^12.38.0 | Animasi (navbar mobile, hover cards, stagger) |
| `recharts` | ^3.8.0 | Grafik APBDes |
| `primereact` | ^10.9.6 | Beberapa komponen tabel |
| `@mantine/hooks` | 9.7.4 | Hooks pendukung Mantine (dipakai luas bareng `@mantine/core`) |
| `chart.js` | ^4.4.8 | Grafik tambahan di luar `@mantine/charts` |

**Catatan Mantine 9** (lihat `docs/decisions/2026-11-04-mantine-9-upgrade.md`):
- Jarak kolom `Grid` memakai prop `gap`, bukan `gutter` (sudah dihapus di v9).
- Tampilan v8 dipertahankan di theme `src/app/layout.tsx`: `defaultRadius: "sm"`, `cssVariablesResolver={v8CssVariablesResolver}`, `fontWeights.medium: "500"`, dan override `--mantine-font-weight-medium: 600` di `Button` (+ `ButtonGroupSection`/`ActionIconGroupSection`), supaya tombol tetap 600 seperti di v8. Jangan dihapus sebelum fondasi tema baru diterapkan.
- `accept` Dropzone yang berisi MIME wildcard **dan** ekstensi (mis. `image/*` + `.jpg`) kini hanya menerima ekstensi itu saja (react-dropzone 20).

---

## 2. Color Tokens

File sumber: `src/con/colors.ts`, `src/utils/themeTokens.ts`

### 2.1 Palette Utama (Public Site)

| Token | Hex | Penggunaan |
|---|---|---|
| `blue-button` | `#0A4E78` | Primary action, link aktif, border aktif |
| `blue-button-1` | `#E5F2FA` | Background ringan, hover |
| `blue-button-2` | `#B8DAEF` | — |
| `blue-button-3` | `#8AC1E3` | — |
| `blue-button-4` | `#5DA9D8` | — |
| `blue-button-5` | `#2F91CC` | — |
| `blue-button-6` | `#083F61` | — |
| `blue-button-7` | `#062F49` | Teks gelap di atas background biru |
| `orange` | `#FCAE00` | Aksen/highlight |
| `Bg` | `#D1D9E8` | Background halaman login |
| `BG-trans` | `#B1C5F2` | Background transparan |
| `grey-1` | `#F4F5F6` | Background section halaman publik |
| `grey-2` | `#CBCACD` | Border ringan |
| `white-1` | `#FBFBFC` | Background Paper admin |

### 2.2 Token Semantik Admin — Light Mode

| Token | Nilai |
|---|---|
| `bg.base` | `#f6f9fc` — AppShellMain background |
| `bg.app` | `#ffffff` — Sidebar background |
| `bg.card` | `#ffffff` — UnifiedCard |
| `bg.surface` | `#f8fafc` — Surface sekunder |
| `text.primary` | `#1a1b1e` |
| `text.secondary` | `#495057` |
| `text.muted` | `#868e96` |
| `primary` | `#0A4E78` |
| `border.default` | `#e2e8f0` |
| `success` | `#22c55e` |
| `warning` | `#facc15` |
| `error` | `#ef4444` |
| `info` | `#38bdf8` |

### 2.3 Token Semantik Admin — Dark Mode

| Token | Nilai |
|---|---|
| `bg.base` | `#0B1220` |
| `bg.app` | `#0F172A` |
| `bg.card` | `#162235` |
| `bg.surface` | `#1E2A3D` |
| `text.primary` | `#E5E7EB` |
| `primary` | `#3B82F6` |
| `border.default` | `#2A3A52` |

### 2.4 Gradient Standar Button Simpan

```ts
background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`
boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)'
```

Gradient ini dipakai di button "Simpan" hampir semua halaman Create/Edit admin.

---

## 3. Tipografi

File sumber: `src/app/layout.tsx`, `src/utils/themeTokens.ts`

### Font Family

- **Primary**: `San Francisco` (custom, `/assets/fonts/font.otf`)  
  Fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
- **Monospace**: `SFMono-Regular, Menlo, Monaco, Consolas, monospace`

### Skala Heading (Admin)

| Level | Font Size | Weight | Line Height |
|---|---|---|---|
| H1 | `2.25rem` | 700 | 1.2 |
| H2 | `2rem` | 700 | 1.25 |
| H3 | `1.75rem` | 700 | 1.3 |
| H4 | `1.5rem` | 600 | 1.35 |
| Body | `1rem` | 400 | 1.5 |
| Small | `0.875rem` | 400 | 1.4 |
| Label | `0.75rem` | 600 | 1.4 |

### Heading Responsif (Public)

```tsx
// H1 hero (APBDes, Landing)
fz={{ base: "2rem", md: "3.6rem" }}

// H1 section
fz={{ base: "1.75rem", md: "3rem" }}

// Kartu kecil
fz={{ base: "sm", md: "md" }}
```

---

## 4. Spacing & Border Radius

| Token | Nilai |
|---|---|
| `xs` | `0.625rem` (10px) |
| `sm` | `1rem` (16px) |
| `md` | `1.5rem` (24px) |
| `lg` | `2rem` (32px) |
| `xl` | `2.5rem` (40px) |

| Radius | Nilai |
|---|---|
| `sm` | `8px` |
| `md` | `12px` |
| `lg` | `16px` |
| `xl` | `20px` |

---

## 5. Layout Public Site (`/darmasaba/`)

File: `src/app/darmasaba/layout.tsx`

```
Stack (gap=0, bg=grey[1])
  Navbar (fixed, glass effect, z-index=100)
  Space h={{ base:"3.9rem", md:"2.5rem" }}
  {children}
  Footer
  FixedPlayerBar
```

### Navbar Desktop

`Paper` dengan class `glass2` (`backdrop-filter: blur(40px)`, `rgba(255,255,255,0.3)`), posisi `fixed`. Lebar konten `Container w={{ base:'100%', md:'80%' }}`. Menu menggunakan `Mantine Menu` dengan `trigger="hover"`.

Active state: `borderBottom: 2px solid ${colors['blue-button']}`, `fontWeight: 600`.

### Navbar Mobile

`Burger` + `Paper` slide-in dari kanan (framer-motion `x: "100%" → x: 0`, duration 0.2s). `ScrollArea.Autosize` agar menu bisa di-scroll.

### Footer

```tsx
Stack bg="linear-gradient(180deg, #1C6EA4, #124170)"
  SimpleGrid cols={{ base:1, sm:2, md:4 }}
    // Tentang Darmasaba
    // Layanan Desa
    // Tautan Penting
    // Berlangganan
```

---

## 6. Layout Admin (`/admin/`)

File: `src/app/admin/layout.tsx`

Menggunakan Mantine `AppShell`:

```tsx
<AppShell
  header={{ height: 64 }}
  navbar={{
    width: { base: 260, sm: 280, lg: 300 },
    breakpoint: 'sm',
    collapsed: { mobile: !mobileOpened, desktop: !desktopOpened }
  }}
>
```

### Header (64px)

Background: `linear-gradient(90deg, #ffffff, #f9fbff)` (light) / dark equivalent.  
Konten: Logo + "Admin Darmasaba" | Spacer | Toggle sidebar (desktop) | Burger (mobile) | Link ke website | Tombol logout.

### Sidebar

`AppShellNavbar` dengan `ScrollArea`. Navigasi 2 level: parent item dan children.

Active state per `NavLink`:
```ts
borderLeft: `3px solid ${tokens.colors.primary}`
background: tokens.colors.bg.surface
```

Deteksi aktif: `useSelectedLayoutSegments()` dari Next.js App Router.

### Main

`AppShellMain` bg `#f6f9fc`.

---

## 7. Menu Navigasi

### Menu Public (10 domain)

File: `src/con/navbar-list-menu.ts`

| # | Menu | Jumlah Sub |
|---|---|---|
| 1 | PPID | 8 |
| 2 | Desa | 9 (termasuk Kalender Event Budaya) |
| 3 | Kesehatan | 7 |
| 4 | Keamanan | 7 |
| 5 | Ekonomi | 11 (termasuk Kesejahteraan Masyarakat) |
| 6 | Inovasi | 6 |
| 7 | Lingkungan | 6 |
| 8 | Kependudukan | 5 |
| 9 | Pendidikan | 7 |
| 10 | Musik | 1 |

### Sidebar Admin

File: `src/app/admin/_com/list_PageAdmin.tsx` (re-export saja; data sebenarnya ada di `src/app/admin/_com/nav/domains.ts` dan dirakit di `src/app/admin/_com/nav/index.ts`)

Export: `navBar` (semua domain), `role1`, `role2`, `role3` (role-based subset), `devBar`.  
Logic pemilihan: `getNavbar({ roleId, menuIds })` — ada di `src/app/admin/(dashboard)/user&role/_com/dynamicNavbar.ts`, dipakai di `src/app/admin/layout.tsx`. Filter berdasarkan `menuIds` (dengan normalisasi ID) jika tersedia, fallback ke role (`roleId 0→devBar, 1→navBar, 2→role1, 3→role2, 4→role3`).

---

## 8. Komponen Shared Admin

File-file di `src/app/admin/(dashboard)/_com/` dan `src/components/admin/`:

### HeaderSearch

```tsx
// src/app/admin/(dashboard)/_com/header.tsx
<Grid>
  <Grid.Col span={{ base: 12, md: 9 }}>
    <UnifiedTitle order={3}>{judul}</UnifiedTitle>
  </Grid.Col>
  <Grid.Col span={{ base: 12, md: 3 }}>
    <TextInput radius="lg" leftSection={<IconSearch />} value={search} onChange={...} />
  </Grid.Col>
</Grid>
```

### JudulList

```tsx
// src/app/admin/(dashboard)/_com/judulList.tsx
<Grid>
  <Grid.Col span={11}>/* title */</Grid.Col>
  <Grid.Col span={1}>
    <Button leftSection={<IconCircleDashedPlus />} style={{ background: gradient }}>
      {namaTambah}
    </Button>
  </Grid.Col>
</Grid>
```

### JudulListTab

Grid 3 kolom (8/3/1) — title + search + create button. Untuk halaman yang memiliki Tab.

### ModalKonfirmasiHapus

```tsx
// src/app/admin/(dashboard)/_com/modalKonfirmasiHapus.tsx
<Modal centered opened={opened} onClose={onClose}>
  <Text>{text}</Text>
  <Group>
    <Button bg={colors['blue-button']} onClick={onClose}>Batal</Button>
    <Button color="red" onClick={onConfirm} loading={loading}>Yakin Hapus</Button>
  </Group>
</Modal>
```

State modal dikelola di page-level via `useState(false)`, bukan `useDisclosure`.

### UnifiedCard

```tsx
// src/components/admin/UnifiedSurface.tsx
<Paper bg={tokens.colors.bg.card} radius={tokens.radius.lg} withBorder>
  <UnifiedCard.Header />  {/* dengan divider */}
  <UnifiedCard.Body />
  <UnifiedCard.Footer />
</Paper>
```

### UnifiedTitle & UnifiedText

```tsx
// src/components/admin/UnifiedTypography.tsx
<UnifiedTitle order={3} color="primary">Judul</UnifiedTitle>
<UnifiedText size="body" weight="medium">Teks</UnifiedText>
<UnifiedPageHeader title="..." subtitle="..." action={<Button />} />
```

---

## 9. Pola Tabel Admin

Semua halaman list menggunakan pola ini secara konsisten:

```tsx
// Desktop (visibleFrom="md")
<Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
  <Group justify="space-between">
    <Title order={4}>Daftar [Entity]</Title>
    <Button leftSection={<IconPlus />} color="blue" variant="light">Tambah Baru</Button>
  </Group>
  <Table highlightOnHover layout="fixed">
    <Table.Thead><Table.Tr><Table.Th>...</Table.Th></Table.Tr></Table.Thead>
    <Table.Tbody>...</Table.Tbody>
  </Table>
</Paper>

// Mobile (hiddenFrom="md")
<Stack gap="sm">
  {items.map(item => (
    <Paper withBorder p="sm" radius="md">
      <Stack>
        <Box><Text size="xs" c="dimmed">Label</Text><Text>{value}</Text></Box>
        {/* ... */}
      </Stack>
      <Button fullWidth>Detail</Button>
    </Paper>
  ))}
</Stack>

// Pagination
<Center mt="md">
  <Pagination value={page} onChange={setPage} total={totalPages} color="blue" radius="md" />
</Center>
```

### Variant Action Buttons Tabel

- **Satu tombol "Detail"** → `router.push(/${item.id})` — dipakai di posyandu, lowongan
- **Pisah tombol** → `<Button color="green">Edit</Button>` + `<Button color="red">Hapus</Button>` atau `<ActionIcon>` — dipakai di event budaya, data banjar

---

## 10. Pola Form Admin

### Create

```tsx
<Box px={{ base: 0, md: 'lg' }} py="xs">
  <Group mb="md">
    <Button variant="subtle" onClick={() => router.back()}>
      <IconArrowBack color={colors['blue-button']} />
    </Button>
    <Title order={4}>Tambah [Entity]</Title>
  </Group>
  <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p="lg" radius="md" shadow="sm">
    <Stack gap="md">
      <Dropzone maxSize={5 * 1024 ** 2} onDrop={...}>/* preview gambar */</Dropzone>
      <TextInput label="..." placeholder="..." required />
      <Select clearable searchable data={[...]} />
      <CreateEditor value={content} onChange={setContent} />
      <Group justify="right">
        <Button variant="outline" color="gray" onClick={resetForm}>Reset</Button>
        <Button
          disabled={!isFormValid() || isSubmitting}
          style={{ background: 'linear-gradient(135deg, #0A4E78, #4facfe)', boxShadow: '...' }}
        >
          {isSubmitting ? <Loader size="sm" color="white" /> : 'Simpan'}
        </Button>
      </Group>
    </Stack>
  </Paper>
</Box>
```

**Catatan penting**: Halaman form menggunakan `useState` manual + validasi di `handleSubmit` (`@mantine/form`/`useForm` tidak dipasang). Error feedback via `toast.error()` (react-toastify).

### Edit

Sama dengan Create, perbedaan:
- Data di-load dari state via `useEffect` saat mount
- Simpan `originalData` untuk tombol "Batal" (bukan "Reset")
- Success feedback: `toast.success('... berhasil diperbarui!')`

### Detail (`[id]/page.tsx`)

```tsx
<Paper bg="#ECEEF8">
  <Stack>
    {/* field-by-field display */}
    <Group>
      <Button color="green" onClick={() => router.push(`${id}/edit`)}>Edit</Button>
      <Button color="red" onClick={() => setModalHapus(true)}>Hapus</Button>
    </Group>
  </Stack>
</Paper>
```

---

## 11. Pola Tab Navigation

File: `src/app/admin/(dashboard)/kesehatan/posyandu/_com/layoutTabs.tsx`

```tsx
<Tabs variant="pills" color={colors['blue-button']} radius="lg"
  value={activeTab} onChange={handleTabChange}>
  <ScrollArea type="hover">
    <Tabs.List
      style={{
        background: 'linear-gradient(135deg, #e7ebf7, #f9faff)',
        borderRadius: '1rem',
        padding: '0.25rem'
      }}
    >
      <Tabs.Tab value="ringkasan">Ringkasan</Tabs.Tab>
      <Tabs.Tab value="data-posyandu">Data Posyandu</Tabs.Tab>
      {/* ... */}
    </Tabs.List>
  </ScrollArea>
  <Tabs.Panel value="..." style={{
    background: 'linear-gradient(180deg, #ffffff, #f5f6fa)',
    borderRadius: '1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
  }}>
    {/* content */}
  </Tabs.Panel>
</Tabs>
```

Tab routing berbasis URL — setiap tab = path unik. Tab aktif dideteksi dari URL segment.

---

## 12. State Management

- **Valtio** (`proxy`, `useSnapshot`) — state dominan di project ini (180+ file), dipakai untuk semua domain (posyandu, kependudukan, ekonomi, dll) **dan** dark mode (`src/state/darkModeStore.ts` — bukan Zustand; Zustand tidak ada di dependencies)
- **Jotai** — ada di `package.json` tapi tidak dipakai sama sekali (0 import) — jangan dipakai untuk kode baru
- **SWR** — hanya dipakai di 1 file (`src/state/state-layanan.ts`), bukan pola umum

Pattern state per domain (contoh posyandu):
```ts
// src/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu.ts
const statePosyandu = proxy({
  list: { data: [], loading: false, page: 1, total: 0 },
  findUnique: { data: null, loading: false },
  create: { loading: false },
  edit: { data: null, loading: false },
})
```

---

## 13. Dark Mode

File: `src/components/admin/AdminThemeProvider.tsx`, `src/utils/themeTokens.ts`, `src/styles/dark-mode-table.css`

- State: `useDarkMode()` hook dari `src/state/darkModeStore.ts`
- Diterapkan via `MantineProvider forceColorScheme={isDark ? 'dark' : 'light'}`
- Semua komponen admin konsumsi `themeTokens(isDark)` untuk styling inline
- Table hover dark mode via CSS override: `[data-mantine-color-scheme="dark"] tr:hover { background: rgba(255,255,255,0.08) }`
- Transisi: `transition: 'background 0.3s ease, border-color 0.3s ease'`
- Halaman publik tidak ada dark mode (fixed light)

---

## 14. Animasi & Efek Visual

### Glass Effect (Navbar Publik)

```css
.glass2 {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(40px);
  position: fixed;
  z-index: 1;
}
```

### Framer Motion Patterns

```ts
// Navbar mobile slide-in
initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.2 }}

// Card hover
whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}  // potensi, layanan
whileHover={{ scale: 1.05 }}                               // SDGs

// Stagger fade-up (APBDes sections)
initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
transition={{ delay: index * 0.1 }}  // 0.1s, 0.2s, 0.3s, 0.4s
```

### Shadows

| Token | Nilai |
|---|---|
| `sm` | `0 1px 3px rgba(0,0,0,0.1)` |
| `md` | `0 4px 6px rgba(0,0,0,0.1)` |
| `lg` | `0 10px 15px rgba(0,0,0,0.1)` |

Dark mode: ganti alpha `0.1` → `0.3`.

---

## 15. Responsive Patterns

Breakpoint utama: `md` (~992px)

| Pattern | Mobile | Desktop |
|---|---|---|
| Navigasi admin | `Burger` + slide overlay | `AppShell Navbar` fixed |
| Tabel data | `Stack` kartu per row | `Table` `highlightOnHover` |
| Form create | `w="100%"` | `w="50%"` |
| Container publik | `w="100%"` | `w="80%"` |
| Grid kartu | `cols={1}` | `cols={2/4}` |

Props Mantine yang sering dipakai:
```tsx
visibleFrom="md"   // hanya tampil di ≥md
hiddenFrom="md"    // hanya tampil di <md
span={{ base: 12, md: 6 }}
fz={{ base: "sm", md: "lg" }}
p={{ base: "sm", md: "lg" }}
```

---

## 16. Konten Halaman Publik

### Landing Page

- Hero: foto/video desa, nama desa, sapaan kepala desa, jam operasional kantor
- Statistik cepat: jumlah penduduk, KK, banjar
- Modul layanan (slider/grid)
- Sosial media links
- Berita terbaru (polling tiap 30 detik)

### Domain Utama

| Domain | Konten Utama |
|---|---|
| PPID | Profil, Struktur, Visi Misi, Dasar Hukum, Permohonan Informasi |
| Desa | Profil, Potensi, Berita, Pengumuman, Gallery, Layanan, Penghargaan, Kalender Event Budaya |
| Kesehatan | Data Posyandu (balita, ibu hamil, ringkasan), Puskesmas, Program, Info Wabah |
| Kependudukan | Dashboard statistik, Data Per Banjar, Dinamika, Distribusi Agama/Umur |
| Ekonomi | UMKM, Lowongan Kerja, BUMDesa, PADesa, Transparansi APBDes (grafik + tabel) |
| Keamanan | Data keamanan wilayah |
| Lingkungan | Bank Sampah, Penghijauan, Gotong Royong |
| Pendidikan | Data lembaga pendidikan |
| Inovasi | Inovasi desa |
| Musik | Koleksi musik/gamelan |

### Transparansi APBDes

Grafik interaktif (Recharts) + tabel per tahun. Komponen `Mantine Transition` fade-slide saat ganti tahun. Staggered animation pada section cards.

### Survey Kepuasan Masyarakat

Form survei + hasil real-time via `Mantine BarChart` dan `PieChart`.

---

## 17. Rich Text Editor

File: `src/app/admin/(dashboard)/_com/createEditor.tsx`, `editEditor.tsx`

Editor memakai **Tiptap 3**. Konfigurasi wajib (`StarterKit.configure({ link: false, trailingNode: false })`, `shouldRerenderOnTransaction: true`, `setContent(value, { emitUpdate: false })`) dan alasannya ada di `docs/decisions/2026-11-04-mantine-8-staged-upgrade.md` §3.

Wrapper `Mantine RichTextEditor` (`@mantine/tiptap`) dengan ekstensi:
- Format: Bold, Italic, Underline, Strikethrough, Highlight, Code
- Struktur: H1, H2, H3, H4, Blockquote, BulletList, OrderedList
- Link: Link, Unlink
- Alignment: Left, Center, Right, Justify
- History: Undo, Redo

---

## 18. Upload & Preview Gambar

Pattern di halaman Create/Edit:

```tsx
<Box style={{ border: '2px dashed #ccc', borderRadius: 8, position: 'relative' }}>
  {preview
    ? <>
        <Image src={preview} alt="preview" height={200} fit="contain" />
        <ActionIcon
          color="red" variant="filled"
          style={{ position: 'absolute', top: 8, right: 8 }}
          onClick={() => { setFile(null); setPreview(null) }}
        >
          <IconX />
        </ActionIcon>
      </>
    : <Dropzone maxSize={5 * 1024 ** 2} accept={IMAGE_MIME_TYPE} onDrop={handleDrop}>
        <Text ta="center">Klik atau seret gambar ke sini</Text>
      </Dropzone>
  }
</Box>
```

---

## 19. Notifikasi & Feedback

| Situasi | Komponen |
|---|---|
| Success CRUD | `toast.success('...')` — react-toastify |
| Error CRUD | `toast.error('...')` — react-toastify |
| Konfirmasi hapus | `ModalKonfirmasiHapus` (Modal centered) |
| Konfirmasi nonaktif | `ModalKonfirmasiNonAktif` |
| Loading submit | `<Loader size="sm" color="white" />` di dalam Button |

---

## 20. File Kunci Design System

| File | Isi |
|---|---|
| `src/con/colors.ts` | Raw color palette |
| `src/utils/themeTokens.ts` | Token warna, tipografi, spacing, radius, shadows |
| `src/app/layout.tsx` | `createTheme` Mantine (font, overrides) |
| `src/components/admin/AdminThemeProvider.tsx` | Provider dark mode admin |
| `src/components/admin/UnifiedSurface.tsx` | UnifiedCard komponen |
| `src/components/admin/UnifiedTypography.tsx` | UnifiedTitle, UnifiedText, UnifiedPageHeader |
| `src/app/admin/(dashboard)/_com/header.tsx` | HeaderSearch |
| `src/app/admin/(dashboard)/_com/judulList.tsx` | JudulList |
| `src/app/admin/(dashboard)/_com/judulListTab.tsx` | JudulListTab |
| `src/app/admin/(dashboard)/_com/modalKonfirmasiHapus.tsx` | Modal konfirmasi delete |
| `src/app/admin/(dashboard)/_com/createEditor.tsx` | Rich text editor wrapper |
| `src/styles/dark-mode-table.css` | CSS override dark mode tabel |
| `src/app/darmasaba/layout.tsx` | Public site layout |
| `src/app/admin/layout.tsx` | Admin AppShell layout |
| `src/app/admin/_com/list_PageAdmin.tsx` | Konfigurasi menu sidebar |
