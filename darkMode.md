# 🌙 Dark Mode Design Specification
## Admin Darmasaba – Dashboard & CMS

Dokumen ini mendefinisikan standar **Dark Mode UI** agar:
- nyaman di mata
- konsisten
- tidak flat
- tetap profesional untuk aplikasi pemerintahan

---

## 🎨 Color Palette (Dark Mode)

### Background Layers
| Layer | Token | Warna | Fungsi |
|------|------|------|------|
| Base | `--bg-base` | `#0B1220` | Background utama aplikasi |
| App | `--bg-app` | `#0F172A` | Area kerja utama |
| Card | `--bg-card` | `#162235` | Card / container |
| Surface | `--bg-surface` | `#1E2A3D` | Table header, tab, input |

---

### Border & Divider
| Token | Warna | Catatan |
|-----|------|--------|
| `--border-default` | `#2A3A52` | Border utama |
| `--border-soft` | `#22314A` | Divider halus |

> ❗ Hindari border terlalu tipis (`opacity < 20%`)

---

### Text Colors
| Jenis | Token | Warna |
|-----|------|------|
| Primary | `--text-primary` | `#E5E7EB` |
| Secondary | `--text-secondary` | `#9CA3AF` |
| Muted | `--text-muted` | `#6B7280` |
| Inverse | `--text-inverse` | `#020617` |

---

### Accent & Action
| Fungsi | Warna |
|------|------|
| Primary Action | `#3B82F6` |
| Hover | `#2563EB` |
| Active | `#1D4ED8` |
| Link | `#60A5FA` |

---

### Status Colors
| Status | Warna |
|------|------|
| Success | `#22C55E` |
| Warning | `#FACC15` |
| Error | `#EF4444` |
| Info | `#38BDF8` |

---

## 🧱 Layout Rules

### Sidebar
- Background: `--bg-app`
- Active menu:
  - Background: `rgba(59,130,246,0.15)`
  - Text: Primary
  - Indicator: kiri (2–3px accent bar)
- Hover:
  - Background: `rgba(255,255,255,0.04)`

---

### Header / Topbar
- Background: `linear-gradient(#0F172A → #0B1220)`
- Border bawah wajib (`--border-soft`)
- Icon:
  - Default: muted
  - Hover: primary

---

## 📦 Card & Section

### Card
- Background: `--bg-card`
- Border: `--border-default`
- Radius: 12–16px
- Jangan pakai shadow hitam

### Section Header
- Font weight lebih besar
- Text: primary
- Spacing jelas dari konten

---

## 📊 Table (Dark Mode Friendly)

### Table Header
- Background: `--bg-surface`
- Text: secondary
- Font weight: medium

### Table Row
- Default: transparent
- Hover:
  - Background: `rgba(255,255,255,0.03)`
- Divider antar row wajib terlihat

### Link di Table
- Warna link **lebih terang dari text**
- Hover underline

---

## 🔘 Button Rules

### Primary Button
- Background: Primary Action
- Text: Inverse
- Hover: darker shade

### Secondary Button
- Background: transparent
- Border: `--border-default`
- Text: primary

### Icon Button
- Default: muted
- Hover: primary + bg soft

---

## 🧭 Tab Navigation

- Inactive:
  - Text: muted
- Active:
  - Background: `rgba(59,130,246,0.15)`
  - Text: primary
  - Icon ikut berubah

---

## 🌗 Dark vs Light Mode Rule
- Layout, spacing, typography **HARUS SAMA**
- Yang boleh beda:
  - warna
  - border intensity
  - background layer

> ❌ Jangan ganti struktur UI antara dark & light

---

## ✅ Dark Mode Checklist
- [ ] Kontras teks terbaca
- [ ] Active state jelas
- [ ] Hover terasa hidup
- [ ] Tidak flat
- [ ] Tidak silau

---

Dokumen ini adalah **single source of truth** untuk Dark Mode.