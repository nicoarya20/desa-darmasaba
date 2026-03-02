# Music Player Library

Folder ini berisi fungsi-fungsi dan hooks untuk music player Desa Darmasaba.

## Files

### 1. `audio-player.ts` - Fungsi Utility Audio

Berisi fungsi-fungsi pure untuk kontrol audio player:

#### Fungsi yang Tersedia:

| Fungsi | Deskripsi | Parameters |
|--------|-----------|------------|
| `togglePlayPause()` | Toggle play/pause audio | `audioRef`, `isPlaying`, `setIsPlaying` |
| `skipToPreviousSong()` | **Lagu sebelumnya** dalam playlist | `currentSongIndex`, `filteredMusikLength`, `isShuffle`, `setCurrentSongIndex`, `setIsPlaying` |
| `skipToNextSong()` | **Lagu berikutnya** dalam playlist | `currentSongIndex`, `filteredMusikLength`, `isShuffle`, `setCurrentSongIndex`, `setIsPlaying` |
| `toggleMute()` | Toggle mute/unmute | `audioRef`, `isMuted`, `setIsMuted` |
| `handleVolumeChange(val)` | `function` | Set volume | `audioRef`, `volume`, `setVolume`, `isMuted`, `setIsMuted` |
| `handleSeekStart(value)` | `function` | **Mulai drag** progress bar | `value` - posisi slider |
| `handleSeekEnd(value)` | `function` | **Selesai drag** progress bar | `value` - posisi final |
| `formatTime()` | `function` | Format detik ke MM:SS | `seconds` |
| `parseDuration()` | Parse "MM:SS" ke detik | `durationString` |
| `playSong()` | Putar lagu dari playlist | `index`, `filteredMusikLength`, `setCurrentSongIndex`, `setIsPlaying` |
| `handleSongEnd()` | Handle saat lagu selesai | Multiple params untuk repeat/shuffle logic |
| `toggleRepeat()` | Toggle repeat mode | `isRepeat`, `setIsRepeat` |
| `toggleShuffle()` | Toggle shuffle mode | `isShuffle`, `setIsShuffle` |
| `getNextSongIndex()` | Dapatkan index lagu berikutnya | `currentSongIndex`, `filteredMusikLength`, `isShuffle` |
| `getPreviousSongIndex()` | Dapatkan index lagu sebelumnya | `currentSongIndex`, `filteredMusikLength`, `isShuffle` |

#### Contoh Penggunaan:

```typescript
import { togglePlayPause, formatTime, skipBack } from './audio-player';

// Toggle play/pause
const handlePlayPause = () => {
  togglePlayPause(audioRef, isPlaying, setIsPlaying);
};

// Format time
const displayTime = formatTime(125); // Returns: "2:05"

// Skip back 10 seconds
const handleSkipBack = () => {
  skipBack(audioRef, 10);
};
```

---

### 2. `audio-hooks.ts` - Fungsi Helper untuk Audio Effects

Berisi fungsi-fungsi untuk setup audio effects dan lifecycle:

#### Fungsi yang Tersedia:

| Fungsi | Deskripsi | Parameters |
|--------|-----------|------------|
| `setupProgressInterval()` | Setup interval update progress | `audioRef`, `isPlaying`, `setCurrentTime`, `progressIntervalRef` |
| `clearProgressInterval()` | Clear progress interval | `progressIntervalRef` |
| `handleAudioMetadataLoaded()` | Handle metadata loaded event | `audioRef`, `setDuration` |
| `handleAudioError()` | Handle audio error | `error`, `audioRef`, `setIsPlaying` |
| `preloadAudio()` | Preload audio file | `audioRef`, `src` |
| `stopAudio()` | Stop audio dan reset state | `audioRef`, `setIsPlaying`, `setCurrentTime` |

#### Contoh Penggunaan:

```typescript
import { setupProgressInterval, handleAudioMetadataLoaded } from './audio-hooks';
import { useEffect, useRef } from 'react';

// Setup progress interval in useEffect
useEffect(() => {
  return setupProgressInterval(
    audioRef,
    isPlaying,
    setCurrentTime,
    progressIntervalRef
  );
}, [isPlaying]);

// Handle audio metadata
<audio
  ref={audioRef}
  onLoadedMetadata={() => handleAudioMetadataLoaded(audioRef, setDuration)}
/>
```

---

### 3. `use-music-player.ts` - Custom React Hook

Custom hook yang menggabungkan semua state dan logic music player.

#### Usage:

```typescript
import { useMusicPlayer } from './use-music-player';

function MusicPlayerComponent() {
  const [musikData, setMusikData] = useState<Musik[]>([]);
  const [search, setSearch] = useState('');

  const {
    currentSong,
    currentSongIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isRepeat,
    isShuffle,
    filteredMusik,
    audioRef,
    playSong,
    togglePlayPause,
    skipBack,
    skipForward,
    toggleRepeat,
    toggleShuffle,
    toggleMute,
    handleVolumeChange,
    handleSeek,
    handleSongEnd,
  } = useMusicPlayer({ musikData, search });

  return (
    // Your component JSX
  );
}
```

#### Return Values:

| Property/Function | Type | Deskripsi |
|-------------------|------|-----------|
| `currentSong` | `Musik \| null` | Lagu yang sedang diputar |
| `currentSongIndex` | `number` | Index lagu dalam filtered list |
| `isPlaying` | `boolean` | Status play/pause |
| `currentTime` | `number` | Waktu saat ini (detik) |
| `duration` | `number` | Durasi total (detik) |
| `volume` | `number` | Volume (0-100) |
| `isMuted` | `boolean` | Status mute |
| `isRepeat` | `boolean` | Status repeat |
| `isShuffle` | `boolean` | Status shuffle |
| `filteredMusik` | `Musik[]` | List lagu setelah filter search |
| `audioRef` | `RefObject<HTMLAudioElement>` | Ref ke audio element |
| `playSong(index)` | `function` | Putar lagu by index |
| `togglePlayPause()` | `function` | Toggle play/pause |
| `skipBack()` | `function` | Mundur 10 detik |
| `skipForward()` | `function` | Maju 10 detik |
| `toggleRepeat()` | `function` | Toggle repeat |
| `toggleShuffle()` | `function` | Toggle shuffle |
| `toggleMute()` | `function` | Toggle mute |
| `handleVolumeChange(val)` | `function` | Set volume |
| `handleSeekStart(value)` | `function` | Start drag progress bar |
| `handleSeekEnd(value)` | `function` | End drag progress bar |
| `handleSongEnd()` | `function` | Handle lagu selesai |
| `handleAudioMetadataLoaded()` | `function` | Handle metadata loaded dari audio |

---

## Fitur Music Player

### ✅ Fitur Utama:

1. **Play/Pause** - Memutar dan menghentikan musik
2. **Skip Back/Forward** - Mundur/maju 10 detik
3. **Repeat Mode** - Ulangi lagu saat ini
4. **Shuffle Mode** - Acak playlist
5. **Volume Control** - Atur volume (0-100%)
6. **Mute** - Bisukan suara
7. **Seek/Scrub** - Geser progress bar
8. **Search** - Cari lagu berdasarkan judul, artis, atau genre
9. **Auto Next** - Otomatis lanjut ke lagu berikutnya
10. **Progress Update** - Update progress real-time setiap detik

### 🎵 Cara Kerja:

```
┌─────────────────────────────────────────────────────────┐
│                    Music Player                          │
├─────────────────────────────────────────────────────────┤
│  Input:                                                 │
│  - musikData (from API)                                 │
│  - search (user input)                                  │
├─────────────────────────────────────────────────────────┤
│  Process:                                               │
│  1. Filter musik based on search                        │
│  2. Manage audio state (play, pause, volume, etc)       │
│  3. Handle user interactions (buttons, sliders)         │
│  4. Auto-advance to next song                           │
├─────────────────────────────────────────────────────────┤
│  Output:                                                │
│  - currentSong (currently playing)                      │
│  - audio controls (play, pause, skip, etc)              │
│  - progress (currentTime, duration)                     │
└─────────────────────────────────────────────────────────┘
```

---

## File Structure

```
src/app/darmasaba/(pages)/musik/
├── lib/
│   ├── audio-player.ts       # Pure utility functions
│   ├── audio-hooks.ts        # Audio effect helpers
│   ├── use-music-player.ts   # Custom React hook
│   └── README.md            # This file
└── musik-desa/
    └── page.tsx             # Main music player page
```

---

## Testing

Untuk testing manual:

1. Buka halaman `/darmasaba/musik-desa`
2. Test semua tombol:
   - ▶️ Play - Harus mulai memutar musik
   - ⏸️ Pause - Harus menghentikan musik
   - ⏮️ Skip Back - Harus mundur 10 detik
   - ⏭️ Skip Forward - Harus maju 10 detik
   - 🔁 Repeat - Harus mengulang lagu
   - 🔀 Shuffle - Harus acak playlist
   - 🔊 Volume - Harus mengubah volume
   - 🔇 Mute - Harus bisukan suara
   - 🎵 Click song list - Harus putar lagu yang dipilih

---

## Development Notes

- Semua fungsi sudah dipisahkan berdasarkan tanggung jawab
- Gunakan `useMusicPlayer` hook untuk logic utama
- Import fungsi utility dari `audio-player.ts` jika butuh fungsi spesifik
- Audio ref menggunakan HTML5 Audio API
- Progress update setiap 1 detik saat playing

---

## Contact

Untuk pertanyaan atau issue, hubungi developer team.
