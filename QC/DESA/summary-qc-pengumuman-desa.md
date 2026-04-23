# Quality Control Report - Pengumuman Desa Admin

**Lokasi:** `/src/app/admin/(dashboard)/desa/pengumuman/`  
**Tanggal QC:** 25 Februari 2026  
**Status:** ⚠️ **Needs Improvement** (ada issue critical yang perlu segera diperbaiki)

---

## 📋 Ringkasan Eksekutif

Halaman Pengumuman Desa memiliki implementasi yang **cukup baik** dengan CRUD lengkap dan state management terstruktur. Namun ditemukan **15 issue** dengan rincian:

- 🔴 **High Priority:** 2 issue
- 🟡 **Medium Priority:** 7 issue
- 🟢 **Low Priority:** 6 issue

**Overall Score: 6.5/10** - Needs Improvement

---

## 📁 Struktur File yang Diperiksa

```
/src/app/admin/(dashboard)/desa/pengumuman/
├── layout.tsx
├── _com/
│   └── layoutTabs.tsx          # Tab navigation component
├── kategori-pengumuman/
│   ├── page.tsx                # List kategori dengan search & pagination
│   ├── create/
│   │   └── page.tsx            # Form create kategori
│   └── [id]/
│       └── page.tsx            # Edit kategori
└── list-pengumuman/
    ├── page.tsx                # List pengumuman dengan search & pagination
    ├── create/
    │   └── page.tsx            # Form create pengumuman (rich text)
    └── [id]/
        ├── page.tsx            # Detail pengumuman
        └── edit/
            └── page.tsx        # Edit pengumuman
```

**File Terkait:**
- State: `/src/app/admin/(dashboard)/_state/desa/pengumuman.ts`
- API: `/src/app/api/[[...slugs]]/_lib/desa/pengumuman/` (9 files)
- API: `/src/app/api/[[...slugs]]/_lib/desa/pengumuman/kategori-pengumuman/` (6 files)
- Schema: `/prisma/schema.prisma` (Model `Pengumuman` & `CategoryPengumuman`)

---

## 🔴 HIGH PRIORITY ISSUES

### 1. API - Hard Delete vs Soft Delete Mismatch (DATA LOSS RISK)

**File:** `src/app/api/[[...slugs]]/_lib/desa/pengumuman/del.ts`

```typescript
export default async function pengumumanDelete(context: Context) {
  const id = context.params?.id as string;
  
  // ❌ HARD DELETE - Data benar-benar terhapus dari database
  await prisma.pengumuman.delete({ where: { id } });
  
  return { success: true, message: "Pengumuman berhasil dihapus" };
}
```

**Schema yang Diharapkan:**
```prisma
model Pengumuman {
  deletedAt DateTime? @default(null)  // Soft delete field
  isActive  Boolean @default(true)
}
```

**Dampak:**
- **DATA LOSS** - Data pengumuman terhapus permanen, tidak bisa direcover
- Audit trail hilang (riwayat pengumuman tidak ada lagi)
- Inconsistent dengan schema design yang sudah ada soft delete fields
- Bisa melanggar compliance requirements untuk data retention

**Solusi:**
```typescript
// Ganti hard delete dengan soft delete
export default async function pengumumanDelete(context: Context) {
  const id = context.params?.id as string;
  
  // ✅ SOFT DELETE - Update deletedAt dan isActive
  await prisma.pengumuman.update({
    where: { id },
    data: { 
      deletedAt: new Date(),
      isActive: false 
    }
  });
  
  return { success: true, message: "Pengumuman berhasil dihapus" };
}
```

**File yang Perlu Diperbaiki:**
- `src/app/api/[[...slugs]]/_lib/desa/pengumuman/del.ts`
- `src/app/api/[[...slugs]]/_lib/desa/pengumuman/kategori-pengumuman/del.ts`

---

### 2. Schema - `deletedAt` Default Value `now()` Bermasalah

**File:** `prisma/schema.prisma`

```prisma
model Pengumuman {
  id        String   @id @default(cuid())
  judul     String
  deletedAt DateTime @default(now())  // ❌ PROBLEMATIC DEFAULT
  isActive  Boolean  @default(true)
}

model CategoryPengumuman {
  id        String   @id @default(cuid())
  name      String   @unique
  deletedAt DateTime @default(now())  // ❌ PROBLEMATIC DEFAULT
  isActive  Boolean  @default(true)
}
```

**Dampak:**
- Setiap record **baru langsung ter-mark sebagai deleted** saat dibuat
- Query dengan filter `deletedAt: null` tidak akan dapat data baru
- Soft delete logic tidak bekerja dengan benar
- Data inconsistency antara `deletedAt` (set) dan `isActive` (true)

**Solusi:**
```prisma
model Pengumuman {
  id        String   @id @default(cuid())
  judul     String
  deletedAt DateTime?  // ✅ Nullable, tanpa default
  isActive  Boolean  @default(true)
}

model CategoryPengumuman {
  id        String   @id @default(cuid())
  name      String   @unique
  deletedAt DateTime?  // ✅ Nullable, tanpa default
  isActive  Boolean  @default(true)
}
```

**Migration Required:**
```bash
# Generate migration
bunx prisma migrate dev --name fix_deleted_at_default

# Atau jika tidak pakai migrate
bunx prisma db push

# Data cleanup untuk record yang sudah ter-affected
UPDATE "Pengumuman" SET "deletedAt" = NULL WHERE "isActive" = true;
UPDATE "CategoryPengumuman" SET "deletedAt" = NULL WHERE "isActive" = true;
```

---

## 🟡 MEDIUM PRIORITY ISSUES

### 3. UI - Search Parameter Hilang Saat Pagination

**File:** `src/app/admin/(dashboard)/desa/pengumuman/list-pengumuman/page.tsx`

```typescript
<Pagination
  total={totalPages}
  value={page}
  onChange={(newPage) => {
    load(newPage, 10);  // ❌ Missing search parameter
  }}
/>
```

**Dampak:**
- Saat user ganti halaman, search query hilang
- User harus ketik ulang search query
- UX sangat buruk untuk pagination dengan search
- Inconsistent dengan page lain (berita, potensi)

**Solusi:**
```typescript
<Pagination
  total={totalPages}
  value={page}
  onChange={(newPage) => {
    load(newPage, 10, debouncedSearch);  // ✅ Include search parameter
  }}
/>
```

**Note:** Pastikan function `load` menerima parameter search:
```typescript
const load = async (page: number, limit: number, searchQuery?: string) => {
  // ...
};
```

---

### 4. UI - Duplicate State Management

**File:** `src/app/admin/(dashboard)/desa/pengumuman/list-pengumuman/[id]/edit/page.tsx`

```typescript
// Local state
const [formData, setFormData] = useState({
  judul: '',
  deskripsi: '',
  content: '',
  categoryPengumumanId: '',
});

const [originalData, setOriginalData] = useState({...formData});

// Global state (Valtio)
editState.pengumuman.edit.form = {
  ...editState.pengumuman.edit.form,
  ...formData,  // ❌ Duplicate data
};
```

**Dampak:**
- Data inconsistency antara local state dan global state
- Sulit debug karena data ada di 2 tempat
- Memory overhead
- Potential bugs saat reset form

**Solusi:**

**Option A - Gunakan hanya global state:**
```typescript
// Hapus local state, gunakan langsung global state
const formData = editState.pengumuman.edit.form;

const handleResetForm = () => {
  editState.pengumuman.edit.form = { ...originalData };
};
```

**Option B - Sinkronisasi dengan useEffect:**
```typescript
useEffect(() => {
  // Sync local state ke global state
  editState.pengumuman.edit.form = { ...formData };
}, [formData]);
```

---

### 5. UI - Error Handling Silent Failures

**File:** `src/app/admin/(dashboard)/_state/desa/pengumuman.ts`

```typescript
// Line 266-268
catch (error) {
  console.log((error as Error).message);
  // ❌ Error tidak ditampilkan ke user, silent failure
}
```

**Dampak:**
- User tidak tahu ada error
- Sulit debug production issues
- User experience buruk (loading forever tanpa feedback)

**Solusi:**
```typescript
catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error('Failed to load pengumuman:', errorMessage);
  toast.error(`Gagal memuat data: ${errorMessage}`);
}
```

---

### 6. UI - ColSpan Mismatch

**File:** `src/app/admin/(dashboard)/desa/pengumuman/kategori-pengumuman/page.tsx`

```typescript
<TableThead>
  <TableTr>
    <TableTh>Nama</TableTh>
    <TableTh>Dibuat</TableTh>
    <TableTh>Aksi</TableTh>  {/* 3 kolom total */}
  </TableTr>
</TableThead>

<TableTbody>
  {loading ? (
    <TableTr>
      <TableTd colSpan={4}>  {/* ❌ colSpan 4, seharusnya 3 */}
        <Skeleton height={40} />
      </TableTd>
    </TableTr>
  ) : (
    // ...
  )}
</TableTbody>
```

**Dampak:** Layout table tidak rapi, colSpan terlalu lebar.

**Solusi:**
```typescript
<TableTd colSpan={3}>  // ✅ Match column count
```

---

### 7. State Management - Copy-Paste Error Message

**File:** `src/app/admin/(dashboard)/_state/desa/pengumuman.ts`

```typescript
// Line 68-70
kategoriPengumuman: {
  findMany: {
    loading: false,
    async load(page = 1, limit = 10, search = '') {
      try {
        // ...
      } catch (error) {
        console.error("Failed to load potensi desa:", res.data?.message);
        // ❌ Copy-paste error dari file potensi! Seharusnya "kategori pengumuman"
      }
    }
  }
}
```

**Dampak:**
- Membingungkan saat debug
- Tidak profesional
- Menunjukkan kurangnya attention to detail

**Solusi:**
```typescript
console.error("Failed to load kategori pengumuman:", res.data?.message);
```

---

### 8. UI - Button Text "Batal" Membingungkan

**File:** `src/app/admin/(dashboard)/desa/pengumuman/kategori-pengumuman/[id]/page.tsx`

```typescript
<Button
  onClick={handleResetForm}
  variant="outline"
  color="gray"
>
  Batal  // ❌ Membingungkan - "Batal" biasanya untuk cancel navigation
</Button>
```

**Dampak:** User mungkin bingung apakah button ini akan cancel edit atau reset form.

**Solusi:**
```typescript
<Button
  onClick={handleResetForm}
  variant="outline"
  color="gray"
>
  Reset Form  // ✅ Lebih jelas
</Button>
```

---

### 9. UI - Button Order Tidak Mengikuti UX Best Practice

**File:** `src/app/admin/(dashboard)/desa/pengumuman/list-pengumuman/[id]/page.tsx`

```typescript
<Group gap="sm">
  <Button color="red">  {/* Delete button first */}
  <Button color="green"> {/* Edit button second */}
</Group>
```

**Dampak:** Destructive action (delete) lebih prominent daripada primary action (edit).

**Solusi:**
```typescript
<Group gap="sm">
  <Button color="green">  {/* Edit button first */}
  <Button color="red">    {/* Delete button second */}
</Group>
```

**UX Best Practice:** Primary action (edit) seharusnya lebih prominent, destructive action (delete) kurang prominent dan lebih sulit diakses.

---

## 🟢 LOW PRIORITY ISSUES

### 10. UI - Inline Styles yang Panjang

**File:** `src/app/admin/(dashboard)/desa/pengumuman/_com/layoutTabs.tsx`

```typescript
<TabsList
  style={{
    background: "linear-gradient(135deg, #e7ebf7, #f9faff)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    border: "1px solid #d1d5db",
    padding: "0.5rem",
    borderRadius: "12px",
    display: "flex",
    gap: "0.5rem",
    // ... 10+ baris inline styles
  }}
>
```

**Dampak:**
- Sulit maintain
- Tidak reusable
- Code readability buruk

**Solusi:**
```typescript
// Option A: CSS module
// layoutTabs.module.css
.tabsList {
  background: linear-gradient(135deg, #e7ebf7, #f9faff);
  boxShadow: 0 2px 8px rgba(0,0,0,0.08);
  // ...
}

// Component
<TabsList className={styles.tabsList}>
```

**Option B: Mantine theme**
```typescript
// theme.ts
const theme = createTheme({
  components: {
    TabsList: {
      styles: {
        root: {
          background: "linear-gradient(135deg, #e7ebf7, #f9faff)",
          // ...
        }
      }
    }
  }
});
```

---

### 11. UI - Hardcoded Paths

**File:** `src/app/admin/(dashboard)/desa/pengumuman/_com/layoutTabs.tsx`

```typescript
const tabs = [
  { href: "/admin/desa/pengumuman/list-pengumuman" },
  { href: "/admin/desa/pengumuman/kategori-pengumuman" },
];
```

**Dampak:** Sulit refactor, jika ada perubahan struktur URL harus update di banyak tempat.

**Solusi:**
```typescript
// constants/routes.ts
export const ROUTES = {
  PENGUMUMAN_LIST: '/admin/desa/pengumuman/list-pengumuman',
  PENGUMUMAN_CREATE: '/admin/desa/pengumuman/list-pengumuman/create',
  PENGUMUMAN_EDIT: (id: string) => `/admin/desa/pengumuman/list-pengumuman/${id}/edit`,
  KATEGORI_PENGUMUMAN_LIST: '/admin/desa/pengumuman/kategori-pengumuman',
  KATEGORI_PENGUMUMAN_CREATE: '/admin/desa/pengumuman/kategori-pengumuman/create',
  KATEGORI_PENGUMUMAN_EDIT: (id: string) => `/admin/desa/pengumuman/kategori-pengumuman/${id}/edit`,
};

// Usage
const tabs = [
  { href: ROUTES.PENGUMUMAN_LIST },
  { href: ROUTES.KATEGORI_PENGUMUMAN_LIST },
];
```

---

### 12. UI - HTML Validation Function Bisa False Positive

**File:** `src/app/admin/(dashboard)/desa/pengumuman/list-pengumuman/create/page.tsx`

```typescript
const isHtmlEmpty = (html: string) => {
  const textContent = html.replace(/<[^>]*>/g, '').trim();
  return textContent === '';
};
```

**Dampak:**
- Konten dengan hanya `<br>` atau `<p> </p>` akan dianggap empty
- User bisa submit content yang sebenarnya kosong

**Solusi:**
```typescript
const isHtmlEmpty = (html: string) => {
  // Strip HTML tags
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  // Get text content and check if empty
  const textContent = tmp.textContent || tmp.innerText || '';
  return textContent.trim().length === 0;
};
```

---

### 13. State - Inconsistent API Client Usage

**File:** `src/app/admin/(dashboard)/_state/desa/pengumuman.ts`

```typescript
// ❌ Direct fetch
const res = await fetch(`/api/desa/kategoripengumuman/${id}`);
const data = await res.json();

// ✅ Di tempat lain pakai ApiFetch
const data = await ApiFetch.api.desa.kategoripengumuman[':id'].get({ query: { id } });
```

**Dampak:** Code maintainability kurang, tidak konsisten.

**Solusi:**
```typescript
// Gunakan ApiFetch untuk semua
const data = await ApiFetch.api.desa.kategoripengumuman[':id'].get({ query: { id } });
```

---

### 14. Layout - `isDetailPage` Logic Kurang Robust

**File:** `src/app/admin/(dashboard)/desa/pengumuman/layout.tsx`

```typescript
const segments = pathname.split('/').filter(Boolean);
const isDetailPage = segments.length >= 5;  // ❌ Magic number, bisa false positive
```

**Dampak:** Bisa false positive untuk path lain yang length sama.

**Contoh False Positive:**
```
/admin/desa/pengumuman/list-pengumuman/create  // 6 segments, dianggap detail page ❌
```

**Solusi:**
```typescript
// Check last segment
const lastSegment = segments[segments.length - 1];
const isDetailPage = ['create', 'edit'].includes(lastSegment) || 
                     /^[a-zA-Z0-9]{20,}$/.test(lastSegment);  // CUID pattern
```

---

### 15. API - Missing Validation

**File:** `src/app/api/[[...slugs]]/_lib/desa/pengumuman/create.ts`

```typescript
const body = await context.body;
// ❌ Tidak ada validasi uniqueness untuk judul
// ❌ Tidak ada validasi panjang maksimal
await prisma.pengumuman.create({
  data: {
    judul: body.judul,  // Bisa sangat panjang
    // ...
  }
});
```

**Dampak:**
- User bisa buat pengumuman dengan judul sama
- User bisa input judul/deskripsi sangat panjang
- Database bisa penuh dengan data tidak valid

**Solusi:**
```typescript
// Validasi di API
const body = await context.body;

// Check uniqueness
const existing = await prisma.pengumuman.findFirst({
  where: { 
    judul: body.judul,
    isActive: true
  }
});

if (existing) {
  return new Response(
    JSON.stringify({ 
      success: false, 
      message: "Judul pengumuman sudah digunakan" 
    }),
    { status: 400 }
  );
}

// Validate length
if (body.judul.length > 255) {
  return new Response(
    JSON.stringify({ 
      success: false, 
      message: "Judul maksimal 255 karakter" 
    }),
    { status: 400 }
  );
}
```

---

## ✅ YANG SUDAH BAIK

### **Schema:**
- ✅ Relasi yang jelas antara Pengumuman dan CategoryPengumuman (one-to-many)
- ✅ Soft delete pattern dengan `deletedAt` dan `isActive` (tapi ada bug di default value)
- ✅ Audit trail dengan `createdAt` dan `updatedAt`
- ✅ Unique constraint pada `name` di CategoryPengumuman

### **API:**
- ✅ CRUD lengkap untuk Pengumuman dan Kategori Pengumuman
- ✅ Pagination support dengan `page`, `limit`, `search`
- ✅ Search functionality dengan case-insensitive
- ✅ Include relasi (CategoryPengumuman) di response
- ✅ Validation input menggunakan Elysia `t.Object`
- ✅ Filter by kategori di find-many

### **UI/UX:**
- ✅ Konsisten design pattern
- ✅ Responsive untuk mobile dan desktop
- ✅ Loading states dan skeleton
- ✅ Toast notifications untuk feedback
- ✅ Form validation yang comprehensive
- ✅ Rich text editor (TipTap) untuk content
- ✅ Search dengan debounce (500ms-1000ms)
- ✅ Modal konfirmasi hapus
- ✅ Empty state message

### **State Management:**
- ✅ Valtio proxy untuk global state
- ✅ Zod validation schema
- ✅ Loading state management
- ✅ Auto-refresh after CRUD operations

---

## 📊 Metrics

| Aspek | Score | Keterangan |
|-------|-------|------------|
| **Schema Design** | 7/10 | Good, tapi ada bug di deletedAt default |
| **API Design** | 7/10 | RESTful, validation ada, tapi hard delete issue |
| **API Security** | 6/10 | Tidak ada authentication |
| **UI/UX** | 7.5/10 | Responsive, comprehensive validation |
| **State Management** | 7/10 | Valtio works well, ada inconsistency |
| **Code Quality** | 6.5/10 | Good structure, copy-paste errors, inline styles |

**Overall Score: 6.5/10** - **Needs Improvement**

---

## 🎯 Action Plan

### Week 1 (Critical Fixes) 🔴
- [ ] **URGENT:** Fix hard delete → soft delete di API del.ts
- [ ] **URGENT:** Fix `deletedAt @default(now())` di schema
- [ ] Fix pagination pass search parameter
- [ ] Fix colSpan mismatch

### Week 2 (Medium Priority) 🟡
- [ ] Consolidate state management (local vs global)
- [ ] Improve error handling (no silent failures)
- [ ] Fix error message typo ("potensi desa" → "kategori pengumuman")
- [ ] Rename button "Batal" → "Reset Form"
- [ ] Fix button order (edit before delete)

### Week 3 (Polish) 🟢
- [ ] Move inline styles to CSS module/theme
- [ ] Extract hardcoded paths to constants
- [ ] Fix HTML validation function
- [ ] Konsisten gunakan ApiFetch
- [ ] Fix isDetailPage logic
- [ ] Add uniqueness validation di API create

---

## 📝 Technical Notes

### **Database Migration:**

Fix deletedAt default dan cleanup data:
```bash
# Generate migration
bunx prisma migrate dev --name fix_deleted_at_default

# Atau jika tidak pakai migrate
bunx prisma db push

# Data cleanup
UPDATE "Pengumuman" SET "deletedAt" = NULL WHERE "isActive" = true;
UPDATE "CategoryPengumuman" SET "deletedAt" = NULL WHERE "isActive" = true;
```

### **Soft Delete Implementation:**

Update semua delete endpoint:
```typescript
// Before (hard delete)
await prisma.pengumuman.delete({ where: { id } });

// After (soft delete)
await prisma.pengumuman.update({
  where: { id },
  data: { 
    deletedAt: new Date(),
    isActive: false 
  }
});
```

### **API Testing:**

Test soft delete:
```bash
# 1. Create pengumuman
POST /api/desa/pengumuman/create
{ 
  "judul": "Test Pengumuman",
  "deskripsi": "Test",
  "content": "Test content",
  "categoryPengumumanId": "<id>"
}

# 2. Delete pengumuman
DELETE /api/desa/pengumuman/del/<id>

# 3. Verify soft delete (data masih ada tapi isActive = false)
GET /api/desa/pengumuman/<id>
# Expected: isActive = false, deletedAt != null
```

Test pagination dengan search:
1. Buka halaman List Pengumuman
2. Ketik search query (misal: "desa")
3. Klik pagination halaman 2
4. Verify search query masih ada dan result sesuai

---

## 📚 References

- [Prisma Soft Delete Pattern](https://www.prisma.io/docs/concepts/components/prisma-client/soft-delete)
- [Mantine Table Documentation](https://mantine.dev/core/table/)
- [React Toastify Documentation](https://fkhadra.github.io/react-toastify/)
- [Zod Documentation](https://zod.dev/)
- [TipTap Documentation](https://tiptap.dev/)

---

## 📈 Comparison dengan QC Sebelumnya

| Aspek | Profil Desa | Potensi Desa | Berita Desa | **Pengumuman** |
|-------|-------------|--------------|-------------|----------------|
| Schema | 6/10 | 7/10 | 8/10 | **7/10** |
| API Security | 4/10 | 6/10 | 6/10 | **6/10** |
| API Design | 7/10 | 8/10 | 7.5/10 | **7/10** |
| UI/UX | 8/10 | 8.5/10 | 8/10 | **7.5/10** |
| State Mgmt | 7/10 | 8/10 | 8/10 | **7/10** |
| Code Quality | 7/10 | 7.5/10 | 7/10 | **6.5/10** |
| **Overall** | **6.5/10** | **7.5/10** | **7/10** | **6.5/10** |

**Pengumuman** memiliki score yang sama dengan **Profil Desa** karena:
- ✅ Unique constraint pada `name` (CategoryPengumuman)
- ✅ Validation input di API
- ❌ Hard delete vs soft delete mismatch (critical)
- ❌ Copy-paste error messages
- ❌ Inline styles yang berlebihan
- ❌ Duplicate state management

---

**Dibuat oleh:** QC Automation  
**Review Status:** ⏳ Menunggu Review Developer  
**Next Review:** Setelah implementasi fixes
