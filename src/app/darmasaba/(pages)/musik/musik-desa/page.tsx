/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { ActionIcon, Avatar, Badge, Box, Card, Flex, Grid, Group, Paper, ScrollArea, Slider, Stack, Text, TextInput } from '@mantine/core';
import { IconArrowsShuffle, IconPlayerPauseFilled, IconPlayerPlayFilled, IconPlayerSkipBackFilled, IconPlayerSkipForwardFilled, IconRepeat, IconRepeatOff, IconSearch, IconVolume, IconVolumeOff, IconX } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';
import { formatTime } from '../lib/audio-player';

interface MusicFile {
  id: string;
  name: string;
  realName: string;
  path: string;
  mimeType: string;
  link: string;
}

export interface Musik {
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
  const [search, setSearch] = useState('');
  const [musikData, setMusikData] = useState<Musik[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Player state
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

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

  // Filter musik based on search
  const filteredMusik = musikData.filter(musik =>
    musik.judul.toLowerCase().includes(search.toLowerCase()) ||
    musik.artis.toLowerCase().includes(search.toLowerCase()) ||
    (musik.genre && musik.genre.toLowerCase().includes(search.toLowerCase()))
  );

  const currentSong = currentSongIndex >= 0 && currentSongIndex < filteredMusik.length
    ? filteredMusik[currentSongIndex]
    : null;

  // Setup progress interval
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      progressIntervalRef.current = window.setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(Math.floor(audioRef.current.currentTime));
        }
      }, 1000);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPlaying]);

  // Update duration and play when song changes
  useEffect(() => {
    if (currentSong && audioRef.current) {
      const durationParts = currentSong.durasi.split(':');
      const durationInSeconds = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]);
      setDuration(durationInSeconds);
      setCurrentTime(0);
      audioRef.current.currentTime = 0;
      
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.error('Error playing audio:', err);
          setIsPlaying(false);
        });
      }
    }
  }, [currentSongIndex, currentSong]);

  // Play specific song
  const playSong = (index: number) => {
    if (index < 0 || index >= filteredMusik.length) return;
    setCurrentSongIndex(index);
    setIsPlaying(true);
  };

  // Skip to previous song
  const skipBack = () => {
    if (filteredMusik.length === 0) return;
    
    let prevIndex: number;
    if (isShuffle) {
      do {
        prevIndex = Math.floor(Math.random() * filteredMusik.length);
      } while (prevIndex === currentSongIndex && filteredMusik.length > 1);
    } else {
      prevIndex = currentSongIndex === 0 ? filteredMusik.length - 1 : currentSongIndex - 1;
    }
    
    setCurrentSongIndex(prevIndex);
    setIsPlaying(true);
  };

  // Skip to next song
  const skipForward = () => {
    if (filteredMusik.length === 0) return;
    
    let nextIndex: number;
    if (isShuffle) {
      do {
        nextIndex = Math.floor(Math.random() * filteredMusik.length);
      } while (nextIndex === currentSongIndex && filteredMusik.length > 1);
    } else {
      nextIndex = (currentSongIndex + 1) % filteredMusik.length;
    }
    
    setCurrentSongIndex(nextIndex);
    setIsPlaying(true);
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!currentSong) return;
    setIsPlaying(!isPlaying);
  };

  // Handle seek
  const handleSeek = (value: number) => {
    setCurrentTime(value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
    }
  };

  // Handle song ended
  const handleSongEnded = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      // Play next song
      let nextIndex: number;
      if (isShuffle) {
        nextIndex = Math.floor(Math.random() * filteredMusik.length);
      } else {
        nextIndex = (currentSongIndex + 1) % filteredMusik.length;
      }

      if (filteredMusik.length > 1) {
        setCurrentSongIndex(nextIndex);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    }
  };

  // Handle volume
  const handleVolumeChange = (val: number) => {
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val / 100;
    }
    if (val > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioRef.current) {
      audioRef.current.muted = newMuted;
    }
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
      {/* Hidden audio element */}
      {currentSong?.audioFile && (
        <audio
          ref={audioRef}
          src={currentSong.audioFile.link}
          onEnded={handleSongEnded}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setDuration(Math.floor(audioRef.current.duration));
            }
          }}
          muted={isMuted}
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
                          max={duration || 1}
                          onChange={(value) => handleSeek(value)}
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
              src={currentSong?.coverImage?.link || '/mp3-logo.png'}
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
                onClick={() => setIsShuffle(!isShuffle)}
                radius="xl"
                title={isShuffle ? 'Matikan acak' : 'Acak lagu'}
              >
                {isShuffle ? <IconArrowsShuffle size={18} /> : <IconX size={18} />}
              </ActionIcon>
              <ActionIcon variant="light" color="#0B4F78" size={40} radius="xl" onClick={skipBack} title="Lagu sebelumnya">
                <IconPlayerSkipBackFilled size={20} />
              </ActionIcon>
              <ActionIcon
                variant="filled"
                color="#0B4F78"
                size={56}
                radius="xl"
                onClick={togglePlayPause}
                title={isPlaying ? 'Jeda' : 'Putar'}
              >
                {isPlaying ? <IconPlayerPauseFilled size={26} /> : <IconPlayerPlayFilled size={26} />}
              </ActionIcon>
              <ActionIcon variant="light" color="#0B4F78" size={40} radius="xl" onClick={skipForward} title="Lagu berikutnya">
                <IconPlayerSkipForwardFilled size={20} />
              </ActionIcon>
              <ActionIcon
                variant={isRepeat ? 'filled' : 'subtle'}
                color="#0B4F78"
                onClick={() => setIsRepeat(!isRepeat)}
                radius="xl"
                title={isRepeat ? 'Matikan ulang' : 'Ulangi lagu'}
              >
                {isRepeat ? <IconRepeat size={18} /> : <IconRepeatOff size={18} />}
              </ActionIcon>
            </Group>
            <Group gap="xs" style={{ width: '100%', maxWidth: 500 }}>
              <Text size="xs" c="#5A6C7D" w={40} ta="right">{formatTime(currentTime)}</Text>
              <Slider
                value={currentTime}
                max={duration || 1}
                onChange={(value) => handleSeek(value)}
                color="#0B4F78"
                size="xs"
                style={{ flex: 1 }}
              />
              <Text size="xs" c="#5A6C7D" w={40}>{formatTime(duration)}</Text>
            </Group>
          </Stack>

          <Group gap="xs" style={{ flex: 1 }} justify="flex-end">
            <ActionIcon 
              variant="subtle" 
              color="gray" 
              onClick={toggleMute}
              title={isMuted ? 'Hidupkan suara' : 'Bisukan suara'}
            >
              {isMuted || volume === 0 ? <IconVolumeOff size={20} /> : <IconVolume size={20} />}
            </ActionIcon>
            <Slider
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              color="#0B4F78"
              size="xs"
              w={100}
              aria-label="Volume control"
            />
            <Text size="xs" c="#5A6C7D" w={32}>{isMuted ? 0 : volume}%</Text>
          </Group>
        </Flex>
      </Paper>
    </Box>
  );
};

export default MusicPlayer;
