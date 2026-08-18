'use client'
import { useMusic } from '@/app/context/MusicContext';
import { formatTime } from '@/app/context/music/format';
import { ActionIcon, Avatar, Badge, Box, Card, Flex, Grid, Group, Paper, ScrollArea, Slider, Stack, Text, TextInput } from '@mantine/core';
import { IconArrowsShuffle, IconPlayerPauseFilled, IconPlayerPlayFilled, IconPlayerSkipBackFilled, IconPlayerSkipForwardFilled, IconRepeat, IconRepeatOff, IconSearch, IconVolume, IconVolumeOff, IconX } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';

const MusicPlayer = () => {
  const {
    isPlaying,
    currentSong,
    currentTime,
    duration,
    volume,
    isMuted,
    isRepeat,
    isShuffle,
    isLoading,
    musikData,
    playSong,
    togglePlayPause,
    playNext,
    playPrev,
    seek,
    seekPreview,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
  } = useMusic();

  const [search, setSearch] = useState('');

  // Fetch musik data from global state
  const { loadMusikData } = useMusic();

  useEffect(() => {
    loadMusikData();
  }, [loadMusikData]);

  // Filter musik based on search - gunakan useMemo untuk mencegah re-calculate setiap render
  const filteredMusik = useMemo(() => {
    return musikData.filter(musik =>
      musik.judul.toLowerCase().includes(search.toLowerCase()) ||
      musik.artis.toLowerCase().includes(search.toLowerCase()) ||
      (musik.genre && musik.genre.toLowerCase().includes(search.toLowerCase()))
    );
  }, [musikData, search]);

  const handleVolumeChange = (value: number) => {
    setVolume(value);
  };

  const toggleMuteHandler = () => {
    toggleMute();
  };

  const togglePlayPauseHandler = () => {
    togglePlayPause();
  };

  const skipBack = () => {
    playPrev();
  };

  const skipForward = () => {
    playNext();
  };

  const toggleShuffleHandler = () => {
    toggleShuffle();
  };

  const toggleRepeatHandler = () => {
    toggleRepeat();
  };

  if (isLoading) {
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
                      src={currentSong.coverImage?.link || '/mp3-logo.png'}
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
                          max={duration || 100}
                          onChange={(v) => seekPreview(v)}
                          onChangeEnd={(v) => seek(v)}
                          color="#0B4F78"
                          size="sm"
                          style={{ flex: 1 }}
                          styles={{ thumb: { borderWidth: 2 } }}
                        />
                        <Text size="xs" c="#5A6C7D" w={42}>{formatTime(duration || 0)}</Text>
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
                    {filteredMusik.map((song) => (
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
                          onClick={() => playSong(song)}
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
                            {!song.audioFile?.link ? (
                              <Badge color="gray" variant="light">Audio belum tersedia</Badge>
                            ) : currentSong?.id === song.id && isPlaying ? (
                              <Badge color="#0B4F78" variant="filled">Memutar</Badge>
                            ) : null}
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
                disabled={!currentSong?.audioFile?.link}
                title={!currentSong?.audioFile?.link ? 'Audio belum tersedia' : undefined}
              >
                {isPlaying ? <IconPlayerPauseFilled size={26} /> : <IconPlayerPlayFilled size={26} />}
              </ActionIcon>
              <ActionIcon variant="light" color="#0B4F78" size={40} radius="xl" onClick={skipForward}>
                <IconPlayerSkipForwardFilled size={20} />
              </ActionIcon>
              <ActionIcon
                variant={isRepeat ? 'filled' : 'subtle'}
                color="#0B4F78"
                onClick={toggleRepeatHandler}
                radius="xl"
              >
                {isRepeat ? <IconRepeat size={18} /> : <IconRepeatOff size={18} />}
              </ActionIcon>
            </Group>
            <Group gap="xs" style={{ width: '100%', maxWidth: 500 }}>
              <Text size="xs" c="#5A6C7D" w={40} ta="right">{formatTime(currentTime)}</Text>
              <Slider
                value={currentTime}
                max={duration || 100}
                onChange={(v) => seekPreview(v)}
                onChangeEnd={(v) => seek(v)}
                color="#0B4F78"
                size="xs"
                style={{ flex: 1 }}
              />
              <Text size="xs" c="#5A6C7D" w={40}>{formatTime(duration || 0)}</Text>
            </Group>
          </Stack>

          <Group gap="xs" style={{ flex: 1 }} justify="flex-end">
            <ActionIcon variant="subtle" color="gray" onClick={toggleMuteHandler}>
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