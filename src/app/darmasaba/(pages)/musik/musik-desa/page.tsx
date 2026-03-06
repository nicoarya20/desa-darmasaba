'use client'
import { useMusic } from '@/app/context/MusicContext';
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

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
    <Box px={{ base: 'xs', sm: 'md', md: 100 }} py="xl">
      <Paper
        mx="auto"
        p={{ base: 'md', sm: 'xl' }}
        radius="lg"
        shadow="sm"
        bg="white"
        style={{
          border: '1px solid #eaeaea',
        }}
      >
        <Stack gap="md">
          <BackButton />
          <Flex
            justify="space-between"
            align={{ base: 'flex-start', sm: 'center' }}
            direction={{ base: 'column', sm: 'row' }}
            gap="md"
            mb="xl"
            mt="md"
          >
            <div>
              <Text fz={{ base: '24px', sm: '32px' }} fw={700} c="#0B4F78" lh={1.2}>Selamat Datang Kembali</Text>
              <Text size="sm" c="#5A6C7D">Temukan musik favorit Anda hari ini</Text>
            </div>
            <TextInput
              placeholder="Cari lagu..."
              leftSection={<IconSearch size={18} />}
              radius="xl"
              w={{ base: '100%', sm: 280 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              styles={{ input: { backgroundColor: '#fff' } }}
            />
          </Flex>

          <Stack gap="xl">
            <div>
              <Text size="xl" fw={700} c="#0B4F78" mb="md">Sedang Diputar</Text>
              {currentSong ? (
                <Card radius="md" p={{ base: 'md', sm: 'xl' }} shadow="md" withBorder>
                  <Flex
                    direction={{ base: 'column', sm: 'row' }}
                    align="center"
                    gap={{ base: 'md', sm: 'xl' }}
                  >
                    <Avatar
                      src={currentSong.coverImage?.link || '/mp3-logo.png'}
                      size={120}
                      radius="md"
                    />
                    <Stack gap="md" style={{ flex: 1, width: '100%' }}>
                      <Box ta={{ base: 'center', sm: 'left' }}>
                        <Text fz={{ base: '20px', sm: '28px' }} fw={700} c="#0B4F78" lineClamp={1}>{currentSong.judul}</Text>
                        <Text size="lg" c="#5A6C7D">{currentSong.artis}</Text>
                        {currentSong.genre && (
                          <Badge mt="xs" color="#0B4F78" variant="light">{currentSong.genre}</Badge>
                        )}
                      </Box>
                      <Group gap="xs" align="center">
                        <Text size="xs" c="#5A6C7D" w={42}>{formatTime(currentTime)}</Text>
                        <Slider
                          value={currentTime}
                          max={duration || 100}
                          onChange={(v) => seek(v)}
                          color="#0B4F78"
                          size="sm"
                          style={{ flex: 1 }}
                          styles={{ thumb: { borderWidth: 2 } }}
                        />
                        <Text size="xs" c="#5A6C7D" w={42}>{formatTime(duration || 0)}</Text>
                      </Group>
                    </Stack>
                  </Flex>
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
                          p="sm"
                          shadow="sm"
                          withBorder
                          style={{
                            cursor: 'pointer',
                            borderColor: currentSong?.id === song.id ? '#0B4F78' : 'transparent',
                            backgroundColor: currentSong?.id === song.id ? '#F0F7FA' : 'white',
                            transition: 'all 0.2s'
                          }}
                          onClick={() => playSong(song)}
                        >
                          <Group gap="sm" align="center" wrap="nowrap">
                            <Avatar
                              src={song.coverImage?.link || '/mp3-logo.png'}
                              size={50}
                              radius="md"
                            />
                            <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
                              <Text size="sm" fw={600} c="#0B4F78" truncate>{song.judul}</Text>
                              <Text size="xs" c="#5A6C7D" truncate>{song.artis}</Text>
                            </Stack>
                            {currentSong?.id === song.id && isPlaying && (
                              <Badge color="#0B4F78" variant="filled" size="xs">Playing</Badge>
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

      {/* Control Player Section */}
      <Paper
        mt="xl"
        mx="auto"
        p={{ base: 'md', sm: 'xl' }}
        radius="lg"
        shadow="sm"
        bg="white"
        style={{
          border: '1px solid #eaeaea',
          position: 'sticky',
          bottom: 20,
          zIndex: 10
        }}
      >
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align="center"
          justify="space-between"
          gap={{ base: 'md', md: 'xl' }}
        >
          {/* Song Info */}
          <Group gap="md" style={{ flex: 1, width: '100%' }} wrap="nowrap">
            <Avatar
              src={currentSong?.coverImage?.link || '/mp3-logo.png'}
              size={48}
              radius="md"
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              {currentSong ? (
                <>
                  <Text size="sm" fw={600} c="#0B4F78" truncate>{currentSong.judul}</Text>
                  <Text size="xs" c="#5A6C7D" truncate>{currentSong.artis}</Text>
                </>
              ) : (
                <Text size="sm" c="dimmed">Tidak ada lagu</Text>
              )}
            </div>
          </Group>

          {/* Controls + Progress */}
          <Stack gap="xs" style={{ flex: 2, width: '100%' }} align="center">
            <Group gap="sm">
              <ActionIcon
                variant={isShuffle ? 'filled' : 'subtle'}
                color="#0B4F78"
                onClick={toggleShuffleHandler}
                radius="xl"
                size={48}
              >
                {isShuffle ? <IconArrowsShuffle size={18} /> : <IconX size={18} />}
              </ActionIcon>
              <ActionIcon variant="light" color="#0B4F78" size={48} radius="xl" onClick={skipBack}>
                <IconPlayerSkipBackFilled size={20} />
              </ActionIcon>
              <ActionIcon
                variant="filled"
                color="#0B4F78"
                size={48}
                radius="xl"
                onClick={togglePlayPauseHandler}
              >
                {isPlaying ? <IconPlayerPauseFilled size={26} /> : <IconPlayerPlayFilled size={26} />}
              </ActionIcon>
              <ActionIcon variant="light" color="#0B4F78" size={48} radius="xl" onClick={skipForward}>
                <IconPlayerSkipForwardFilled size={20} />
              </ActionIcon>
              <ActionIcon
                variant={isRepeat ? 'filled' : 'subtle'}
                color="#0B4F78"
                onClick={toggleRepeatHandler}
                radius="xl"
                size="md"
              >
                {isRepeat ? <IconRepeat size={18} /> : <IconRepeatOff size={18} />}
              </ActionIcon>
            </Group>
            <Group gap="xs" style={{ width: '100%', maxWidth: 500 }}>
              <Text size="xs" c="#5A6C7D" w={40} ta="right">{formatTime(currentTime)}</Text>
              <Slider
                value={currentTime}
                max={duration || 100}
                onChange={(v) => seek(v)}
                color="#0B4F78"
                size="xs"
                style={{ flex: 1 }}
              />
              <Text size="xs" c="#5A6C7D" w={40}>{formatTime(duration || 0)}</Text>
            </Group>
          </Stack>

          {/* Volume Control - Hidden on mobile, shown on md and up */}
          <Group gap="xs" style={{ flex: 1 }} justify="flex-end" visibleFrom="md">
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