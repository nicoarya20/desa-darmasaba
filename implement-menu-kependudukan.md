📋 Rencana Implementasi Menu "Kependudukan" │
│ │
│ 🎯 Overview │
│ Membuat menu navbar baru "Kependudukan" dengan 5 halaman (1 dashboard + 4 fitur demografi) yang mencakup: │
│ 1. Dashboard Kependudukan - Summary cards (Total Penduduk, KK, Kelahiran, Kemiskinan) │
│ 2. Distribusi Agama - Pie/bar chart komposisi agama penduduk │
│ 3. Distribusi Umur - Bar/line chart distribusi umur penduduk (6 kelompok) │
│ 4. Data per Banjar - Tabel statistik per banjar │
│ 5. Dinamika Penduduk - Statistik migrasi (Pindah Masuk/Keluar) + Kelahiran/Kematian │
│ │
│ --- │
│ │
│ 📦 Phase 1: Database Schema (Prisma) │
│ │
│ 1.1 Model Baru │
│ 1 // Dashboard summary (opsional - bisa dihitung dari model lain) │
│ 2 model DashboardKependudukan { │
│ 3 id String @id @default(uuid()) │
│ 4 totalPenduduk Int │
│ 5 totalKK Int │
│ 6 totalKelahiran Int │
│ 7 totalKemiskinan Int │
│ 8 tahun Int │
│ 9 createdAt DateTime @default(now()) │
│ 10 updatedAt DateTime @updatedAt │
│ 11 } │
│ 12 │
│ 13 // Distribusi Agama │
│ 14 model DistribusiAgama { │
│ 15 id String @id @default(uuid()) │
│ 16 agama String // ISLAM, HINDU, KRISTEN, BUDDHA, dll │
│ 17 jumlah Int │
│ 18 tahun Int │
│ 19 createdAt DateTime @default(now()) │
│ 20 updatedAt DateTime @updatedAt │
│ 21 } │
│ 22 │
│ 23 // Distribusi Umur │
│ 24 model DistribusiUmur { │
│ 25 id String @id @default(uuid()) │
│ 26 rentangUmur String // "17-25", "26-35", "36-45", "46-55", "56-65", "65+" │
│ 27 jumlah Int │
│ 28 tahun Int │
│ 29 createdAt DateTime @default(now()) │
│ 30 updatedAt DateTime @updatedAt │
│ 31 } │
│ 32 │
│ 33 // Data per Banjar │
│ 34 model DataBanjar { │
│ 35 id String @id @default(uuid()) │
│ 36 nama String // Nama banjar │
│ 37 penduduk Int │
│ 38 kk Int │
│ 39 miskin Int │
│ 40 tahun Int │
│ 41 createdAt DateTime @default(now()) │
│ 42 updatedAt DateTime @updatedAt │
│ 43 } │
│ 44 │
│ 45 // Migrasi Penduduk (Pindah Masuk/Keluar) │
│ 46 model MigrasiPenduduk { │
│ 47 id String @id @default(uuid()) │
│ 48 jenis String // "MASUK" atau "KELUAR" │
│ 49 nama String │
│ 50 tanggal DateTime │
│ 51 asalTujuan String // Asal (untuk masuk) / Tujuan (untuk keluar) │
│ 52 alasan String? │
│ 53 createdAt DateTime @default(now()) │
│ 54 updatedAt DateTime @updatedAt │
│ 55 } │
│ │
│ --- │
│ │
│ 🔧 Phase 2: API Endpoints (Elysia.js) │
│ │
│ Buat route: /api/[[...slugs]]/kependudukan/ │
│ │
│ 2.1 Dashboard │
│ - GET /api/kependudukan/dashboard - Summary stats │
│ │
│ 2.2 Distribusi Agama │
│ - GET /api/kependudukan/distribusi-agama - List all │
│ - POST /api/kependudukan/distribusi-agama - Create │
│ - PUT /api/kependudukan/distribusi-agama/:id - Update │
│ - DELETE /api/kependudukan/distribusi-agama/:id - Delete │
│ │
│ 2.3 Distribusi Umur │
│ - GET /api/kependudukan/distribusi-umur - List all │
│ - POST /api/kependudukan/distribusi-umur - Create │
│ - PUT /api/kependudukan/distribusi-umur/:id - Update │
│ - DELETE /api/kependudukan/distribusi-umur/:id - Delete │
│ │
│ 2.4 Data Banjar │
│ - GET /api/kependudukan/banjar - List all │
│ - POST /api/kependudukan/banjar - Create │
│ - PUT /api/kependudukan/banjar/:id - Update │
│ - DELETE /api/kependudukan/banjar/:id - Delete │
│ │
│ 2.5 Migrasi │
│ - GET /api/kependudukan/migrasi - List all │
│ - POST /api/kependudukan/migrasi - Create │
│ - PUT /api/kependudukan/migrasi/:id - Update │
│ - DELETE /api/kependudukan/migrasi/:id - Delete │
│ │
│ --- │
│ │
│ 🎨 Phase 3: Public Pages (Darmasaba) │
│ │
│ 3.1 Navbar Update │
│ File: src/con/navbar-list-menu.ts │
│ 1 { │
│ 2 id: "10", │
│ 3 name: "Kependudukan", │
│ 4 children: [ │
│ 5 { id: "10.1", name: "Dashboard", href: "/darmasaba/kependudukan/dashboard" }, │
│ 6 { id: "10.2", name: "Distribusi Agama", href: "/darmasaba/kependudukan/distribusi-agama" }, │
│ 7 { id: "10.3", name: "Distribusi Umur", href: "/darmasaba/kependudukan/distribusi-umur" }, │
│ 8 { id: "10.4", name: "Data per Banjar", href: "/darmasaba/kependudukan/data-per-banjar" }, │
│ 9 { id: "10.5", name: "Dinamika Penduduk", href: "/darmasaba/kependudukan/dinamika-penduduk" } │
│ 10 ] │
│ 11 } │
│ │
│ 3.2 Page Structure │
│ 1 src/app/darmasaba/(pages)/kependudukan/ │
│ 2 ├── dashboard/ │
│ 3 │ └── page.tsx # Summary cards + overview charts │
│ 4 ├── distribusi-agama/ │
│ 5 │ └── page.tsx # Pie chart agama │
│ 6 ├── distribusi-umur/ │
│ 7 │ └── page.tsx # Bar chart umur │
│ 8 ├── data-per-banjar/ │
│ 9 │ └── page.tsx # Table + map (opsional) │
│ 10 └── dinamika-penduduk/ │
│ 11 └── page.tsx # Stats: Kelahiran, Kematian, Pindah Masuk/Keluar │
│ │
│ 3.3 Components Needed │
│ - SummaryCard.tsx - Card untuk statistik │
│ - AgamaChart.tsx - Pie chart (Recharts/Chart.js) │
│ - UmurChart.tsx - Bar chart │
│ - BanjarTable.tsx - Tabel data banjar │
│ - DinamikaStats.tsx - Panel statistik dinamika │
│ │
│ --- │
│ │
│ 🛠️ Phase 4: Admin Pages (CRUD) │
│ │
│ 4.1 Page Structure │
│ 1 src/app/admin/(dashboard)/kependudukan/ │
│ 2 ├── dashboard/ │
│ 3 │ └── page.tsx # Admin dashboard view │
│ 4 ├── distribusi-agama/ │
│ 5 │ ├── page.tsx # List │
│ 6 │ ├── create/page.tsx # Form create │
│ 7 │ └── [id]/edit/page.tsx # Form edit │
│ 8 ├── distribusi-umur/ │
│ 9 │ ├── page.tsx │
│ 10 │ ├── create/page.tsx │
│ 11 │ └── [id]/edit/page.tsx │
│ 12 ├── data-per-banjar/ │
│ 13 │ ├── page.tsx │
│ 14 │ ├── create/page.tsx │
│ 15 │ └── [id]/edit/page.tsx │
│ 16 └── dinamika-penduduk/ │
│ 17 ├── page.tsx │
│ 18 ├── create/page.tsx │
│ 19 └── [id]/edit/page.tsx │
│ │
│ 4.2 Admin Components │
│ - Form components untuk setiap entitas │
│ - DataTable untuk list view │
│ - Layout dengan tabs navigation (ikuti pola existing admin) │
│ │
│ --- │
│ │
│ 📊 Phase 5: Charts & Visualisasi │
│ │
│ Library │
│ Gunakan Recharts (sudah ada di project berdasarkan pola existing) atau Chart.js │
│ │
│ Charts Required │
│ 1. Pie Chart - Distribusi Agama │
│ 2. Bar Chart - Distribusi Umur (6 kelompok) │
│ 3. Table - Data Banjar │
│ 4. Summary Cards - Dashboard (4 cards) │
│ 5. Stat Panel - Dinamika Penduduk (4 stats) │
│ │
│ --- │
│ │
│ 📝 Implementation Order │
│ │
│ 1. ✅ Prisma Schema - Generate models & migrate DB │
│ 2. ✅ API Endpoints - CRUD untuk semua model │
│ 3. ✅ Admin Pages - CRUD interface (mulai dari 1 fitur dulu) │
│ 4. ✅ Public Pages - Display dengan charts │
│ 5. ✅ Navbar Update - Tambahkan menu baru │
│ 6. ✅ Testing - Verify semua fitur │
│ │
│ --- │
│ │
│ ⚙️ Technical Notes │
│ - Ikuti pola existing code (demografi-pekerjaan, kesehatan, dll) │
│ - Gunakan Mantine UI untuk components │
│ - TypeScript strict mode │
│ - Zod validation untuk forms │
│ - Responsive design (mobile-first) │
│ │
│ --- │
│ │
│ 🎯 Deliverables Per Fitur │
│ │
│ Setiap fitur akan memiliki: │
│ - [ ] Prisma model │
│ - [ ] API endpoints (GET, POST, PUT, DELETE) │
│ - [ ] Admin CRUD pages │
│ - [ ] Public display page dengan chart │
│ - [ ] Navbar menu entry │
│ │
│ Total: 5 fitur × 5 deliverables = 25 tasks │
│ │
│ ---
