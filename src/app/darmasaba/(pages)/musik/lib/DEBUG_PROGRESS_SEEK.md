# Debugging Progress Bar Issue

## Masalah
Musik auto back ke awal (0:00) saat user mencoba seek/maju-mundurkan progress bar.

## Kemungkinan Penyebab

### 1. Duration dari Database vs Actual Duration
```typescript
// Database durasi (dari currentSong.durasi): "3:45"
const durationParts = currentSong.durasi.split(':');
const durationInSeconds = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]);
// Result: 225 seconds

// Actual duration dari audio file:
audioRef.current.duration
// Might be: 224.87 seconds (bisa berbeda!)
```

**Problem:** Jika kita set manual duration dari database, tapi actual audio duration berbeda, bisa terjadi konflik.

**Solution:** Gunakan actual duration dari audio file, jangan dari database.

---

### 2. useEffect Dependencies Terlalu Banyak
```typescript
// ❌ BEFORE - Too many dependencies
useEffect(() => {
  // Reset currentTime to 0
  audioRef.current.currentTime = 0;
}, [currentSongIndex, currentSong, isPlaying]);
// Trigger setiap kali ada perubahan!
```

**Problem:**
- `currentSong` berubah → reset ke 0
- `isPlaying` berubah → reset ke 0
- `currentTime` berubah → re-render → effect trigger?

**Solution:**
```typescript
// ✅ AFTER - Only depend on currentSongIndex
useEffect(() => {
  if (currentSong && audioRef.current) {
    audioRef.current.currentTime = 0;
    if (isPlaying) {
      audioRef.current.play();
    }
  }
}, [currentSongIndex]);
// Only trigger when song changes
```

---

### 3. Progress Interval vs Seek Conflict
```typescript
// Progress interval update setiap detik
setInterval(() => {
  setCurrentTime(audioRef.current.currentTime);
}, 1000);

// User seek
handleSeekEnd(value) {
  setCurrentTime(value);
  audioRef.current.currentTime = value;
}

// 1 detik kemudian, progress interval overwrite!
setCurrentTime(audioRef.current.currentTime); // Back to old value!
```

**Solution:**
```typescript
// Pause progress interval saat dragging
useEffect(() => {
  return setupProgressInterval(
    audioRef,
    isPlaying && !isDragging, // ✅ Don't update if dragging
    setCurrentTime,
    progressIntervalRef
  );
}, [isPlaying, isDragging]);
```

---

### 4. isDragging Tidak Digunakan di Page
**Check:** Pastikan `isDragging` di-import dan digunakan dengan benar.

```typescript
// ✅ In use-music-player.ts
const {
  isDragging,      // ✅ Import ini
  handleSeekStart,
  handleSeekEnd,
  currentTime,     // ✅ Ini dynamic: isDragging ? dragTime : currentTime
} = useMusicPlayer({ musikData, search });

// ✅ In page.tsx
<Slider
  value={currentTime}  // ✅ Gunakan currentTime dari hook
  onChange={handleSeekStart}
  onChangeEnd={handleSeekEnd}
/>
```

---

## Debugging Steps

### Step 1: Check Console Logs

Open browser console dan look for:

```
[Song Change Effect] currentSongIndex: 0 currentSong: "Judul Lagu"
[Song Change] Reset currentTime to 0
[Song Change] Playing new song

[Audio Metadata] Actual duration: 225 Previous duration: 0
[Progress] Interval started

[Seek Start] 45 isDragging: false
[Seek End] 45 currentTime: 30 duration: 225
[Seek Applied] 45

[Progress Tick] 46
[Progress Tick] 47
...
```

**Expected:**
- `[Song Change]` hanya muncul saat ganti lagu
- `[Audio Metadata]` muncul sekali saat lagu load
- `[Seek Start]` dan `[Seek End]` muncul saat user drag slider
- `[Progress Tick]` muncul setiap detik saat playing

**Red Flags:**
- ❌ `[Song Change]` muncul terus → useEffect dependency salah
- ❌ `[Seek Applied]` tapi currentTime tetap 0 → audio element issue
- ❌ `[Progress Tick]` muncul saat dragging → isDragging tidak bekerja

---

### Step 2: Check Duration Value

Add this to your component:

```typescript
console.log('Duration:', duration, 'Current Time:', currentTime);
```

**Expected:**
- Duration: 225 (atau actual duration dari audio)
- Current Time: 0 → 1 → 2 → 3... (increment normal)

**Red Flags:**
- ❌ Duration: 0 → Audio metadata tidak load
- ❌ Duration: NaN → Database durasi format salah
- ❌ Current Time reset ke 0 terus → Effect trigger terus

---

### Step 3: Check isDragging State

```typescript
console.log('isDragging:', isDragging, 'dragTime:', dragTime);
```

**Expected:**
- isDragging: false (normal state)
- isDragging: true (saat user drag slider)
- dragTime: 45 (posisi saat drag)

**Red Flags:**
- ❌ isDragging: true terus → handleSeekEnd tidak dipanggil
- ❌ dragTime: 0 terus → handleSeekStart tidak dipanggil

---

### Step 4: Check Slider Events

Add event listeners to slider:

```tsx
<Slider
  value={currentTime}
  onChange={(v) => {
    console.log('[Slider onChange]', v);
    handleSeekStart(v);
  }}
  onChangeEnd={(v) => {
    console.log('[Slider onChangeEnd]', v);
    handleSeekEnd(v);
  }}
/>
```

**Expected:**
- `onChange` dipanggil terus saat drag
- `onChangeEnd` dipanggil sekali saat release

**Red Flags:**
- ❌ `onChangeEnd` tidak dipanggil → Mantine slider issue
- ❌ `onChange` tidak dipanggil → Slider tidak interactive

---

## Common Issues & Solutions

### Issue 1: Duration = 0 atau NaN

**Cause:**
- Audio file tidak load
- Database durasi format salah (harus "MM:SS")

**Solution:**
```typescript
// Use actual duration from audio
const handleAudioMetadataLoaded = () => {
  if (audioRef.current) {
    setDuration(Math.floor(audioRef.current.duration));
  }
};

// Fallback to database duration if needed
useEffect(() => {
  if (currentSong && duration === 0) {
    const parts = currentSong.durasi.split(':');
    setDuration(parseInt(parts[0]) * 60 + parseInt(parts[1]));
  }
}, [currentSong]);
```

---

### Issue 2: Seek Reset ke 0

**Cause:**
- useEffect trigger terus
- Progress interval overwrite seek

**Solution:**
```typescript
// 1. Fix useEffect dependencies
useEffect(() => {
  // Only reset when song changes
}, [currentSongIndex]);

// 2. Pause progress during drag
useEffect(() => {
  return setupProgressInterval(
    audioRef,
    isPlaying && !isDragging,
    ...
  );
}, [isPlaying, isDragging]);

// 3. Safe seek with range check
const handleSeekEnd = (value: number) => {
  const safeValue = Math.max(0, Math.min(value, duration));
  setCurrentTime(safeValue);
  audioRef.current.currentTime = safeValue;
};
```

---

### Issue 3: Slider Tidak Berfungsi

**Cause:**
- Slider disabled
- onChange/onChangeEnd tidak di-set
- Value NaN atau Infinity

**Solution:**
```tsx
<Slider
  value={currentTime}
  max={duration || 1}  // ✅ Fallback to 1
  onChange={handleSeekStart}
  onChangeEnd={handleSeekEnd}
  disabled={!currentSong}  // ✅ Only disable if no song
/>
```

---

## Testing Checklist

### ✅ Test 1: Normal Playback
1. Play song
2. Check console: `[Progress Tick]` setiap detik
3. Current time increment normal
4. Duration correct

### ✅ Test 2: Seek Forward
1. Play song (e.g., at 0:30)
2. Click ahead on progress bar (e.g., 1:30)
3. Check console: `[Seek Start] 90`, `[Seek End] 90`
4. Audio jumps to 1:30
5. Continues playing from 1:30

### ✅ Test 3: Seek Backward
1. Play song (e.g., at 2:00)
2. Click behind on progress bar (e.g., 0:45)
3. Check console: `[Seek Start] 45`, `[Seek End] 45`
4. Audio jumps to 0:45
5. Continues playing from 0:45

### ✅ Test 4: Drag Seek
1. Play song
2. Click and drag slider thumb
3. Check console: `[Seek Start]` dengan berbagai value
4. Time display update smooth
5. Release slider
6. Check console: `[Seek End]` dengan final value
7. Audio jumps to exact position

### ✅ Test 5: Song Change
1. Play song #1
2. Click next song button
3. Check console: `[Song Change]` hanya sekali
4. New song plays from 0:00
5. Duration updates correctly

---

## Remove Debug Logs (Production)

Setelah semua berfungsi, hapus atau comment console logs:

```typescript
// Comment out debug logs
// console.log('[Seek Start]', value);
// console.log('[Seek End]', value);
// console.log('[Song Change Effect]', currentSongIndex);
// console.log('[Progress Tick]', time);
// console.log('[Audio Metadata]', actualDuration);
```

Atau gunakan environment variable:

```typescript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('[Seek Start]', value);
}
```

---

## Final Check

✅ Duration dari audio file (bukan database)
✅ useEffect hanya depend on `currentSongIndex`
✅ Progress interval pause saat dragging
✅ `isDragging` state bekerja
✅ `handleSeekStart` dan `handleSeekEnd` dipanggil
✅ Safe value range (0 to duration)
✅ Console logs menunjukkan flow yang benar

---

**Updated**: February 27, 2026  
**Issue**: Progress bar auto-reset to 0:00  
**Status**: 🔍 Debugging with console logs  
**Next Step**: Test dan check console output
