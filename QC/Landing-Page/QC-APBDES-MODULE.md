# QC Summary - APBDes Module

**Scope:** List APBDes, Create, Edit, Detail  
**Date:** 2026-02-23  
**Status:** ✅ Secara umum sudah baik, ada beberapa critical issues yang perlu diperbaiki

---

## 📊 OVERVIEW

| Aspect | Schema | API | UI Admin | State Management | Overall |
|--------|--------|-----|----------|-----------------|---------|
| APBDes | ✅ Baik | ✅ Baik | ✅ Baik | ⚠️ Ada issue | 🟡 Perlu fix |

---

## ✅ YANG SUDAH BAIK

### **1. UI/UX Consistency**
- ✅ Responsive design (desktop table + mobile cards)
- ✅ Loading states dengan Skeleton
- ✅ Search dengan debounce (1000ms)
- ✅ Pagination konsisten
- ✅ Empty state handling yang informatif
- ✅ Modal konfirmasi hapus

### **2. File Upload Handling**
- ✅ Dual upload: Gambar + Dokumen
- ✅ Dropzone dengan preview (image + iframe untuk dokumen)
- ✅ Validasi format (gambar: JPEG/PNG/WEBP, dokumen: PDF/DOC/DOCX)
- ✅ Validasi ukuran file (max 5MB untuk gambar, 10MB untuk dokumen di edit)
- ✅ Tombol hapus preview (IconX di pojok kanan atas)
- ✅ URL.createObjectURL untuk preview lokal

### **3. Form Validation**
- ✅ Zod schema untuk validasi typed
- ✅ isFormValid() check sebelum submit
- ✅ Error toast dengan pesan spesifik
- ✅ Button disabled saat invalid/loading
- ✅ Type number input untuk tahun

### **4. Complex Feature - APBDes Items**
- ✅ Hierarchical items dengan level (1, 2, 3)
- ✅ Tipe classification (pendapatan, belanja, pembiayaan)
- ✅ Auto-calculation: selisih & persentase
- ✅ Add/remove items dynamic
- ✅ Table preview dengan badge color coding
- ✅ Indentasi visual berdasarkan level

### **5. Edit Form - Original Data Tracking**
- ✅ Original data state untuk reset form
- ✅ Load data existing dengan benar
- ✅ Preview image & dokumen dari data lama
- ✅ Reset form mengembalikan ke data original
- ✅ File replacement logic (upload baru jika ada perubahan)

**Code Example (✅ GOOD):**
```typescript
// Line ~95-130 - Load data & save original
const data = await apbdesState.edit.load(id);

setOriginalData({
  tahun: data.tahun || new Date().getFullYear(),
  imageId: data.imageId || '',
  fileId: data.fileId || '',
  imageUrl: data.image?.link || '',
  fileUrl: data.file?.link || '',
});

// Set form dengan data lama (termasuk imageId dan fileId)
apbdesState.edit.form = {
  tahun: data.tahun || new Date().getFullYear(),
  imageId: data.imageId || '',  // ✅ Preserve old ID
  fileId: data.fileId || '',    // ✅ Preserve old ID
  items: (data.items || []).map(...),
};

// Line ~270 - Handle reset
const handleReset = () => {
  apbdesState.edit.form = {
    tahun: originalData.tahun,
    imageId: originalData.imageId,  // ✅ Restore old ID
    fileId: originalData.fileId,    // ✅ Restore old ID
    items: [...apbdesState.edit.form.items],
  };
  setPreviewImage(originalData.imageUrl || null);
  setPreviewDoc(originalData.fileUrl || null);
  setImageFile(null);
  setDocFile(null);
  toast.info('Form dikembalikan ke data awal');
};
```

**Verdict:** ✅ **SUDAH BENAR** - Original data tracking sudah implementasi dengan baik.

---

### **6. Schema Design**
- ✅ Proper relations: APBDes ↔ FileStorage (image & file)
- ✅ Self-relation untuk hierarchical items (parentId → children)
- ✅ Indexing untuk performa (kode, level, apbdesId)
- ✅ Soft delete support (deletedAt, isActive)
- ✅ Nullable deletedAt yang benar (`DateTime? @default(null)`)

**Schema Example (✅ GOOD):**
```prisma
model APBDes {
  id        String       @id @default(cuid())
  tahun     Int?
  name      String?
  deskripsi String?
  jumlah    String?
  items     APBDesItem[]
  image     FileStorage? @relation("APBDesImage", fields: [imageId], references: [id])
  imageId   String?
  file      FileStorage? @relation("APBDesFile", fields: [fileId], references: [id])
  fileId    String?
  deletedAt DateTime?    // ✅ Nullable, no default
  isActive  Boolean      @default(true)
}

model APBDesItem {
  id         String       @id @default(cuid())
  kode       String
  uraian     String
  anggaran   Float
  realisasi  Float
  selisih    Float        // ✅ Formula di komentar
  persentase Float
  tipe       String?      // ✅ Nullable untuk level 1
  level      Int
  parentId   String?
  parent     APBDesItem?  @relation("APBDesItemParent", fields: [parentId], references: [id])
  children   APBDesItem[] @relation("APBDesItemParent")
  apbdesId   String
  apbdes     APBDes       @relation(fields: [apbdesId], references: [id])
  
  @@index([kode])
  @@index([level])
  @@index([apbdesId])
}
```

**Verdict:** ✅ **SUDAH BENAR** - Schema design sudah solid.

---

## ⚠️ ISSUES & SARAN PERBAIKAN

### **🔴 CRITICAL**

#### **1. Formula Selisih - SALAH di State, BENAR di Schema/API**

**Lokasi:** 
- `src/app/admin/(dashboard)/_state/landing-page/apbdes.ts` (line 36)
- Schema komentar di `prisma/schema.prisma` (line 210)

**Masalah:**
```typescript
// ❌ SALAH di state (line 36)
function normalizeItem(item: Partial<...>): z.infer<typeof ApbdesItemSchema> {
  const anggaran = item.anggaran ?? 0;
  const realisasi = item.realisasi ?? 0;
  
  // ❌ WRONG FORMULA
  const selisih = anggaran - realisasi; // positif = sisa anggaran
  
  const persentase = anggaran > 0 ? (realisasi / anggaran) * 100 : 0;
  
  return { ... };
}
```

```prisma
// ✅ BENAR di schema komentar (line 210)
model APBDesItem {
  // ...
  realisasi  Float
  selisih    Float // ✅ realisasi - anggaran (komentar benar)
  // ...
}
```

**Dampak:**
- **Data salah!** Selisih positif/negatif terbalik
- Jika realisasi > anggaran (over budget), seharusnya **negatif** tapi jadi **positif**
- Jika realisasi < anggaran (under budget/sisa), seharusnya **positif** tapi jadi **negatif**
- Color coding di UI (green/red) juga terbalik!

**Contoh:**
```
Anggaran: Rp 100.000.000
Realisasi: Rp 120.000.000 (over budget!)

❌ Formula sekarang: selisih = 100M - 120M = -20M (negatif)
   UI show: merah (over budget) ✅ TAPI karena negatif

✅ Seharusnya: selisih = 120M - 100M = +20M (positif)
   UI show: merah (over budget) ✅ Karena positif
```

**Rekomendasi:** Fix formula di state:

```typescript
// ✅ CORRECT FORMULA
const selisih = realisasi - anggaran; // positif = over budget, negatif = under budget
const persentase = anggaran > 0 ? (realisasi / anggaran) * 100 : 0;
```

**Priority:** 🔴 **CRITICAL**  
**Effort:** Low (1 line fix)  
**Impact:** **HIGH** (data integrity issue)

---

#### **2. State Management - Inconsistency Fetch Pattern**

**Lokasi:** `src/app/admin/(dashboard)/_state/landing-page/apbdes.ts`

**Masalah:** Ada 3 pattern berbeda untuk fetch API:

```typescript
// ❌ Pattern 1: ApiFetch (create, findMany, delete, edit.load, edit.update)
const res = await ApiFetch.api.landingpage.apbdes["create"].post(parsed.data);
const res = await ApiFetch.api.landingpage.apbdes["findMany"].get({ query });
const res = await (ApiFetch.api.landingpage.apbdes as any)["del"][id].delete();
const res = await (ApiFetch.api.landingpage.apbdes as any)[id].get();
const res = await (ApiFetch.api.landingpage.apbdes as any)[this.id].put(requestData);

// ❌ Pattern 2: fetch manual (findUnique)
const response = await fetch(`/api/landingpage/apbdes/${id}`);
const res = await response.json();
```

**Dampak:**
- Code consistency buruk
- Sulit maintenance
- Type safety tidak konsisten
- Duplikasi logic error handling
- Console.log debugging tertinggal di production

**Rekomendasi:** Gunakan **ApiFetch** untuk semua operasi:

```typescript
// ✅ Unified pattern
async load(id: string) {
  try {
    this.loading = true;
    const res = await ApiFetch.api.landingpage.apbdes[id].get();
    
    if (res.data?.success) {
      this.data = res.data.data;
    } else {
      this.data = null;
      this.error = res.data?.message || "Gagal memuat detail APBDes";
      toast.error(this.error);
    }
  } catch (error) {
    console.error("FindUnique error:", error);
    this.data = null;
    this.error = "Gagal memuat detail APBDes";
    toast.error(this.error);
  } finally {
    this.loading = false;
  }
}
```

**Priority:** 🔴 High  
**Effort:** Medium (refactor di findUnique)

---

#### **3. Console.log Debugging di Production**

**Lokasi:** `src/app/admin/(dashboard)/_state/landing-page/apbdes.ts`

**Masalah:**
```typescript
// Line ~175-177
const url = `/api/landingpage/apbdes/${id}`;
console.log("🌐 Fetching:", url);  // ❌ Debug log

const response = await fetch(url);
const res = await response.json();

console.log("📦 Response:", res);  // ❌ Debug log
```

**Dampak:**
- Performance impact (I/O operation)
- Security risk (expose API structure)
- Log pollution di production
- Unprofessional

**Rekomendasi:** Remove atau gunakan conditional logging:

```typescript
// ✅ Remove completely (recommended)
// Atau gunakan conditional logging
if (process.env.NODE_ENV === 'development') {
  console.log("🌐 Fetching:", url);
  console.log("📦 Response:", res);
}
```

**Priority:** 🔴 Medium  
**Effort:** Low

---

### **🟡 MEDIUM**

#### **4. Type Safety - Any Usage di Edit Methods**

**Lokasi:** `src/app/admin/(dashboard)/_state/landing-page/apbdes.ts`

**Masalah:**
```typescript
// Line ~215
const res = await (ApiFetch.api.landingpage.apbdes as any)[id].get();
//                                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^

// Line ~245
const res = await (ApiFetch.api.landingpage.apbdes as any)[this.id].put(requestData);
//                                ^^^^^^^^^^^^^^^^^^^^^^^^^^
```

**Dampak:**
- Type safety hilang
- Autocomplete tidak bekerja
- Runtime errors tidak terdeteksi di compile time
- Refactoring sulit

**Rekomendasi:** Define typed API client:

```typescript
// Define proper types
interface APBDesAPI {
  [id: string]: {
    get: () => Promise<ApiResponse<APBDesData>>;
    put: (data: APBDesForm) => Promise<ApiResponse<APBDesData>>;
  };
  del: {
    [id: string]: {
      delete: () => Promise<ApiResponse<void>>;
    };
  };
}

// Use typed client
const res = await ApiFetch.api.landingpage.apbdes[id].get();
// No more `as any`
```

**Priority:** 🟡 Medium  
**Effort:** Medium (perlu setup types)

---

#### **5. Edit Form - Items Tidak Di-Restore Saat Reset**

**Lokasi:** `src/app/admin/(dashboard)/landing-page/apbdes/[id]/edit/page.tsx`

**Masalah:**
```typescript
// Line ~270-285
const handleReset = () => {
  apbdesState.edit.form = {
    tahun: originalData.tahun,
    imageId: originalData.imageId,
    fileId: originalData.fileId,
    items: [...apbdesState.edit.form.items], // ⚠️ Keep MODIFIED items
  };
  // ...
};
```

**Issue:** Saat reset, items yang sudah di-modified (added/removed) tidak di-restore ke original. User expect reset = kembali ke data awal sepenuhnya.

**Rekomendasi:** Save original items dan restore saat reset:

```typescript
// Add to originalData state
const [originalData, setOriginalData] = useState({
  tahun: 0,
  imageId: '',
  fileId: '',
  imageUrl: '',
  fileUrl: '',
  items: [] as ItemForm[], // ✅ Save original items
});

// Load data
setOriginalData({
  tahun: data.tahun || new Date().getFullYear(),
  imageId: data.imageId || '',
  fileId: data.fileId || '',
  imageUrl: data.image?.link || '',
  fileUrl: data.file?.link || '',
  items: (data.items || []).map((item: any) => ({...})), // ✅ Save
});

// Reset
const handleReset = () => {
  apbdesState.edit.form = {
    tahun: originalData.tahun,
    imageId: originalData.imageId,
    fileId: originalData.fileId,
    items: [...originalData.items], // ✅ Restore original items
  };
  // ...
};
```

**Priority:** 🟡 Medium  
**Effort:** Low

---

#### **6. Zod Schema - Error Message Tidak Akurat**

**Lokasi:** `src/app/admin/(dashboard)/_state/landing-page/apbdes.ts`

**Masalah:**
```typescript
// Line ~10
const ApbdesItemSchema = z.object({
  kode: z.string().min(1, "Kode wajib diisi"), // ✅ OK
  uraian: z.string().min(1, "Uraian wajib diisi"), // ✅ OK
  anggaran: z.number().min(0), // ⚠️ No custom message
  realisasi: z.number().min(0), // ⚠️ No custom message
  // ...
});

// Line ~17
const ApbdesFormSchema = z.object({
  tahun: z.number().int().min(2000, "Tahun tidak valid"), // ⚠️ Generic
  imageId: z.string().min(1, "Gambar wajib diunggah"), // ✅ OK
  fileId: z.string().min(1, "File wajib diunggah"), // ✅ OK
  items: z.array(ApbdesItemSchema).min(1, "Minimal ada 1 item"), // ✅ OK
});
```

**Dampak:** Error messages tidak konsisten, beberapa generic beberapa spesifik.

**Rekomendasi:** Standardisasi error messages:

```typescript
const ApbdesItemSchema = z.object({
  kode: z.string().min(1, "Kode wajib diisi"),
  uraian: z.string().min(1, "Uraian wajib diisi"),
  anggaran: z.number().min(0, "Anggaran tidak boleh negatif"),
  realisasi: z.number().min(0, "Realisasi tidak boleh negatif"),
  selisih: z.number(),
  persentase: z.number(),
  level: z.number().int().min(1).max(3, "Level harus antara 1-3"),
  tipe: z.enum(['pendapatan', 'belanja', 'pembiayaan']).nullable().optional(),
});

const ApbdesFormSchema = z.object({
  tahun: z.number().int().min(2000, "Tahun minimal 2000").max(2100, "Tahun maksimal 2100"),
  imageId: z.string().min(1, "Gambar wajib diunggah"),
  fileId: z.string().min(1, "Dokumen wajib diunggah"),
  items: z.array(ApbdesItemSchema).min(1, "Minimal ada 1 item"),
});
```

**Priority:** 🟡 Low  
**Effort:** Low

---

#### **7. Console.log di Production (UI Components)**

**Lokasi:** Multiple UI files

**Masalah:**
```typescript
// edit/page.tsx - Line ~220
console.error('Update error:', err);

// create/page.tsx - Line ~120
console.error("Gagal submit:", error);

// detail/page.tsx - Line ~40
console.error('Error loading APBDes:', error);
```

**Rekomendasi:** Gunakan conditional logging:

```typescript
if (process.env.NODE_ENV === 'development') {
  console.error('Update error:', err);
}
```

**Priority:** 🟡 Low  
**Effort:** Low

---

### **🟢 LOW (Minor Polish)**

#### **8. Mobile Layout - Title Order Inconsistency**

**Lokasi:** `page.tsx`

**Masalah:**
```typescript
// Line ~170 (Mobile)
<Title order={2} size="lg" lh={1.2}>
  Daftar APBDes
</Title>

// Line ~70 (Desktop - inside Paper)
<Title order={4} size="lg" lh={1.2}>
  Daftar APBDes
</Title>
```

**Issue:** Mobile pakai `order={2}` (heading besar), desktop `order={4}`. Seharusnya konsisten.

**Rekomendasi:** Samakan:
```typescript
<Title order={4} size="lg" lh={1.2}>
  Daftar APBDes
</Title>
```

**Priority:** 🟢 Low  
**Effort:** Low

---

#### **9. Search Placeholder Tidak Spesifik**

**Lokasi:** `page.tsx`

**Masalah:**
```typescript
// Line ~30
<HeaderSearch
  title="APBDes"
  placeholder="Cari APBDes..." // ⚠️ Generic
  // ...
/>
```

**Rekomendasi:** Lebih spesifik:
```typescript
placeholder='Cari nama atau tahun APBDes...'
```

**Priority:** 🟢 Low  
**Effort:** Low

---

#### **10. Duplicate Comment**

**Lokasi:** `src/app/admin/(dashboard)/_state/landing-page/apbdes.ts`

**Masalah:**
```typescript
// Line ~28-29
// --- Helper: hitung selisih & persentase otomatis (opsional di frontend) ---
// --- Helper: hitung selisih & persentase otomatis (opsional di frontend) ---
// ^ Duplicate line
```

**Priority:** 🟢 Low  
**Effort:** Low (remove duplicate)

---

#### **11. Inconsistent Button Label**

**Lokasi:** Multiple files

**Masalah:**
```typescript
// create/page.tsx - Line ~270
<Button ...>Simpan</Button>

// edit/page.tsx - Line ~340
<Button ...>Simpan Perubahan</Button>

// Should be consistent: "Simpan" atau "Simpan Perubahan"
```

**Rekomendasi:** Standardisasi:
```typescript
// Create: "Simpan"
// Edit: "Simpan Perubahan" (lebih descriptive untuk edit)
// OR both: "Simpan"
```

**Priority:** 🟢 Low  
**Effort:** Low

---

#### **12. Missing Search Feature in Pagination**

**Lokasi:** `page.tsx`

**Masalah:**
```typescript
// Line ~250
<Pagination
  value={page}
  onChange={(newPage) => {
    load(newPage, 10);  // ⚠️ Missing search parameter
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }}
  total={totalPages}
  // ...
/>
```

**Issue:** Saat ganti page, search query hilang.

**Rekomendasi:** Include search:
```typescript
onChange={(newPage) => {
  load(newPage, 10, debouncedSearch); // ✅ Include search
  window.scrollTo({ top: 0, behavior: 'smooth' });
}}
```

**Priority:** 🟢 Low  
**Effort:** Low

---

#### **13. Edit Page - Document Max Size Inconsistency**

**Lokasi:** `edit/page.tsx`

**Masalah:**
```typescript
// Line ~230 (Image)
maxSize={5 * 1024 ** 2}  // 5MB

// Line ~250 (Document)
maxSize={10 * 1024 ** 2} // 10MB
```

**Issue:** Create page maksimal 5MB untuk semua file, edit page 10MB untuk dokumen. Inconsistent.

**Rekomendasi:** Samakan (prefer 5MB untuk consistency):
```typescript
maxSize={5 * 1024 ** 2} // 5MB for both
```

**Priority:** 🟢 Low  
**Effort:** Low

---

## 📋 RINGKASAN ACTION ITEMS

| Priority | Issue | Module | Impact | Effort | Status |
|----------|-------|--------|--------|--------|--------|
| 🔴 P0 | **Formula selisih SALAH** | State | **CRITICAL** | Low | **MUST FIX** |
| 🔴 P0 | Fetch method inconsistency | State | Medium | Medium | Perlu refactor |
| 🔴 P1 | Console.log debugging in production | State | Medium | Low | Should fix |
| 🟡 M | Type safety (any usage) | State | Low | Medium | Optional |
| 🟡 M | Items tidak di-restore saat reset | Edit UI | Medium | Low | Should fix |
| 🟡 M | Zod schema error messages | State | Low | Low | Optional |
| 🟢 L | Console.log in UI components | UI | Low | Low | Optional |
| 🟢 L | Mobile title order inconsistency | List UI | Low | Low | Optional |
| 🟢 L | Search placeholder tidak spesifik | List UI | Low | Low | Optional |
| 🟢 L | Duplicate comment | State | Low | Low | Optional |
| 🟢 L | Inconsistent button label | UI | Low | Low | Optional |
| 🟢 L | Missing search in pagination | List UI | Low | Low | Should fix |
| 🟢 L | Document max size inconsistency | Edit UI | Low | Low | Optional |

---

## ✅ KESIMPULAN

### **Overall Quality: 🟢 BAIK (7/10)**

**Strengths:**
1. ✅ UI/UX konsisten & responsive
2. ✅ File upload handling solid (dual upload: image + document)
3. ✅ Form validation dengan Zod schema
4. ✅ State management terstruktur (Valtio)
5. ✅ **Edit form reset sudah benar** (original data tracking untuk files)
6. ✅ Complex feature: hierarchical items dengan level & tipe
7. ✅ Schema design solid (proper relations, indexing, soft delete)
8. ✅ Modal konfirmasi hapus untuk user safety

**Critical Issues:**
1. ⚠️ **FORMULA SELISIH SALAH** - Data integrity issue (CRITICAL)
2. ⚠️ Fetch method pattern inconsistency (ApiFetch vs fetch manual)
3. ⚠️ Console.log debugging tertinggal di production

**Areas for Improvement:**
1. ⚠️ **Fix formula selisih** (realisasi - anggaran, bukan anggaran - realisasi)
2. ⚠️ **Refactor fetch methods** untuk gunakan ApiFetch consistently
3. ⚠️ **Remove console.log** debugging dari production code
4. ⚠️ **Save & restore original items** saat reset form di edit page
5. ⚠️ **Improve type safety** dengan remove `as any` usage
6. ⚠️ **Standardisasi error messages** di Zod schema

**Recommended Next Steps:**
1. **🔴 CRITICAL: Fix formula selisih** di state (line 36) - 5 menit fix
2. **🔴 HIGH:** Refactor findUnique ke ApiFetch - 30 menit
3. **🔴 HIGH:** Remove console.log debugging - 10 menit
4. **🟡 MEDIUM:** Save & restore original items - 30 menit
5. **🟡 MEDIUM:** Improve type safety - 1-2 jam
6. **🟢 LOW:** Polish minor issues - 30 menit

---

## 📈 COMPARISON WITH OTHER MODULES

| Aspect | Profil | Desa Anti Korupsi | SDGs Desa | APBDes | Notes |
|--------|--------|-------------------|-----------|--------|-------|
| Fetch Pattern | ⚠️ Mixed | ⚠️ Mixed | ⚠️ Mixed | ⚠️ Mixed | All perlu refactor |
| Loading State | ⚠️ Some missing | ⚠️ Some missing | ⚠️ Missing | ✅ Good | APBDes paling baik |
| Edit Form Reset | ✅ Good | ✅ Good | ✅ Good | ✅ Good | All consistent |
| Type Safety | ⚠️ Some `any` | ⚠️ Some `any` | ⚠️ Some `any` | ⚠️ Some `any` | Same issue |
| File Upload | ✅ Images | ✅ Documents | ✅ Images | ✅ **Dual** | APBDes paling complex |
| Error Handling | ✅ Good | ✅ Good (better) | ✅ Good | ✅ Good | Consistent |
| Schema Design | ✅ Good | ⚠️ deletedAt issue | ⚠️ deletedAt issue | ✅ **Best** | APBDes paling solid |
| **Data Integrity** | ✅ Good | ✅ Good | ✅ Good | ❌ **Formula WRONG** | **APBDes CRITICAL issue** |
| Complexity | Low | Medium | Low | **High** | APBDes items hierarchy |

---

## 🎯 UNIQUE FEATURES OF APBDes MODULE

**Most Complex Module So Far:**
1. **Dual file upload** (gambar + dokumen) - unique to APBDes
2. **Hierarchical items** dengan 3 level - unique to APBDes
3. **Auto-calculation** (selisih & persentase) - unique to APBDes
4. **Type classification** (pendapatan, belanja, pembiayaan) - unique to APBDes
5. **Dynamic item management** (add/remove) - unique to APBDes

**Best Practices:**
1. ✅ Schema design paling solid (deletedAt nullable, proper indexing)
2. ✅ Edit form reset paling comprehensive (preserve files & items)
3. ✅ Validation paling thorough (Zod schema untuk items)

**Biggest Issue:**
1. ❌ **Formula selisih SALAH** - critical data integrity issue yang tidak ada di modul lain

---

**Catatan:** Secara keseluruhan, modul APBDes adalah **paling complex dan paling solid** dibanding modul lain yang sudah di-QC. Namun, ada **1 CRITICAL BUG** (formula selisih) yang harus **SEGERA DIPERBAIKI** karena menyangkut integritas data. Setelah fix critical issue, module ini production-ready dengan beberapa improvement minor yang bisa dilakukan secara incremental.

**Priority Action:**
```
🔴 FIX INI SEKARANG JUGA (5 MENIT):
File: src/app/admin/(dashboard)/_state/landing-page/apbdes.ts
Line: 36
Change: const selisih = anggaran - realisasi;
To:     const selisih = realisasi - anggaran;
```
