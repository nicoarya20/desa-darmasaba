'use client'
import { ActionIcon, Avatar, Badge, Box, Card, Flex, Grid, Group, Paper, ScrollArea, Slider, Stack, Text, TextInput } from '@mantine/core';
import { IconArrowsShuffle, IconPlayerPauseFilled, IconPlayerPlayFilled, IconPlayerSkipBackFilled, IconPlayerSkipForwardFilled, IconRepeat, IconRepeatOff, IconSearch, IconVolume, IconVolumeOff, IconX } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { togglePlayPause } from '../lib/playPause';
import { getNextIndex, getPrevIndex } from '../lib/nextPrev';
import { handleRepeatOrNext } from '../lib/repeat';
import { toggleShuffle } from '../lib/shuffle';
import { setAudioVolume, toggleMute as toggleMuteUtil } from '../lib/volume';
import { useAudioProgress } from '../lib/useAudioProgress';

interface MusicFile {
  id: string;
  name: string;
  realName: string;
  path: string;
  mimeType: string;
  link: string;
}

interface Musik {
  id: string;
  judul: string;
  artis: string;
  deskripsi: string | null;
  durasi: string;
  genre: string | null;
  tahunRilis: number | null;
  audioFile: MusicFile | null;
  coverImage: MusicFile | null;
  isActive: boolean;
}

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [search, setSearch] = useState('');
  const [musikData, setMusikData] = useState<Musik[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSeekingRef = useRef(false);
  const lastPlayedSongIdRef = useRef<string | null>(null);
  const lastSeekTimeRef = useRef<number>(0); // Track last seek time

  // Smooth progress update dengan requestAnimationFrame
  useAudioProgress(audioRef as React.RefObject<HTMLAudioElement>, isPlaying, setCurrentTime, isSeekingRef);

  // Fetch musik data from API
  useEffect(() => {
    const fetchMusik = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/desa/musik/find-many?page=1&limit=50');
        const data = await res.json();
        if (data.success && data.data) {
          const activeMusik = data.data.filter((m: Musik) => m.isActive);
          setMusikData(activeMusik);
        }
      } catch (error) {
        console.error('Error fetching musik:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMusik();
  }, []);

  // Filter musik based on search - gunakan useMemo untuk mencegah re-calculate setiap render
  const filteredMusik = useMemo(() => {
    return musikData.filter(musik =>
      musik.judul.toLowerCase().includes(search.toLowerCase()) ||
      musik.artis.toLowerCase().includes(search.toLowerCase()) ||
      (musik.genre && musik.genre.toLowerCase().includes(search.toLowerCase()))
    );
  }, [musikData, search]);

  const currentSong = currentSongIndex >= 0 && currentSongIndex < filteredMusik.length
    ? filteredMusik[currentSongIndex]
    : null;

  // // Update progress bar
  // useEffect(() => {
  //   if (isPlaying && audioRef.current) {
  //     progressInterval.current = window.setInterval(() => {
  //       if (audioRef.current) {
  //         setCurrentTime(Math.floor(audioRef.current.currentTime));
  //       }
  //     }, 1000);
  //   } else {
  //     if (progressInterval.current) {
  //       clearInterval(progressInterval.current);
  //     }
  //   }

  //   return () => {
  //     if (progressInterval.current) {
  //       clearInterval(progressInterval.current);
  //     }
  //   };
  // }, [isPlaying]);

  // Update duration when song changes (HANYA saat ganti lagu, bukan saat isPlaying berubah)
  useEffect(() => {
    if (currentSong && audioRef.current) {
      // Cek apakah ini benar-benar lagu baru
      const isNewSong = lastPlayedSongIdRef.current !== currentSong.id;

      if (isNewSong) {
        // Gunakan durasi dari database sebagai acuan utama
        const durationParts = currentSong.durasi.split(':');
        const durationInSeconds = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]);
        setDuration(durationInSeconds);

        // Reset audio currentTime ke 0 untuk lagu baru
        audioRef.current.currentTime = 0;
        setCurrentTime(0);

        // Update ref
        lastPlayedSongIdRef.current = currentSong.id;

        if (isPlaying) {
          audioRef.current.play().catch(err => {
            console.error('Error playing audio:', err);
            setIsPlaying(false);
          });
        }
      }
      // Jika bukan lagu baru, jangan reset currentTime (biar seek tidak kembali ke 0)
    }
  }, [currentSong?.id]); // eslint-disable-line react-hooks/exhaustive-deps -- Intentional: hanya depend on song ID, bukan isPlaying

  // Sync duration dari audio element jika berbeda signifikan (> 1 detik)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    const handleLoadedMetadata = () => {
      const audioDuration = Math.floor(audio.duration);
      const durationParts = currentSong.durasi.split(':');
      const dbDuration = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]);

      // Jika perbedaan > 2 detik, gunakan audio duration (lebih akurat)
      if (Math.abs(audioDuration - dbDuration) > 2) {
        setDuration(audioDuration);
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, [currentSong?.id]); // eslint-disable-line react-hooks/exhaustive-deps -- Intentional: hanya depend on song ID

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playSong = (index: number) => {
    if (index < 0 || index >= filteredMusik.length) return;

    setCurrentSongIndex(index);
    setIsPlaying(true);
  };

  const handleSongEnd = () => {
    const playNext = () => {
      let nextIndex: number;
      if (isShuffle) {
        nextIndex = Math.floor(Math.random() * filteredMusik.length);
      } else {
        nextIndex = (currentSongIndex + 1) % filteredMusik.length;
      }

      if (filteredMusik.length > 1) {
        playSong(nextIndex);
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    handleRepeatOrNext(audioRef, isRepeat, playNext);
  };

  const toggleMute = () => {
    toggleMuteUtil(audioRef, isMuted, setIsMuted);
  };

  const handleVolumeChange = (val: number) => {
    setAudioVolume(audioRef, val, setVolume, setIsMuted);
  };

  const skipBack = () => {
    const prevIndex = getPrevIndex(currentSongIndex, filteredMusik.length, isShuffle);
    if (prevIndex >= 0) {
      playSong(prevIndex);
    }
  };

  const skipForward = () => {
    const nextIndex = getNextIndex(currentSongIndex, filteredMusik.length, isShuffle);
    if (nextIndex >= 0) {
      playSong(nextIndex);
    }
  };

  const toggleShuffleHandler = () => {
    toggleShuffle(isShuffle, setIsShuffle);
  };

  const togglePlayPauseHandler = () => {
    if (!currentSong) return;
    togglePlayPause(audioRef, isPlaying, setIsPlaying);
  };

  if (loading) {
    return (
      <Box px={{ base: 'md', md: 100 }} py="xl">
        <Paper mx="auto" p="xl" radius="lg" shadow="sm" bg="white">
          <Text ta="center">Memuat data musik...</Text>
        </Paper>
      </Box>
    );
  }

  return (
    <Box px={{ base: 'md', md: 100 }} py="xl">
      {/* Hidden audio element - gunakan key yang stabil untuk mencegah remount */}
      {currentSong?.audioFile && (
        <audio
          ref={audioRef}
          src={currentSong?.audioFile?.link}
          muted={isMuted}
          onEnded={handleSongEnd}
        />
      )}

      <Paper
        mx="auto"
        p="xl"
        radius="lg"
        shadow="sm"
        bg="white"
        style={{
          border: '1px solid #eaeaea',
        }}
      >
        <Stack gap="md">
          <BackButton />
          <Group justify="space-between" mb="xl" mt={"md"}>
            <div>
              <Text size="32px" fw={700} c="#0B4F78">Selamat Datang Kembali</Text>
              <Text size="md" c="#5A6C7D">Temukan musik favorit Anda hari ini</Text>
            </div>
            <Group gap="md">
              <TextInput
                placeholder="Cari lagu..."
                leftSection={<IconSearch size={18} />}
                radius="xl"
                w={280}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                styles={{ input: { backgroundColor: '#fff' } }}
              />
            </Group>
          </Group>
          <Stack gap="xl">
            <div>
              <Text size="xl" fw={700} c="#0B4F78" mb="md">Sedang Diputar</Text>
              {currentSong ? (
                <Card radius="md" p="xl" shadow="md">
                  <Group align="center" gap="xl">
                    <Avatar
                      src={currentSong.coverImage?.link || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'}
                      size={180}
                      radius="md"
                    />
                    <Stack gap="md" style={{ flex: 1 }}>
                      <div>
                        <Text size="28px" fw={700} c="#0B4F78">{currentSong.judul}</Text>
                        <Text size="lg" c="#5A6C7D">{currentSong.artis}</Text>
                        {currentSong.genre && (
                          <Badge mt="xs" color="#0B4F78" variant="light">{currentSong.genre}</Badge>
                        )}
                      </div>
                      <Group gap="xs" align="center">
                        <Text size="xs" c="#5A6C7D" w={42}>{formatTime(currentTime)}</Text>
                        <Slider
                          value={currentTime}
                          max={duration}
                          onChange={(v) => {
                            isSeekingRef.current = true;
                            setCurrentTime(v);
                          }}
                          onChangeEnd={(v) => {
                            // Validasi: jangan seek melebihi durasi
                            const seekTime = Math.min(Math.max(0, v), duration);

                            if (audioRef.current) {
                              // Set audio currentTime
                              audioRef.current.currentTime = seekTime;
                              setCurrentTime(seekTime);
                              lastSeekTimeRef.current = seekTime;

                              // Jika audio tidak sedang playing, mainkan
                              if (!audioRef.current.paused && !isPlaying) {
                                audioRef.current.play().catch(console.error);
                              }
                            }

                            // Set seeking false SETELAH semua operasi selesai
                            setTimeout(() => {
                              isSeekingRef.current = false;
                            }, 0);
                          }}
                          color="#0B4F78"
                          size="sm"
                          style={{ flex: 1 }}
                          styles={{ thumb: { borderWidth: 2 } }}
                        />
                        <Text size="xs" c="#5A6C7D" w={42}>{formatTime(duration)}</Text>
                      </Group>
                    </Stack>
                  </Group>
                </Card>
              ) : (
                <Card radius="md" p="xl" shadow="md">
                  <Text ta="center" c="dimmed">Pilih lagu untuk diputar</Text>
                </Card>
              )}
            </div>

            <div>
              <Text size="xl" fw={700} c="#0B4F78" mb="md">Daftar Putar</Text>
              {filteredMusik.length === 0 ? (
                <Text ta="center" c="dimmed">Tidak ada musik yang ditemukan</Text>
              ) : (
                <ScrollArea.Autosize mah={400}>
                  <Grid gutter="md">
                    {filteredMusik.map((song, index) => (
                      <Grid.Col span={{ base: 12, sm: 6, lg: 4 }} key={song.id}>
                        <Card
                          radius="md"
                          p="md"
                          shadow="sm"
                          style={{
                            cursor: 'pointer',
                            border: currentSong?.id === song.id ? '2px solid #0B4F78' : '2px solid transparent',
                            transition: 'all 0.2s'
                          }}
                          onClick={() => playSong(index)}
                        >
                          <Group gap="md" align="center">
                            <Avatar
                              src={song.coverImage?.link || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'}
                              size={64}
                              radius="md"
                            />
                            <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                              <Text size="sm" fw={600} c="#0B4F78" truncate>{song.judul}</Text>
                              <Text size="xs" c="#5A6C7D">{song.artis}</Text>
                              <Text size="xs" c="#8A9BA8">{song.durasi}</Text>
                            </Stack>
                            {currentSong?.id === song.id && isPlaying && (
                              <Badge color="#0B4F78" variant="filled">Memutar</Badge>
                            )}
                          </Group>
                        </Card>
                      </Grid.Col>
                    ))}
                  </Grid>
                </ScrollArea.Autosize>
              )}
            </div>
          </Stack>

        </Stack>

      </Paper>

      <Paper
        mt="xl"
        mx="auto"
        p="xl"
        radius="lg"
        shadow="sm"
        bg="white"
        style={{
          border: '1px solid #eaeaea',
        }}
      >
        <Flex align="center" justify="space-between" gap="xl" h="100%">
          <Group gap="md" style={{ flex: 1 }}>
            <Avatar
              src={currentSong?.coverImage?.link || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'}
              size={56}
              radius="md"
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              {currentSong ? (
                <>
                  <Text size="sm" fw={600} c="#0B4F78" truncate>{currentSong.judul}</Text>
                  <Text size="xs" c="#5A6C7D">{currentSong.artis}</Text>
                </>
              ) : (
                <Text size="sm" c="dimmed">Tidak ada lagu</Text>
              )}
            </div>
          </Group>

          <Stack gap="xs" style={{ flex: 1 }} align="center">
            <Group gap="md">
              <ActionIcon
                variant={isShuffle ? 'filled' : 'subtle'}
                color="#0B4F78"
                onClick={toggleShuffleHandler}
                radius="xl"
              >
                {isShuffle ? <IconArrowsShuffle size={18} /> : <IconX size={18} />}
              </ActionIcon>
              <ActionIcon variant="light" color="#0B4F78" size={40} radius="xl" onClick={skipBack}>
                <IconPlayerSkipBackFilled size={20} />
              </ActionIcon>
              <ActionIcon
                variant="filled"
                color="#0B4F78"
                size={56}
                radius="xl"
                onClick={togglePlayPauseHandler}
              >
                {isPlaying ? <IconPlayerPauseFilled size={26} /> : <IconPlayerPlayFilled size={26} />}
              </ActionIcon>
              <ActionIcon variant="light" color="#0B4F78" size={40} radius="xl" onClick={skipForward}>
                <IconPlayerSkipForwardFilled size={20} />
              </ActionIcon>
              <ActionIcon
                variant={isRepeat ? 'filled' : 'subtle'}
                color="#0B4F78"
                onClick={() => setIsRepeat(!isRepeat)}
                radius="xl"
              >
                {isRepeat ? <IconRepeat size={18} /> : <IconRepeatOff size={18} />}
              </ActionIcon>
            </Group>
            <Group gap="xs" style={{ width: '100%', maxWidth: 500 }}>
              <Text size="xs" c="#5A6C7D" w={40} ta="right">{formatTime(currentTime)}</Text>
              <Slider
                value={currentTime}
                max={duration}
                onChange={(v) => {
                  isSeekingRef.current = true;
                  setCurrentTime(v); // preview - update UI saja
                }}
                onChangeEnd={(v) => {
                  // Validasi: jangan seek melebihi durasi
                  const seekTime = Math.min(Math.max(0, v), duration);

                  if (audioRef.current) {
                    // Set audio currentTime
                    audioRef.current.currentTime = seekTime;
                    setCurrentTime(seekTime);
                    lastSeekTimeRef.current = seekTime;

                    // Jika audio tidak sedang playing, mainkan
                    if (!audioRef.current.paused && !isPlaying) {
                      audioRef.current.play().catch(console.error);
                    }
                  }

                  // Set seeking false SETELAH semua operasi selesai
                  setTimeout(() => {
                    isSeekingRef.current = false;
                  }, 0);
                }}
                color="#0B4F78"
                size="xs"
                style={{ flex: 1 }}
              />
              <Text size="xs" c="#5A6C7D" w={40}>{formatTime(duration)}</Text>
            </Group>
          </Stack>

          <Group gap="xs" style={{ flex: 1 }} justify="flex-end">
            <ActionIcon variant="subtle" color="gray" onClick={toggleMute}>
              {isMuted || volume === 0 ? <IconVolumeOff size={20} /> : <IconVolume size={20} />}
            </ActionIcon>
            <Slider
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              color="#0B4F78"
              size="xs"
              w={100}
            />
            <Text size="xs" c="#5A6C7D" w={32}>{isMuted ? 0 : volume}%</Text>
          </Group>
        </Flex>
      </Paper>
    </Box>
  );
};

export default MusicPlayer;

// 'use client'
// import {
//   Box, Paper, Group, Stack, Text, Slider, ActionIcon
// } from '@mantine/core';
// import {
//   IconPlayerPlayFilled,
//   IconPlayerPauseFilled
// } from '@tabler/icons-react';
// import { useEffect, useState } from 'react';
// import { useAudioEngine } from '../lib/useAudioProgress';

// interface Musik {
//   id: string;
//   judul: string;
//   artis: string;
//   audioFile: { link: string };
// }

// export default function MusicPlayer() {
//   const {
//     audioRef,
//     isPlaying,
//     currentTime,
//     duration,
//     load,
//     toggle,
//     seek,
//   } = useAudioEngine();

//   const [songs, setSongs] = useState<Musik[]>([]);
//   const [index, setIndex] = useState(0);

//   useEffect(() => {
//     fetch('/api/desa/musik/find-many?page=1&limit=50')
//       .then(r => r.json())
//       .then(r => setSongs(r.data ?? []));
//   }, []);

//   useEffect(() => {
//     if (!songs[index]) return;
//     load(songs[index].audioFile.link);
//   }, [songs, index, load]);

//   const format = (n: number) => {
//     const m = Math.floor(n / 60);
//     const s = Math.floor(n % 60);
//     return `${m}:${s.toString().padStart(2, '0')}`;
//   };

//   return (
//     <Box p="xl">
//       <audio ref={audioRef} />

//       <Paper p="lg">
//         <Stack>
//           <Text fw={700}>{songs[index]?.judul}</Text>
//           <Text size="sm">{songs[index]?.artis}</Text>

//           <Group>
//             <Text size="xs">{format(currentTime)}</Text>

//             <Slider
//               value={currentTime}
//               max={duration}
//               onChange={seek}
//               style={{ flex: 1 }}
//             />

//             <Text size="xs">{format(duration)}</Text>
//           </Group>

//           <ActionIcon size={56} radius="xl" onClick={toggle}>
//             {isPlaying
//               ? <IconPlayerPauseFilled />
//               : <IconPlayerPlayFilled />}
//           </ActionIcon>
//         </Stack>
//       </Paper>
//     </Box>
//   );
// }