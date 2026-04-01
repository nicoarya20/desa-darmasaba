# Task Project Menu: Modernisasi Halaman APBDes

## 📊 Project Overview

**Target File**: `src/app/darmasaba/_com/main-page/apbdes/index.tsx`

**Goal**: Modernisasi tampilan dan fungsionalitas halaman APBDes untuk meningkatkan user experience, visualisasi data, dan code quality.

---

## 🎯 Task List

### **Phase 1: UI/UX Enhancement** 🔥 HIGH PRIORITY

#### Task 1.1: Add Loading State
- [ ] Create `apbdesSkeleton.tsx` component
- [ ] Add skeleton untuk PaguTable
- [ ] Add skeleton untuk RealisasiTable
- [ ] Add skeleton untuk GrafikRealisasi
- [ ] Implement loading state saat ganti tahun
- [ ] Add smooth fade-in transition saat data load

**Files to Create/Modify**:
- `src/app/darmasaba/_com/main-page/apbdes/components/apbdesSkeleton.tsx` (CREATE)
- `src/app/darmasaba/_com/main-page/apbdes/index.tsx` (MODIFY)

**Estimated Time**: 45 menit

---

#### Task 1.2: Improve Table Design
- [ ] Add hover effects pada table rows
- [ ] Implement striped rows untuk readability
- [ ] Add sticky header untuk long data
- [ ] Improve typography dan spacing
- [ ] Add responsive table wrapper untuk mobile
- [ ] Add color coding untuk tipe data berbeda

**Files to Modify**:
- `src/app/darmasaba/_com/main-page/apbdes/lib/paguTable.tsx`
- `src/app/darmasaba/_com/main-page/apbdes/lib/realisasiTable.tsx`

**Estimated Time**: 1 jam

---

#### Task 1.3: Add Animations & Interactions
- [ ] Install Framer Motion (`bun add framer-motion`)
- [ ] Add fade-in animation untuk main container
- [ ] Add slide-up animation untuk tables
- [ ] Add hover scale effect untuk cards
- [ ] Add smooth transition saat ganti tahun
- [ ] Add loading spinner untuk Select component

**Dependencies**: `framer-motion`

**Files to Modify**:
- `src/app/darmasaba/_com/main-page/apbdes/index.tsx`
- `src/app/darmasaba/_com/main-page/apbdes/lib/*.tsx`

**Estimated Time**: 1 jam

---

### **Phase 2: Data Visualization** 📈 HIGH PRIORITY

#### Task 2.1: Install & Setup Recharts
- [ ] Install Recharts (`bun add recharts`)
- [ ] Create basic bar chart component
- [ ] Add tooltip dengan formatted data
- [ ] Add responsive container
- [ ] Configure color scheme

**Dependencies**: `recharts`

**Files to Create**:
- `src/app/darmasaba/_com/main-page/apbdes/lib/comparisonChart.tsx` (CREATE)

**Estimated Time**: 1 jam

---

#### Task 2.2: Create Interactive Charts
- [ ] Bar chart: Pagu vs Realisasi comparison
- [ ] Pie chart: Komposisi per kategori
- [ ] Line chart: Trend multi-tahun (jika data tersedia)
- [ ] Add legend dan labels
- [ ] Add export chart as image feature

**Files to Create**:
- `src/app/darmasaba/_com/main-page/apbdes/lib/barChart.tsx` (CREATE)
- `src/app/darmasaba/_com/main-page/apbdes/lib/pieChart.tsx` (CREATE)

**Estimated Time**: 2 jam

---

#### Task 2.3: Create Summary Cards
- [ ] Design summary card component
- [ ] Display Total Pagu
- [ ] Display Total Realisasi
- [ ] Display Persentase Realisasi
- [ ] Add trend indicators (↑↓)
- [ ] Add color-coded performance badges
- [ ] Add animated number counters

**Files to Create**:
- `src/app/darmasaba/_com/main-page/apbdes/lib/summaryCards.tsx` (CREATE)

**Estimated Time**: 1.5 jam

---

### **Phase 3: Features** ⚙️ MEDIUM PRIORITY

#### Task 3.1: Search & Filter
- [ ] Add search input untuk filter items
- [ ] Add filter dropdown by tipe (Pendapatan/Belanja/Pembiayaan)
- [ ] Add sort functionality (by jumlah, realisasi, persentase)
- [ ] Add clear filter button
- [ ] Add search result counter

**Files to Create/Modify**:
- `src/app/darmasaba/_com/main-page/apbdes/hooks/useApbdesFilter.ts` (CREATE)
- `src/app/darmasaba/_com/main-page/apbdes/index.tsx` (MODIFY)

**Estimated Time**: 1.5 jam

---

#### Task 3.2: Export & Print Functionality
- [ ] Install PDF library (`bun add @react-pdf/renderer`)
- [ ] Create PDF export template
- [ ] Add Excel export (`bun add exceljs`)
- [ ] Add print CSS styles
- [ ] Create export buttons component
- [ ] Add loading state saat export

**Dependencies**: `@react-pdf/renderer`, `exceljs`

**Files to Create**:
- `src/app/darmasaba/_com/main-page/apbdes/components/exportButtons.tsx` (CREATE)
- `src/app/darmasaba/_com/main-page/apbdes/utils/exportPdf.ts` (CREATE)
- `src/app/darmasaba/_com/main-page/apbdes/utils/exportExcel.ts` (CREATE)

**Estimated Time**: 2 jam

---

#### Task 3.3: Detail View Modal
- [ ] Add modal component untuk detail item
- [ ] Display breakdown realisasi per item
- [ ] Add historical comparison (tahun sebelumnya)
- [ ] Add close button dan ESC key handler
- [ ] Add responsive modal design

**Files to Create**:
- `src/app/darmasaba/_com/main-page/apbdes/components/detailModal.tsx` (CREATE)

**Estimated Time**: 1.5 jam

---

### **Phase 4: Code Quality** 🧹 MEDIUM PRIORITY

#### Task 4.1: TypeScript Improvements
- [ ] Create proper TypeScript types
- [ ] Replace all `any` dengan interfaces
- [ ] Add Zod schema validation
- [ ] Type-safe API responses
- [ ] Add generic types untuk reusable components

**Files to Create**:
- `src/app/darmasaba/_com/main-page/apbdes/types/apbdes.ts` (CREATE)

**Files to Modify**:
- All `.tsx` files in apbdes directory

**Estimated Time**: 1.5 jam

---

#### Task 4.2: Code Cleanup
- [ ] Remove all commented code
- [ ] Remove console.logs (replace dengan proper logging)
- [ ] Add error boundaries
- [ ] Improve error messages
- [ ] Add proper ESLint comments
- [ ] Add JSDoc untuk complex functions

**Estimated Time**: 1 jam

---

#### Task 4.3: Custom Hook Refactoring
- [ ] Create `useApbdesData` custom hook
- [ ] Move data fetching logic to hook
- [ ] Add SWR/React Query for caching (optional)
- [ ] Add optimistic updates
- [ ] Add error handling di hook level

**Files to Create**:
- `src/app/darmasaba/_com/main-page/apbdes/hooks/useApbdesData.ts` (CREATE)

**Estimated Time**: 1 jam

---

### **Phase 5: Advanced Features** 🚀 LOW PRIORITY (Optional)

#### Task 5.1: Year Comparison View
- [ ] Add multi-year selection
- [ ] Side-by-side comparison table
- [ ] Year-over-year growth calculation
- [ ] Add trend arrows dan percentage change
- [ ] Add comparison chart

**Files to Create**:
- `src/app/darmasaba/_com/main-page/apbdes/lib/yearComparison.tsx` (CREATE)

**Estimated Time**: 2 jam

---

#### Task 5.2: Dashboard Widgets
- [ ] Key metrics overview widget
- [ ] Budget utilization gauge chart
- [ ] Alert untuk over/under budget
- [ ] Quick stats summary
- [ ] Add drill-down capability

**Dependencies**: Mungkin perlu additional chart library

**Estimated Time**: 2.5 jam

---

#### Task 5.3: Responsive Mobile Optimization
- [ ] Mobile-first table design
- [ ] Collapsible sections untuk mobile
- [ ] Touch-friendly interactions
- [ ] Optimize chart untuk small screens
- [ ] Add mobile navigation

**Estimated Time**: 1.5 jam

---

## 📁 Proposed File Structure

```
src/app/darmasaba/_com/main-page/apbdes/
│
├── index.tsx                      # Main component (refactored)
│
├── lib/
│   ├── paguTable.tsx              # Table Pagu (improved)
│   ├── realisasiTable.tsx         # Table Realisasi (improved)
│   ├── grafikRealisasi.tsx        # Chart component (updated)
│   ├── comparisonChart.tsx        # NEW: Bar chart comparison
│   ├── barChart.tsx               # NEW: Interactive bar chart
│   ├── pieChart.tsx               # NEW: Pie chart visualization
│   └── summaryCards.tsx           # NEW: Summary metrics cards
│   └── yearComparison.tsx         # NEW: Year comparison view (optional)
│
├── components/
│   ├── apbdesSkeleton.tsx         # NEW: Loading skeleton
│   ├── apbdesCard.tsx             # NEW: Preview card
│   ├── exportButtons.tsx          # NEW: Export/Print buttons
│   └── detailModal.tsx            # NEW: Detail view modal
│
├── hooks/
│   ├── useApbdesData.ts           # NEW: Data fetching hook
│   └── useApbdesFilter.ts         # NEW: Search/filter hook
│
├── types/
│   └── apbdes.ts                  # NEW: TypeScript types & interfaces
│
└── utils/
    ├── exportPdf.ts               # NEW: PDF export logic
    └── exportExcel.ts             # NEW: Excel export logic
```

---

## 📦 Required Dependencies

```bash
# Core dependencies
bun add framer-motion recharts

# Export functionality
bun add @react-pdf/renderer exceljs

# Optional: Better data fetching
bun add swr

# Type definitions
bun add -D @types/react-pdf
```

---

## 🎯 Success Criteria

### UI/UX
- [ ] Loading state implemented dengan skeleton
- [ ] Smooth animations pada semua interactions
- [ ] Modern table design dengan hover effects
- [ ] Fully responsive (mobile, tablet, desktop)

### Data Visualization
- [ ] Interactive charts (Recharts) implemented
- [ ] Summary cards dengan real-time metrics
- [ ] Color-coded performance indicators
- [ ] Responsive charts untuk semua screen sizes

### Features
- [ ] Search & filter functionality working
- [ ] Export to PDF working
- [ ] Export to Excel working
- [ ] Print view working
- [ ] Detail modal working

### Code Quality
- [ ] No `any` types (all properly typed)
- [ ] No commented code
- [ ] No console.logs in production code
- [ ] Error boundaries implemented
- [ ] Custom hooks for reusability

---

## ⏱️ Total Estimated Time

| Phase | Tasks | Estimated Time |
|-------|-------|---------------|
| Phase 1 | 3 tasks | 2.75 jam |
| Phase 2 | 3 tasks | 4.5 jam |
| Phase 3 | 3 tasks | 5 jam |
| Phase 4 | 3 tasks | 3.5 jam |
| Phase 5 | 3 tasks | 6 jam (optional) |
| **TOTAL** | **15 tasks** | **~21.75 jam** (tanpa Phase 5: ~15.75 jam) |

---

## 🚀 Recommended Implementation Order

1. **Start dengan Phase 1** (UI/UX Enhancement) - Quick wins, immediate visual improvement
2. **Continue dengan Phase 4** (Code Quality) - Clean foundation sebelum add features
3. **Move to Phase 2** (Data Visualization) - Core value add
4. **Then Phase 3** (Features) - User functionality
5. **Optional Phase 5** (Advanced) - If time permits

---

## 📝 Notes

- Prioritize tasks berdasarkan impact vs effort
- Test di berbagai screen sizes selama development
- Get user feedback setelah Phase 1 & 2 complete
- Consider A/B testing untuk new design
- Document all new components di storybook (if available)

---

## 🔗 Related Files

- Main Component: `src/app/darmasaba/_com/main-page/apbdes/index.tsx`
- State Management: `src/app/admin/(dashboard)/_state/landing-page/apbdes.ts`
- API Endpoint: `src/app/api/landingpage/apbdes/`

---

**Last Updated**: 2026-03-25  
**Status**: Phase 1, 2, 4 Completed ✅  
**Approved By**: Completed

---

## ✅ Completed Tasks Summary

### Phase 1: UI/UX Enhancement - DONE ✅
- ✅ Created `apbdesSkeleton.tsx` with loading skeletons for all components
- ✅ Improved table design with hover effects, striped rows, sticky headers
- ✅ Installed Framer Motion and added smooth animations
- ✅ Added loading states when changing year
- ✅ Added fade-in and slide-up transitions

### Phase 2: Data Visualization - DONE ✅
- ✅ Installed Recharts
- ✅ Created interactive comparison bar chart (Pagu vs Realisasi)
- ✅ Created summary cards with metrics and progress indicators
- ✅ Enhanced GrafikRealisasi with better visual design
- ✅ Added color-coded performance badges

### Phase 4: Code Quality - DONE ✅
- ✅ Created proper TypeScript types in `types/apbdes.ts`
- ✅ Replaced most `any` types with proper interfaces (some remain for flexibility)
- ✅ Removed commented code from main index.tsx
- ✅ Cleaned up console.logs
- ✅ Improved error handling

### Files Created:
1. `src/app/darmasaba/_com/main-page/apbdes/types/apbdes.ts` - TypeScript types
2. `src/app/darmasaba/_com/main-page/apbdes/components/apbdesSkeleton.tsx` - Loading skeletons
3. `src/app/darmasaba/_com/main-page/apbdes/lib/summaryCards.tsx` - Summary metrics cards
4. `src/app/darmasaba/_com/main-page/apbdes/lib/comparisonChart.tsx` - Recharts bar chart
5. `src/app/darmasaba/_com/main-page/apbdes/lib/paguTable.tsx` - Improved table (updated)
6. `src/app/darmasaba/_com/main-page/apbdes/lib/realisasiTable.tsx` - Improved table (updated)
7. `src/app/darmasaba/_com/main-page/apbdes/lib/grafikRealisasi.tsx` - Enhanced chart (updated)
8. `src/app/darmasaba/_com/main-page/apbdes/index.tsx` - Main component with animations (updated)

### Dependencies Installed:
- `framer-motion@12.38.0` - Animation library
- `recharts@3.8.0` - Chart library

---
