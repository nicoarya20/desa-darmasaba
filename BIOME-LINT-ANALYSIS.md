# 📊 Laporan Analisis Biome Lint - Desa Darmasaba

**Tanggal:** 9 April 2026  
**Tool:** Biome v2.4.10  
**Scope:** Seluruh project (src/, prisma/, config files)

---

## 📈 Ringkasan Statistik

| Metrik | Jumlah |
|--------|--------|
| **Files Checked** | 1,951 files |
| **Execution Time** | 809ms |
| **Errors** | 4,516 ❌ |
| **Warnings** | 3,861 ⚠️ |
| **Infos** | 614 ℹ️ |
| **Total Issues** | **8,991** |

---

## 🔥 Top 10 Lint Rules Violations

| Rank | Rule | Category | Count | Severity | Fixable |
|------|------|----------|-------|----------|---------|
| 1 | `noExplicitAny` | suspicious | ~3,500+ | ⚠️ Warning | Manual |
| 2 | `useLiteralKeys` | complexity | ~800+ | ℹ️ Info | ✅ Auto |
| 3 | `noUnusedImports` | correctness | ~100+ | ⚠️ Warning | ✅ Auto |
| 4 | `noUnusedVariables` | correctness | ~50+ | ⚠️ Warning | Manual |
| 5 | `useNodejsImportProtocol` | style | 7 | ℹ️ Info | ✅ Auto |
| 6 | `noNonNullAssertion` | style | ~30+ | ⚠️ Warning | Manual |
| 7 | `noAsyncPromiseExecutor` | suspicious | 2 | ❌ Error | Manual |
| 8 | `useOptionalChain` | complexity | 2 | ⚠️ Warning | ✅ Auto |
| 9 | `noImportantStyles` | complexity | 4 | ⚠️ Warning | ✅ Auto |
| 10 | `noUselessContinue` | complexity | 1 | ℹ️ Info | ✅ Auto |

---

## 📂 Breakdown per Kategori

### 1. **Suspicious** (⚠️ Warnings + ❌ Errors)

#### `noExplicitAny` - ~3,500+ violations
- **Severity:** ⚠️ Warning
- **Impact:** Menonaktifkan banyak type checking rules
- **Files affected:**
  - `__tests__/api/fileStorage.test.ts` (lines 10, 25)
  - `prisma/_seeder_list/desa/berita/seed_berita.ts` (line 85)
  - `zgen/image.ts` (line 29)
  - `prisma/lib/get_shared_images.ts` (lines 29, 53, 54)
  - Dan ~3,490+ files lainnya

**Rekomendasi:** 
- Gunakan type yang spesifik atau `unknown` dengan type guard
- Prioritaskan fix di files yang sering digunakan

#### `noAsyncPromiseExecutor` - 2 violations ❌
- **Files:**
  - `xcoba.ts:12` - `new Promise(async (resolve, reject) => {...})`
  - `xcoba2.ts:14` - `new Promise(async (resolve, reject) => {...})`

**Masalah:** Async promise executor bisa menyebabkan unhandled rejections

**Fix:**
```typescript
// ❌ Before
return new Promise(async (resolve, reject) => {
  await someAsyncOperation();
  resolve(result);
});

// ✅ After
return new Promise(async (resolve, reject) => {
  try {
    await someAsyncOperation();
    resolve(result);
  } catch (error) {
    reject(error);
  }
});
```

#### `useIterableCallbackReturn` - 1 violation ❌
- **File:** `prisma/_seeder_list/desa/berita/seed_berita.ts:34`

**Masalah:** forEach callback tidak seharusnya return value

**Fix:**
```typescript
// ❌ Before
kategoriList.forEach((k) => validKategoriIds.add(k.id));

// ✅ After
for (const k of kategoriList) {
  validKategoriIds.add(k.id);
}
```

---

### 2. **Style** (ℹ️ Info + ⚠️ Warnings)

#### `useNodejsImportProtocol` - 7 violations
- **Severity:** ℹ️ Info
- **Fixable:** ✅ Auto-fix available

**Files:**
1. `eslint.config.mjs:1` - `import { dirname } from "path"`
2. `eslint.config.mjs:2` - `import { fileURLToPath } from "url"`
3. `vitest.config.ts:2` - `import path from 'path'`
4. `zgen/image.ts:2` - `import fs from "fs"`
5. `zgen/image.ts:3` - `import path from "path"`

**Fix:**
```typescript
// ❌ Before
import fs from "fs";
import path from "path";

// ✅ After
import fs from "node:fs";
import path from "node:path";
```

#### `noNonNullAssertion` - ~30+ violations
- **Severity:** ⚠️ Warning
- **Example:** `prisma/lib/get_sharef.ts:2`
  ```typescript
  const ADMIN_TOKEN = process.env.SEAFILE_TOKEN!; // ❌
  ```

**Rekomendasi:** Gunakan optional chaining atau nullish coalescing

---

### 3. **Complexity** (ℹ️ Info + ⚠️ Warnings)

#### `useLiteralKeys` - ~800+ violations
- **Severity:** ℹ️ Info
- **Fixable:** ✅ Auto-fix available

**Example:**
```typescript
// ❌ Before
const res = await ApiFetch.api.desa.berita["create"].post(form);

// ✅ After
const res = await ApiFetch.api.desa.berita.create.post(form);
```

#### `noImportantStyles` - 4 violations
- **Severity:** ⚠️ Warning
- **File:** `src/styles/dark-mode-table.css` (lines 12, 17, 22, 29)

**Masalah:** `!important` mengacungkan cascade CSS

**Rekomendasi:** Gunakan CSS specificity yang lebih baik

#### `useOptionalChain` - 2 violations
- **Severity:** ⚠️ Warning
- **Fixable:** ✅ Auto-fix available

**Files:**
- `xcoba.ts:41` - `if (resOut && resOut.body)`
- `xcoba.ts:51` - `if (resErr && resErr.body)`

**Fix:**
```typescript
// ❌ Before
if (resOut && resOut.body) {

// ✅ After
if (resOut?.body) {
```

#### `noUselessContinue` - 1 violation
- **Severity:** ℹ️ Info
- **File:** `find-port.ts:56`

---

### 4. **Correctness** (⚠️ Warnings)

#### `noUnusedImports` - ~100+ violations
- **Severity:** ⚠️ Warning
- **Fixable:** ✅ Auto-fix available

#### `noUnusedVariables` - ~50+ violations
- **Severity:** ⚠️ Warning
- **Manual fix required**

---

## 🎯 Rekomendasi Prioritas Fix

### 🔴 HIGH PRIORITY (Fix Immediately)

1. **`noAsyncPromiseExecutor`** (2 errors)
   - Bisa menyebabkan unhandled promise rejections
   - Files: `xcoba.ts`, `xcoba2.ts`

2. **`useIterableCallbackReturn`** (1 error)
   - Logic yang salah di forEach
   - File: `prisma/_seeder_list/desa/berita/seed_berita.ts`

### 🟡 MEDIUM PRIORITY (Fix Soon)

3. **`useNodejsImportProtocol`** (7 infos, auto-fixable)
   - Best practice untuk Node.js imports
   - Run: `npx biome lint --fix .`

4. **`useOptionalChain`** (2 warnings, auto-fixable)
   - Lebih concise dan safer
   - Files: `xcoba.ts`

5. **`noUselessContinue`** (1 info, auto-fixable)
   - File: `find-port.ts`

6. **`noImportantStyles`** (4 warnings)
   - File: `src/styles/dark-mode-table.css`

### 🟢 LOW PRIORITY (Gradual Refactor)

7. **`useLiteralKeys`** (~800+ infos, auto-fixable)
   - Bisa di-fix dengan `npx biome lint --fix .`
   - Low risk, high volume

8. **`noExplicitAny`** (~3,500+ warnings)
   - Requires manual refactoring
   - Prioritaskan files yang critical/paling sering digunakan
   - Gunakan `unknown` dengan type guards sebagai alternatif

9. **`noNonNullAssertion`** (~30+ warnings)
   - Gunakan optional chaining (`?.`) atau nullish coalescing (`??`)

10. **`noUnusedImports/Variables`** (~150+ warnings)
    - Auto-fixable dengan `npx biome lint --fix .`

---

## 🛠️ Auto-Fix Commands

### Fix All Auto-Fixable Issues
```bash
npx biome lint --fix .
```

### Fix Specific Categories
```bash
# Fix style issues
npx biome lint --fix --include=style .

# Fix complexity issues
npx biome lint --fix --include=complexity .

# Format code
npx biome format --write .
```

### Check Without Fixing
```bash
npx biome check .
```

---

## 📋 Configuration Issues

### `biome.json` - Deprecated Property
```json
{
  "files": {
    "experimentalScannerIgnores": [...] // ⚠️ DEPRECATED
  }
}
```

**Rekomendasi:** Gunakan `files.includes` dengan negation pattern:
```json
{
  "files": {
    "includes": [
      "**/*",
      "!!**/node_modules",
      "!!**/.next",
      "!!**/out",
      "!!**/public"
    ]
  }
}
```

---

## 📊 Health Score

| Aspect | Score | Status |
|--------|-------|--------|
| **Syntax Correctness** | 95/100 | ✅ Good |
| **Type Safety** | 35/100 | ❌ Poor (too many `any`) |
| **Code Style** | 60/100 | ⚠️ Needs Work |
| **Complexity** | 70/100 | ⚠️ Acceptable |
| **Best Practices** | 55/100 | ⚠️ Needs Improvement |
| **Overall** | **63/100** | ⚠️ **Moderate** |

---

## 🎯 Action Plan

### Phase 1: Quick Wins (1-2 hours)
```bash
# 1. Auto-fix all fixable issues
npx biome lint --fix .

# 2. Format code
npx biome format --write .

# 3. Fix the 2 async promise executor errors manually
# Files: xcoba.ts, xcoba2.ts
```

### Phase 2: Critical Fixes (2-4 hours)
1. Fix `useIterableCallbackReturn` in seed_berita.ts
2. Fix `useOptionalChain` in xcoba.ts
3. Remove `!important` styles atau refactor CSS
4. Fix Node.js import protocols

### Phase 3: Type Safety Improvement (1-2 weeks)
1. Replace `any` dengan proper types di critical files
2. Add type guards untuk `unknown` values
3. Implement proper error handling types
4. Remove unused imports dan variables

### Phase 4: Long-term Improvement (Ongoing)
1. Setup Biome di CI/CD pipeline
2. Add pre-commit hooks untuk auto-lint
3. Regular code reviews untuk maintain quality
4. Gradually refactor `any` to proper types

---

## 📝 Notes

- **Majority of issues** adalah `noExplicitAny` yang memerlukan manual effort
- **Most auto-fixable** issues bisa diselesaikan dalam 1 command
- **Critical errors** hanya 3 files yang harus segera di-fix
- **Project size:** 1,951 files dengan ~9,000 issues
- **Estimated effort:** 1-2 minggu untuk comprehensive cleanup

---

**Generated by:** Biome Lint Analysis  
**Date:** 9 April 2026  
**Project:** Desa Darmasaba Village Management System
