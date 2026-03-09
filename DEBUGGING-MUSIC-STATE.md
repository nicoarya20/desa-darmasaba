# 🐛 DEBUGGING GUIDE - Music State

## Problem: `window.publicMusicState` is undefined

### Possible Causes & Solutions

---

### 1️⃣ **Debug Utility Not Loaded**

**Check:** Open browser console and look for:
```
[Debug] State exposed to window object:
  ✅ window.publicMusicState
  ✅ window.adminNavState
  ✅ window.adminAuthState
```

**If NOT visible:**
- Debug utility not imported
- Check `src/app/layout.tsx` has: `import '@/lib/debug-state';`

---

### 2️⃣ **Timing Issue - Console.log Too Early**

**Problem:** You're checking `window.publicMusicState` before it's exposed.

**Solution:** Wait for page to fully load, then check:

```javascript
// In browser console, type:
window.publicMusicState
```

**Expected Output:**
```javascript
{
  isPlaying: false,
  currentSong: null,
  currentSongIndex: -1,
  musikData: [],
  currentTime: 0,
  duration: 0,
  volume: 70,
  isMuted: false,
  isRepeat: false,
  isShuffle: false,
  isLoading: true,
  isPlayerOpen: false,
  error: null,
  playSong: ƒ,
  togglePlayPause: ƒ,
  // ... all methods
}
```

---

### 3️⃣ **Alternative Debug Methods**

If `window.publicMusicState` still undefined, try these:

#### Method 1: Use Helper Function
```javascript
// In browser console:
window.getMusicState()
```

#### Method 2: Import Directly (in console)
```javascript
// This won't work in console, but you can add to your component:
import { publicMusicState } from '@/state/public/publicMusicState';
console.log('Music State:', publicMusicState);
```

#### Method 3: Check from Component
Add to any component:
```typescript
useEffect(() => {
  console.log('Music State:', window.publicMusicState);
}, []);
```

---

### 4️⃣ **Verify Import Chain**

Check if all files are properly imported:

```
src/app/layout.tsx
  └─ import '@/lib/debug-state'
       └─ import { publicMusicState } from '@/state/public/publicMusicState'
            └─ Exports proxy state
```

---

### 5️⃣ **Check Browser Console for Errors**

Look for errors like:
- ❌ `Cannot find module '@/state/public/publicMusicState'`
- ❌ `publicMusicState is not defined`
- ❌ `Failed to load module`

**If you see these:**
- Check TypeScript compilation: `bunx tsc --noEmit`
- Check file paths are correct
- Restart dev server: `bun run dev`

---

### 6️⃣ **Manual Test - Add to Component**

Temporarily add to any page component:

```typescript
'use client';

import { publicMusicState } from '@/state/public/publicMusicState';
import { useEffect } from 'react';

export default function TestPage() {
  useEffect(() => {
    console.log('🎵 Music State:', publicMusicState);
    console.log('🎵 Is Playing:', publicMusicState.isPlaying);
    console.log('🎵 Current Song:', publicMusicState.currentSong);
  }, []);

  return <div>Check console</div>;
}
```

---

### 7️⃣ **Quick Fix - Re-import in Layout**

If still undefined, add explicit import in `src/app/layout.tsx`:

```typescript
import '@/lib/debug-state'; // Debug state exposure

// Add this AFTER imports
if (typeof window !== 'undefined') {
  import('@/state/public/publicMusicState').then(({ publicMusicState }) => {
    (window as any).publicMusicState = publicMusicState.publicMusicState;
    console.log('✅ Music state manually exposed!');
  });
}
```

---

### 8️⃣ **Verify State is Working**

Test state reactivity:

```javascript
// In browser console:
window.publicMusicState.volume = 80
console.log(window.publicMusicState.volume) // Should log: 80

// Change state
window.publicMusicState.togglePlayer()
console.log(window.publicMusicState.isPlayerOpen) // Should log: true
```

---

### 9️⃣ **Check Valtio Installation**

Ensure Valtio is installed:

```bash
bun list valtio
```

Should show: `valtio@1.x.x`

If not installed:
```bash
bun install valtio
```

---

### 🔟 **Nuclear Option - Re-export**

Create new file `src/lib/music-debug.ts`:

```typescript
'use client';

import { publicMusicState } from '@/state/public/publicMusicState';

if (typeof window !== 'undefined') {
  (window as any).publicMusicState = publicMusicState;
  console.log('🎵 Music state exposed!');
}

export { publicMusicState };
```

Then import in layout:
```typescript
import '@/lib/music-debug';
```

---

## ✅ Working Checklist

- [ ] Debug utility imported in layout.tsx
- [ ] Console shows "[Debug] State exposed" message
- [ ] No TypeScript errors
- [ ] No console errors about missing modules
- [ ] `window.publicMusicState` returns object (not undefined)
- [ ] State has all properties (isPlaying, currentSong, etc.)
- [ ] State methods are functions (playSong, togglePlayPause, etc.)

---

## 🎯 Expected Console Output

When page loads, you should see:

```
[Debug] State exposed to window object:
  ✅ window.publicMusicState
  ✅ window.adminNavState
  ✅ window.adminAuthState
  ℹ️  Type "window.publicMusicState" in console to check state

[MusicState] Loading musik data...
[MusicState] API response: {...}
[MusicState] Loaded 2 active songs
[MusicState] First song: {judul: 'Celengan Rindu', ...}
```

---

## 📞 Still Having Issues?

If `window.publicMusicState` still undefined after trying all above:

1. **Clear browser cache** - Hard refresh (Ctrl+Shift+R)
2. **Restart dev server** - `bun run dev`
3. **Check file permissions** - Ensure files are readable
4. **Check Next.js config** - Ensure path aliases work
5. **Try incognito mode** - Rule out extensions interfering

---

Last updated: March 9, 2026
