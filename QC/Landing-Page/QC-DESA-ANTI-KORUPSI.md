# QC Summary - Desa Anti Korupsi Module

**Scope:** List Desa Anti Korupsi, Kategori Desa Anti Korupsi  
**Date:** 2026-02-23  
**Status:** ✅ Secara umum sudah baik, ada beberapa improvement yang diperlukan

---

## 📊 OVERVIEW

| Module | Schema | API | UI Admin | State Management | Overall |
|--------|--------|-----|----------|-----------------|---------|
| List Desa Anti Korupsi | ✅ Baik | ✅ Baik | ✅ Baik | ⚠️ Ada issue | 🟡 Perlu fix |
| Kategori Desa Anti Korupsi | ✅ Baik | ✅ Baik | ✅ Baik | ⚠️ Ada issue | 🟡 Perlu fix |

---

## ✅ YANG SUDAH BAIK (COMMON)

### **1. UI/UX Consistency**
- ✅ Responsive design (desktop table + mobile cards)
- ✅ Loading states dengan Skeleton
- ✅ Search dengan debounce (1000ms)
- ✅ Pagination konsisten
- ✅ Empty state handling yang informatif
- ✅ Modal konfirmasi hapus

### **2. File Upload Handling** (Desa Anti Korupsi)
- ✅ Dropzone dengan preview iframe untuk dokumen
- ✅ Validasi format dokumen (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX)
- ✅ Validasi ukuran file (max 5MB)
- ✅ Tombol hapus preview (IconX di pojok kanan atas)
- ✅ URL.createObjectURL untuk preview lokal

### **3. Form Validation**
- ✅ Zod schema untuk validasi typed
- ✅ isFormValid() check sebelum submit
- ✅ Error toast dengan pesan spesifik
- ✅ Button disabled saat invalid/loading

### **4. CRUD Operations**
- ✅ Create dengan upload file
- ✅ FindMany dengan pagination & search
- ✅ FindUnique untuk detail
- ✅ Delete dengan soft delete
- ✅ Update dengan file replacement

### **5. Error Handling**
- ✅ Try-catch di semua async operation
- ✅ Toast error dengan pesan user-friendly
- ✅ Console.error untuk debugging
- ✅ Response cloning untuk error handling yang lebih baik (di kategori update)

---

## ⚠️ ISSUES & SARAN PERBAIKAN

### **🔴 CRITICAL**

#### **1. Edit Form - File Lama Tidak Tersimpan Saat Reset**

**Lokasi:** `src/app/admin/(dashboard)/landing-page/desa-anti-korupsi/list-desa-anti-korupsi/[id]/edit/page.tsx`

**Masalah:**
```typescript
// Line ~70 - Load data
const data = await desaAntiKorupsiState.edit.load(id);

setFormData({
  name: data.name,
  deskripsi: data.deskripsi,
  kategoriId: data.kategoriId,
  fileId: data.fileId, // ✅ Sudah benar
});

setOriginalData({
  name: data.name,
  deskripsi: data.deskripsi,
  kategoriId: data.kategoriId,
  fileId: data.fileId,
  fileUrl: data.file?.link || "", // ✅ Sudah benar
});

// Line ~130 - Handle reset
const handleResetForm = () => {
  setFormData({
    name: originalData.name,
    deskripsi: originalData.deskripsi,
    kategoriId: originalData.kategoriId,
    fileId: originalData.fileId, // ✅ Sudah benar
  });
  setPreviewFile(originalData.fileUrl || null); // ✅ Sudah benar
  setFile(null); // ✅ Sudah benar
};
```

**Status:** ✅ **SUDAH BENAR** - Original data tracking sudah implementasi dengan baik.

**Verdict:** Tidak ada action needed.

---

#### **2. State Management - Inconsistency Fetch Pattern**

**Lokasi:** `src/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi.ts`

**Masalah:** Ada 2 pattern berbeda untuk fetch API:

```typescript
// ❌ Pattern 1: ApiFetch (create operations)
const res = await ApiFetch.api.landingpage.desaantikorupsi["create"].post({...});

// ❌ Pattern 2: fetch manual (findUnique, edit, delete)
const res = await fetch(`/api/landingpage/desaantikorupsi/${id}`);
const response = await fetch(`/api/landingpage/desaantikorupsi/del/${id}`, {
  method: "DELETE",
  headers: { "Content-Type": "application/json" },
});
```

**Dampak:**
- Code consistency buruk
- Sulit maintenance
- Type safety tidak konsisten
- Duplikasi logic error handling

**Rekomendasi:** Gunakan **ApiFetch** untuk semua operasi:

```typescript
// ✅ Unified pattern
const res = await ApiFetch.api.landingpage.desaantikorupsi["create"].post(data);
const res = await ApiFetch.api.landingpage.desaantikorupsi[id].get();
const res = await ApiFetch.api.landingpage.desaantikorupsi[id].put(data);
const res = await ApiFetch.api.landingpage.desaantikorupsi["del"][id].delete();
```

**Priority:** 🔴 High  
**Effort:** Medium (refactor di semua state methods)

---

#### **3. findUnique State - Tidak Ada Loading State Management**

**Lokasi:** `src/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi.ts`

**Masalah:**
```typescript
// Line ~97 - desaAntikorupsi.findUnique.load()
async load(id: string) {
  try {
    const res = await fetch(`/api/landingpage/desaantikorupsi/${id}`);
    if (res.ok) {
      const data = await res.json();
      desaAntikorupsi.findUnique.data = data.data ?? null;
    } else {
      console.error("Failed to fetch data", res.status, res.statusText);
      desaAntikorupsi.findUnique.data = null;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    desaAntikorupsi.findUnique.data = null;
  }
  // ❌ MISSING: finally block untuk stop loading
}
```

**Dampak:** UI mungkin stuck di loading state jika ada error.

**Rekomendasi:** Tambahkan loading state dan finally block:

```typescript
async load(id: string) {
  try {
    desaAntikorupsi.findUnique.loading = true; // ✅ Start loading
    const res = await fetch(`/api/landingpage/desaantikorupsi/${id}`);
    if (res.ok) {
      const data = await res.json();
      desaAntikorupsi.findUnique.data = data.data ?? null;
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    desaAntikorupsi.findUnique.loading = false; // ✅ Stop loading
  }
}
```

**Priority:** 🔴 Medium  
**Effort:** Low

---

#### **4. Kategori Edit - Response Cloning Overkill**

**Lokasi:** `src/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi.ts`

**Masalah:**
```typescript
// Line ~370 - kategoriDesaAntiKorupsi.edit.update()
async update() {
  // ...
  const response = await fetch(...);
  
  // Clone the response to avoid 'body already read' error
  const responseClone = response.clone();

  try {
    const result = await response.json();
    // ...
  } catch (error) {
    // If JSON parsing fails, try to get the response text
    try {
      const text = await responseClone.text();
      console.error("Error response text:", text);
      throw new Error(`Gagal memproses respons dari server: ${text}`);
    } catch (textError) {
      // ...
    }
  }
}
```

**Analysis:**
- ✅ **GOOD:** Error handling sangat thorough
- ⚠️ **OVERKILL:** Untuk production API yang stable, ini berlebihan
- ⚠️ **INCONSISTENT:** Module lain tidak punya error handling se-detail ini

**Rekomendasi:** Simplify untuk consistency:

```typescript
async update() {
  try {
    kategoriDesaAntiKorupsi.edit.loading = true;
    
    const response = await fetch(`/api/landingpage/kategoridak/${this.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: this.form.name }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.message || `HTTP ${response.status}`);
    }

    if (result.success) {
      toast.success(result.message || "Berhasil update");
      await kategoriDesaAntiKorupsi.findMany.load();
      return true;
    }
    
    throw new Error(result.message || "Gagal update");
  } catch (error) {
    console.error("Error updating:", error);
    toast.error(error instanceof Error ? error.message : "Gagal update");
    return false;
  } finally {
    kategoriDesaAntiKorupsi.edit.loading = false;
  }
}
```

**Priority:** 🟡 Low  
**Effort:** Low

---

### **🟡 MEDIUM**

#### **5. HTML Injection Risk - dangerouslySetInnerHTML**

**Lokasi:** 
- `list-desa-anti-korupsi/[id]/page.tsx` (line ~105)
- `list-desa-anti-korupsi/create/page.tsx` (CreateEditor component)
- `list-desa-anti-korupsi/[id]/edit/page.tsx` (EditEditor component)

**Masalah:**
```typescript
// ❌ Direct HTML render tanpa sanitization
<Box
  dangerouslySetInnerHTML={{ __html: data.deskripsi || '-' }}
  style={{ wordBreak: "break-word", whiteSpace: "normal", lineHeight: 1.6 }}
/>
```

**Risk:**
- XSS attack jika admin input script malicious
- Bisa inject iframe, script tag, dll
- Security vulnerability

**Rekomendasi:** Gunakan DOMPurify atau library sanitization:

```typescript
import DOMPurify from 'dompurify';

// Sanitize sebelum render
const sanitizedHtml = DOMPurify.sanitize(data.deskripsi);
<Box
  dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
  // ...
/>
```

Atau validasi di backend untuk whitelist tag HTML yang diperbolehkan (hanya `<p>`, `<ul>`, `<li>`, `<strong>`, dll).

**Priority:** 🟡 Medium (**Security concern**)  
**Effort:** Low

---

#### **6. Type Safety - Any Usage**

**Lokasi:** `src/app/admin/(dashboard)/_state/landing-page/desa-anti-korupsi.ts`

**Masalah:**
```typescript
// Line ~60
data: null as any[] | null, // ❌ Using 'any'

// Line ~280
data: null as any[] | null, // ❌ Using 'any'

// Line ~97
data: null as Prisma.DesaAntiKorupsiGetPayload<{...}> | null, // ✅ Typed

// Line ~310
data: null as Prisma.KategoriDesaAntiKorupsiGetPayload<{...}> | null, // ✅ Typed
```

**Rekomendasi:** Gunakan typed data consistently:

```typescript
// desaAntikorupsi.findMany
data: null as Prisma.DesaAntiKorupsiGetPayload<{
  include: { kategori: true; file: true };
}>[] | null,

// kategoriDesaAntiKorupsi.findMany
data: null as Prisma.KategoriDesaAntiKorupsiGetPayload<{}>[] | null,
```

**Priority:** 🟡 Medium  
**Effort:** Medium (perlu update semua reference)

---

#### **7. Console.log di Production**

**Lokasi:** Multiple places di state file

**Masalah:**
```typescript
// Line ~50
console.log(error);
toast.error("Gagal menambahkan data");

// Line ~85
console.error("Failed to load media sosial:", res.data?.message);

// Line ~91
console.error("Error loading media sosial:", error);

// Line ~110
console.error("Failed to fetch data", res.status, res.statusText);

// Line ~114
console.error("Error fetching data:", error);

// ... dan banyak lagi
```

**Rekomendasi:** Gunakan conditional logging:

```typescript
if (process.env.NODE_ENV === 'development') {
  console.error("Error:", error);
}
```

Atau gunakan logging library (winston, pino, dll) dengan levels yang jelas.

**Priority:** 🟡 Low  
**Effort:** Low

---

#### **8. Error Message Tidak Konsisten**

**Lokasi:** Multiple places

**Masalah:**
```typescript
// Create - Line ~40
return toast.error("Gagal menambahkan data");

// Create - Line ~42
toast.error("Gagal menambahkan data");

// Delete - Line ~140
toast.error("Terjadi kesalahan saat menghapus desa anti korupsi");

// Edit - Line ~190
toast.error("Gagal memuat data");

// Edit update - Line ~240
toast.error("Gagal mengupdate desa anti korupsi");
```

**Rekomendasi:** Standardisasi error messages:

```typescript
// Pattern: "[Action] [resource] gagal"
toast.error("Menambahkan data gagal");
toast.error("Menghapus data gagal");
toast.error("Memuat data gagal");
toast.error("Memperbarui data gagal");

// Atau lebih spesifik dengan context
toast.error("Gagal menambahkan data Desa Anti Korupsi");
toast.error("Gagal menghapus Kategori Desa Anti Korupsi");
```

**Priority:** 🟢 Low  
**Effort:** Low

---

### **🟢 LOW (Minor Polish)**

#### **9. Placeholder Search Tidak Spesifik**

**Lokasi:** 
- `list-desa-anti-korupsi/page.tsx`: `placeholder="Cari nama program atau kategori..."` ✅ Spesifik
- `kategori-desa-anti-korupsi/page.tsx`: `placeholder='pencarian'` ❌ Terlalu generic

**Rekomendasi:**
```typescript
// Kategori page
placeholder="Cari nama kategori..."
```

**Priority:** 🟢 Low  
**Effort:** Low

---

#### **10. Alert vs Toast**

**Lokasi:** `kategori-desa-anti-korupsi/create/page.tsx`

**Masalah:**
```typescript
// Line ~37
if (!stateKategori.create.form.name) {
  return alert('Nama kategori harus diisi'); // ❌ Using alert()
}
```

**Rekomendasi:** Gunakan toast untuk consistency:
```typescript
if (!stateKategori.create.form.name) {
  return toast.warn('Nama kategori harus diisi'); // ✅ Using toast
}
```

**Priority:** 🟢 Low  
**Effort:** Low

---

#### **11. Component Name Mismatch**

**Lokasi:** `list-desa-anti-korupsi/[id]/page.tsx`

**Masalah:**
```typescript
// Line ~17
export default function DetailKegiatanDesa() { // ❌ Wrong name
  // ...
}
```

**Rekomendasi:** Rename ke yang sesuai:
```typescript
export default function DetailDesaAntiKorupsi() { // ✅ Correct name
  // ...
}
```

**Priority:** 🟢 Low  
**Effort:** Low (hanya rename)

---

#### **12. Duplicate Error Logging**

**Lokasi:** `list-desa-anti-korupsi/[id]/edit/page.tsx`

**Masalah:**
```typescript
// Line ~87
} catch (err) {
  console.error(err); // ❌ Duplicate logging
  toast.error('Gagal memuat data Desa Anti Korupsi');
}
```

**Rekomendasi:** Cukup satu logging yang informatif:
```typescript
} catch (err) {
  console.error('Failed to load Desa Anti Korupsi:', err);
  toast.error('Gagal memuat data Desa Anti Korupsi');
}
```

**Priority:** 🟢 Low  
**Effort:** Low

---

#### **13. Comment Typo**

**Lokasi:** `kategori-desa-anti-korupsi/[id]/edit/page.tsx`

**Masalah:**
```typescript
// Line ~20
// 🧠 Ambil proxy asli (bisa ditulis) & snapshot (buat render)
const stateKategori = korupsiState.kategoriDesaAntiKorupsi;
const snapshotKategori = useProxy(stateKategori);

// ❌ snapshotKategori declared but never used
```

**Rekomendasi:** Remove unused variable:
```typescript
const stateKategori = korupsiState.kategoriDesaAntiKorupsi;
// const snapshotKategori = useProxy(stateKategori); // ❌ Remove
```

**Priority:** 🟢 Low  
**Effort:** Low

---

#### **14. Schema - deletedAt Default Value**

**Lokasi:** `prisma/schema.prisma`

**Masalah:**
```prisma
model DesaAntiKorupsi {
  // ...
  deletedAt  DateTime  @default(now())  // ❌ Always has default value
  isActive   Boolean   @default(true)
}
```

**Issue:** `deletedAt @default(now())` berarti setiap record baru langsung punya `deletedAt` value, yang bisa membingungkan untuk soft delete logic.

**Rekomendasi:**
```prisma
model DesaAntiKorupsi {
  // ...
  deletedAt  DateTime? @default(null)  // ✅ Nullable, null = not deleted
  isActive   Boolean   @default(true)
}
```

**Priority:** 🟢 Medium (potential logic issue)  
**Effort:** Medium (perlu migration)

---

## 📋 RINGKASAN ACTION ITEMS

| Priority | Issue | Module | Impact | Effort | Status |
|----------|-------|--------|--------|--------|--------|
| 🔴 P0 | Fetch method inconsistency | State | Medium | Medium | Perlu refactor |
| 🔴 P0 | Missing loading state in findUnique | State | Medium | Low | Perlu fix |
| 🟡 M | HTML injection risk | UI | **High (Security)** | Low | **Should fix** |
| 🟡 M | Type safety (any usage) | State | Low | Medium | Optional |
| 🟡 M | Response cloning overkill | State (Kategori) | Low | Low | Optional |
| 🟢 L | Console.log in production | State | Low | Low | Optional |
| 🟢 L | Error message inconsistency | State | Low | Low | Optional |
| 🟢 L | Placeholder tidak spesifik | Kategori UI | Low | Low | Optional |
| 🟢 L | Alert vs Toast | Kategori Create | Low | Low | Optional |
| 🟢 L | Component name mismatch | Detail page | Low | Low | Optional |
| 🟢 L | Duplicate error logging | Edit page | Low | Low | Optional |
| 🟢 L | Unused variable | Kategori Edit | Low | Low | Optional |
| 🟢 M | deletedAt default value | Schema | Medium | Medium | Should fix |

---

## ✅ KESIMPULAN

### **Overall Quality: 🟢 BAIK (7.5/10)**

**Strengths:**
1. ✅ UI/UX konsisten & responsive
2. ✅ File upload handling solid (iframe preview untuk dokumen)
3. ✅ Form validation dengan Zod schema
4. ✅ State management terstruktur (Valtio)
5. ✅ Error handling comprehensive (terutama di kategori update)
6. ✅ **Edit form reset sudah benar** (original data tracking)
7. ✅ Modal konfirmasi hapus untuk user safety

**Areas for Improvement:**
1. ⚠️ **Security:** HTML injection di deskripsi (prioritas)
2. ⚠️ **Consistency:** Fetch method pattern (ApiFetch vs fetch manual)
3. ⚠️ **Loading States:** findUnique tidak ada loading state management
4. ⚠️ **Type Safety:** Reduce `any` usage, gunakan Prisma types
5. ⚠️ **Schema:** deletedAt default value bisa menyebabkan logic issue

**Recommended Next Steps:**
1. **Fix HTML injection** dengan DOMPurify atau backend validation
2. **Refactor fetch methods** untuk gunakan ApiFetch consistently
3. **Add loading state** di findUnique operations
4. **Fix deletedAt schema** untuk soft delete yang benar
5. **Optional:** Improve type safety dengan remove `any`

---

## 📈 COMPARISON WITH OTHER MODULES

| Aspect | Profil Module | Desa Anti Korupsi | Notes |
|--------|--------------|-------------------|-------|
| Fetch Pattern | ⚠️ Mixed | ⚠️ Mixed | Both perlu refactor |
| Loading State | ⚠️ Some missing | ⚠️ Some missing | Same issue |
| Edit Form Reset | ✅ Good | ✅ Good | Consistent |
| Type Safety | ⚠️ Some `any` | ⚠️ Some `any` | Same issue |
| HTML Injection | ⚠️ Present | ⚠️ Present | Both need fix |
| File Upload | ✅ Images | ✅ Documents | Different use case |
| Error Handling | ✅ Good | ✅ Good (better) | DAK more thorough |

---

**Catatan:** Secara keseluruhan, modul Desa Anti Korupsi sudah **production-ready** dengan beberapa improvements yang bisa dilakukan secara incremental. Module ini memiliki error handling yang lebih thorough dibanding module Profil, terutama di kategori update operation.
