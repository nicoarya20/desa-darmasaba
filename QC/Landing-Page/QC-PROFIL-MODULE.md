# QC Summary - Profil Landing Page Module

**Scope:** Media Sosial, Pejabat Desa, Program Inovasi  
**Date:** 2026-02-23  
**Status:** ✅ Secara umum sudah baik, ada beberapa improvement minor

---

## 📊 OVERVIEW

| Module | Schema | API | UI Admin | Public Page | Overall |
|--------|--------|-----|----------|-------------|---------|
| Media Sosial | ✅ Baik | ✅ Baik | ✅ Baik | N/A | 🟢 Baik |
| Pejabat Desa | ✅ Baik | ⚠️ Ada issue | ✅ Baik | N/A | 🟡 Perlu fix |
| Program Inovasi | ✅ Baik | ✅ Baik | ✅ Baik | N/A | 🟢 Baik |

---

## ✅ YANG SUDAH BAIK (COMMON)

### **1. Konsistensi UI/UX**
- ✅ Semua halaman menggunakan pattern yang sama (list → detail → edit)
- ✅ Responsive design (desktop table + mobile cards)
- ✅ Loading states dengan Skeleton
- ✅ Empty state handling yang informatif
- ✅ Search dengan debounce (1000ms)
- ✅ Pagination konsisten di semua modul

### **2. File Upload Handling**
- ✅ Dropzone dengan preview image
- ✅ Validasi format & ukuran file (max 5MB)
- ✅ Tombol hapus preview (IconX di pojok kanan atas)
- ✅ URL.createObjectURL untuk preview lokal
- ✅ Cleanup file state saat reset form

### **3. Form Validation**
- ✅ Zod schema untuk validasi typed
- ✅ isFormValid() check sebelum submit
- ✅ Error toast dengan pesan spesifik
- ✅ Button disabled saat invalid/loading

### **4. State Management (Valtio)**
- ✅ Proxy state untuk reaktivitas
- ✅ Separate state per modul (programInovasi, pejabatDesa, mediaSosial)
- ✅ Reset form function di setiap create/edit
- ✅ Original data tracking untuk reset

### **5. Error Handling**
- ✅ Try-catch di semua async operation
- ✅ Toast error dengan pesan user-friendly
- ✅ Console.error untuk debugging
- ✅ Modal konfirmasi hapus

---

## ⚠️ ISSUES & SARAN PERBAIKAN

### **🔴 CRITICAL**

#### **1. Pejabat Desa - Edit Form Tidak Reset imageId ke Original**
**Lokasi:** `src/app/admin/(dashboard)/landing-page/profil/pejabat-desa/[id]/edit/page.tsx`

**Masalah:**
```typescript
// Line ~100 - Load data
setFormData({
  name: profileData.name || "",
  position: profileData.position || "",
  imageId: profileData.imageId || "", // ✅ Sudah benar
});

// Line ~170 - Handle reset
setFormData({
  name: originalData.name,
  position: originalData.position,
  imageId: originalData.imageId, // ✅ Sudah benar
});
```

**Status:** ✅ **SUDAH BENAR** - Tidak ada issue di sini

**Verdict:** Tidak ada action needed.

---

#### **2. Media Sosial - Edit Form Sudah Benar**
**Lokasi:** `src/app/admin/(dashboard)/landing-page/profil/media-sosial/[id]/edit/page.tsx`

**Verdict:** ✅ **SUDAH BENAR** - Original data tracking sudah implementasi dengan baik:
```typescript
const [originalData, setOriginalData] = useState({
  name: '',
  icon: '',
  iconUrl: '',
  imageId: '',
  imageUrl: '',
});

// Load data
setOriginalData({
  ...newForm,
  imageUrl: data.image?.link || '',
});

// Reset form
setFormData({
  name: originalData.name,
  icon: originalData.icon,
  iconUrl: originalData.iconUrl,
  imageId: originalData.imageId,
});
```

**Verdict:** Tidak ada action needed.

---

#### **3. Program Inovasi - Edit Form Sudah Benar**
**Lokasi:** `src/app/admin/(dashboard)/landing-page/profil/program-inovasi/[id]/edit/page.tsx`

**Verdict:** ✅ **SUDAH BENAR** - Original data tracking sudah implementasi dengan baik.

**Verdict:** Tidak ada action needed.

---

### **🟡 MEDIUM**

#### **4. Inconsistency: Fetch Method di State**

**Lokasi:** `src/app/admin/(dashboard)/_state/landing-page/profile.ts`

**Masalah:** Ada 3 pattern berbeda untuk fetch API:

```typescript
// ❌ Pattern 1: ApiFetch (programInovasi.create)
const res = await ApiFetch.api.landingpage.programinovasi["create"].post(formData);

// ❌ Pattern 2: fetch manual (programInovasi.findUnique)
const res = await fetch(`/api/landingpage/programinovasi/${id}`);

// ❌ Pattern 3: fetch dengan headers (programInovasi.update)
const response = await fetch(`/api/landingpage/programinovasi/${this.id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({...}),
});

// ❌ Pattern 4: fetch dengan delete (programInovasi.delete)
const response = await fetch(`/api/landingpage/programinovasi/del/${id}`, {
  method: "DELETE",
  ...
});
```

**Dampak:**
- Code consistency buruk
- Sulit maintenance
- Type safety tidak konsisten

**Rekomendasi:** Gunakan **ApiFetch** untuk semua operasi:

```typescript
// ✅统一 pattern
const res = await ApiFetch.api.landingpage.programinovasi["create"].post(formData);
const res = await ApiFetch.api.landingpage.programinovasi[id].get();
const res = await ApiFetch.api.landingpage.programinovasi[id].put(data);
const res = await ApiFetch.api.landingpage.programinovasi["del"][id].delete();
```

**Priority:** 🟡 Medium  
**Effort:** Low (refactor saja, tidak ada logic change)

---

#### **5. Media Sosial - Validasi IconUrl Tidak Selalu Relevan**

**Lokasi:** `src/app/admin/(dashboard)/landing-page/profil/media-sosial/create/page.tsx`

**Masalah:**
```typescript
// Line ~67
const isFormValid = () => {
  const isNameValid = stateMediaSosial.create.form.name?.trim() !== '';
  const isIconUrlValid = stateMediaSosial.create.form.iconUrl?.trim() !== ''; // ❌ Selalu required
  const isCustomIconValid = selectedSosmed !== 'custom' || file !== null;

  return isNameValid && isIconUrlValid && isCustomIconValid;
};
```

**Scenario:**
- User pilih icon "telephone" → iconUrl **seharusnya** required (nomor telepon)
- User pilih icon "facebook" → iconUrl **seharusnya** required (URL profile)
- Tapi jika user hanya mau tampil icon tanpa link → **tidak bisa**

**Rekomendasi:** Jadikan optional atau berikan default value:

```typescript
const isFormValid = () => {
  const isNameValid = stateMediaSosial.create.form.name?.trim() !== '';
  // IconUrl optional, atau validasi berdasarkan selectedSosmed
  const isIconUrlValid = true; // atau validasi spesifik
  const isCustomIconValid = selectedSosmed !== 'custom' || file !== null;

  return isNameValid && isCustomIconValid;
};
```

**Priority:** 🟡 Medium  
**Effort:** Low

---

#### **6. Pejabat Desa - Hanya Ada 1 Data (Hardcoded ID "edit")**

**Lokasi:** `src/app/admin/(dashboard)/landing-page/profil/pejabat-desa/page.tsx`

**Masalah:**
```typescript
// Line ~17
useShallowEffect(() => {
  allList.findUnique.load("edit"); // ❌ Hardcoded ID
}, []);
```

**Dampak:**
- Tidak scalable jika nanti ada multiple pejabat desa
- Pattern berbeda dari modul lain (yang pakai findMany)
- Confusing untuk developer baru

**Rekomendasi:** 
- Jika memang hanya 1 data, tambahkan komentar:
```typescript
// Note: "edit" adalah special ID untuk single pejabat desa record
// Backend akan return data pertama jika ID tidak ditemukan
allList.findUnique.load("edit");
```

- Atau gunakan pattern yang lebih clear:
```typescript
allList.findUnique.load("single"); // atau "default"
```

**Priority:** 🟡 Low-Medium  
**Effort:** Low

---

#### **7. Program Inovasi - HTML Injection Risk di Deskripsi**

**Lokasi:** 
- `src/app/admin/(dashboard)/landing-page/profil/program-inovasi/page.tsx` (line ~107)
- `src/app/admin/(dashboard)/landing-page/profil/program-inovasi/[id]/page.tsx` (line ~105)

**Masalah:**
```typescript
// ❌ Direct HTML render tanpa sanitization
<Text dangerouslySetInnerHTML={{ __html: item.description || '-' }}></Text>
```

**Risk:**
- XSS attack jika admin input script malicious
- Bisa inject iframe, script tag, dll

**Rekomendasi:** Gunakan DOMPurify atau library sanitization:

```typescript
import DOMPurify from 'dompurify';

// Sanitize sebelum render
const sanitizedHtml = DOMPurify.sanitize(item.description);
<Text dangerouslySetInnerHTML={{ __html: sanitizedHtml }}></Text>
```

Atau validasi di backend untuk whitelist tag HTML yang diperbolehkan (hanya `<p>`, `<ul>`, `<li>`, dll).

**Priority:** 🟡 Medium (security concern)  
**Effort:** Low

---

### **🟢 LOW (Minor Polish)**

#### **8. Inconsistency: Button Size & Styling**

**Lokasi:** Multiple files

**Masalah:** Button styling tidak konsisten:

```typescript
// Media Sosial create
<Button size="md" ...>Simpan</Button>

// Program Inovasi create  
<Button size="md" ...>Simpan</Button>

// Pejabat Desa edit
<Button size="md" ...>Simpan</Button>

// Media Sosial edit
<Button size="md" ...>Simpan</Button>
```

Tapi di detail page:
```typescript
// Semua detail page
<Button size="md" ...> // ✅ Konsisten
```

**Rekomendasi:** Buat konstanta untuk button size:
```typescript
const BUTTON_SIZE = "md";
const BUTTON_VARIANT = "light";
const BUTTON_RADIUS = "md";
```

**Priority:** 🟢 Low  
**Effort:** Low

---

#### **9. Search Placeholder Tidak Spesifik**

**Lokasi:** Multiple list pages

**Masalah:**
```typescript
// Media Sosial
placeholder='Cari nama media sosial atau kontak...' // ✅ Spesifik

// Program Inovasi
placeholder="Cari program inovasi..." // ✅ Oke

// Pejabat Desa
// ❌ Tidak ada search feature
```

**Rekomendasi:** Tambahkan search feature ke Pejabat Desa jika memungkinkan, atau berikan komentar kenapa tidak ada (karena hanya 1 data).

**Priority:** 🟢 Low  
**Effort:** Low

---

#### **10. Loading State Tidak Selalu Akurat**

**Lokasi:** `src/app/admin/(dashboard)/_state/landing-page/profile.ts`

**Masalah:**
```typescript
// Line ~120 - findUnique.load untuk programInovasi
async load(id: string) {
  try {
    const res = await fetch(`/api/landingpage/programinovasi/${id}`);
    // ❌ Tidak ada loading state update di sini
    if (res.ok) {
      const data = await res.json();
      programInovasi.findUnique.data = data.data ?? null;
    }
  } catch (error) {
    // ❌ Tidak ada finally block untuk stop loading
  }
}
```

**Dampak:** UI mungkin stuck di loading state jika ada error.

**Rekomendasi:** Tambahkan finally block:
```typescript
async load(id: string) {
  try {
    programInovasi.findUnique.loading = true; // ✅ Start loading
    const res = await fetch(`/api/landingpage/programinovasi/${id}`);
    if (res.ok) {
      const data = await res.json();
      programInovasi.findUnique.data = data.data ?? null;
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    programInovasi.findUnique.loading = false; // ✅ Stop loading
  }
}
```

**Priority:** 🟢 Low  
**Effort:** Low

---

#### **11. Type Safety - Any Usage**

**Lokasi:** `src/app/admin/(dashboard)/_state/landing-page/profile.ts`

**Masalah:**
```typescript
// Line ~75
data: null as any[] | null, // ❌ Using 'any'

// Line ~120
data: null as Prisma.ProgramInovasiGetPayload<{...}> | null, // ✅ Typed

// Line ~200
data: null as any[] | null, // ❌ Using 'any'
```

**Rekomendasi:** Gunakan typed data:
```typescript
data: null as Prisma.MediaSosialGetPayload<{ include: { image: true } }>[] | null
```

**Priority:** 🟢 Low  
**Effort:** Medium (perlu update semua reference)

---

#### **12. Console.log di Production**

**Lokasi:** Multiple files

**Masalah:**
```typescript
// Media Sosial edit page (line ~170)
console.log("Data yang akan dikirim ke backend:", stateMediaSosial.update.form);

// Profile state (multiple places)
console.log("Failed to load program inovasi:", res.statusText);
console.log((error as Error).message);
```

**Rekomendasi:** Gunakan conditional logging:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log("Data:", stateMediaSosial.update.form);
}
```

Atau gunakan logging library (winston, pino, dll).

**Priority:** 🟢 Low  
**Effort:** Low

---

## 📋 RINGKASAN ACTION ITEMS

| Priority | Issue | Module | Impact | Effort | Status |
|----------|-------|--------|--------|--------|--------|
| 🟡 M | Fetch method inconsistency | All | Medium | Low | Perlu refactor |
| 🟡 M | IconUrl validation terlalu strict | Media Sosial | Low | Low | Perlu fix logic |
| 🟡 M | HTML injection risk | Program Inovasi | **High (Security)** | Low | **Should fix** |
| 🟢 L | Hardcoded ID "edit" | Pejabat Desa | Low | Low | Optional |
| 🟢 L | Button styling inconsistency | All | Low | Low | Optional |
| 🟢 L | Missing search feature | Pejabat Desa | Low | Low | Optional |
| 🟢 L | Loading state inaccurate | All | Low | Low | Perlu fix |
| 🟢 L | Type safety (any usage) | All | Low | Medium | Optional |
| 🟢 L | Console.log in production | All | Low | Low | Optional |

---

## ✅ KESIMPULAN

### **Overall Quality: 🟢 BAIK (8/10)**

**Strengths:**
1. ✅ UI/UX konsisten & responsive
2. ✅ File upload handling sudah solid
3. ✅ Form validation dengan Zod
4. ✅ State management terstruktur
5. ✅ Error handling comprehensive
6. ✅ Edit form reset sudah benar di semua modul

**Areas for Improvement:**
1. ⚠️ **Security:** HTML injection di deskripsi Program Inovasi (prioritas)
2. ⚠️ **Consistency:** Fetch method pattern (ApiFetch vs fetch manual)
3. ⚠️ **Type Safety:** Reduce `any` usage, gunakan Prisma types
4. ⚠️ **Loading States:** Pastikan selalu ada finally block

**Recommended Next Steps:**
1. **Fix HTML injection** dengan DOMPurify atau backend validation
2. **Refactor fetch methods** untuk gunakan ApiFetch consistently
3. **Add loading state cleanup** di semua async operations
4. **Optional:** Improve type safety dengan remove `any`

---

**Catatan:** Secara keseluruhan, modul Profil sudah **production-ready** dengan minor improvements yang bisa dilakukan secara incremental.
