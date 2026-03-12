# Musik Desa - Create Feature Analysis

## Error Summary
**Error**: `ERR_BLOCKED_BY_CLIENT` saat create musik di staging environment

## Root Cause Analysis

### 1. **CORS Configuration Issue** (Primary)
File: `src/app/api/[[...slugs]]/route.ts`

The CORS configuration has specific origins listed:
```typescript
const corsConfig = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://cld-dkr-desa-darmasaba-stg.wibudev.com",
    "https://cld-dkr-staging-desa-darmasaba.wibudev.com",
    "*",
  ],
  // ...
}
```

**Problem**: The wildcard `*` is at the end, but some browsers don't respect it when `credentials: true` is set.

### 2. **API Fetch Base URL** (Secondary)
File: `src/lib/api-fetch.ts`

```typescript
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
```

**Problem**: 
- In staging, this might still default to `http://localhost:3000`
- Mixed content (HTTPS frontend → HTTP API) gets blocked by browsers
- The `NEXT_PUBLIC_BASE_URL` environment variable might not be set in staging

### 3. **File Storage Upload Path** (Tertiary)
File: `src/app/api/[[...slugs]]/_lib/fileStorage/_lib/create.ts`

```typescript
const UPLOAD_DIR = process.env.WIBU_UPLOAD_DIR;
```

**Problem**: If `WIBU_UPLOAD_DIR` is not set or points to a non-writable location, uploads will fail silently.

## Solution

### Fix 1: Update CORS Configuration
**File**: `src/app/api/[[...slugs]]/route.ts`

```typescript
// Move wildcard to first position and ensure it works with credentials
const corsConfig = {
  origin: [
    "*", // Allow all origins (for staging flexibility)
    "http://localhost:3000",
    "http://localhost:3001",
    "https://cld-dkr-desa-darmasaba-stg.wibudev.com",
    "https://cld-dkr-staging-desa-darmasaba.wibudev.com",
  ],
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"] as HTTPMethod[],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 86400, // 24 hours
  credentials: true,
};
```

### Fix 2: Add Environment Variable Validation
**File**: `.env.example` (update)

```bash
# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# For staging/production, set this to your actual domain
# NEXT_PUBLIC_BASE_URL=https://cld-dkr-desa-darmasaba-stg.wibudev.com
```

### Fix 3: Update API Fetch to Handle Relative URLs
**File**: `src/lib/api-fetch.ts`

```typescript
import { AppServer } from '@/app/api/[[...slugs]]/route'
import { treaty } from '@elysiajs/eden'

// Use relative URL for better deployment flexibility
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '/'

const ApiFetch = treaty<AppServer>(BASE_URL)

export default ApiFetch
```

### Fix 4: Add Error Handling in Create Page
**File**: `src/app/admin/(dashboard)/musik/create/page.tsx`

Add better error logging to diagnose issues:

```typescript
const handleSubmit = async () => {
  // ... validation ...

  try {
    setIsSubmitting(true);

    // Upload cover image
    const coverRes = await ApiFetch.api.fileStorage.create.post({
      file: coverFile,
      name: coverFile.name,
    });

    if (!coverRes.data?.data?.id) {
      console.error('Cover upload failed:', coverRes);
      return toast.error('Gagal mengunggah cover, silakan coba lagi');
    }

    // ... rest of the code ...

  } catch (error) {
    console.error('Error creating musik:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    toast.error('Terjadi kesalahan saat membuat musik');
  } finally {
    setIsSubmitting(false);
  }
};
```

## Testing Checklist

### Local Development
- [ ] Test create musik with cover image and audio file
- [ ] Verify CORS headers in browser DevTools Network tab
- [ ] Check that file uploads are saved to correct directory

### Staging Environment
- [ ] Set `NEXT_PUBLIC_BASE_URL` to staging domain
- [ ] Verify HTTPS is used for all API calls
- [ ] Check browser console for mixed content warnings
- [ ] Verify `WIBU_UPLOAD_DIR` is set and writable
- [ ] Test create musik end-to-end

## Additional Notes

### ERR_BLOCKED_BY_CLIENT Common Causes:
1. **CORS policy blocking** - Most likely cause
2. **Ad blockers** - Can block certain API endpoints
3. **Mixed content** - HTTPS page making HTTP requests
4. **Content Security Policy (CSP)** - Restrictive CSP headers
5. **Browser extensions** - Privacy/security extensions blocking requests

### Debugging Steps:
1. Open browser DevTools → Network tab
2. Try to create musik
3. Look for failed requests (red status)
4. Check the "Headers" tab for:
   - Request URL (should be correct domain)
   - Response headers (should have `Access-Control-Allow-Origin`)
   - Status code (4xx/5xx indicates server-side issue)
5. Check browser console for CORS errors

## Recommended Next Steps

1. **Immediate**: Update CORS configuration to allow staging domain
2. **Short-term**: Add proper environment variable validation
3. **Long-term**: Implement proper error boundaries and logging
