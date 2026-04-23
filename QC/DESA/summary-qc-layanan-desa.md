# Quality Control Report - Layanan Desa Admin

**Lokasi:** `/src/app/admin/(dashboard)/desa/layanan/`  
**Tanggal QC:** 25 Februari 2026  
**Status:** ⚠️ **Needs Improvement** (ada issue critical dan incomplete features)

---

## 📋 Ringkasan Eksekutif

Halaman Layanan Desa memiliki **5 modul** dengan implementasi yang **bervariasi**. Ditemukan **15 issue** dengan rincian:

- 🔴 **High Priority:** 4 issue
- 🟡 **Medium Priority:** 5 issue
- 🟢 **Low Priority:** 6 issue

**Overall Score: 6.5/10** - Needs Improvement

---

## 📁 Struktur File yang Diperiksa

```
/src/app/admin/(dashboard)/desa/layanan/
├── layout.tsx
├── ajukan_permohonan/
│   ├── page.tsx                # List permohonan dengan search & pagination
│   └── [id]/
│       ├── page.tsx            # Detail permohonan
│       └── edit/
│           └── page.tsx        # Edit permohonan
├── pelayanan_penduduk_non_permanent/
│   ├── page.tsx                # ⚠️ Preview only (hardcoded ID)
│   └── [id]/
│       └── page.tsx            # Edit form
├── pelayanan_perizinan_berusaha/
│   ├── page.tsx                # ⚠️ Preview only dengan stepper (hardcoded ID)
│   └── [id]/
│       └── page.tsx            # Edit form
├── pelayanan_surat_keterangan/
│   ├── page.tsx                # List surat keterangan
│   ├── create/
│   │   └── page.tsx            # Create dengan dual image upload
│   └── [id]/
│       ├── page.tsx            # Detail
│       └── edit/
│           └── page.tsx        # Edit dengan dual image upload
└── pelayanan_telunjuk_sakti_desa/
    ├── page.tsx                # List telunjuk sakti desa
    ├── create/
    │   └── page.tsx            # Create form
    └── [id]/
        ├── page.tsx            # Detail
        └── edit/
            └── page.tsx        # Edit form
```

**File Terkait:**
- State: `/src/app/admin/(dashboard)/_state/desa/layananDesa.ts` (1050 baris)
- API: `/src/app/api/[[...slugs]]/_lib/desa/layanan/` (5 modul)
- Schema: `/prisma/schema.prisma` (5 models)

---

## 🔴 HIGH PRIORITY ISSUES

### 1. API - Inconsistent Delete Endpoint

**File:** `src/app/api/[[...slugs]]/_lib/desa/layanan/pelayanan_telunjuk_sakti_desa/index.ts`

```typescript
// Line 38-40
.delete("/:id", pelayananTelunjukSaktiDesaDelete)  // ❌ Inconsistent
```

**Bandingkan dengan modul lain:**
```typescript
// pelayanan_surat_keterangan/index.ts
.delete("/del/:id", pelayananSuratKeteranganDelete)  // ✅ Consistent

// pelayanan_surat_keterangan/index.ts line 34
.delete("/del/:id", pelayananSuratKeteranganDelete)
```

**State Management memanggil:**
```typescript
// layananDesa.ts line 501
const response = await fetch(`/api/desa/layanan/pelayanantelunjuksaktidesa/del/${id}`, {
  method: "DELETE",
});
// ❌ State panggil /del/${id} tapi API endpoint adalah /:id
```

**Dampak:**
- Delete tidak akan bekerja (404 Not Found)
- User tidak bisa hapus data
- Data inconsistency

**Severity:** 🔴 **HIGH** - Feature broken

**Solusi:**
```typescript
// File: pelayanan_telunjuk_sakti_desa/index.ts
.delete("/del/:id", pelayananTelunjukSaktiDesaDelete)  // ✅ Consistent dengan modul lain
```

---

### 2. API - Missing Endpoints (INCOMPLETE FEATURE)

**File:** `src/app/api/[[...slugs]]/_lib/desa/layanan/pelayanan_perizinan_berusaha/`

```
Current files:
├── findUnique.ts    ✅
└── updt.ts          ✅

Missing files:
❌ find-many.ts      # Tidak ada list dengan pagination
❌ create.ts          # Tidak ada create
❌ del.ts             # Tidak ada delete
```

**Same issue untuk:** `pelayanan_penduduk_non_permanen/`

**Dampak:**
- **Tidak ada list page dengan pagination** - hanya preview hardcoded
- **Tidak ada create functionality** - data tidak bisa ditambah
- **Tidak ada delete functionality** - data tidak bisa dihapus
- **Feature incomplete** - hanya bisa edit data yang sudah ada

**Severity:** 🔴 **HIGH** - Incomplete feature

**Solusi:**

**Create `find-many.ts`:**
```typescript
import { prisma } from "@/lib/prisma";
import { Context } from "elysia";

export default async function findMany(context: Context) {
  try {
    const { page = 1, limit = 10, search = "" } = context.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { isActive: true };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { deskripsi: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [data, total] = await Promise.all([
      prisma.pelayananPerizinanBerusaha.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.pelayananPerizinanBerusaha.count({ where })
    ]);

    return {
      success: true,
      message: "Data retrieved successfully",
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { success: false, message: "Failed to fetch data" };
  }
}
```

**Create `create.ts`:**
```typescript
import { prisma } from "@/lib/prisma";
import { Context } from "elysia";

export default async function create(context: Context) {
  try {
    const body = await context.body;
    
    // Validation
    if (!body.name || !body.deskripsi || !body.link) {
      return Response.json({
        success: false,
        message: "All fields are required"
      }, { status: 400 });
    }

    const created = await prisma.pelayananPerizinanBerusaha.create({
      data: {
        name: body.name,
        deskripsi: body.deskripsi,
        link: body.link,
      }
    });

    return {
      success: true,
      message: "Data created successfully",
      data: created
    };
  } catch (error) {
    console.error("Error creating data:", error);
    return { success: false, message: "Failed to create data" };
  }
}
```

**Create `del.ts`:**
```typescript
import { prisma } from "@/lib/prisma";
import { Context } from "elysia";

export default async function del(context: Context) {
  try {
    const id = context.params?.id as string;

    // Soft delete
    await prisma.pelayananPerizinanBerusaha.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false
      }
    });

    return {
      success: true,
      message: "Data deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting data:", error);
    return { success: false, message: "Failed to delete data" };
  }
}
```

**Update API route index:**
```typescript
// index.ts
import findMany from "./find-many";
import create from "./create";
import del from "./del";

export const pelayananPerizinanBerusahaRoutes = (app: Elysia) =>
  app
    .get("/api/desa/layanan/pelayananperizinanberusaha/find-many", findMany)
    .post("/api/desa/layanan/pelayananperizinanberusaha/create", create)
    .delete("/api/desa/layanan/pelayananperizinanberusaha/del/:id", del);
```

---

### 3. UI - Hardcoded ID 'edit' (CRITICAL)

**File:** `src/app/admin/(dashboard)/desa/layanan/pelayanan_penduduk_non_permanent/page.tsx`

```typescript
// Line 22
const { data, loading } = useSnapshot(pelayananPendudukNonPermanenState.findUnique);

useEffect(() => {
  pelayananPendudukNonPermanenState.findUnique.load('edit');  // ❌ HARDCODED ID
}, []);
```

**Same issue di:** `pelayanan_perizinan_berusaha/page.tsx` line 36

```typescript
useEffect(() => {
  pelayananPerizinanBerusahaState.findUnique.load("edit");  // ❌ HARDCODED ID
}, []);
```

**Dampak:**
- Data yang di-load selalu ID `'edit'` (data pertama?)
- Tidak dinamis
- Jika tidak ada data dengan ID `'edit'`, page kosong
- **Ini seharusnya list page, bukan preview single data**

**Severity:** 🔴 **HIGH** - Logic error

**Solusi:**

**Option A - Convert ke List Page (Recommended):**
```typescript
// page.tsx should be a list page with pagination
const { data, loading } = useSnapshot(pelayananPendudukNonPermanenState.findMany);

useEffect(() => {
  pelayananPendudukNonPermanenState.findMany.load(page, limit, search);
}, [page, limit, search]);
```

**Option B - Remove Hardcoded Page:**
```typescript
// Jika memang hanya ada 1 data, remove page.tsx
// Direct ke edit page atau detail page
```

---

### 4. State Management - Wrong Variable Assignment (BUG)

**File:** `src/app/admin/(dashboard)/_state/desa/layananDesa.ts`

```typescript
// Line 468-470
} catch (error) {
  console.error("Error fetching telunjuk sakti desa:", error);
  suratKeterangan.findMany.total = 0;  // ❌ WRONG VARIABLE!
  suratKeterangan.findMany.totalPages = 1;  // ❌ WRONG VARIABLE!
}
```

**Should be:**
```typescript
} catch (error) {
  console.error("Error fetching telunjuk sakti desa:", error);
  pelayananTelunjukSaktiDesa.findMany.total = 0;  // ✅ Correct
  pelayananTelunjukSaktiDesa.findMany.totalPages = 1;  // ✅ Correct
}
```

**Dampak:**
- `pelayananTelunjukSaktiDesa.findMany.total` tidak di-set saat error
- Pagination tidak bekerja dengan benar
- Bisa infinite loading atau wrong pagination display

**Severity:** 🔴 **HIGH** - Bug

**Solusi:** Fix variable names immediately.

---

## 🟡 MEDIUM PRIORITY ISSUES

### 5. State - Missing Validation for `link` Field

**File:** `src/app/admin/(dashboard)/_state/desa/layananDesa.ts`

```typescript
// Line 28-32
const templateTelunjukSaktiDesaForm = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
  // ❌ Missing link field validation!
});
```

**Dampak:**
- User bisa submit dengan link kosong atau invalid URL
- Data inconsistency
- Broken links di frontend

**Severity:** 🟡 **MEDIUM** - Validation gap

**Solusi:**
```typescript
const templateTelunjukSaktiDesaForm = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  deskripsi: z.string().min(3, "Deskripsi minimal 3 karakter"),
  link: z.string().url("Link harus URL yang valid"),  // ✅ Add validation
});
```

**Same issue untuk:** `pelayananPerizinanBerusahaForm`

---

### 6. UI - Inconsistent Edit Page Structure

**Current structure:**

| Module | Edit Page Location |
|--------|-------------------|
| `ajukan_permohonan` | `[id]/edit/page.tsx` ✅ |
| `pelayanan_surat_keterangan` | `[id]/edit/page.tsx` ✅ |
| `pelayanan_telunjuk_sakti_desa` | `[id]/edit/page.tsx` ✅ |
| `pelayanan_penduduk_non_permanent` | `[id]/page.tsx` ❌ |
| `pelayanan_perizinan_berusaha` | `[id]/page.tsx` ❌ |

**Dampak:**
- Inconsistent user experience
- Confusing navigation
- Harder to maintain

**Severity:** 🟡 **MEDIUM** - UX inconsistency

**Solusi:**
- Move edit logic from `[id]/page.tsx` to `[id]/edit/page.tsx`
- Or convert `[id]/page.tsx` to detail view only

---

### 7. UI - Missing Create Functionality

**Modules without create:**

| Module | Create Page | Create API |
|--------|-------------|------------|
| `pelayanan_penduduk_non_permanent` | ❌ | ❌ |
| `pelayanan_perizinan_berusaha` | ❌ | ❌ |

**Dampak:**
- **Data tidak bisa ditambah** dari admin panel
- Data hanya bisa di-seed dari database atau cara lain
- Feature incomplete

**Severity:** 🟡 **MEDIUM** - Missing feature

**Solusi:**
- Create `create/page.tsx` untuk kedua modul
- Add corresponding API endpoints (lihat Issue #2)

---

### 8. API - Inconsistent Response Format

**Examples:**

```typescript
// pelayanan_surat_keterangan/create.ts
return {
  success: true,
  message: "Sukses menambahkan data",
  data: created
};

// pelayanan_telunjuk_sakti_desa/create.ts
return new Response(
  JSON.stringify({
    status: 200,
    message: "Sukses menambahkan data",
    data: created
  })
);

// ajukan_permohonan/del.ts
return {
  status: 200,
  message: "Sukses menghapus data"
};
```

**Dampak:**
- Frontend harus handle multiple response formats
- Confusing untuk developer
- Harder to maintain

**Severity:** 🟡 **MEDIUM** - Code quality

**Solusi:**
```typescript
// Standardize response format
return {
  success: boolean,
  message: string,
  data?: any,
  // Optional: status code if needed
};
```

---

### 9. UI - Client-Side Search Instead of Server-Side

**File:** `src/app/admin/(dashboard)/desa/layanan/pelayanan_surat_keterangan/page.tsx`

```typescript
// Line 50-57
const filteredData = useMemo(() => {
  if (!search) return data || [];
  return (data || []).filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.deskripsi.toLowerCase().includes(search.toLowerCase())
  );
}, [data, search]);
```

**Dampak:**
- Semua data di-load dari server (no server-side filtering)
- Performance issue jika data banyak
- Pagination tidak bekerja dengan benar (filter setelah pagination)

**Severity:** 🟡 **MEDIUM** - Performance issue

**Solusi:**
```typescript
// Pass search to API
const load = async (page: number, limit: number, search: string) => {
  pelayananSuratKeteranganState.findMany.loading = true;
  try {
    const res = await ApiFetch.api.desa.layanan.pelayanansuratketerangan['find-many'].get({
      query: { page, limit, search }
    });
    // ...
  }
};
```

---

## 🟢 LOW PRIORITY ISSUES

### 10. UI - Table Fixed Layout Without Column Widths

**File:** Multiple list pages

```typescript
<Table layout="fixed">
  <TableThead>
    <TableTr>
      <TableTh>Nama</TableTh>
      <TableTh>Deskripsi</TableTh>
      <TableTh>Aksi</TableTh>
    </TableTr>
  </TableThead>
</Table>
```

**Dampak:** Column widths tidak konsisten, bisa break layout.

**Severity:** 🟢 **LOW** - UI polish

**Solusi:**
```typescript
<Table layout="fixed">
  <TableThead>
    <TableTr>
      <TableTh w="30%">Nama</TableTh>
      <TableTh w="50%">Deskripsi</TableTh>
      <TableTh w="20%">Aksi</TableTh>
    </TableTr>
  </TableThead>
</Table>
```

---

### 11. State - Inconsistent Ordering

**File:** Multiple state files

```typescript
// ajukan_permohonan/findMany.ts
orderBy: { createdAt: 'asc' }  // ❌ Ascending

// pelayanan_surat_keterangan/find-many.ts
orderBy: { createdAt: 'desc' }  // ✅ Descending
```

**Dampak:** Inconsistent data display (oldest first vs newest first).

**Severity:** 🟢 **LOW** - UX consistency

**Solusi:** Standardize to `orderBy: { createdAt: 'desc' }` for all modules.

---

### 12. UI - Missing Loading States (Some Edit Pages)

**File:** Some edit pages

```typescript
useEffect(() => {
  state.load(params.id);
}, [params.id]);

// ❌ No loading state check
return (
  <form>
    {/* Form fields */}
  </form>
);
```

**Dampak:** Form bisa render dengan empty data saat loading.

**Severity:** 🟢 **LOW** - UX polish

**Solusi:**
```typescript
const [loading, setLoading] = useState(true);

useEffect(() => {
  state.load(params.id).finally(() => setLoading(false));
}, [params.id]);

if (loading) {
  return <Skeleton height={400} radius="md" />;
}

return (
  <form>
    {/* Form fields */}
  </form>
);
```

---

### 13. UI - Memory Leak Potential (createObjectURL)

**File:** Multiple create/edit pages with image upload

```typescript
useEffect(() => {
  if (file) {
    const url = URL.createObjectURL(file);
    setPreviewImage(url);
  }
}, [file]);

// ❌ No cleanup
```

**Dampak:** Memory leak jika user upload banyak gambar.

**Severity:** 🟢 **LOW** - Performance

**Solusi:**
```typescript
useEffect(() => {
  if (file) {
    const url = URL.createObjectURL(file);
    setPreviewImage(url);
    
    return () => {
      URL.revokeObjectURL(url);  // ✅ Cleanup
    };
  }
}, [file]);
```

---

### 14. Schema - `deletedAt @default(now())` (SAME BUG AS OTHER MODULES)

**File:** `prisma/schema.prisma`

```prisma
model PelayananSuratKeterangan {
  deletedAt DateTime @default(now())  // ❌ SAME BUG
}

model PelayananTelunjukSaktiDesa {
  deletedAt DateTime @default(now())  // ❌ SAME BUG
}

model PelayananPerizinanBerusaha {
  deletedAt DateTime @default(now())  // ❌ SAME BUG
}

model PelayananPendudukNonPermanen {
  deletedAt DateTime @default(now())  // ❌ SAME BUG
}

model AjukanPermohonan {
  deletedAt DateTime @default(now())  // ❌ SAME BUG
}
```

**Dampak:** Record baru langsung ter-mark deleted.

**Severity:** 🟢 **LOW** - (Actually MEDIUM, tapi sudah documented di QC lain)

**Solusi:**
```prisma
deletedAt DateTime?  // Remove @default(now())
```

---

### 15. UI - No Error Boundary

**File:** No error boundary found

**Dampak:** Error di component bisa crash entire app.

**Severity:** 🟢 **LOW** - Code quality

**Solusi:**
```typescript
// Add Error Boundary di layout.tsx
'use client'
import { Component, ReactNode } from 'react'

class ErrorBoundary extends Component {
  state = { hasError: false }
  
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}
```

---

## ✅ YANG SUDAH BAIK

### **Schema:**
- ✅ Relasi yang jelas antara `AjukanPermohonan` dan `PelayananSuratKeterangan`
- ✅ Soft delete pattern dengan `deletedAt` dan `isActive`
- ✅ Audit trail dengan `createdAt` dan `updatedAt`
- ✅ Dual image support untuk `PelayananSuratKeterangan`

### **API:**
- ✅ CRUD lengkap untuk `pelayanan_surat_keterangan` dan `pelayanan_telunjuk_sakti_desa`
- ✅ Pagination support
- ✅ Search functionality
- ✅ Soft delete di-support via `isActive` flag
- ✅ Response format mostly consistent: `{ success, message, data }`

### **UI/UX:**
- ✅ Responsive design (desktop + mobile)
- ✅ Loading states dan skeleton
- ✅ Toast notifications untuk feedback
- ✅ Form validation comprehensive
- ✅ Dual image upload dengan preview (surat keterangan)
- ✅ Rich text editor untuk deskripsi
- ✅ Search dengan debounce
- ✅ Modal konfirmasi hapus
- ✅ Interactive stepper (perizinan berusaha)
- ✅ Reset form functionality

### **State Management:**
- ✅ Valtio proxy untuk global state
- ✅ Zod validation schema
- ✅ Loading state management
- ✅ Auto-refresh after CRUD operations

---

## 📊 Metrics

| Aspek | Score | Keterangan |
|-------|-------|------------|
| **Schema Design** | 7/10 | Good structure, tapi ada bug deletedAt |
| **API Completeness** | 5/10 | 2 modul incomplete (missing endpoints) |
| **API Security** | 5/10 | Tidak ada authentication |
| **UI/UX** | 7.5/10 | Responsive, good features |
| **State Management** | 6.5/10 | Good structure, ada bug |
| **Code Quality** | 6/10 | Inconsistent patterns, hardcoded values |

**Overall Score: 6.5/10** - **Needs Improvement**

---

## 🎯 Action Plan

### Week 1 (Critical Fixes) 🔴

- [ ] **URGENT:** Fix delete endpoint inconsistency (`pelayanan_telunjuk_sakti_desa`)
- [ ] **URGENT:** Fix state management bug (wrong variable assignment)
- [ ] **URGENT:** Fix hardcoded ID 'edit' di list pages
- [ ] **URGENT:** Create missing API endpoints (`find-many`, `create`, `del`) untuk 2 modul

### Week 2 (Complete Features) 🟡

- [ ] Create `create/page.tsx` untuk 2 modul tanpa create
- [ ] Move edit logic to `[id]/edit/page.tsx` untuk consistency
- [ ] Add validation for `link` field di state
- [ ] Standardize response format di semua API
- [ ] Move client-side search to server-side

### Week 3 (Polish) 🟢

- [ ] Add column widths untuk fixed layout tables
- [ ] Standardize ordering (`createdAt: desc`)
- [ ] Add loading states di semua edit pages
- [ ] Fix memory leak (revoke Object URLs)
- [ ] Add Error Boundary di layout
- [ ] Fix `deletedAt @default(now())` di schema

---

## 📝 Technical Notes

### **Database Migration:**

Fix deletedAt default:
```bash
bunx prisma migrate dev --name fix_layanan_deleted_at
# atau
bunx prisma db push

# Data cleanup
UPDATE "PelayananSuratKeterangan" SET "deletedAt" = NULL WHERE "isActive" = true;
UPDATE "PelayananTelunjukSaktiDesa" SET "deletedAt" = NULL WHERE "isActive" = true;
UPDATE "PelayananPerizinanBerusaha" SET "deletedAt" = NULL WHERE "isActive" = true;
UPDATE "PelayananPendudukNonPermanen" SET "deletedAt" = NULL WHERE "isActive" = true;
UPDATE "AjukanPermohonan" SET "deletedAt" = NULL WHERE "isActive" = true;
```

### **API Endpoint Checklist:**

**pelayanan_perizinan_berusaha:**
- [ ] Create `find-many.ts`
- [ ] Create `create.ts`
- [ ] Create `del.ts`
- [ ] Update `index.ts` dengan routes baru

**pelayanan_penduduk_non_permanen:**
- [ ] Create `find-many.ts`
- [ ] Create `create.ts`
- [ ] Create `del.ts`
- [ ] Update `index.ts` dengan routes baru

### **Frontend Checklist:**

**pelayanan_perizinan_berusaha:**
- [ ] Convert `page.tsx` dari preview ke list page
- [ ] Create `create/page.tsx`
- [ ] Move edit logic ke `[id]/edit/page.tsx`

**pelayanan_penduduk_non_permanen:**
- [ ] Convert `page.tsx` dari preview ke list page
- [ ] Create `create/page.tsx`
- [ ] Move edit logic ke `[id]/edit/page.tsx`

---

## 📚 References

- [Prisma Soft Delete Pattern](https://www.prisma.io/docs/concepts/components/prisma-client/soft-delete)
- [Mantine Table Documentation](https://mantine.dev/core/table/)
- [React Toastify Documentation](https://fkhadra.github.io/react-toastify/)
- [Zod Documentation](https://zod.dev/)
- [URL.createObjectURL() Memory Management](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL#memory_management)

---

## 📈 Comparison dengan QC Sebelumnya

| Aspek | Profil | Potensi | Berita | Pengumuman | Gallery | **Layanan** |
|-------|--------|---------|--------|------------|---------|-------------|
| Schema | 6/10 | 7/10 | 8/10 | 7/10 | 6/10 | **7/10** |
| API Completeness | 7/10 | 8/10 | 7.5/10 | 7/10 | 6/10 | **5/10** 🔴 |
| API Security | 4/10 | 6/10 | 6/10 | 6/10 | 4/10 | **5/10** |
| UI/UX | 8/10 | 8.5/10 | 8/10 | 7.5/10 | 7.5/10 | **7.5/10** |
| State Mgmt | 7/10 | 8/10 | 8/10 | 7/10 | 6.5/10 | **6.5/10** |
| Code Quality | 7/10 | 7.5/10 | 7/10 | 6.5/10 | 6/10 | **6/10** |
| **Overall** | **6.5/10** | **7.5/10** | **7/10** | **6.5/10** | **6/10** | **6.5/10** |

**Layanan** memiliki score sama dengan **Profil Desa** dan **Pengumuman** karena:

**Positif:**
- ✅ Schema design lebih baik (dual image support, relasi yang jelas)
- ✅ UI/UX bagus (responsive, interactive stepper)
- ✅ Most modules complete

**Negatif:**
- ❌ **2 modul incomplete** (missing API endpoints & create pages)
- ❌ **Hardcoded ID 'edit'** di production code
- ❌ **State management bug** (wrong variable assignment)
- ❌ **Inconsistent endpoint patterns** (delete endpoint beda)
- ❌ Missing authentication

---

**Dibuat oleh:** QC Automation  
**Review Status:** ⏳ Menunggu Review Developer  
**Next Review:** Setelah implementasi fixes
