# Quality Control Report - Gallery Desa Admin

**Lokasi:** `/src/app/admin/(dashboard)/desa/gallery/`  
**Tanggal QC:** 25 Februari 2026  
**Status:** ⚠️ **Needs Improvement** (ada issue critical data loss risk)

---

## 📋 Ringkasan Eksekutif

Halaman Gallery Desa (Foto & Video) memiliki implementasi yang **cukup baik** dengan CRUD lengkap, upload gambar, YouTube embed, dan state management terstruktur. Namun ditemukan **18 issue** dengan rincian:

- 🔴 **High Priority:** 5 issue
- 🟡 **Medium Priority:** 8 issue
- 🟢 **Low Priority:** 5 issue

**Overall Score: 6/10** - Needs Improvement

---

## 📁 Struktur File yang Diperiksa

```
/src/app/admin/(dashboard)/desa/gallery/
├── layout.tsx
├── lib/
│   ├── layoutTabs.tsx          # Tab navigation Foto/Video
│   ├── youtube-utils.ts        # YouTube URL conversion utilities
│   └── youtubeEmbed.tsx        # Reusable embed component (UNUSED)
├── foto/
│   ├── page.tsx                # List foto dengan search & pagination
│   ├── create/
│   │   └── page.tsx            # Upload foto dengan dropzone
│   └── [id]/
│       ├── page.tsx            # Detail foto
│       └── edit/
│           └── page.tsx        # Edit foto (replace image)
└── video/
    ├── page.tsx                # List video dengan search & pagination
    ├── create/
    │   └── page.tsx            # Add video YouTube dengan embed preview
    └── [id]/
        ├── page.tsx            # Detail video
        └── edit/
            └── page.tsx        # Edit video
```

**File Terkait:**
- State: `/src/app/admin/(dashboard)/_state/desa/gallery.ts`
- API: `/src/app/api/[[...slugs]]/_lib/desa/gallery/foto/` (7 files)
- API: `/src/app/api/[[...slugs]]/_lib/desa/gallery/video/` (6 files)
- Schema: `/prisma/schema.prisma` (Model `GalleryFoto` & `GalleryVideo`)

---

## 🔴 HIGH PRIORITY ISSUES

### 1. Schema - `deletedAt @default(now())` (CRITICAL BUG)

**File:** `prisma/schema.prisma`

```prisma
model GalleryFoto {
  id        String   @id @default(cuid())
  name      String
  deletedAt DateTime @default(now())  // ❌ CRITICAL BUG
  isActive  Boolean  @default(true)
}

model GalleryVideo {
  id        String   @id @default(cuid())
  name      String
  deletedAt DateTime @default(now())  // ❌ CRITICAL BUG
  isActive  Boolean  @default(true)
}
```

**Dampak:**
- **Setiap record baru langsung ter-mark sebagai deleted** saat dibuat
- Query dengan filter `deletedAt: null` tidak akan dapat data baru
- Soft delete logic tidak bekerja sama sekali
- Data inconsistency antara `deletedAt` (set) dan `isActive` (true)

**Severity:** 🔴 **CRITICAL** - Ini adalah bug yang sama seperti di Profil Desa dan Pengumuman

**Solusi:**
```prisma
model GalleryFoto {
  id        String   @id @default(cuid())
  name      String
  deletedAt DateTime?  // ✅ Nullable, tanpa default
  isActive  Boolean  @default(true)
}

model GalleryVideo {
  id        String   @id @default(cuid())
  name      String
  deletedAt DateTime?  // ✅ Nullable, tanpa default
  isActive  Boolean  @default(true)
}
```

**Migration Required:**
```bash
bunx prisma migrate dev --name fix_deleted_at_default
# atau
bunx prisma db push

# Data cleanup
UPDATE "GalleryFoto" SET "deletedAt" = NULL WHERE "isActive" = true;
UPDATE "GalleryVideo" SET "deletedAt" = NULL WHERE "isActive" = true;
```

---

### 2. API - File Orphaning Saat Create Gagal

**File:** `src/app/admin/(dashboard)/desa/gallery/foto/create/page.tsx`

```typescript
// Line 78-88
const res = await ApiFetch.api.fileStorage.create.post({
  file,
  name: file.name,
});
const uploaded = res.data?.data;
if (!uploaded?.id) {
  return toast.error('Gagal mengunggah gambar, silakan coba lagi');
}
FotoState.create.form.imagesId = uploaded.id;
await FotoState.create.create();  // ❌ Jika ini gagal, file sudah ter-upload
```

**Dampak:**
- File ter-upload ke server tapi gallery tidak terbuat
- **Orphaned files** menumpuk di database dan filesystem
- Storage waste, tidak ada cleanup mechanism

**Severity:** 🔴 **HIGH** - Data integrity issue

**Solusi:**

**Option A - Transaction di API:**
```typescript
// Di API create.ts
try {
  // Validate fileStorage exists first
  const fileStorage = await prisma.fileStorage.findUnique({
    where: { id: body.imagesId }
  });
  
  if (!fileStorage) {
    return Response.json({
      success: false,
      message: "File tidak ditemukan"
    }, { status: 404 });
  }
  
  const gallery = await prisma.galleryFoto.create({
    data: {
      name: body.name,
      deskripsi: body.deskripsi,
      imagesId: body.imagesId,
    }
  });
  
  return { success: true, data: gallery };
} catch (error) {
  // Rollback file jika create gagal
  if (body.imagesId) {
    await prisma.fileStorage.delete({ where: { id: body.imagesId } }).catch(() => {});
  }
  throw error;
}
```

**Option B - Cleanup di Frontend:**
```typescript
try {
  const uploaded = await uploadFile(file);
  const result = await createGallery({ ...imagesId: uploaded.id });
  
  if (!result.success) {
    // Cleanup orphaned file
    await deleteFile(uploaded.id);
    throw new Error('Create gallery failed');
  }
} catch (error) {
  toast.error('Gagal membuat gallery');
}
```

---

### 3. API - Old File Dihapus Sebelum Update Confirmed

**File:** `src/app/api/[[...slugs]]/_lib/desa/gallery/foto/updt.ts`

```typescript
// Line 47-58
if (existing.imagesId && existing.imagesId !== body.imagesId) {
  const oldImage = existing.imageGalleryFoto;
  if (oldImage) {
    const filePath = path.join(oldImage.path, oldImage.name);
    await fs.unlink(filePath);  // ❌ File dihapus DULU
    await prisma.fileStorage.delete({
      where: { id: oldImage.id },
    });
  }
}

// Baru update data
const updated = await prisma.galleryFoto.update({
  where: { id },
  data: { ... }
});
```

**Dampak:**
- Jika `prisma.galleryFoto.update()` gagal, **old file sudah terhapus**
- **DATA LOSS** - Gallery tidak punya image sama sekali
- Tidak ada rollback mechanism

**Severity:** 🔴 **HIGH** - Data loss risk

**Solusi:**
```typescript
// Update data DULU, baru hapus old file
const updated = await prisma.galleryFoto.update({
  where: { id },
  data: {
    name: body.name,
    deskripsi: body.deskripsi,
    imagesId: body.imagesId,
  },
  include: { imageGalleryFoto: true }
});

// Hapus old file SETELAH update berhasil
if (existing.imagesId && existing.imagesId !== body.imagesId) {
  const oldImage = existing.imageGalleryFoto;
  if (oldImage) {
    try {
      const filePath = path.join(oldImage.path, oldImage.name);
      await fs.unlink(filePath);
      await prisma.fileStorage.delete({
        where: { id: oldImage.id },
      });
    } catch (error) {
      console.error('Failed to delete old file:', error);
      // Log error tapi tidak rollback karena update sudah berhasil
    }
  }
}
```

---

### 4. API - Tidak Ada Authentication/Authorization

**File:** Semua API endpoints di `/src/app/api/[[...slugs]]/_lib/desa/gallery/`

```typescript
export default async function fotoCreate(context: Context) {
  // ❌ Tidak ada validasi session/user
  const body = await context.body;
  
  // Langsung proses create
  await prisma.galleryFoto.create({ ... });
}
```

**Dampak:**
- **Siapa saja bisa upload/delete foto/video** jika tahu endpoint
- Tidak ada audit trail siapa yang upload/delete
- Security risk untuk production

**Severity:** 🔴 **HIGH** - Security vulnerability

**Solusi:**
```typescript
import { getSession } from '@/lib/auth';

export default async function fotoCreate(context: Context) {
  const session = await getSession();
  
  if (!session || !session.user) {
    return Response.json({
      success: false,
      message: "Unauthorized"
    }, { status: 401 });
  }
  
  // Check role/permission jika perlu
  if (!session.user.menuIds?.includes('gallery')) {
    return Response.json({
      success: false,
      message: "Forbidden"
    }, { status: 403 });
  }
  
  const body = await context.body;
  // ... lanjut proses
}
```

---

### 5. API - Tidak Ada Input Validation

**File:** `src/app/api/[[...slugs]]/_lib/desa/gallery/foto/create.ts`

```typescript
// Line 13-23
await prisma.galleryFoto.create({
  data: {
    name: body.name,        // ❌ Tidak ada validasi length
    deskripsi: body.deskripsi,  // ❌ Tidak ada sanitasi XSS
    imagesId: body.imagesId,    // ❌ Tidak cek apakah FileStorage ada
  },
});
```

**Dampak:**
- User bisa input name sangat panjang (bisa break UI/database)
- XSS attack via `deskripsi` field (rich text editor)
- Bisa create gallery dengan `imagesId` yang tidak valid

**Severity:** 🔴 **HIGH** - Security & data integrity

**Solusi:**
```typescript
// Validasi input
const { name, deskripsi, imagesId } = await context.body;

// Check length
if (!name || name.length > 255) {
  return Response.json({
    success: false,
    message: "Name maksimal 255 karakter"
  }, { status: 400 });
}

// Check duplikasi
const existing = await prisma.galleryFoto.findFirst({
  where: { name, isActive: true }
});

if (existing) {
  return Response.json({
    success: false,
    message: "Name sudah digunakan"
  }, { status: 400 });
}

// Check fileStorage exists
const fileStorage = await prisma.fileStorage.findUnique({
  where: { id: imagesId }
});

if (!fileStorage) {
  return Response.json({
    success: false,
    message: "File tidak ditemukan"
  }, { status: 404 });
}

// Sanitize HTML (gunakan library seperti DOMPurify di server)
const sanitizedDeskripsi = sanitizeHtml(deskripsi);

// Create
const gallery = await prisma.galleryFoto.create({
  data: {
    name,
    deskripsi: sanitizedDeskripsi,
    imagesId,
  }
});
```

---

## 🟡 MEDIUM PRIORITY ISSUES

### 6. UI - Dead Code (youtubeEmbed.tsx Tidak Digunakan)

**File:** `src/app/admin/(dashboard)/desa/gallery/lib/youtubeEmbed.tsx`

```typescript
// Component ini TIDAK digunakan di mana pun
export function YoutubeEmbed({ url, ... }: Props) {
  // ... component code
}
```

**Dampak:**
- Dead code menumpuk (120+ baris tidak digunakan)
- Confusing untuk developer baru
- Maintenance overhead

**Severity:** 🟡 **MEDIUM** - Code quality issue

**Solusi:**
- **Option A:** Hapus file ini jika memang tidak diperlukan
- **Option B:** Gunakan component ini di semua halaman (create, edit, detail) untuk konsistensi

**Recommendation:** Hapus, karena setiap halaman sudah implementasi iframe manual dengan cara berbeda.

---

### 7. UI - Inconsistent Styling Foto vs Video

**File:** `foto/page.tsx` vs `video/page.tsx`

```typescript
// foto/page.tsx - Line 58
<Box p={{ base: 'md', md: 'lg' }}>  // ✅ Responsive padding

// video/page.tsx - Line 60
<Box py={20}>  // ❌ Hardcoded padding
```

**Dampak:** Inconsistent spacing antara foto dan video pages.

**Severity:** 🟡 **MEDIUM** - UX inconsistency

**Solusi:**
```typescript
// video/page.tsx
<Box p={{ base: 'md', md: 'lg' }}>  // ✅ Konsisten dengan foto
```

---

### 8. UI - Memory Leak Potential (createObjectURL)

**File:** `src/app/admin/(dashboard)/desa/gallery/foto/create/page.tsx`

```typescript
// Line 59-62
useEffect(() => {
  if (file) {
    const url = URL.createObjectURL(file);
    setPreviewImage(url);
  }
}, [file]);

// Line 47-52
const resetForm = () => {
  FotoState.create.form = { name: '', deskripsi: '', imagesId: '' };
  setPreviewImage(null);
  setFile(null);
  // ❌ URL.revokeObjectURL() tidak dipanggil
};
```

**Dampak:**
- Memory leak jika user upload banyak gambar tanpa refresh
- Browser bisa crash setelah banyak createObjectURL tidak di-cleanup

**Severity:** 🟡 **MEDIUM** - Performance issue

**Solusi:**
```typescript
// Cleanup saat unmount atau file berubah
useEffect(() => {
  if (file) {
    const url = URL.createObjectURL(file);
    setPreviewImage(url);
    
    return () => {
      URL.revokeObjectURL(url);  // ✅ Cleanup
    };
  }
}, [file]);

// Cleanup saat reset
const resetForm = () => {
  if (previewImage) {
    URL.revokeObjectURL(previewImage);  // ✅ Cleanup
  }
  FotoState.create.form = { name: '', deskripsi: '', imagesId: '' };
  setPreviewImage(null);
  setFile(null);
};
```

---

### 9. State - Error Handling Tidak Konsisten

**File:** `src/app/admin/(dashboard)/_state/desa/gallery.ts`

```typescript
// Line 39-53 (foto.create)
async create() {
  try {
    const res = await ApiFetch.api.desa.gallery.foto["create"].post(foto.create.form);
    if (res.status === 200) {
      foto.findMany.load();
      return toast.success("Foto berhasil disimpan!");
    }
    return toast.error("Gagal menyimpan foto");
  } catch (error) {
    console.log((error as Error).message);
    // ❌ Error di-catch tapi tidak ada toast error notification
  }
}

// Line 91-107 (foto.findUnique)
async load(id: string) {
  try {
    const res = await fetch(`/api/desa/gallery/foto/${id}`);
    if (res.ok) {
      const data = await res.json();
      foto.findUnique.data = data.data ?? null;
    }
  } catch (error) {
    console.error("Error fetching foto:", error);
    // ❌ Tidak ada error toast notification
  }
}

// Line 205-227 (foto.findRecent)
async load() {
  try {
    // ...
  } catch (error) {
    console.error("Gagal fetch foto recent:", error);
    // ❌ Tidak ada error toast notification
  }
}
```

**Dampak:**
- User tidak tahu ada error (silent failure)
- UX buruk (loading forever tanpa feedback)
- Sulit debug production issues

**Severity:** 🟡 **MEDIUM** - UX issue

**Solusi:**
```typescript
async create() {
  try {
    const res = await ApiFetch.api.desa.gallery.foto["create"].post(foto.create.form);
    if (res.status === 200) {
      foto.findMany.load();
      return toast.success("Foto berhasil disimpan!");
    }
    return toast.error("Gagal menyimpan foto");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Create foto failed:', errorMessage);
    toast.error(`Gagal menyimpan foto: ${errorMessage}`);  // ✅ Show error
  }
}
```

---

### 10. State - `findMany.load()` Dipanggil Tanpa Parameter

**File:** `src/app/admin/(dashboard)/_state/desa/gallery.ts`

```typescript
// Line 47 (foto.create)
async create() {
  // ...
  if (res.status === 200) {
    foto.findMany.load();  // ❌ Tanpa parameter (default page=1, limit=10)
    return toast.success("Foto berhasil disimpan!");
  }
}

// Line 119 (foto.delete)
async byId(id: string) {
  // ...
  if (response.ok) {
    toast.success(result.message || "Foto berhasil dihapus");
    await foto.findMany.load();  // ❌ Tanpa parameter
  }
}
```

**Dampak:**
- Jika user di page 5, setelah create/delete refresh ke page 1
- User bingung kenapa data hilang (padahal masih ada, cuma page berubah)

**Severity:** 🟡 **MEDIUM** - UX issue

**Solusi:**
```typescript
// Simpan current pagination state
let currentPage = 1;
let currentLimit = 10;
let currentSearch = '';

// Set parameter saat load
async load(page = 1, limit = 10, search = '') {
  currentPage = page;
  currentLimit = limit;
  currentSearch = search;
  // ... load data
}

// Gunakan current state saat refresh
async create() {
  // ...
  if (res.status === 200) {
    await foto.findMany.load(currentPage, currentLimit, currentSearch);  // ✅ Pass current params
    toast.success("Foto berhasil disimpan!");
  }
}
```

---

### 11. API - Video Search Tidak Include `deskripsi`

**File:** `src/app/api/[[...slugs]]/_lib/desa/gallery/video/find-many.ts`

```typescript
// Line 18-21
if (search) {
  where.OR = [
    { name: { contains: search, mode: 'insensitive' } }
    // ❌ deskripsi tidak di-include
  ];
}
```

**Bandingkan dengan Foto:**
```typescript
// foto/find-many.ts - Line 20-26
if (search) {
  where.OR = [
    { name: { contains: search, mode: 'insensitive' } },
    { deskripsi: { contains: search, mode: 'insensitive' } }  // ✅ Include deskripsi
  ];
}
```

**Dampak:**
- User tidak bisa search video berdasarkan deskripsi
- Inconsistent behavior antara foto dan video

**Severity:** 🟡 **MEDIUM** - Feature inconsistency

**Solusi:**
```typescript
if (search) {
  where.OR = [
    { name: { contains: search, mode: 'insensitive' } },
    { deskripsi: { contains: search, mode: 'insensitive' } }  // ✅ Add deskripsi
  ];
}
```

---

### 12. UI - Skeleton Height Terlalu Besar

**File:** `src/app/admin/(dashboard)/desa/gallery/video/page.tsx`

```typescript
// Line 73-77
if (loading || !data) {
  return (
    <Stack py={20}>
      <Skeleton height={600} radius="md" />  // ❌ Terlalu besar
    </Stack>
  );
}
```

**Dampak:** Skeleton mengambil hampir seluruh layar, UX buruk.

**Severity:** 🟡 **MEDIUM** - UX issue

**Solusi:**
```typescript
<Skeleton height={200} radius="md" />  // ✅ Lebih reasonable
```

---

### 13. UI - Duplicate `convertToEmbedUrl` Function

**File:** `src/app/admin/(dashboard)/desa/gallery/video/[id]/page.tsx`

```typescript
// Line 106-118
function convertToEmbedUrl(youtubeUrl: string): string {
  try {
    const url = new URL(youtubeUrl);
    const videoId = url.searchParams.get("v");
    if (!videoId) return youtubeUrl;
    return `https://www.youtube.com/embed/${videoId}`;
  } catch (err) {
    return youtubeUrl;
  }
}
```

**Padahal sudah ada di:** `lib/youtube-utils.ts`
```typescript
export function convertYoutubeUrlToEmbed(url: string) {
  const videoIdMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : null;
}
```

**Dampak:**
- Duplicate code (violation DRY principle)
- Logic berbeda (page.tsx hanya support watch URL, utils.ts support multiple formats)
- Maintenance overhead

**Severity:** 🟡 **MEDIUM** - Code quality issue

**Solusi:**
```typescript
// Import dari utils
import { convertYoutubeUrlToEmbed } from '../../lib/youtube-utils';

// Gunakan function yang sudah ada
const embedLink = convertYoutubeUrlToEmbed(data.linkVideo);
```

---

### 14. Utils - YouTube Shorts URL Tidak Disupport

**File:** `src/app/admin/(dashboard)/desa/gallery/lib/youtube-utils.ts`

```typescript
export function convertYoutubeUrlToEmbed(url: string) {
  const videoIdMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  // ❌ Regex tidak support youtube.com/shorts/VIDEO_ID
  return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : null;
}
```

**Dampak:** User tidak bisa input YouTube Shorts URL (format populer).

**Severity:** 🟡 **MEDIUM** - Feature gap

**Solusi:**
```typescript
export function convertYoutubeUrlToEmbed(url: string) {
  const videoIdMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  // ✅ Added shorts\/ support
  return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : null;
}
```

---

## 🟢 LOW PRIORITY ISSUES

### 15. UI - Redundant Variable (`filteredData`)

**File:** `src/app/admin/(dashboard)/desa/gallery/foto/page.tsx`

```typescript
// Line 78-79
const filteredData = data || [];
// ❌ Variable ini redundant, data sudah difilter di backend
```

**Dampak:** Minor code clutter.

**Severity:** 🟢 **LOW** - Code cleanliness

**Solusi:** Hapus variable, gunakan langsung `data || []`.

---

### 16. UI - useEffect Redundant di layoutTabs.tsx

**File:** `src/app/admin/(dashboard)/desa/gallery/lib/layoutTabs.tsx`

```typescript
// Line 35-40
useEffect(() => {
  const match = tabs.find(tab => tab.href === pathname)
  if (match) {
    setActiveTab(match.value)
  }
}, [pathname])
// ❌ Redundant karena sudah ada logic serupa di handleTabChange
```

**Dampak:** Minor performance overhead.

**Severity:** 🟢 **LOW** - Code quality

**Solusi:** Hapus useEffect jika tidak diperlukan.

---

### 17. State - `findRecent` Tidak Digunakan di UI

**File:** `src/app/admin/(dashboard)/_state/desa/gallery.ts`

```typescript
// Line 205-227
foto: {
  findRecent: {
    loading: false,
    data: [] as any[],
    async load() {
      // ... fetch recent photos
    }
  }
}
```

**Dampak:** Dead code di state management.

**Severity:** 🟢 **LOW** - Code cleanliness

**Solusi:** 
- Option A: Hapus jika memang tidak diperlukan
- Option B: Implementasi di UI (misal: widget "Recent Photos" di dashboard)

---

### 18. State - Mix State Mutation dan Return Value

**File:** `src/app/admin/(dashboard)/_state/desa/gallery.ts`

```typescript
// Line 138-203 (foto.update)
async load(id: string) {
  // ... fetch GET
  if (result?.success) {
    const data = result.data;
    this.id = data.id;
    this.form = { ... };
    return data;  // ❌ Mix mutation + return value (confusing API)
  }
}
```

**Dampak:** Confusing API, tidak jelas apakah caller harus gunakan return value atau akses state langsung.

**Severity:** 🟢 **LOW** - Code quality

**Solusi:**
```typescript
// Option A: Hanya mutation (recommended)
async load(id: string) {
  // ... fetch GET
  if (result?.success) {
    const data = result.data;
    this.id = data.id;
    this.form = { ... };
    // No return value
  }
}

// Usage
await foto.update.load(id);
const formData = foto.update.form;  // Akses dari state

// Option B: Hanya return value
async load(id: string) {
  // ... fetch GET
  if (result?.success) {
    return result.data;
  }
  return null;
}

// Usage
const data = await foto.update.load(id);
```

---

## ✅ YANG SUDAH BAIK

### **Schema:**
- ✅ Relasi GalleryFoto ke FileStorage sudah benar
- ✅ Kedua model memiliki soft delete fields (`deletedAt`, `isActive`)
- ✅ Audit trail dengan `createdAt` dan `updatedAt`

### **API:**
- ✅ CRUD lengkap untuk Foto dan Video
- ✅ Pagination support dengan `page`, `limit`
- ✅ Search functionality (foto: name + deskripsi, video: name only)
- ✅ Soft delete di-support via `isActive` flag di find-many
- ✅ File cleanup saat delete foto (hapus filesystem + database)
- ✅ Error handling ada di semua endpoints
- ✅ Response format konsisten: `{ success, message, data }`

### **UI/UX:**
- ✅ Responsive design (desktop table + mobile cards)
- ✅ Loading states dan skeleton
- ✅ Toast notifications untuk feedback
- ✅ Form validation (name, deskripsi, image required)
- ✅ Dropzone untuk upload gambar dengan preview
- ✅ File size limit (5MB) dan format validation
- ✅ Rich text editor untuk deskripsi
- ✅ YouTube URL conversion dengan embed preview
- ✅ Search dengan debounce (1000ms)
- ✅ Modal konfirmasi hapus
- ✅ Empty state message
- ✅ Reset form functionality

### **State Management:**
- ✅ Valtio proxy untuk global state
- ✅ Separate state untuk foto dan video
- ✅ CRUD operations lengkap
- ✅ Form validation dengan Zod
- ✅ Pagination state management
- ✅ Loading states

### **Utilities:**
- ✅ YouTube URL conversion support multiple formats (watch, embed, youtu.be)
- ✅ Reusable component pattern (youtubeEmbed.tsx - meski tidak digunakan)

---

## 📊 Metrics

| Aspek | Score | Keterangan |
|-------|-------|------------|
| **Schema Design** | 6/10 | Good structure, tapi ada critical bug di deletedAt |
| **API Design** | 6/10 | RESTful, tapi tidak ada auth & validation |
| **API Security** | 4/10 | Tidak ada authentication, XSS risk |
| **UI/UX** | 7.5/10 | Responsive, comprehensive features |
| **State Management** | 6.5/10 | Valtio works well, inconsistency di error handling |
| **Code Quality** | 6/10 | Dead code, duplicate code, memory leak potential |

**Overall Score: 6/10** - **Needs Improvement**

---

## 🎯 Action Plan

### Week 1 (Critical Fixes) 🔴

- [ ] **URGENT:** Fix `deletedAt @default(now())` di schema
- [ ] **URGENT:** Fix file orphaning saat create gagal
- [ ] **URGENT:** Fix old file delete sebelum update confirmed
- [ ] **URGENT:** Tambahkan authentication di semua API endpoints
- [ ] **URGENT:** Tambahkan input validation di API

### Week 2 (High Priority) 🟡

- [ ] Tambahkan rollback mechanism untuk operasi file
- [ ] Fix error handling konsisten (semua catch show toast)
- [ ] Fix `findMany.load()` pass current pagination params
- [ ] Tambahkan video search include deskripsi
- [ ] Fix memory leak (createObjectURL cleanup)

### Week 3 (Polish) 🟢

- [ ] Hapus dead code (youtubeEmbed.tsx, findRecent)
- [ ] Konsistensi styling foto vs video pages
- [ ] Hapus duplicate convertToEmbedUrl function
- [ ] Tambahkan support YouTube Shorts URL
- [ ] Fix skeleton height
- [ ] Fix redundant useEffect di layoutTabs

---

## 📝 Technical Notes

### **Database Migration:**

Fix deletedAt default:
```bash
# Generate migration
bunx prisma migrate dev --name fix_gallery_deleted_at

# Atau jika tidak pakai migrate
bunx prisma db push

# Data cleanup
UPDATE "GalleryFoto" SET "deletedAt" = NULL WHERE "isActive" = true;
UPDATE "GalleryVideo" SET "deletedAt" = NULL WHERE "isActive" = true;
```

### **File Orphan Prevention:**

Implementasi transaction pattern di API:
```typescript
// Di API create.ts
export default async function fotoCreate(context: Context) {
  try {
    // Validate fileStorage exists
    const fileStorage = await prisma.fileStorage.findUnique({
      where: { id: body.imagesId }
    });
    
    if (!fileStorage) {
      return Response.json({
        success: false,
        message: "File tidak ditemukan"
      }, { status: 404 });
    }
    
    // Create gallery dengan transaction
    const gallery = await prisma.galleryFoto.create({
      data: {
        name: body.name,
        deskripsi: body.deskripsi,
        imagesId: body.imagesId,
      }
    });
    
    return { success: true, data: gallery };
  } catch (error) {
    // Rollback file jika create gagal
    if (body.imagesId) {
      await prisma.fileStorage.delete({ 
        where: { id: body.imagesId } 
      }).catch(() => {});
    }
    throw error;
  }
}
```

### **Memory Leak Prevention:**

```typescript
// Cleanup createObjectURL
useEffect(() => {
  if (file) {
    const url = URL.createObjectURL(file);
    setPreviewImage(url);
    
    return () => {
      URL.revokeObjectURL(url);  // ✅ Cleanup
    };
  }
}, [file]);

// Cleanup saat reset
const resetForm = () => {
  if (previewImage) {
    URL.revokeObjectURL(previewImage);
  }
  // ...
};
```

### **YouTube Shorts Support:**

```typescript
// youtube-utils.ts
export function convertYoutubeUrlToEmbed(url: string) {
  const videoIdMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return videoIdMatch 
    ? `https://www.youtube.com/embed/${videoIdMatch[1]}` 
    : null;
}

// Test cases
convertYoutubeUrlToEmbed('https://youtube.com/watch?v=VIDEO_ID');  // ✅
convertYoutubeUrlToEmbed('https://youtu.be/VIDEO_ID');  // ✅
convertYoutubeUrlToEmbed('https://youtube.com/embed/VIDEO_ID');  // ✅
convertYoutubeUrlToEmbed('https://youtube.com/shorts/VIDEO_ID');  // ✅ NEW
```

---

## 📚 References

- [Prisma Transactions](https://www.prisma.io/docs/concepts/components/prisma-client/transactions)
- [Prisma Soft Delete Pattern](https://www.prisma.io/docs/concepts/components/prisma-client/soft-delete)
- [URL.createObjectURL() Memory Management](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL#memory_management)
- [Mantine Skeleton Documentation](https://mantine.dev/core/skeleton/)
- [React Toastify Documentation](https://fkhadra.github.io/react-toastify/)

---

## 📈 Comparison dengan QC Sebelumnya

| Aspek | Profil Desa | Potensi Desa | Berita Desa | Pengumuman | **Gallery** |
|-------|-------------|--------------|-------------|------------|-------------|
| Schema | 6/10 | 7/10 | 8/10 | 7/10 | **6/10** |
| API Security | 4/10 | 6/10 | 6/10 | 6/10 | **4/10** |
| API Design | 7/10 | 8/10 | 7.5/10 | 7/10 | **6/10** |
| UI/UX | 8/10 | 8.5/10 | 8/10 | 7.5/10 | **7.5/10** |
| State Mgmt | 7/10 | 8/10 | 8/10 | 7/10 | **6.5/10** |
| Code Quality | 7/10 | 7.5/10 | 7/10 | 6.5/10 | **6/10** |
| **Overall** | **6.5/10** | **7.5/10** | **7/10** | **6.5/10** | **6/10** |

**Gallery** memiliki score **terendah** karena:
- ❌ Critical bug `deletedAt @default(now())` (sama seperti Profil & Pengumuman)
- ❌ File orphaning issue (data integrity)
- ❌ Old file dihapus sebelum update confirmed (data loss risk)
- ❌ Tidak ada authentication di API
- ❌ Dead code (youtubeEmbed.tsx tidak digunakan)
- ❌ Memory leak potential
- ❌ Duplicate code (convertToEmbedUrl)

Tapi Gallery punya **UI/UX yang bagus** (7.5/10) dengan:
- ✅ Upload gambar dengan dropzone & preview
- ✅ YouTube embed conversion
- ✅ Rich text editor
- ✅ Responsive design
- ✅ Comprehensive validation

---

**Dibuat oleh:** QC Automation  
**Review Status:** ⏳ Menunggu Review Developer  
**Next Review:** Setelah implementasi fixes
