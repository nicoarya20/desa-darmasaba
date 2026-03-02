# 🎵 Music Player - Quick Reference

## Fungsi Tombol

| Tombol | Ikon | Fungsi | Keterangan |
|--------|------|--------|------------|
| **⏮️ Skip Back** | `<IconPlayerSkipBackFilled />` | Lagu sebelumnya | Sequential atau random (shuffle) |
| **▶️ Play** | `<IconPlayerPlayFilled />` | Putar lagu | Jika sedang pause |
| **⏸️ Pause** | `<IconPlayerPauseFilled />` | Jeda lagu | Jika sedang play |
| **⏭️ Skip Forward** | `<IconPlayerSkipForwardFilled />` | Lagu berikutnya | Sequential atau random (shuffle) |
| **🔁 Repeat** | `<IconRepeat />` | Ulangi lagu | Loop current song |
| **🔀 Shuffle** | `<IconArrowsShuffle />` | Acak lagu | Random playlist |
| **🔊 Volume** | `<Slider />` | Atur volume | 0-100% |
| **🔇 Mute** | `<IconVolumeOff />` | Bisukan | Toggle mute |

---

## State Flow

```
┌─────────────────────────────────────────────────────────┐
│                    User Action                           │
│  (Click Skip Back / Skip Forward / Play / Pause)        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              useMusicPlayer Hook                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  skipBack()                                      │   │
│  │    └─> skipToPreviousSong()                      │   │
│  │         └─> setCurrentSongIndex(prev)            │   │
│  │         └─> setIsPlaying(true)                   │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  skipForward()                                   │   │
│  │    └─> skipToNextSong()                          │   │
│  │         └─> setCurrentSongIndex(next)            │   │
│  │         └─> setIsPlaying(true)                   │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              useEffect Trigger                           │
│  (currentSongIndex, currentSong, isPlaying)             │
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │  1. Parse duration from currentSong.durasi     │    │
│  │  2. Set currentTime = 0                        │    │
│  │  3. audioRef.current.currentTime = 0           │    │
│  │  4. If isPlaying → audioRef.current.play()     │    │
│  └────────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Audio Plays                                 │
│  ┌────────────────────────────────────────────────┐    │
│  │  progressInterval updates currentTime/sec      │    │
│  └────────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Song Ends                                   │
│  ┌────────────────────────────────────────────────┐    │
│  │  onEnded → handleSongEnd()                     │    │
│  │    If repeat: replay current                   │    │
│  │    Else: skipToNextSong()                      │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## Logic Skip Back/Forward

### Sequential Mode (Shuffle OFF)

```
Playlist: [Song A] → [Song B] → [Song C]

Skip Forward (⏭️):
  Song A → Song B → Song C → Song A (loop)

Skip Back (⏮️):
  Song C → Song B → Song A → Song C (loop)
```

### Shuffle Mode (Shuffle ON)

```
Playlist: [Song A] [Song B] [Song C]

Skip Forward (⏭️):
  Song A → [Random: B or C] → [Random: A or C] ...

Skip Back (⏮️):
  Song C → [Random: A or B] → [Random: A or B or C] ...
  
Note: Random tidak akan memilih lagu yang sedang diputar
```

---

## Code Examples

### Basic Usage

```typescript
import { useMusicPlayer } from './lib/use-music-player';

function MyComponent() {
  const {
    currentSong,
    isPlaying,
    skipBack,
    skipForward,
    togglePlayPause,
  } = useMusicPlayer({ musikData, search });

  return (
    <div>
      <button onClick={skipBack}>⏮️</button>
      <button onClick={togglePlayPause}>
        {isPlaying ? '⏸️' : '▶️'}
      </button>
      <button onClick={skipForward}>⏭️</button>
      
      {currentSong && (
        <div>
          <h3>{currentSong.judul}</h3>
          <p>{currentSong.artis}</p>
        </div>
      )}
    </div>
  );
}
```

### With All Controls

```typescript
const {
  // State
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
  
  // Controls
  playSong,
  togglePlayPause,
  skipBack,      // ⏮️ Previous song
  skipForward,   // ⏭️ Next song
  toggleRepeat,  // 🔁
  toggleShuffle, // 🔀
  toggleMute,    // 🔇
  handleVolumeChange,
  handleSeek,
} = useMusicPlayer({ musikData, search });
```

---

## Troubleshooting

### ❌ Skip buttons don't work
**Check:**
- Is `filteredMusik.length > 0`?
- Is `currentSongIndex` valid?
- Check console for errors

### ❌ No sound after skip
**Check:**
- Is `isPlaying` state true?
- Is audio element loaded?
- Check browser autoplay policy

### ❌ Wrong song plays
**Check:**
- Is `currentSongIndex` correct?
- Is `filteredMusik` array correct?
- Check search filter logic

### ❌ Shuffle not random
**Check:**
- Is `isShuffle` state true?
- Random function working?
- Array length > 1?

---

## Key Files

| File | Purpose |
|------|---------|
| `use-music-player.ts` | Main hook with all state & logic |
| `audio-player.ts` | Utility functions (skipToPreviousSong, skipToNextSong) |
| `audio-hooks.ts` | Audio lifecycle helpers |
| `musik-desa/page.tsx` | UI component using the hook |

---

## API Endpoint

```
GET /api/desa/musik/find-many?page=1&limit=50

Response:
{
  "success": true,
  "data": [
    {
      "id": "string",
      "judul": "string",
      "artis": "string",
      "durasi": "MM:SS",
      "genre": "string | null",
      "audioFile": { "link": "url" },
      "coverImage": { "link": "url" },
      "isActive": boolean
    }
  ]
}
```

---

## Quick Debug

Add this to your component:

```typescript
// Debug info
console.log({
  currentSongIndex,
  totalSongs: filteredMusik.length,
  currentSong: currentSong?.judul,
  isPlaying,
  isShuffle,
  isRepeat,
});
```

---

**Last Updated**: February 27, 2026  
**Version**: 2.0 (with skip functionality)
