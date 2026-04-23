# Quality Control Report - Profil Desa Admin

**Lokasi:** `/src/app/admin/(dashboard)/desa/profil/`  
**Tanggal QC:** 25 Februari 2026  
**Status:** ⚠️ **Needs Improvement**

---

## 📋 Ringkasan Eksekutif

Halaman Profil Desa sudah memiliki struktur yang baik dengan separation of concerns yang jelas antara UI, State Management, dan API. Namun ditemukan **16 issue** dengan rincian:

- 🔴 **High Priority:** 5 issue
- 🟡 **Medium Priority:** 5 issue
- 🟢 **Low Priority:** 6 issue

---

## 📁 Struktur File yang Diperiksa

```
/src/app/admin/(dashboard)/desa/profil/
├── layout.tsx
├── _lib/
│   ├── layoutTabsDetail.tsx
│   └── layoutTabsEdit.tsx
├── profil-desa/
│   ├── page.tsx
│   └── [id]/
│       ├── sejarah_desa/page.tsx
│       ├── visi_misi_desa/page.tsx
│       ├── lambang_desa/page.tsx
│       └── maskot_desa/page.tsx
├── profil-perbekel/
│   ├── page.tsx
│   └── [id]/page.tsx
└── profil-perbekel-dari-masa-ke-masa/
    ├── page.tsx
    ├── create/page.tsx
    └── [id]/
        ├── page.tsx
        └── edit/page.tsx
```

**File Terkait:**
- State: `/src/app/admin/(dashboard)/_state/desa/profile.ts` (1058 baris)
- API: `/src/app/api/[[...slugs]]/_lib/desa/profile/` (15+ files)
- Schema: `/prisma/schema.prisma`

---

## 🔴 HIGH PRIORITY ISSUES

### 1. Schema Bug - `deletedAt` Default Value Salah

**File:** `prisma/schema.prisma`

```prisma
model SejarahDesa {
  deletedAt DateTime @default(now())  // ❌ BUG: Record langsung ter-delete!
  isActive  Boolean  @default(true)
}
```

**Dampak:** Setiap record baru langsung ter-mark sebagai deleted karena `deletedAt` di-set ke `now()` saat create.

**Solusi:**
```prisma
deletedAt DateTime?  // ✅ Nullable, tanpa default
```

**Affected Models:** `SejarahDesa`, `VisiMisiDesa`, `LambangDesa`, `MaskotDesa`

---

### 2. API Tidak Ada Authentication

**File:** Semua file di `/src/app/api/[[...slugs]]/_lib/desa/profile/`

```typescript
export default async function sejarahDesaUpdate(context: Context) {
  // ❌ Tidak ada validasi session/user
  const id = context.params?.id as string;
  // Langsung proses update...
}
```

**Dampak:** Siapa saja yang tahu endpoint bisa update/delete data tanpa login.

**Solusi:** Tambahkan middleware authentication di route handler atau di setiap endpoint.

---

### 3. Hardcoded Nama Perbekel di UI

**File:** `src/app/admin/(dashboard)/desa/profil/profil-perbekel/page.tsx`

```typescript
<Text>
  I.B. Surya Prabhawa Manuaba, S.H., M.H.  // ❌ Hardcoded!
</Text>
```

**Dampak:** UI tidak update otomatis jika ada perbekel baru.

**Solusi:** Ambil data dari database `ProfilPerbekel` dengan filter `isActive: true`.

---

### 4. Maskot Image Delete Logic Bug

**File:** `src/app/api/[[...slugs]]/_lib/desa/profile/profile_desa/maskot-desa/update.ts`

```typescript
// Hapus semua gambar lama
for (const old of existing.images) {
  await prisma.fileStorage.delete({ where: { id: old.imageId } });
}
```

**Dampak:** Semua gambar lama **selalu dihapus**, bahkan jika user ingin mempertahankan beberapa gambar.

**Solusi:** Implementasi diff logic untuk membandingkan gambar yang dipertahankan vs dihapus.

---

### 5. Magic String "edit" sebagai ID

**File:** Multiple files di state dan API

```typescript
stateProfileDesa.sejarahDesa.findUnique.load("edit");  // ❌ Magic string
```

**Dampak:** Tidak type-safe, rentan typo, tidak scalable.

**Solusi:** Buat endpoint khusus `/first` atau `/active` untuk get record pertama yang aktif.

---

## 🟡 MEDIUM PRIORITY ISSUES

### 6. ProfileDesaImage Tanpa Soft Delete

**File:** `prisma/schema.prisma`

```prisma
model ProfileDesaImage {
  // ❌ Tidak ada deletedAt, isActive, createdAt, updatedAt
  id           String      @id @default(cuid())
  label        String
  imageId      String?
}
```

**Solusi:** Tambahkan audit fields:
```prisma
deletedAt DateTime?
isActive  Boolean @default(true)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

---

### 7. HTML Validation dengan Regex

**File:** `src/app/admin/(dashboard)/desa/profil/profil-desa/[id]/sejarah_desa/page.tsx`

```typescript
const isHtmlEmpty = (html: string) => {
  const textContent = html.replace(/<[^>]*>/g, '').trim();  // ❌ Tidak robust
  return textContent === '';
};
```

**Dampak:** Validasi bisa gagal untuk edge cases (nested tags, comments, script tags).

**Solusi:** Gunakan library `sanitize-html` atau DOMParser untuk extract text content.

---

### 8. Image Label Tidak Divvalidasi

**File:** `src/app/admin/(dashboard)/desa/profil/profil-desa/[id]/maskot_desa/page.tsx`

**Dampak:** User bisa submit dengan label kosong atau sangat panjang.

**Solusi:** Tambahkan validation:
```typescript
z.object({
  label: z.string().min(1, "Label wajib diisi").max(100, "Maksimal 100 karakter")
})
```

---

### 9. Typo Variable Name

**File:** `src/app/api/[[...slugs]]/_lib/desa/profile/profilePerbekel/update.ts`

```typescript
if (exisitng.imageId !== imageId) {  // ❌ Typo: "exisitng"
```

**Solusi:** Fix menjadi `existing`.

---

### 10. Tidak Ada Error Boundary

**Dampak:** Jika ada error di component tree, seluruh halaman bisa crash.

**Solusi:** Tambahkan React Error Boundary di layout.tsx:
```typescript
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<ErrorFallback />}>
  {children}
</ErrorBoundary>
```

---

## 🟢 LOW PRIORITY ISSUES

### 11. Image Loading Tanpa Skeleton

**File:** `src/app/admin/(dashboard)/desa/profil/profil-desa/page.tsx`

**Dampak:** Layout shift saat image load, UX kurang smooth.

**Solusi:** Tambahkan Skeleton component:
```typescript
{loading ? (
  <Skeleton height={200} circle />
) : (
  <Image src={imageUrl} alt="..." />
)}
```

---

### 12. Reset Form Tanpa Konfirmasi

**File:** `src/app/admin/(dashboard)/desa/profil/profil-perbekel-dari-masa-ke-masa/[id]/edit/page.tsx`

**Dampak:** User bisa tidak sengaja reset form dan kehilangan perubahan.

**Solusi:** Tambahkan modal konfirmasi sebelum reset.

---

### 13. Sequential API Calls Tanpa Promise.all

**File:** `src/app/admin/(dashboard)/desa/profil/profil-desa/page.tsx`

```typescript
useEffect(() => {
  stateProfileDesa.sejarahDesa.findUnique.load("edit");
  stateProfileDesa.visiMisiDesa.findUnique.load("edit");  // ❌ Sequential
  stateProfileDesa.lambangDesa.findUnique.load("edit");
  stateProfileDesa.maskotDesa.findUnique.load("edit");
}, []);
```

**Solusi:** Gunakan `Promise.all` untuk parallel loading.

---

### 14. FileStorage Validation di Server

**Dampak:** User bisa upload file dengan tipe yang tidak diinginkan.

**Solusi:** Tambahkan MIME type check di server-side upload handler.

---

### 15. Mantan Perbekel Create Tidak Return ID

**File:** `src/app/api/[[...slugs]]/_lib/desa/profile/profile-mantan-perbekel/create.ts`

```typescript
return {
  success: true,
  data: { ...body },  // ❌ Tidak return ID
};
```

**Solusi:** Return ID record yang baru dibuat untuk referensi.

---

### 16. Tidak Ada Unique Constraint

**Dampak:** Bisa ada multiple record aktif untuk model yang seharusnya single-record.

**Solusi:** Tambahkan unique constraint atau validasi di API layer.

---

## ✅ Yang Sudah Baik

1. ✅ **Struktur folder terorganisir** dengan separation of concerns
2. ✅ **Responsive design** untuk mobile dan desktop
3. ✅ **Loading states** dan error handling dasar
4. ✅ **Form validation** client-side dengan Valtio
5. ✅ **Preview image** sebelum upload
6. ✅ **Toast notifications** untuk feedback user
7. ✅ **File cleanup** (hapus file fisik + database) di API
8. ✅ **Consistent response format** di semua API endpoint

---

## 📊 Metrics

| Aspek | Score | Keterangan |
|-------|-------|------------|
| **Schema Design** | 6/10 | Ada bug critical di deletedAt |
| **API Security** | 4/10 | Tidak ada authentication |
| **API Design** | 7/10 | RESTful, tapi ada magic string |
| **UI/UX** | 8/10 | Responsive, tapi ada hardcoded data |
| **State Management** | 7/10 | Valtio works, tapi tidak type-safe |
| **Code Quality** | 7/10 | Ada typo, tidak ada error boundary |

**Overall Score: 6.5/10** - **Needs Improvement**

---

## 🎯 Action Plan

### Week 1 (Critical Fixes)
- [ ] Fix `deletedAt @default(now())` di schema
- [ ] Tambahkan authentication middleware di API
- [ ] Fix hardcoded nama perbekel
- [ ] Fix maskot image delete logic

### Week 2 (Medium Priority)
- [ ] Tambahkan audit fields di ProfileDesaImage
- [ ] Fix HTML validation dengan library
- [ ] Tambahkan validasi image label
- [ ] Fix typo dan tambahkan error boundary

### Week 3 (Polish)
- [ ] Tambahkan skeleton loading untuk images
- [ ] Tambahkan konfirmasi reset form
- [ ] Optimasi dengan Promise.all
- [ ] Tambahkan server-side file validation

---

## 📝 Notes

1. **Database Migration Required:** Setelah fix schema, jalankan:
   ```bash
   bunx prisma db push
   ```

2. **Data Migration:** Record yang sudah ter-create dengan `deletedAt` set perlu di-update:
   ```sql
   UPDATE "SejarahDesa" SET "deletedAt" = NULL WHERE "isActive" = true;
   ```

3. **Testing:** Setelah fix authentication, test semua endpoint dengan:
   - User belum login (should redirect)
   - User login dengan role berbeda (should respect permissions)

---

**Dibuat oleh:** QC Automation  
**Review Status:** ⏳ Menunggu Review Developer
