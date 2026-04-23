# Quality Control Report - Posyandu Kesehatan Admin

**Lokasi:** `/src/app/admin/(dashboard)/kesehatan/posyandu/`  
**Tanggal QC:** 25 Februari 2026  
**Status:** ⚠️ **Needs Improvement** (ada issue critical data loss & validation)

---

## 📋 Ringkasan Eksekutif

Halaman Posyandu Kesehatan memiliki implementasi yang **cukup baik** dengan CRUD lengkap, upload gambar, dan state management terstruktur. Namun ditemukan **15 issue** dengan rincian:

- 🔴 **High Priority:** 5 issue
- 🟡 **Medium Priority:** 5 issue
- 🟢 **Low Priority:** 5 issue

**Overall Score: 6.5/10** - Needs Improvement

---

## 📁 Struktur File yang Diperiksa

```
/src/app/admin/(dashboard)/kesehatan/posyandu/
├── page.tsx                    # List posyandu dengan search & pagination
├── create/
│   └── page.tsx                # Create posyandu dengan upload gambar
└── [id]/
    ├── page.tsx                # Detail posyandu
    └── edit/
        └── page.tsx            # Edit posyandu dengan replace image
```

**File Terkait:**
- State: `/src/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu.ts`
- API: `/src/app/api/[[...slugs]]/_lib/kesehatan/posyandu/` (6 files)
- Schema: `/prisma/schema.prisma` (Model `Posyandu`)
- UI Components: `/src/app/admin/(dashboard)/_com/` (createEditor, editEditor, modalKonfirmasiHapus)

---

## 🔴 HIGH PRIORITY ISSUES

### 1. Delete Operation Hard Delete (DATA LOSS RISK)

**File:** `src/app/api/[[...slugs]]/_lib/kesehatan/posyandu/del.ts`

```typescript
// Line 28-37
// Hapus file gambar dari filesystem
const filePath = path.join(posyandu.image.path, posyandu.image.name);
await fs.unlink(filePath);

// Hapus dari database FileStorage
await prisma.fileStorage.delete({ where: { id: posyandu.image.id } });

// Hapus posyandu (HARD DELETE!) ❌
await prisma.posyandu.delete({ where: { id } });
```

**Schema yang Diharapkan:**
```prisma
model Posyandu {
  deletedAt DateTime? @default(null)  // Soft delete field
  isActive  Boolean @default(true)
}
```

**Dampak:**
- **DATA LOSS** - Data posyandu terhapus permanen, tidak bisa direcover
- Audit trail hilang (riwayat posyandu tidak ada lagi)
- **Inconsistent dengan schema design** yang sudah ada soft delete fields
- Bisa melanggar compliance requirements untuk data retention

**Severity:** 🔴 **HIGH** - Data loss risk

**Solusi:**
```typescript
// Ganti hard delete dengan soft delete
export default async function posyanduDelete(context: Context) {
  const id = context.params?.id as string;
  
  try {
    // SOFT DELETE - Update deletedAt dan isActive
    await prisma.posyandu.update({
      where: { id },
      data: { 
        deletedAt: new Date(),
        isActive: false 
      }
    });
    
    return { 
      success: true, 
      message: "Posyandu berhasil dihapus" 
    };
  } catch (error) {
    console.error("Error deleting posyandu:", error);
    return { success: false, message: "Gagal menghapus posyandu" };
  }
}
```

**Note:** File cleanup sebaiknya tidak dilakukan saat soft delete, atau dipindah ke background job untuk hard delete data yang sudah lama ter-delete.

---

### 2. Tidak Ada Validasi Duplicate Name/Nomor

**File:** `src/app/api/[[...slugs]]/_lib/kesehatan/posyandu/create.ts`

```typescript
// Line 13-23
const posyandu = await prisma.posyandu.create({
  data: {
    name: body.name,        // ❌ Tidak cek duplicate
    nomor: body.nomor,      // ❌ Tidak cek duplicate
    deskripsi: body.deskripsi,
    imageId: body.imageId,
    jadwalPelayanan: body.jadwalPelayanan,
  },
});
```

**Same issue di:** `updt.ts` (update endpoint)

**Dampak:**
- User bisa buat posyandu dengan nama/nomor sama
- Data redundancy
- Confusing saat search dan reporting
- Bisa terjadi data inconsistency

**Severity:** 🔴 **HIGH** - Data integrity

**Solusi:**
```typescript
// Validasi duplicate sebelum create
const existing = await prisma.posyandu.findFirst({
  where: { 
    OR: [
      { name: body.name },
      { nomor: body.nomor }
    ],
    isActive: true
  }
});

if (existing) {
  return Response.json({
    success: false,
    message: "Nama atau nomor posyandu sudah digunakan"
  }, { status: 400 });
}

// Lanjut create
const posyandu = await prisma.posyandu.create({ ... });
```

**Alternative - Schema Level:**
```prisma
model Posyandu {
  name  String @unique @db.VarChar(255)  // Add unique constraint
  nomor String @unique @db.VarChar(50)   // Add unique constraint
  // ...
}
```

---

### 3. Tidak Ada Validasi imageId Existence

**File:** `src/app/api/[[...slugs]]/_lib/kesehatan/posyandu/create.ts`

```typescript
// Line 13-23
const posyandu = await prisma.posyandu.create({
  data: {
    imageId: body.imageId,  // ❌ Tidak cek apakah FileStorage benar ada
    // ...
  },
});
```

**Dampak:**
- User bisa create posyandu dengan `imageId` yang tidak valid
- Orphaned records (posyandu dengan gambar yang tidak ada)
- Bisa error saat fetch data dengan include image

**Severity:** 🔴 **HIGH** - Data integrity

**Solusi:**
```typescript
// Validasi imageId existence
if (body.imageId) {
  const imageExists = await prisma.fileStorage.findUnique({
    where: { id: body.imageId }
  });
  
  if (!imageExists) {
    return Response.json({
      success: false,
      message: "Gambar tidak valid atau tidak ditemukan"
    }, { status: 404 });
  }
}

// Lanjut create
const posyandu = await prisma.posyandu.create({ ... });
```

---

### 4. Race Condition di Edit Page

**File:** `src/app/admin/(dashboard)/kesehatan/posyandu/[id]/edit/page.tsx`

```typescript
// Line 53-59: Local state
const [formData, setFormData] = useState({
  name: '',
  nomor: '',
  deskripsi: '',
  jadwalPelayanan: '',
  imageId: '',
});

// Line 79-95: Load data ke local state
useEffect(() => {
  const loadPosyandu = async () => {
    const data = await statePosyandu.edit.load(params?.id as string);
    if (data) {
      setFormData({
        name: data.name || '',
        nomor: data.nomor || '',
        // ...
      });
    }
  };
  loadPosyandu();
}, [params?.id]);

// Line 100-113: Reset form
const handleResetForm = () => {
  setFormData({
    name: originalData.name,
    nomor: originalData.nomor,
    // ...
  });
  // ❌ statePosyandu.edit.form tidak di-reset
};

// Line 133-140: Sync ke global state sebelum submit
useEffect(() => {
  statePosyandu.edit.form = {
    ...statePosyandu.edit.form,
    ...formData,
  };
}, [formData]);
```

**Dampak:**
- **Dual source of truth** - formData lokal dan statePosyandu.edit.form bisa tidak sinkron
- User bisa submit data yang tidak sesuai dengan yang ditampilkan di form
- Sulit debug karena data ada di 2 tempat

**Severity:** 🔴 **HIGH** - Data consistency

**Solusi:**

**Option A - Gunakan hanya global state (Recommended):**
```typescript
// Hapus local state, gunakan langsung global state
const formData = statePosyandu.edit.form;

const handleResetForm = () => {
  statePosyandu.edit.form = { ...originalData };
};

// Submit langsung
const handleSubmit = async () => {
  // Validasi
  await statePosyandu.edit.update();
};
```

**Option B - Sinkronisasi dengan proper effect:**
```typescript
// Sync global state ke local state saat load
useEffect(() => {
  const loadPosyandu = async () => {
    const data = await statePosyandu.edit.load(params?.id as string);
    if (data) {
      statePosyandu.edit.form = {
        name: data.name || '',
        nomor: data.nomor || '',
        // ...
      };
      setFormData(statePosyandu.edit.form);
    }
  };
  loadPosyandu();
}, [params?.id]);

// Update global state saat formData berubah
useEffect(() => {
  statePosyandu.edit.form = { ...formData };
}, [formData]);
```

---

### 5. Inconsistent API Client Usage

**File:** `src/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu.ts`

```typescript
// Line 45-53 (create) - Menggunakan ApiFetch ✅
const res = await ApiFetch.api.kesehatan.posyandu.create.post(posyandu.create.form);

// Line 90-93 (findUnique) - Menggunakan fetch langsung ❌
const res = await fetch(`/api/kesehatan/posyandu/${id}`);
const data = await res.json();

// Line 108-120 (delete) - Menggunakan fetch langsung ❌
const response = await fetch(`/api/kesehatan/posyandu/del/${id}`, {
  method: 'DELETE',
});
const result = await response.json();

// Line 147-165 (edit.load) - Menggunakan fetch langsung ❌
const response = await fetch(`/api/kesehatan/posyandu/${id}`);
const result = await response.json();
```

**Dampak:**
- Code maintainability kurang
- Tidak type-safe
- Inconsistent error handling
- Sulit refactor

**Severity:** 🔴 **HIGH** - Code quality

**Solusi:**
```typescript
// Gunakan ApiFetch untuk semua
// findUnique
const data = await ApiFetch.api.kesehatan.posyandu[':id'].get({ query: { id } });

// delete
const result = await ApiFetch.api.kesehatan.posyandu['del/:id'].delete({ params: { id } });

// edit.load
const data = await ApiFetch.api.kesehatan.posyandu[':id'].get({ query: { id } });
```

---

## 🟡 MEDIUM PRIORITY ISSUES

### 6. Search Tidak Reset Pagination

**File:** `src/app/admin/(dashboard)/kesehatan/posyandu/page.tsx`

```typescript
// Line 35-38
useShallowEffect(() => {
  load(page, 10, debouncedSearch);
}, [page, debouncedSearch]);
```

**Dampak:**
- User di page 5, search untuk data yang hanya ada di page 1
- Result kosong atau page error
- UX buruk

**Severity:** 🟡 **MEDIUM** - UX issue

**Solusi:**
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

### 7. Find By ID Tidak Filter isActive

**File:** `src/app/api/[[...slugs]]/_lib/kesehatan/posyandu/find-by-id.ts`

```typescript
// Line 13-19
const data = await prisma.posyandu.findUnique({
  where: { id },  // ❌ Tidak filter isActive
  include: { image: true }
});
```

**Dampak:**
- Bisa fetch data yang sudah di-soft delete
- Data inconsistency
- Bisa tampil di UI padahal sudah dihapus

**Severity:** 🟡 **MEDIUM** - Data consistency

**Solusi:**
```typescript
const data = await prisma.posyandu.findFirst({
  where: { 
    id,
    isActive: true,
    deletedAt: null  // ✅ Filter soft-deleted data
  },
  include: { image: true }
});
```

---

### 8. Error Handling Upload Gambar Hanya console.log

**File:** `src/app/admin/(dashboard)/kesehatan/posyandu/create/page.tsx`

```typescript
// Line 81-95
const res = await ApiFetch.api.fileStorage.create.post({
  file,
  name: file.name,
});

const uploaded = res.data?.data;
if (!uploaded?.id) {
  toast.error('Gagal mengunggah gambar');  // ❌ Generic error
  console.error('Gagal upload gambar');     // ❌ Hanya console.log
  return;
}
```

**Dampak:**
- User tidak tahu penyebab error
- Sulit debug production issues
- Error detail hilang

**Severity:** 🟡 **MEDIUM** - UX & debugging

**Solusi:**
```typescript
const uploaded = res.data?.data;
if (!uploaded?.id) {
  const errorMessage = res.data?.message || 'Unknown error';
  console.error('Gagal upload gambar:', errorMessage);
  toast.error(`Gagal upload gambar: ${errorMessage}`);
  return;
}
```

---

### 9. Tidak Ada Progress Indicator Upload

**File:** Create & Edit pages

**Dampak:**
- User tidak tahu upload sedang berjalan
- User bisa klik submit berkali-kali (duplicate upload)
- UX buruk untuk file besar

**Severity:** 🟡 **MEDIUM** - UX

**Solusi:**
```typescript
// Tambah loading state untuk upload
const [uploading, setUploading] = useState(false);

const handleUpload = async (file: File) => {
  setUploading(true);
  try {
    const res = await ApiFetch.api.fileStorage.create.post({
      file,
      name: file.name,
    });
    // ...
  } finally {
    setUploading(false);
  }
};

// Disable button saat uploading
<Button type="submit" loading={submitting || uploading}>
  Simpan
</Button>
```

---

### 10. Validasi Form Hanya di Frontend

**File:** Create & Edit pages

**Dampak:**
- User bisa bypass validation via API call langsung
- Data invalid bisa masuk ke database
- Security risk

**Severity:** 🟡 **MEDIUM** - Security & data integrity

**Solusi:**
```typescript
// Tambah validasi di API create.ts
const { name, nomor, deskripsi, jadwalPelayanan } = await context.body;

// Validasi required fields
if (!name || !nomor || !deskripsi || !jadwalPelayanan) {
  return Response.json({
    success: false,
    message: "Semua field wajib diisi"
  }, { status: 400 });
}

// Validasi length
if (name.length > 255) {
  return Response.json({
    success: false,
    message: "Nama maksimal 255 karakter"
  }, { status: 400 });
}

// Validasi nomor format (jika perlu)
if (!/^\d+$/.test(nomor)) {
  return Response.json({
    success: false,
    message: "Nomor harus angka"
  }, { status: 400 });
}
```

---

## 🟢 LOW PRIORITY ISSUES

### 11. Schema Field `name` Tidak Unique

**File:** `prisma/schema.prisma`

```prisma
model Posyandu {
  name  String  // ❌ Tidak ada @unique (berbeda dengan Berita, KategoriBerita, dll)
  nomor String  // ❌ Tidak ada @unique
  // ...
}
```

**Dampak:** Tidak ada constraint di database level untuk mencegah duplikasi.

**Severity:** 🟢 **LOW** - Schema design

**Solusi:**
```prisma
model Posyandu {
  name  String @unique @db.VarChar(255)
  nomor String @unique @db.VarChar(50)
  // ...
}
```

---

### 12. Tidak Ada Constraint Panjang untuk Field Text

**File:** `prisma/schema.prisma`

```prisma
model Posyandu {
  name            String  // ❌ Tidak ada max length
  nomor           String  // ❌ Tidak ada max length
  deskripsi       String  @db.Text
  jadwalPelayanan String  // ❌ Tidak ada max length
  // ...
}
```

**Dampak:** User bisa input text sangat panjang, bisa break UI atau database.

**Severity:** 🟢 **LOW** - Schema design

**Solusi:**
```prisma
model Posyandu {
  name            String @db.VarChar(255)
  nomor           String @db.VarChar(50)
  deskripsi       String @db.Text
  jadwalPelayanan String @db.VarChar(500)
  // ...
}
```

---

### 13. Empty State Tanpa Illustration

**File:** `src/app/admin/(dashboard)/kesehatan/posyandu/page.tsx`

```typescript
// Line 67-69
{filteredData.length === 0 && (
  <Box py="xl" ta="center">
    <Text c="dimmed">Tidak ada data posyandu</Text>
  </Box>
)}
```

**Dampak:** Empty state kurang informatif dan kurang visually appealing.

**Severity:** 🟢 **LOW** - UX polish

**Solusi:**
```typescript
{filteredData.length === 0 && (
  <Box py="xl" ta="center">
    <Image 
      src="/empty-state.svg" 
      alt="No data" 
      w={200} 
      mx="auto" 
      mb="md"
    />
    <Text fw={600} mb="xs">Tidak ada data posyandu</Text>
    <Text c="dimmed" size="sm">
      {search ? 'Coba kata kunci lain' : 'Mulai dengan menambahkan posyandu baru'}
    </Text>
    {!search && (
      <Button mt="md" onClick={() => router.push('/kesehatan/posyandu/create')}>
        Tambah Posyandu
      </Button>
    )}
  </Box>
)}
```

---

### 14. Tidak Ada Sorting Option

**File:** `find-many.ts` dan `page.tsx`

```typescript
// find-many.ts
orderBy: { createdAt: 'desc' }  // ❌ Hardcoded, tidak ada option sorting
```

**Dampak:** User tidak bisa sort by name, nomor, atau jadwal.

**Severity:** 🟢 **LOW** - UX

**Solusi:**
```typescript
// API find-many.ts
const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = context.query;

orderBy: { 
  [sortBy as string]: sortOrder === 'asc' ? 'asc' : 'desc' 
}
```

---

### 15. Toast Error Tidak Spesifik

**File:** `posyandu.ts` state

```typescript
// Line 45-53
if (res.status === 200) {
  toast.success("Posyandu berhasil disimpan!");
} else {
  toast.error("Gagal menyimpan posyandu");  // ❌ Generic error
}
```

**Dampak:** User tidak tahu penyebab error.

**Severity:** 🟢 **LOW** - UX

**Solusi:**
```typescript
if (res.status === 200) {
  toast.success("Posyandu berhasil disimpan!");
} else {
  const errorMessage = res.data?.message || 'Terjadi kesalahan';
  toast.error(`Gagal menyimpan posyandu: ${errorMessage}`);
}
```

---

## ✅ YANG SUDAH BAIK

### **Schema:**
- ✅ Relasi ke FileStorage untuk gambar sudah benar
- ✅ Soft delete pattern dengan `deletedAt` dan `isActive` (tapi tidak dipakai di delete)
- ✅ Audit trail dengan `createdAt` dan `updatedAt`
- ✅ Field yang diperlukan sudah lengkap (name, nomor, deskripsi, jadwal, image)

### **API:**
- ✅ CRUD lengkap untuk Posyandu
- ✅ Pagination support dengan `page`, `limit`, `search`
- ✅ Search functionality dengan case-insensitive (include semua field)
- ✅ Include relasi image di response
- ✅ File cleanup saat delete (hapus file fisik + database)
- ✅ Error handling ada di semua endpoints
- ✅ Response format konsisten: `{ success, message, data }`

### **UI/UX:**
- ✅ Responsive design (desktop table + mobile cards)
- ✅ Loading states dan skeleton
- ✅ Toast notifications untuk feedback
- ✅ Form validation comprehensive (name, nomor, deskripsi, jadwal, image)
- ✅ Image upload dengan dropzone & preview
- ✅ File size limit & format validation
- ✅ Rich text editor untuk deskripsi dan jadwal
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
- ✅ Separate state untuk create, findMany, findUnique, edit, delete

---

## 📊 Metrics

| Aspek | Score | Keterangan |
|-------|-------|------------|
| **Schema Design** | 6.5/10 | Good structure, tapi tidak ada unique constraints |
| **API Design** | 6.5/10 | RESTful, file cleanup implemented, tapi tidak ada validation |
| **API Security** | 5/10 | Tidak ada auth, tidak ada backend validation |
| **UI/UX** | 7.5/10 | Responsive, comprehensive features |
| **State Management** | 6.5/10 | Valtio works well, inconsistent fetch patterns |
| **Code Quality** | 6.5/10 | Good structure, race condition potential |

**Overall Score: 6.5/10** - **Needs Improvement**

---

## 🎯 Action Plan

### Week 1 (Critical Fixes) 🔴

- [ ] **URGENT:** Fix delete operation (hard delete → soft delete)
- [ ] **URGENT:** Tambahkan validasi duplicate name/nomor di API
- [ ] **URGENT:** Tambahkan validasi imageId existence di API
- [ ] **URGENT:** Fix race condition di edit page (dual state)
- [ ] **URGENT:** Konsistensi fetch pattern (gunakan ApiFetch)

### Week 2 (Medium Priority) 🟡

- [ ] Fix search reset pagination logic
- [ ] Tambahkan filter isActive di find-by-id API
- [ ] Improve error handling upload gambar
- [ ] Tambahkan progress indicator untuk upload
- [ ] Tambahkan backend validation untuk semua field

### Week 3 (Polish) 🟢

- [ ] Tambahkan unique constraint di schema
- [ ] Tambahkan length constraints di schema
- [ ] Improve empty state dengan illustration
- [ ] Tambahkan sorting option
- [ ] Improve toast error messages

---

## 📝 Technical Notes

### **Database Migration:**

Fix deletedAt default dan add unique constraints:
```bash
# Generate migration
bunx prisma migrate dev --name fix_posyandu_deleted_at_and_unique

# Atau jika tidak pakai migrate
bunx prisma db push

# Data cleanup
UPDATE "Posyandu" SET "deletedAt" = NULL WHERE "isActive" = true;
```

### **Soft Delete Implementation:**

Update delete endpoint:
```typescript
// del.ts - Before (hard delete)
await prisma.posyandu.delete({ where: { id } });

// After (soft delete)
await prisma.posyandu.update({
  where: { id },
  data: { 
    deletedAt: new Date(),
    isActive: false 
  }
});
```

### **Duplicate Validation:**

```typescript
// Check existing name/nomor
const existing = await prisma.posyandu.findFirst({
  where: { 
    OR: [
      { name: body.name },
      { nomor: body.nomor }
    ],
    isActive: true,
    id: body.id ? { not: body.id } : undefined  // Exclude current for update
  }
});

if (existing) {
  return Response.json({
    success: false,
    message: "Nama atau nomor posyandu sudah digunakan"
  }, { status: 400 });
}
```

### **Race Condition Fix:**

```typescript
// Option A: Use only global state
const formData = statePosyandu.edit.form;

const handleResetForm = () => {
  statePosyandu.edit.form = { ...originalData };
};

// Submit directly
const handleSubmit = async () => {
  // Validation
  await statePosyandu.edit.update();
};
```

---

## 📚 References

- [Prisma Soft Delete Pattern](https://www.prisma.io/docs/concepts/components/prisma-client/soft-delete)
- [Prisma Unique Constraints](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
- [Mantine Dropzone Documentation](https://mantine.dev/x/dropzone/)
- [React Toastify Documentation](https://fkhadra.github.io/react-toastify/)
- [Zod Documentation](https://zod.dev/)
- [Valtio Documentation](https://docs.pmnd.rs/valtio)

---

## 📈 Comparison dengan QC Sebelumnya

| Aspek | Profil | Potensi | Berita | Pengumuman | Gallery | Layanan | Penghargaan | **Posyandu** |
|-------|--------|---------|--------|------------|---------|---------|-------------|--------------|
| Schema | 6/10 | 7/10 | 8/10 | 7/10 | 6/10 | 7/10 | 7/10 | **6.5/10** |
| API Design | 7/10 | 8/10 | 7.5/10 | 7/10 | 6/10 | 5/10 | 7.5/10 | **6.5/10** |
| API Security | 4/10 | 6/10 | 6/10 | 6/10 | 4/10 | 5/10 | 5/10 | **5/10** |
| UI/UX | 8/10 | 8.5/10 | 8/10 | 7.5/10 | 7.5/10 | 7.5/10 | 8/10 | **7.5/10** ✅ |
| State Mgmt | 7/10 | 8/10 | 8/10 | 7/10 | 6.5/10 | 6.5/10 | 7/10 | **6.5/10** |
| Code Quality | 7/10 | 7.5/10 | 7/10 | 6.5/10 | 6/10 | 6/10 | 7/10 | **6.5/10** |
| **Overall** | **6.5/10** | **7.5/10** | **7/10** | **6.5/10** | **6/10** | **6.5/10** | **7/10** | **6.5/10** |

**Posyandu** memiliki score sama dengan **Profil Desa** dan **Pengumuman** karena:

**Positif:**
- ✅ CRUD lengkap & berfungsi dengan baik
- ✅ File cleanup implemented (delete) ✅
- ✅ Responsive design bagus
- ✅ Comprehensive validation di frontend
- ✅ Rich text editor untuk 2 field (deskripsi & jadwal)
- ✅ Search include semua field

**Negatif:**
- ❌ **Hard delete** vs soft delete mismatch (data loss risk)
- ❌ **Tidak ada validasi backend** (duplicate, imageId, required fields)
- ❌ **Race condition** di edit page (dual state)
- ❌ **Inconsistent fetch patterns** (ApiFetch vs fetch)
- ❌ **Tidak ada unique constraints** di schema
- ❌ **Tidak ada authentication** di API

---

**Dibuat oleh:** QC Automation  
**Review Status:** ⏳ Menunggu Review Developer  
**Next Review:** Setelah implementasi fixes
