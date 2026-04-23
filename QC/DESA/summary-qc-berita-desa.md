# Quality Control Report - Berita Desa Admin

**Lokasi:** `/src/app/admin/(dashboard)/desa/berita/`  
**Tanggal QC:** 25 Februari 2026  
**Status:** ✅ **Good** (dengan issue critical yang perlu diperbaiki)

---

## 📋 Ringkasan Eksekutif

Halaman Berita Desa memiliki implementasi yang **cukup baik** dengan CRUD lengkap, state management terstruktur, dan UI yang responsive. Ditemukan **14 issue** dengan rincian:

- 🔴 **High Priority:** 3 issue
- 🟡 **Medium Priority:** 7 issue
- 🟢 **Low Priority:** 4 issue

**Overall Score: 7/10** - Good

---

## 📁 Struktur File yang Diperiksa

```
/src/app/admin/(dashboard)/desa/berita/
├── layout.tsx
├── _com/
│   ├── BeritaEditor.tsx        # Rich text editor component
│   └── layoutTabs.tsx          # Tab navigation
├── kategori-berita/
│   ├── page.tsx                # List kategori dengan search & pagination
│   ├── create/
│   │   └── page.tsx            # Form create kategori
│   └── [id]/
│       └── page.tsx            # Edit kategori
└── list-berita/
    ├── page.tsx                # List berita dengan search & pagination
    ├── create/
    │   └── page.tsx            # Form create berita (rich text + image)
    └── [id]/
        ├── page.tsx            # Detail berita
        └── edit/
            └── page.tsx        # Edit berita
```

**File Terkait:**
- State: `/src/app/admin/(dashboard)/_state/desa/berita.ts`
- API: `/src/app/api/[[...slugs]]/_lib/desa/berita/` (8 files)
- API: `/src/app/api/[[...slugs]]/_lib/desa/berita/kategori-berita/` (6 files)
- Schema: `/prisma/schema.prisma` (Model `Berita` & `KategoriBerita`)

---

## 🔴 HIGH PRIORITY ISSUES

### 1. API - Kategori Masih Digunakan Bisa Dihapus

**File:** `src/app/api/[[...slugs]]/_lib/desa/berita/kategori-berita/del.ts`

```typescript
export default async function kategoriBeritaDelete(context: Context) {
  const id = context.params?.id as string;
  
  // ❌ Tidak cek apakah kategori masih dipakai oleh Berita
  await prisma.kategoriBerita.delete({ where: { id } });
  
  return { success: true, message: "Kategori berita berhasil dihapus" };
}
```

**Dampak:** 
- Data integrity bermasalah - berita kehilangan referensi kategori
- Bisa terjadi foreign key constraint error
- Berita yang sudah ada jadi tidak punya kategori

**Solusi:**
```typescript
// Cek apakah masih ada berita yang menggunakan kategori ini
const beritaCount = await prisma.berita.count({
  where: { 
    kategoriBeritaId: id,
    isActive: true 
  }
});

if (beritaCount > 0) {
  return Response.json({
    success: false,
    message: `Kategori tidak dapat dihapus karena masih digunakan oleh ${beritaCount} berita`
  }, { status: 400 });
}

// Lanjut delete jika tidak ada yang menggunakan
await prisma.kategoriBerita.update({
  where: { id },
  data: { deletedAt: new Date(), isActive: false }
});

return { success: true, message: "Kategori berita berhasil dihapus" };
```

---

### 2. UI - Search Parameter Hilang Saat Pagination

**File:** `src/app/admin/(dashboard)/desa/berita/list-berita/page.tsx`

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

**Solusi:**
```typescript
<Pagination
  total={totalPages}
  value={page}
  onChange={(newPage) => {
    load(newPage, 10, search);  // ✅ Include search parameter
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

### 3. UI - colSpan Tidak Sesuai Jumlah Kolom

**File:** `src/app/admin/(dashboard)/desa/berita/kategori-berita/page.tsx`

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

## 🟡 MEDIUM PRIORITY ISSUES

### 4. Schema - `deletedAt` Default `now()` Bermasalah

**File:** `prisma/schema.prisma`

```prisma
model Berita {
  deletedAt DateTime @default(now())  // ❌ Problematic default
  isActive  Boolean @default(true)
}

model KategoriBerita {
  deletedAt DateTime @default(now())  // ❌ Problematic default
  isActive  Boolean @default(true)
}
```

**Dampak:**
- Record baru langsung ter-mark sebagai deleted saat create
- Soft delete logic tidak bekerja dengan benar
- Query dengan filter `deletedAt: null` tidak akan dapat data baru

**Solusi:**
```prisma
model Berita {
  deletedAt DateTime?  // ✅ Nullable, tanpa default
  isActive  Boolean @default(true)
}

model KategoriBerita {
  deletedAt DateTime?  // ✅ Nullable, tanpa default
  isActive  Boolean @default(true)
}
```

**Migration Required:**
```bash
bunx prisma db push
# atau
bunx prisma migrate dev --name fix_deleted_at_default
```

**Data Cleanup:**
```sql
-- Update record yang ter-affected
UPDATE "Berita" SET "deletedAt" = NULL WHERE "isActive" = true;
UPDATE "KategoriBerita" SET "deletedAt" = NULL WHERE "isActive" = true;
```

---

### 5. API - Create Tidak Return Data dari Database

**File:** `src/app/api/[[...slugs]]/_lib/desa/berita/create.ts`

```typescript
const created = await prisma.berita.create({
  data: {
    ...body,
    kategoriBeritaId: kategori?.id
  }
});

return {
  success: true,
  message: "Sukses menambahkan berita",
  data: { ...body }  // ❌ Return input body, bukan data dari DB
};
```

**Dampak:**
- Frontend tidak dapat data lengkap (ID, timestamps, relasi)
- User harus refresh untuk lihat data lengkap
- Inconsistent dengan API lain yang return data dari DB

**Solusi:**
```typescript
const created = await prisma.berita.create({
  data: {
    ...body,
    kategoriBeritaId: kategori?.id
  },
  include: {
    image: true,
    kategoriBerita: true
  }
});

return {
  success: true,
  message: "Sukses menambahkan berita",
  data: created  // ✅ Return data dari DB dengan relasi
};
```

---

### 6. API - Order By `asc` untuk Kategori Tidak Ideal

**File:** `src/app/api/[[...slugs]]/_lib/desa/berita/kategori-berita/findMany.ts`

```typescript
const data = await prisma.kategoriBerita.findMany({
  where,
  orderBy: { createdAt: 'asc' },  // ⚠️ Data lama muncul dulu
  skip,
  take: limit
});
```

**Dampak:** Kategori baru (yang mungkin lebih relevan) ada di bawah.

**Solusi:**
```typescript
const data = await prisma.kategoriBerita.findMany({
  where,
  orderBy: { createdAt: 'desc' },  // ✅ Data terbaru dulu
  skip,
  take: limit
});
```

---

### 7. UI - Button Label "Batal" untuk Reset Form Membingungkan

**File:** `src/app/admin/(dashboard)/desa/berita/kategori-berita/[id]/page.tsx`

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

### 8. UI - Dropzone Accept Tidak Spesifik

**File:** `src/app/admin/(dashboard)/desa/berita/list-berita/create/page.tsx` dan `edit/page.tsx`

```typescript
<Dropzone
  accept={{ "image/*": [] }}  // ❌ Terlalu general
  // ...
>
```

**Dampak:** User bisa coba upload format image aneh yang tidak didukung browser.

**Solusi:**
```typescript
<Dropzone
  accept={{ 
    'image/*': ['.jpeg', '.jpg', '.png', '.webp']  // ✅ Specify extensions
  }}
  // ...
>
```

---

### 9. State - Inconsistent API Client (fetch vs ApiFetch)

**File:** `src/app/admin/(dashboard)/_state/desa/berita.ts`

```typescript
// ❌ Inconsistent - fetch langsung
const res = await fetch(`/api/desa/berita/${id}`);
const data = await res.json();

// ✅ Di tempat lain pakai ApiFetch
const data = await ApiFetch.api.desa.berita[':id'].get({ query: { id } });
```

**Dampak:** Code maintainability kurang, tidak konsisten.

**Solusi:**
```typescript
// Gunakan ApiFetch untuk semua
const data = await ApiFetch.api.desa.berita[':id'].get({ query: { id } });
```

---

### 10. Layout - `isDetailPage` Logic Kurang Robust

**File:** `src/app/admin/(dashboard)/desa/berita/layout.tsx`

```typescript
const segments = pathname.split('/').filter(Boolean);
const isDetailPage = segments.length >= 5;  // ❌ Magic number, bisa false positive
```

**Dampak:** Bisa false positive untuk path lain yang length sama.

**Solusi:**
```typescript
// Option 1: Check for specific segments
const isDetailPage = segments.some(seg => 
  ['create', 'edit'].includes(seg) || /^\w{20,}$/.test(seg)  // CUID pattern
);

// Option 2: Check last segment
const lastSegment = segments[segments.length - 1];
const isDetailPage = ['create', 'edit'].includes(lastSegment) || 
                     /^[a-zA-Z0-9]{20,}$/.test(lastSegment);
```

---

## 🟢 LOW PRIORITY ISSUES

### 11. Form Validation Hanya Cek `trim()`

**File:** `src/app/admin/(dashboard)/desa/berita/kategori-berita/create/page.tsx`

```typescript
const isFormValid = () => {
  return createState.create.form.name?.trim().length > 0;  // ⚠️ Hanya cek empty
};
```

**Dampak:** User bisa input nama 1 karakter.

**Solusi:**
```typescript
const isFormValid = () => {
  const name = createState.create.form.name?.trim();
  return name && name.length >= 3;  // ✅ Minimal 3 karakter
};
```

---

### 12. Error Handling Upload Gambar Generic

**File:** `src/app/admin/(dashboard)/desa/berita/list-berita/create/page.tsx`

```typescript
catch (error) {
  toast.error('Gagal upload gambar');  // ⚠️ Generic message
}
```

**Solusi:**
```typescript
catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  toast.error(`Gagal upload gambar: ${errorMessage}`);
}
```

---

### 13. Unused State - `kategoriBerita.findUnique`

**File:** `src/app/admin/(dashboard)/_state/desa/berita.ts`

```typescript
kategoriBerita: {
  findUnique: {
    loading: false,
    async byId(id: string) {
      // ❌ Defined tapi tidak digunakan di UI
    }
  }
}
```

**Solusi:** 
- Option A: Hapus jika memang tidak diperlukan
- Option B: Implementasikan di UI edit kategori

---

### 14. Unused API Endpoints

**File:** `src/app/api/[[...slugs]]/_lib/desa/berita/`

```
find-first.ts    // ⚠️ Tidak digunakan di admin
find-recent.ts   // ⚠️ Tidak digunakan di admin
```

**Solusi:**
- Option A: Hapus jika memang tidak diperlukan
- Option B: Dokumentasikan untuk future use
- Option C: Implementasikan di UI (misal: recent articles widget)

---

## ✅ YANG SUDAH BAIK

### **Schema:**
- ✅ Relasi yang jelas antara Berita dan KategoriBerita (one-to-many)
- ✅ Soft delete dengan `deletedAt` dan `isActive`
- ✅ Image menggunakan relasi ke FileStorage (reusable)
- ✅ Timestamp lengkap (createdAt, updatedAt)
- ✅ Unique constraint pada `name` di KategoriBerita

### **API:**
- ✅ CRUD lengkap untuk Berita dan Kategori Berita
- ✅ Pagination support dengan `page`, `limit`, `search`
- ✅ Search functionality dengan case-insensitive
- ✅ Include relasi (image, kategori) pada find-many
- ✅ File cleanup (hapus file fisik + database) saat update/delete
- ✅ Filter by kategori di find-many
- ✅ Response format konsisten: `{ success, message, data }`

### **UI/UX:**
- ✅ Konsisten design pattern
- ✅ Responsive untuk mobile dan desktop
- ✅ Loading states dan skeleton
- ✅ Toast notifications untuk feedback
- ✅ Form validation yang comprehensive
- ✅ Rich text editor (BeritaEditor) dengan toolbar lengkap
- ✅ Image upload dengan preview dan delete button
- ✅ Search dengan debounce 1 detik
- ✅ Modal konfirmasi hapus
- ✅ Minimum delay 300ms untuk UX yang smooth

### **State Management:**
- ✅ Valtio proxy untuk global state
- ✅ Zod validation schema
- ✅ Loading state management
- ✅ Error handling di setiap action

---

## 📊 Metrics

| Aspek | Score | Keterangan |
|-------|-------|------------|
| **Schema Design** | 8/10 | Good, unique constraint ada di Kategori |
| **API Design** | 7.5/10 | RESTful, tapi ada unused endpoints |
| **API Security** | 6/10 | Tidak ada authentication |
| **UI/UX** | 8/10 | Responsive, comprehensive validation |
| **State Management** | 8/10 | Valtio works well, ada inconsistency |
| **Code Quality** | 7/10 | Good structure, beberapa bug minor |

**Overall Score: 7/10** - **Good**

---

## 🎯 Action Plan

### Week 1 (Critical Fixes)
- [ ] Fix delete kategori dengan relation check
- [ ] Fix pagination pass search parameter
- [ ] Fix colSpan mismatch
- [ ] Fix `deletedAt @default(now())` di schema

### Week 2 (Medium Priority)
- [ ] API create return data dari DB
- [ ] Fix order by ke `desc` untuk kategori
- [ ] Rename button "Batal" → "Reset Form"
- [ ] Fix dropzone accept extensions
- [ ] Konsisten gunakan ApiFetch

### Week 3 (Polish)
- [ ] Fix isDetailPage logic
- [ ] Improve form validation (min length)
- [ ] Improve error handling messages
- [ ] Cleanup unused state/API
- [ ] Add authentication middleware

---

## 📝 Technical Notes

### **Database Migration:**

Fix deletedAt default:
```bash
# Generate migration
bunx prisma migrate dev --name fix_deleted_at_default

# Atau jika tidak pakai migrate
bunx prisma db push

# Data cleanup
UPDATE "Berita" SET "deletedAt" = NULL WHERE "isActive" = true;
UPDATE "KategoriBerita" SET "deletedAt" = NULL WHERE "isActive" = true;
```

### **API Testing:**

Test delete kategori dengan relasi:
```bash
# 1. Create kategori
POST /api/desa/kategoriberita/create
{ "name": "Test Kategori" }

# 2. Create berita dengan kategori tersebut
POST /api/desa/berita/create
{ 
  "judul": "Test Berita",
  "kategoriBeritaId": "<kategori_id>",
  ...
}

# 3. Try delete kategori (should fail)
DELETE /api/desa/kategoriberita/del/<kategori_id>
# Expected: { success: false, message: "Kategori tidak dapat dihapus..." }
```

### **Frontend Testing:**

Test pagination dengan search:
1. Buka halaman List Berita
2. Ketik search query (misal: "desa")
3. Klik pagination halaman 2
4. Verify search query masih ada dan result sesuai

---

## 📚 References

- [Prisma Soft Delete Pattern](https://www.prisma.io/docs/concepts/components/prisma-client/soft-delete)
- [Mantine Table Documentation](https://mantine.dev/core/table/)
- [React Toastify Documentation](https://fkhadra.github.io/react-toastify/)
- [Zod Documentation](https://zod.dev/)

---

**Dibuat oleh:** QC Automation  
**Review Status:** ⏳ Menunggu Review Developer  
**Next Review:** Setelah implementasi fixes
