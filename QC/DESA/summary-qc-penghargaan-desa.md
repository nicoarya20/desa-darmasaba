# Quality Control Report - Penghargaan Desa Admin

**Lokasi:** `/src/app/admin/(dashboard)/desa/penghargaan/`  
**Tanggal QC:** 25 Februari 2026  
**Status:** ✅ **Good** (dengan beberapa issue security yang perlu diperbaiki)

---

## 📋 Ringkasan Eksekutif

Halaman Penghargaan Desa memiliki implementasi yang **cukup baik** dengan CRUD lengkap, upload gambar, dan state management terstruktur. Ditemukan **11 issue** dengan rincian:

- 🔴 **High Priority:** 2 issue
- 🟡 **Medium Priority:** 5 issue
- 🟢 **Low Priority:** 4 issue

**Overall Score: 7/10** - Good

---

## 📁 Struktur File yang Diperiksa

```
/src/app/admin/(dashboard)/desa/penghargaan/
├── page.tsx                    # List penghargaan dengan search & pagination
├── create/
│   └── page.tsx                # Create penghargaan dengan upload gambar
└── [id]/
    ├── page.tsx                # Detail penghargaan
    └── edit/
        └── page.tsx            # Edit penghargaan dengan replace image
```

**File Terkait:**
- State: `/src/app/admin/(dashboard)/_state/desa/penghargaan.ts`
- API: `/src/app/api/[[...slugs]]/_lib/desa/penghargaan/` (6 files)
- Schema: `/prisma/schema.prisma` (Model `Penghargaan`)

---

## 🔴 HIGH PRIORITY ISSUES

### 1. XSS Vulnerability via `dangerouslySetInnerHTML`

**File:** `src/app/admin/(dashboard)/desa/penghargaan/page.tsx`

```typescript
// Line 79
<TableTd
  dangerouslySetInnerHTML={{
    __html: item.deskripsi,  // ❌ XSS VULNERABILITY
  }}
/>
```

**Same issue di:** `src/app/admin/(dashboard)/desa/penghargaan/[id]/page.tsx` line 89

```typescript
<Box
  dangerouslySetInnerHTML={{
    __html: data.deskripsi,  // ❌ XSS VULNERABILITY
  }}
/>
```

**Dampak:**
- User bisa inject malicious script melalui rich text editor
- XSS attack bisa mencuri session, cookies, atau data sensitif
- Admin lain yang lihat data bisa terinfeksi

**Severity:** 🔴 **HIGH** - Security vulnerability

**Solusi:**

**Option A - Sanitize HTML (Recommended):**
```typescript
// Install: bun add dompurify
import DOMPurify from 'dompurify';

// Di component
<TableTd
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(item.deskripsi, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: []
    })
  }}
/>
```

**Option B - Strip HTML Tags:**
```typescript
const stripHtml = (html: string) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

<TableTd>{stripHtml(item.deskripsi)}</TableTd>
```

**Option C - Server-Side Sanitization:**
```typescript
// Di API create.ts dan updt.ts
import sanitizeHtml from 'sanitize-html';

const sanitizedDeskripsi = sanitizeHtml(body.deskripsi, {
  allowedTags: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li'],
  allowedAttributes: {}
});
```

---

### 2. Inconsistent Fetch Patterns (ApiFetch vs fetch)

**File:** `src/app/admin/(dashboard)/_state/desa/penghargaan.ts`

```typescript
// Line 45-53 (create) - Menggunakan ApiFetch ✅
const res = await ApiFetch.api.desa.penghargaan.create.post(penghargaan.create.form);

// Line 90-93 (findUnique) - Menggunakan fetch langsung ❌
const res = await fetch(`/api/desa/penghargaan/${id}`);
const data = await res.json();

// Line 108-120 (delete) - Menggunakan fetch langsung ❌
const response = await fetch(`/api/desa/penghargaan/del/${id}`, {
  method: 'DELETE',
});
const result = await response.json();

// Line 147-165 (edit.load) - Menggunakan fetch langsung ❌
const response = await fetch(`/api/desa/penghargaan/${id}`);
const result = await response.json();
```

**Dampak:**
- Code maintainability kurang
- Tidak type-safe
- Inconsistent error handling
- Sulit refactor

**Severity:** 🔴 **HIGH** - Code quality issue

**Solusi:**
```typescript
// Gunakan ApiFetch untuk semua
// findUnique
const data = await ApiFetch.api.desa.penghargaan[':id'].get({ query: { id } });

// delete
const result = await ApiFetch.api.desa.penghargaan['del/:id'].delete({ params: { id } });

// edit.load
const data = await ApiFetch.api.desa.penghargaan[':id'].get({ query: { id } });
```

---

## 🟡 MEDIUM PRIORITY ISSUES

### 3. Tidak Ada Validasi Duplicate Name

**File:** `src/app/api/[[...slugs]]/_lib/desa/penghargaan/create.ts`

```typescript
// Line 13-23
const penghargaan = await prisma.penghargaan.create({
  data: {
    name: body.name,        // ❌ Tidak cek duplicate
    juara: body.juara,
    deskripsi: body.deskripsi,
    imageId: body.imageId,
  },
});
```

**Same issue di:** `updt.ts` (update endpoint)

**Dampak:**
- User bisa buat penghargaan dengan nama sama
- Data redundancy
- Confusing saat search

**Severity:** 🟡 **MEDIUM** - Data integrity

**Solusi:**
```typescript
// Check duplicate sebelum create
const existing = await prisma.penghargaan.findFirst({
  where: { 
    name: body.name,
    isActive: true 
  }
});

if (existing) {
  return Response.json({
    success: false,
    message: "Nama penghargaan sudah digunakan"
  }, { status: 400 });
}

// Lanjut create
const penghargaan = await prisma.penghargaan.create({ ... });
```

**Alternative - Schema Level:**
```prisma
model Penghargaan {
  name      String   @unique  // Add unique constraint
  // ...
}
```

---

### 4. Search Tidak Reset Pagination

**File:** `src/app/admin/(dashboard)/desa/penghargaan/page.tsx`

```typescript
// Line 35-38
useShallowEffect(() => {
  load(page, 10, debouncedSearch);
}, [page, debouncedSearch]);
```

**Dampak:**
- User di page 5, search untuk data yang hanya ada di page 1
- Result kosong, user bingung
- UX buruk

**Severity:** 🟡 **MEDIUM** - UX issue

**Solusi:**
```typescript
// Reset page saat search berubah
useShallowEffect(() => {
  if (debouncedSearch !== search) {
    setPage(1);  // Reset to page 1
  }
  load(page, 10, debouncedSearch);
}, [page, debouncedSearch, search]);
```

**Better Solution:**
```typescript
// Watch search separately
useEffect(() => {
  setPage(1);  // Reset page saat search berubah
}, [debouncedSearch]);

useEffect(() => {
  load(page, 10, debouncedSearch);
}, [page, debouncedSearch]);
```

---

### 5. Image Upload Hanya Saat Submit

**File:** `src/app/admin/(dashboard)/desa/penghargaan/create/page.tsx`

```typescript
// Line 81-95
const handleSubmit = async () => {
  // Validasi
  // ...
  
  // Upload image BARU saat submit
  const res = await ApiFetch.api.fileStorage.create.post({
    file,
    name: file.name,
  });
  
  const uploaded = res.data?.data;
  if (!uploaded?.id) {
    return toast.error('Gagal mengunggah gambar');
  }
  
  // Create penghargaan
  await statePenghargaan.penghargaan.create.form.imageId = uploaded.id;
  await statePenghargaan.penghargaan.create();
};
```

**Dampak:**
- Jika create penghargaan gagal, file sudah ter-upload (orphaned file)
- User tidak bisa preview image yang sudah di-upload sebelumnya
- Tidak ada progress indicator saat upload

**Severity:** 🟡 **MEDIUM** - Data integrity & UX

**Solusi:**

**Option A - Upload Dulu, Baru Create:**
```typescript
// Upload immediately saat file selected
const handleFileChange = async (file: File) => {
  const res = await ApiFetch.api.fileStorage.create.post({
    file,
    name: file.name,
  });
  
  const uploaded = res.data?.data;
  if (uploaded?.id) {
    setFile(file);
    setPreviewImage(URL.createObjectURL(file));
    statePenghargaan.penghargaan.create.form.imageId = uploaded.id;
  }
};

// Submit hanya create penghargaan
const handleSubmit = async () => {
  await statePenghargaan.penghargaan.create();
};
```

**Option B - Transaction dengan Rollback:**
```typescript
const handleSubmit = async () => {
  try {
    // Upload file
    const uploaded = await uploadFile(file);
    
    // Create penghargaan
    const result = await createPenghargaan({ imageId: uploaded.id });
    
    if (!result.success) {
      // Rollback: delete uploaded file
      await deleteFile(uploaded.id);
      throw new Error('Create failed');
    }
  } catch (error) {
    toast.error('Gagal membuat penghargaan');
  }
};
```

---

### 6. Dropzone Accept Format Typo

**File:** `src/app/admin/(dashboard)/desa/penghargaan/create/page.tsx`

```typescript
// Line 140-143
<Dropzone
  accept={{
    'image/*': ['.jpeg', '.jpg', '.png', 'webp']  // ❌ Typo: "webp" seharusnya ".webp"
  }}
  // ...
>
```

**Same issue di:** `edit/page.tsx` line 180-183

**Dampak:**
- File `.webp` tidak akan di-accept oleh dropzone
- User confusion saat coba upload WebP
- Inconsistent dengan validasi lainnya

**Severity:** 🟡 **MEDIUM** - UX issue

**Solusi:**
```typescript
<Dropzone
  accept={{
    'image/*': ['.jpeg', '.jpg', '.png', '.webp']  // ✅ Fix typo
  }}
  // ...
>
```

---

### 7. Schema `deletedAt` Default Value (SAME BUG)

**File:** `prisma/schema.prisma`

```prisma
model Penghargaan {
  id        String   @id @default(cuid())
  name      String
  deletedAt DateTime @default(now())  // ❌ SAME BUG AS OTHER MODULES
  isActive  Boolean  @default(true)
}
```

**Dampak:**
- Record baru langsung ter-mark deleted saat dibuat
- Soft delete logic tidak bekerja
- Query dengan `deletedAt: null` tidak dapat data baru

**Severity:** 🟡 **MEDIUM** - Data integrity bug

**Solusi:**
```prisma
model Penghargaan {
  id        String   @id @default(cuid())
  name      String
  deletedAt DateTime?  // ✅ Nullable, tanpa default
  isActive  Boolean  @default(true)
}
```

**Migration:**
```bash
bunx prisma db push
# atau
bunx prisma migrate dev --name fix_penghargaan_deleted_at

# Data cleanup
UPDATE "Penghargaan" SET "deletedAt" = NULL WHERE "isActive" = true;
```

---

## 🟢 LOW PRIORITY ISSUES

### 8. `isHtmlEmpty` Tidak Handle Edge Cases

**File:** `src/app/admin/(dashboard)/desa/penghargaan/create/page.tsx`

```typescript
// Line 23-26
const isHtmlEmpty = (html: string) => {
  const textContent = html.replace(/<[^>]*>/g, '').trim();
  return textContent === '';
};
```

**Dampak:**
- HTML dengan hanya `&nbsp;` atau `<br>` akan dianggap empty
- User bisa submit content yang sebenarnya kosong

**Severity:** 🟢 **LOW** - Validation edge case

**Solusi:**
```typescript
const isHtmlEmpty = (html: string) => {
  // Strip HTML tags
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  // Get text content
  const textContent = tmp.textContent || tmp.innerText || '';
  // Check if empty or only whitespace
  return textContent.trim().length === 0;
};
```

---

### 9. Duplicate Validation Check

**File:** `src/app/admin/(dashboard)/desa/penghargaan/create/page.tsx`

```typescript
// Line 58-73: Validasi pertama
const handleSubmit = async () => {
  if (!statePenghargaan.penghargaan.create.form.name?.trim()) {
    toast.error('Nama penghargaan wajib diisi');
    return;
  }
  // ... validasi lainnya
  
  // Line 81-84: Validasi diulang lagi (redundant)
  if (
    !statePenghargaan.penghargaan.create.form.name?.trim() ||
    !statePenghargaan.penghargaan.create.form.juara?.trim() ||
    isHtmlEmpty(statePenghargaan.penghargaan.create.form.deskripsi) ||
    !file
  ) {
    toast.error('Mohon lengkapi semua data');
    return;
  }
};
```

**Dampak:** Code redundancy, minor performance overhead.

**Severity:** 🟢 **LOW** - Code quality

**Solusi:**
```typescript
const handleSubmit = async () => {
  // Single validation block
  if (!statePenghargaan.penghargaan.create.form.name?.trim()) {
    toast.error('Nama penghargaan wajib diisi');
    return;
  }
  if (!statePenghargaan.penghargaan.create.form.juara?.trim()) {
    toast.error('Juara wajib diisi');
    return;
  }
  if (isHtmlEmpty(statePenghargaan.penghargaan.create.form.deskripsi)) {
    toast.error('Deskripsi wajib diisi');
    return;
  }
  if (!file) {
    toast.error('Gambar wajib diunggah');
    return;
  }
  
  // Submit logic
  // ...
};
```

---

### 10. Inconsistent Button Labels (Reset vs Batal)

**File:** Create page vs Edit page

```typescript
// create/page.tsx line 109
<Button onClick={resetForm} variant="outline" color="gray">
  Reset  // ❌ Inconsistent
</Button>

// edit/page.tsx line 100
<Button onClick={handleResetForm} variant="outline" color="gray">
  Batal  // ❌ Inconsistent
</Button>
```

**Dampak:** Minor UX inconsistency.

**Severity:** 🟢 **LOW** - UX consistency

**Solusi:** Standardize to "Reset Form" untuk kedua page.

---

### 11. Tidak Ada Karakter Counter

**File:** Create & Edit pages

```typescript
<TextInput
  label="Nama Penghargaan"
  value={statePenghargaan.penghargaan.create.form.name}
  onChange={(e) => {
    statePenghargaan.penghargaan.create.form.name = e.target.value;
  }}
  // ❌ Tidak ada maxLength atau character counter
/>
```

**Dampak:** User tidak tahu ada limit atau tidak.

**Severity:** 🟢 **LOW** - UX polish

**Solusi:**
```typescript
<TextInput
  label="Nama Penghargaan"
  value={statePenghargaan.penghargaan.create.form.name}
  onChange={(e) => {
    statePenghargaan.penghargaan.create.form.name = e.target.value;
  }}
  maxLength={255}  // Add max length
  rightSection={
    <Text size="sm" c="dimmed">
      {statePenghargaan.penghargaan.create.form.name?.length || 0}/255
    </Text>
  }
/>
```

---

## ✅ YANG SUDAH BAIK

### **Schema:**
- ✅ Relasi ke FileStorage untuk gambar sudah benar
- ✅ Soft delete pattern dengan `deletedAt` dan `isActive`
- ✅ Audit trail dengan `createdAt` dan `updatedAt`
- ✅ Field yang diperlukan sudah lengkap

### **API:**
- ✅ CRUD lengkap untuk Penghargaan
- ✅ Pagination support dengan `page`, `limit`, `search`
- ✅ Search functionality dengan case-insensitive
- ✅ Include relasi image di response
- ✅ **File cleanup saat update** (hapus old image) ✅
- ✅ **File cleanup saat delete** (hapus image) ✅
- ✅ Parallel query untuk data & count (optimasi performa)
- ✅ Response format mostly konsisten: `{ success, message, data }`

### **UI/UX:**
- ✅ Responsive design (desktop table + mobile cards)
- ✅ Loading states dan skeleton
- ✅ Toast notifications untuk feedback
- ✅ Form validation comprehensive
- ✅ Image upload dengan dropzone & preview
- ✅ File size limit & format validation
- ✅ Rich text editor untuk deskripsi
- ✅ Search dengan debounce (1000ms)
- ✅ Modal konfirmasi hapus
- ✅ Empty state message
- ✅ Reset form functionality
- ✅ Button disabled saat invalid/submitting

### **State Management:**
- ✅ Valtio proxy untuk global state
- ✅ Zod validation schema
- ✅ Loading state management
- ✅ Auto-refresh after CRUD operations
- ✅ Error handling dengan toast

---

## 📊 Metrics

| Aspek | Score | Keterangan |
|-------|-------|------------|
| **Schema Design** | 7/10 | Good, tapi ada bug deletedAt |
| **API Design** | 7.5/10 | RESTful, file cleanup implemented |
| **API Security** | 5/10 | Tidak ada auth, XSS vulnerability |
| **UI/UX** | 8/10 | Responsive, comprehensive features |
| **State Management** | 7/10 | Valtio works well, inconsistent fetch |
| **Code Quality** | 7/10 | Good structure, minor inconsistencies |

**Overall Score: 7/10** - **Good**

---

## 🎯 Action Plan

### Week 1 (Critical Fixes) 🔴

- [ ] **URGENT:** Sanitize HTML content (DOMPurify) untuk XSS prevention
- [ ] **URGENT:** Konsistensi fetch pattern (gunakan ApiFetch untuk semua)

### Week 2 (Medium Priority) 🟡

- [ ] Tambahkan validasi duplicate name di API create/update
- [ ] Fix search reset pagination logic
- [ ] Fix image upload timing (upload dulu atau transaction)
- [ ] Fix dropzone accept format typo (`.webp`)
- [ ] Fix `deletedAt @default(now())` di schema

### Week 3 (Polish) 🟢

- [ ] Improve `isHtmlEmpty` function
- [ ] Remove duplicate validation
- [ ] Standardize button labels (Reset Form)
- [ ] Add character counter untuk text fields
- [ ] Add loading state saat load data di edit page

---

## 📝 Technical Notes

### **Database Migration:**

Fix deletedAt default:
```bash
bunx prisma migrate dev --name fix_penghargaan_deleted_at
# atau
bunx prisma db push

# Data cleanup
UPDATE "Penghargaan" SET "deletedAt" = NULL WHERE "isActive" = true;
```

### **XSS Prevention:**

Install DOMPurify:
```bash
bun add dompurify
bun add -D @types/dompurify
```

Usage:
```typescript
import DOMPurify from 'dompurify';

// Di component
<Box
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(data.deskripsi, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: []
    })
  }}
/>
```

### **Duplicate Name Prevention:**

API validation:
```typescript
// Check existing name
const existing = await prisma.penghargaan.findFirst({
  where: { 
    name: body.name,
    isActive: true,
    id: body.id ? { not: body.id } : undefined  // Exclude current for update
  }
});

if (existing) {
  return Response.json({
    success: false,
    message: "Nama penghargaan sudah digunakan"
  }, { status: 400 });
}
```

### **Search Reset Pagination:**

```typescript
// Watch search separately
useEffect(() => {
  setPage(1);  // Reset page saat search berubah
}, [debouncedSearch]);

useEffect(() => {
  load(page, 10, debouncedSearch);
}, [page, debouncedSearch]);
```

---

## 📚 References

- [Prisma Soft Delete Pattern](https://www.prisma.io/docs/concepts/components/prisma-client/soft-delete)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Mantine Dropzone Documentation](https://mantine.dev/x/dropzone/)
- [React Toastify Documentation](https://fkhadra.github.io/react-toastify/)
- [Zod Documentation](https://zod.dev/)

---

## 📈 Comparison dengan QC Sebelumnya

| Aspek | Profil | Potensi | Berita | Pengumuman | Gallery | Layanan | **Penghargaan** |
|-------|--------|---------|--------|------------|---------|---------|-----------------|
| Schema | 6/10 | 7/10 | 8/10 | 7/10 | 6/10 | 7/10 | **7/10** |
| API Design | 7/10 | 8/10 | 7.5/10 | 7/10 | 6/10 | 5/10 | **7.5/10** ✅ |
| API Security | 4/10 | 6/10 | 6/10 | 6/10 | 4/10 | 5/10 | **5/10** |
| UI/UX | 8/10 | 8.5/10 | 8/10 | 7.5/10 | 7.5/10 | 7.5/10 | **8/10** ✅ |
| State Mgmt | 7/10 | 8/10 | 8/10 | 7/10 | 6.5/10 | 6.5/10 | **7/10** |
| Code Quality | 7/10 | 7.5/10 | 7/10 | 6.5/10 | 6/10 | 6/10 | **7/10** |
| **Overall** | **6.5/10** | **7.5/10** | **7/10** | **6.5/10** | **6/10** | **6.5/10** | **7/10** |

**Penghargaan** memiliki score **tertinggi kedua** (setelah Potensi Desa) karena:

**Positif:**
- ✅ CRUD lengkap & berfungsi dengan baik
- ✅ File cleanup implemented (update & delete) ✅
- ✅ Responsive design bagus
- ✅ Comprehensive validation
- ✅ Parallel query untuk performa
- ✅ Tidak ada incomplete features (seperti Layanan)
- ✅ Tidak ada critical data loss bugs (seperti Gallery)

**Yang Perlu Diperbaiki:**
- ❌ XSS vulnerability (dangerouslySetInnerHTML)
- ❌ Inconsistent fetch patterns
- ❌ Duplicate name validation tidak ada
- ❌ `deletedAt @default(now())` bug
- ❌ Search tidak reset pagination

---

**Dibuat oleh:** QC Automation  
**Review Status:** ⏳ Menunggu Review Developer  
**Next Review:** Setelah implementasi fixes
