# Quality Control Report - Potensi Desa Admin

**Lokasi:** `/src/app/admin/(dashboard)/desa/potensi/`  
**Tanggal QC:** 25 Februari 2026  
**Status:** ✅ **Good** (dengan area untuk improvement)

---

## 📋 Ringkasan Eksekutif

Halaman Potensi Desa memiliki implementasi yang **cukup baik** dengan CRUD lengkap, UI yang responsive, dan state management yang terstruktur. Ditemukan **15 issue** dengan rincian:

- 🔴 **High Priority:** 6 issue
- 🟡 **Medium Priority:** 6 issue
- 🟢 **Low Priority:** 3 issue

**Overall Score: 7.5/10** - Good

---

## 📁 Struktur File yang Diperiksa

```
/src/app/admin/(dashboard)/desa/potensi/
├── layout.tsx
├── _lib/
│   └── layoutTabs.tsx
├── kategori-potensi/
│   ├── page.tsx              # List kategori dengan search & pagination
│   ├── create/
│   │   └── page.tsx          # Form create kategori
│   └── [id]/
│       └── page.tsx          # Edit kategori
└── list-potensi/
    ├── page.tsx              # List potensi dengan search & pagination
    ├── create/
    │   └── page.tsx          # Form create potensi (rich text + image)
    └── [id]/
        ├── page.tsx          # Detail potensi
        └── edit/
            └── page.tsx      # Edit potensi
```

**File Terkait:**
- State: `/src/app/admin/(dashboard)/_state/desa/potensi.ts`
- API: `/src/app/api/[[...slugs]]/_lib/desa/potensi/` (10 files)
- API: `/src/app/api/[[...slugs]]/_lib/desa/potensi/kategori-potensi/` (5 files)
- Schema: `/prisma/schema.prisma` (Model `PotensiDesa` & `KategoriPotensi`)

---

## 🔴 HIGH PRIORITY ISSUES

### 1. Schema - Tidak Ada Unique Constraint pada `name` dan `nama`

**File:** `prisma/schema.prisma`

```prisma
model PotensiDesa {
  name       String   // ❌ Tidak ada @unique
  deskripsi  String
  // ...
}

model KategoriPotensi {
  nama       String   // ❌ Tidak ada @unique
  // ...
}
```

**Dampak:** 
- Bisa ada duplikasi nama kategori potensi (misal: "Pariwisata" muncul 2x)
- Bisa ada duplikasi judul potensi desa
- Menyulitkan user saat mencari data

**Solusi:**
```prisma
model PotensiDesa {
  name       String   @unique  // ✅ Add unique constraint
  // ...
}

model KategoriPotensi {
  nama       String   @unique  // ✅ Add unique constraint
  // ...
}
```

**Migration Required:**
```bash
bunx prisma db push
# atau
bunx prisma migrate dev --name add_unique_constraints
```

---

### 2. Schema - `kategoriId` Nullable Seharusnya Required

**File:** `prisma/schema.prisma`

```prisma
model PotensiDesa {
  kategoriId String?  // ❌ Nullable, seharusnya required
  // ...
}
```

**Dampak:** Potensi desa bisa dibuat tanpa kategori, tidak masuk akal secara bisnis.

**Solusi:**
```prisma
model PotensiDesa {
  kategoriId String   // ✅ Remove ? (required)
  // ...
}
```

**Note:** Perlu update form create/edit untuk validasi kategori wajib dipilih.

---

### 3. Schema - Tidak Ada Length Constraints

**File:** `prisma/schema.prisma`

```prisma
model PotensiDesa {
  name       String   // ❌ Tidak ada max length
  deskripsi  String   @db.Text
  // ...
}

model KategoriPotensi {
  nama       String   // ❌ Tidak ada max length
  // ...
}
```

**Dampak:** User bisa input nama sangat panjang, bisa break UI atau database.

**Solusi:**
```prisma
model PotensiDesa {
  name       String   @db.VarChar(255)  // ✅ Max 255 chars
  deskripsi  String   @db.Text
  // ...
}

model KategoriPotensi {
  nama       String   @db.VarChar(100)  // ✅ Max 100 chars
  // ...
}
```

---

### 4. API - Delete Kategori Tanpa Cek Relasi

**File:** `src/app/api/[[...slugs]]/_lib/desa/potensi/kategori-potensi/del.ts`

```typescript
export default async function kategoriPotensiDelete(context: Context) {
  const id = context.params?.id as string;
  
  // ❌ Tidak cek apakah kategori masih dipakai oleh PotensiDesa
  await prisma.kategoriPotensi.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false }
  });
  
  return { success: true, message: "Kategori potensi berhasil dihapus" };
}
```

**Dampak:** 
- Bisa terjadi foreign key constraint error
- Data inconsistency jika kategori masih dipakai

**Solusi:**
```typescript
// Cek apakah masih ada potensi yang menggunakan kategori ini
const existingPotensi = await prisma.potensiDesa.findFirst({
  where: { 
    kategoriId: id,
    isActive: true 
  }
});

if (existingPotensi) {
  return Response.json({
    success: false,
    message: "Kategori masih digunakan oleh potensi desa. Tidak dapat dihapus."
  }, { status: 400 });
}
```

---

### 5. API - `find-unique.ts` Tidak Filter `isActive`

**File:** `src/app/api/[[...slugs]]/_lib/desa/potensi/find-unique.ts`

```typescript
const data = await prisma.potensiDesa.findUnique({
  where: { id },  // ❌ Tidak cek isActive
  include: {
    image: true,
    kategori: true
  }
});
```

**Dampak:** Bisa load data yang sudah di-soft delete.

**Solusi:**
```typescript
const data = await prisma.potensiDesa.findUnique({
  where: { 
    id,
    isActive: true  // ✅ Add filter
  },
  include: {
    image: true,
    kategori: true
  }
});
```

---

### 6. UI - HTML Injection Risk (XSS Vulnerability)

**File:** Multiple pages

**`kategori-potensi/page.tsx`:**
```typescript
<TableTd dangerouslySetInnerHTML={{ __html: item.nama }} />
```

**`list-potensi/page.tsx`:**
```typescript
<TableTd dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
```

**Dampak:** 
- User bisa inject malicious script melalui rich text editor
- XSS attack bisa mencuri session atau data sensitif

**Solusi:**
```typescript
// Install: bun add dompurify
import DOMPurify from 'dompurify';

// Sanitize sebelum render
<TableTd 
  dangerouslySetInnerHTML={{ 
    __html: DOMPurify.sanitize(item.deskripsi, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: []
    }) 
  }} 
/>
```

**Alternatif (tanpa library):**
```typescript
// Strip HTML tags completely
const stripHtml = (html: string) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

<TableTd>{stripHtml(item.deskripsi)}</TableTd>
```

---

## 🟡 MEDIUM PRIORITY ISSUES

### 7. API - Inconsistent Naming Convention

**File:** API routes

```
potensi/
├── find-many.ts      // ❌ kebab-case
└── kategori-potensi/
    └── findMany.ts   // ❌ camelCase
```

**Dampak:** Membingungkan developer, tidak konsisten.

**Solusi:** Standardize ke **kebab-case** (konsisten dengan endpoint lain):
```bash
mv findMany.ts find-many.ts
mv findUnique.ts find-unique.ts
mv updt.ts update.ts
mv del.ts delete.ts
```

Update semua import di frontend.

---

### 8. UI - Pagination Tidak Pass Search Parameter

**File:** `src/app/admin/(dashboard)/desa/potensi/list-potensi/page.tsx`

```typescript
<Pagination
  value={page}
  onChange={(newPage) => {
    load(newPage, 10);  // ❌ Tidak ada search parameter
  }}
/>
```

**Dampak:** Saat ganti halaman, search query hilang.

**Solusi:**
```typescript
<Pagination
  value={page}
  onChange={(newPage) => {
    load(newPage, 10, search);  // ✅ Include search
  }}
/>
```

---

### 9. UI - colSpan Mismatch

**File:** `src/app/admin/(dashboard)/desa/potensi/kategori-potensi/page.tsx`

```typescript
<TableThead>
  <TableTr>
    <TableTh>Nama</TableTh>
    <TableTh>Dibuat</TableTh>
    <TableTh>Aksi</TableTh>  {/* 3 kolom */}
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

**Solusi:**
```typescript
<TableTd colSpan={3}>  // ✅ Match column count
```

---

### 10. UI - Alert Instead of Toast

**File:** `src/app/admin/(dashboard)/desa/potensi/kategori-potensi/create/page.tsx`

```typescript
if (!nama.trim()) {
  alert('Nama kategori potensi wajib diisi');  // ❌ Browser alert
  return;
}
```

**Dampak:** Browser alert blocking, UX buruk, tidak konsisten dengan page lain.

**Solusi:**
```typescript
import { toast } from 'react-toastify';

if (!nama.trim()) {
  toast.error('Nama kategori potensi wajib diisi');  // ✅ Toast notification
  return;
}
```

---

### 11. UI - Missing useEffect Dependencies

**File:** `src/app/admin/(dashboard)/desa/potensi/list-potensi/page.tsx`

```typescript
useEffect(() => {
  potensiState.kategoriPotensi.findMany.load();
  load(page, 10, debouncedSearch);
}, [page, debouncedSearch]);  // ❌ Missing potensiState
```

**Dampak:** ESLint warning, potential stale closure.

**Solusi:**
```typescript
useEffect(() => {
  potensiState.kategoriPotensi.findMany.load();
  load(page, 10, debouncedSearch);
}, [page, debouncedSearch, potensiState]);  // ✅ Add missing dep
```

**Note:** Atau gunakan `useCallback` untuk `load` function.

---

### 12. UI - Dropzone Accept Tidak Specify Extensions

**File:** `src/app/admin/(dashboard)/desa/potensi/list-potensi/create/page.tsx`

```typescript
<Dropzone
  accept={{ "image/*": [] }}  // ❌ Terlalu general
  // ...
>
```

**Dampak:** User bisa upload format image aneh yang tidak didukung browser.

**Solusi:**
```typescript
<Dropzone
  accept={{ 
    "image/*": ['.jpeg', '.jpg', '.png', '.webp']  // ✅ Specify extensions
  }}
  // ...
>
```

---

## 🟢 LOW PRIORITY ISSUES

### 13. UI - Magic Number untuk Detail Page Detection

**File:** `src/app/admin/(dashboard)/desa/potensi/layout.tsx`

```typescript
const isDetailPage = segments.length >= 5;  // ❌ Magic number
```

**Dampak:** Tidak jelas maksudnya, brittle jika ada perubahan route structure.

**Solusi:**
```typescript
const isDetailPage = segments.includes('[id]') || 
                     segments.some(s => !['create', 'edit'].includes(s) && s.match(/^\w+$/));

// Atau lebih baik lagi:
const isDetailPage = segments.some(s => s.match(/^[a-zA-Z0-9]{20,}$/));  // CUID pattern
```

---

### 14. API - Inconsistent Error Handling

**File:** Multiple API handlers

**Contoh inconsistency:**
```typescript
// File A - Return object
return { success: false, message: "Error" };

// File B - Throw error
throw new Error("Something went wrong");

// File C - Return Response
return Response.json({ success: false }, { status: 500 });
```

**Solusi:** Standardize ke satu format:
```typescript
// Always return Response.json dengan format konsisten
return Response.json({
  success: false,
  message: "Error message",
  data: null
}, { status: 500 });
```

---

### 15. State - Inconsistent Loading State

**File:** `src/app/admin/(dashboard)/_state/desa/potensi.ts`

```typescript
delete: {
  loading: false,
  async byId(id: string) {
    try {
      // ❌ Loading di-set di dalam async function
      potensiDesa.delete.loading = true;
      // ...
    } finally {
      potensiDesa.delete.loading = false;
    }
  }
}
```

**Solusi:** Konsisten set loading di awal dan reset di finally untuk semua operation.

---

## ✅ YANG SUDAH BAIK

### **Schema:**
- ✅ Soft delete dengan `deletedAt` dan `isActive`
- ✅ Relasi yang jelas antara PotensiDesa dan KategoriPotensi
- ✅ Relasi ke FileStorage untuk gambar
- ✅ Timestamp lengkap (createdAt, updatedAt)

### **API:**
- ✅ CRUD lengkap untuk kedua entitas
- ✅ Pagination support dengan `page`, `limit`, `search`
- ✅ Search functionality dengan case-insensitive
- ✅ Include relasi (image, kategori) pada find-many dan find-unique
- ✅ File cleanup (hapus file fisik + database) saat update/delete
- ✅ Response format konsisten: `{ success, message, data }`

### **UI/UX:**
- ✅ Konsisten design pattern
- ✅ Responsive untuk mobile dan desktop
- ✅ Loading states dan skeleton
- ✅ Toast notifications untuk feedback
- ✅ Form validation yang comprehensive
- ✅ Rich text editor dengan toolbar lengkap
- ✅ Image upload dengan preview dan delete button
- ✅ Search dengan debounce
- ✅ Modal konfirmasi hapus

---

## 📊 Metrics

| Aspek | Score | Keterangan |
|-------|-------|------------|
| **Schema Design** | 7/10 | Good, tapi perlu unique constraints |
| **API Design** | 8/10 | RESTful, konsisten, perlu standardisasi naming |
| **API Security** | 6/10 | Tidak ada auth, XSS vulnerability |
| **UI/UX** | 8.5/10 | Responsive, comprehensive validation |
| **State Management** | 8/10 | Valtio works well, minor inconsistency |
| **Code Quality** | 7.5/10 | Good structure, beberapa bug minor |

**Overall Score: 7.5/10** - **Good**

---

## 🎯 Action Plan

### Week 1 (Critical Fixes)
- [ ] Add unique constraint pada `name` dan `nama` di schema
- [ ] Make `kategoriId` required di schema
- [ ] Add length constraints (@db.VarChar)
- [ ] Fix delete kategori dengan relation check
- [ ] Add `isActive` filter di find-unique API
- [ ] Add HTML sanitization (DOMPurify)

### Week 2 (Medium Priority)
- [ ] Standardize API naming (kebab-case)
- [ ] Fix pagination pass search parameter
- [ ] Fix colSpan mismatch
- [ ] Replace alert dengan toast
- [ ] Fix useEffect dependencies
- [ ] Specify dropzone extensions

### Week 3 (Polish)
- [ ] Remove magic number di layout
- [ ] Standardize error handling di API
- [ ] Fix loading state consistency
- [ ] Add authentication middleware
- [ ] Add unit tests untuk critical functions

---

## 📝 Technical Notes

### **Database Migration:**

Setelah update schema:
```bash
# Generate migration
bunx prisma migrate dev --name add_unique_and_length_constraints

# Atau jika tidak pakai migrate
bunx prisma db push

# Handle duplicate data (jika ada)
# Query manual untuk merge/delete duplicates
```

### **HTML Sanitization:**

Install DOMPurify:
```bash
bun add dompurify
bun add -D @types/dompurify
```

Usage:
```typescript
import DOMPurify from 'dompurify';

// Di component
const sanitizedContent = DOMPurify.sanitize(htmlContent, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3'],
  ALLOWED_ATTR: []
});

<div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
```

### **API Testing:**

Test delete kategori dengan relasi:
```bash
# 1. Create kategori
POST /api/desa/kategoripotensi/create
{ "nama": "Test Kategori" }

# 2. Create potensi dengan kategori tersebut
POST /api/desa/potensi/create
{ 
  "name": "Test Potensi",
  "kategoriId": "<kategori_id>",
  ...
}

# 3. Try delete kategori (should fail)
DELETE /api/desa/kategoripotensi/del/<kategori_id>
# Expected: { success: false, message: "Kategori masih digunakan..." }
```

---

## 📚 References

- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Mantine Table Documentation](https://mantine.dev/core/table/)
- [React Toastify Documentation](https://fkhadra.github.io/react-toastify/)

---

**Dibuat oleh:** QC Automation  
**Review Status:** ⏳ Menunggu Review Developer  
**Next Review:** Setelah implementasi fixes
