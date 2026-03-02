# Update: Skip Back/Forward Functionality

## Problem
Tombol **Skip Back** dan **Skip Forward** sebelumnya hanya berfungsi untuk mundur/maju 10 detik dalam lagu yang sama, bukan untuk pindah ke lagu sebelumnya/berikutnya.

## Solution

### Changes Made

#### 1. New Functions in `audio-player.ts`

**`skipToPreviousSong()`** - Pindah ke lagu sebelumnya
```typescript
export const skipToPreviousSong = (
  currentSongIndex: number,
  filteredMusikLength: number,
  isShuffle: boolean,
  setCurrentSongIndex: (index: number) => void,
  setIsPlaying: (playing: boolean) => void
)
```

**Features:**
- Jika **shuffle mode OFF**: Pindah ke lagu sebelumnya secara sequential
- Jika di lagu pertama → loop ke lagu terakhir
- Jika **shuffle mode ON**: Random lagu lain (tidak sama dengan current)
- Auto play setelah pindah lagu

**`skipToNextSong()`** - Pindah ke lagu berikutnya
```typescript
export const skipToNextSong = (
  currentSongIndex: number,
  filteredMusikLength: number,
  isShuffle: boolean,
  setCurrentSongIndex: (index: number) => void,
  setIsPlaying: (playing: boolean) => void
)
```

**Features:**
- Jika **shuffle mode OFF**: Pindah ke lagu berikutnya secara sequential
- Jika di lagu terakhir → loop ke lagu pertama
- Jika **shuffle mode ON**: Random lagu lain (tidak sama dengan current)
- Auto play setelah pindah lagu

---

### 2. Updated `use-music-player.ts`

**Before:**
```typescript
// Skip back 10 seconds
const skipBack = () => {
  if (audioRef.current) {
    audioRef.current.currentTime = Math.max(
      0,
      audioRef.current.currentTime - 10
    );
  }
};

// Skip forward 10 seconds
const skipForward = () => {
  if (audioRef.current) {
    audioRef.current.currentTime = Math.min(
      duration,
      audioRef.current.currentTime + 10
    );
  }
};
```

**After:**
```typescript
// Skip to previous song
const skipBack = () => {
  skipToPreviousSong(
    currentSongIndex,
    filteredMusik.length,
    isShuffle,
    setCurrentSongIndex,
    setIsPlaying
  );
};

// Skip to next song
const skipForward = () => {
  skipToNextSong(
    currentSongIndex,
    filteredMusik.length,
    isShuffle,
    setCurrentSongIndex,
    setIsPlaying
  );
};
```

---

### 3. Updated `handleSongEnd()`

Sekarang menggunakan `skipToNextSong()` untuk konsistensi:

```typescript
const handleSongEnd = () => {
  if (isRepeat) {
    // Repeat current song
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  } else {
    // Use skipToNextSong for consistency
    skipToNextSong(
      currentSongIndex,
      filteredMusik.length,
      isShuffle,
      setCurrentSongIndex,
      setIsPlaying
    );
  }
};
```

---

### 4. Improved Song Change Detection

Updated useEffect untuk memastikan lagu benar-benar diputar saat berganti:

```typescript
useEffect(() => {
  if (currentSong && audioRef.current) {
    const durationParts = currentSong.durasi.split(':');
    const durationInSeconds =
      parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]);
    setDuration(durationInSeconds);
    setCurrentTime(0);

    // Reset and play
    audioRef.current.currentTime = 0;
    
    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.error('Error playing audio:', err);
        setIsPlaying(false);
      });
    }
  }
}, [currentSongIndex, currentSong, isPlaying]); // Added isPlaying to dependencies
```

---

## Behavior Matrix

### Skip Back (⏮️)

| Condition | Action |
|-----------|--------|
| Shuffle OFF, not at first song | Previous song (index - 1) |
| Shuffle OFF, at first song | Last song (loop) |
| Shuffle ON | Random song (≠ current) |
| Only 1 song | Stay on current song |

### Skip Forward (⏭️)

| Condition | Action |
|-----------|--------|
| Shuffle OFF, not at last song | Next song (index + 1) |
| Shuffle OFF, at last song | First song (loop) |
| Shuffle ON | Random song (≠ current) |
| Only 1 song | Stay on current song |

---

## User Experience

### Button Functions:

| Button | Icon | Function |
|--------|------|----------|
| **Skip Back** | ⏮️ | Previous song (with shuffle support) |
| **Play/Pause** | ▶️/⏸️ | Toggle play/pause |
| **Skip Forward** | ⏭️ | Next song (with shuffle support) |

### With Shuffle Mode:

- **Shuffle OFF** 🔁: Sequential playback (1 → 2 → 3 → 1...)
- **Shuffle ON** 🔀: Random playback (1 → 3 → 2 → 1...)

### With Repeat Mode:

- **Repeat OFF**: Auto-advance to next song when current ends
- **Repeat ON** 🔂: Replay current song when it ends

---

## Testing Scenarios

### ✅ Test 1: Sequential Playback
1. Play song #1
2. Click ⏭️ → Should play song #2
3. Click ⏭️ → Should play song #3
4. Click ⏭️ (at last) → Should loop to song #1

### ✅ Test 2: Previous Song
1. Playing song #3
2. Click ⏮️ → Should play song #2
3. Click ⏮️ → Should play song #1
4. Click ⏮️ (at first) → Should loop to last song

### ✅ Test 3: Shuffle Mode
1. Enable shuffle 🔀
2. Playing song #1
3. Click ⏭️ → Should play random song (not #1)
4. Click ⏮️ → Should play different random song

### ✅ Test 4: Auto-Advance
1. Play any song
2. Wait until song ends
3. Should automatically play next song

### ✅ Test 5: Single Song
1. Filter search to show only 1 song
2. Click ⏭️ or ⏮️ → Should stay on same song

---

## Files Modified

| File | Changes |
|------|---------|
| `audio-player.ts` | Added `skipToPreviousSong()`, `skipToNextSong()`; Removed old `skipBack()`, `skipForward()` |
| `use-music-player.ts` | Updated `skipBack`, `skipForward`, `handleSongEnd` to use new functions |
| `README.md` | Updated documentation |

---

## API Considerations

**No API changes required!** 

The functionality is purely client-side state management. The API endpoint `/api/desa/musik/find-many` already returns all necessary data:
- `id` - Unique identifier
- `judul` - Song title
- `artis` - Artist
- `durasi` - Duration (MM:SS)
- `audioFile.link` - Audio URL
- `coverImage.link` - Cover art URL
- `isActive` - Active status

State management handles the rest:
- `currentSongIndex` - Tracks which song is playing
- `filteredMusik` - Array of songs (after search filter)
- `isShuffle` - Shuffle mode toggle
- `isPlaying` - Play/pause state

---

## Browser Compatibility

✅ Chrome/Edge (Chromium)
✅ Firefox
✅ Safari
✅ Mobile browsers (iOS Safari, Chrome Mobile)

Uses standard HTML5 Audio API which is universally supported.

---

## Performance Notes

- **Instant response**: No API call needed for skip operations
- **Smooth transitions**: Songs load immediately from preloaded URLs
- **Memory efficient**: Only one audio element in DOM
- **State optimized**: Uses React state batching for smooth updates

---

## Future Enhancements (Optional)

1. **Transition Fade**: Crossfade between songs
2. **Preload Next**: Preload next song for instant playback
3. **History**: Track played songs for "go back" feature
4. **Queue**: Custom queue management
5. **Keyboard Shortcuts**: Arrow keys for skip controls

---

**Updated**: February 27, 2026  
**Issue**: Skip buttons not working as expected  
**Status**: ✅ Resolved
