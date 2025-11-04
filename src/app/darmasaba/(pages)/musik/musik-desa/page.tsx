/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { ActionIcon, Avatar, Badge, Box, Card, Flex, Grid, Group, Paper, Slider, Stack, Text, TextInput } from '@mantine/core';
import { IconArrowsShuffle, IconPlayerPauseFilled, IconPlayerPlayFilled, IconPlayerSkipBackFilled, IconPlayerSkipForwardFilled, IconRepeat, IconRepeatOff, IconSearch, IconVolume, IconVolumeOff, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import BackButton from '../../desa/layanan/_com/BackButto';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(245);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  const songs = [
    { id: 1, title: 'Midnight Dreams', artist: 'The Wanderers', duration: '4:05', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop' },
    { id: 2, title: 'Summer Breeze', artist: 'Coastal Vibes', duration: '3:42', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop' },
    { id: 3, title: 'City Lights', artist: 'Urban Echo', duration: '4:18', cover: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop' },
    { id: 4, title: 'Ocean Waves', artist: 'Serenity Sound', duration: '5:20', cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop' },
    { id: 5, title: 'Neon Nights', artist: 'Electric Dreams', duration: '3:55', cover: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&h=400&fit=crop' },
    { id: 6, title: 'Mountain High', artist: 'Peak Performers', duration: '4:32', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop' }
  ];

  const [currentSong, setCurrentSong] = useState(songs[0]);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playSong = (song: any) => {
    setCurrentSong(song);
    setCurrentTime(0);
    setIsPlaying(true);
    const durationInSeconds = parseInt(song.duration.split(':')[0]) * 60 + parseInt(song.duration.split(':')[1]);
    setDuration(durationInSeconds);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

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
                styles={{ input: { backgroundColor: '#fff' } }}
              />
            </Group>
          </Group>
          <Stack gap="xl">
            <div>
              <Text size="xl" fw={700} c="#0B4F78" mb="md">Sedang Diputar</Text>
              <Card radius="md" p="xl" shadow="md">
                <Group align="center" gap="xl">
                  <Avatar src={currentSong.cover} size={180} radius="md" />
                  <Stack gap="md" style={{ flex: 1 }}>
                    <div>
                      <Text size="28px" fw={700} c="#0B4F78">{currentSong.title}</Text>
                      <Text size="lg" c="#5A6C7D">{currentSong.artist}</Text>
                    </div>
                    <Group gap="xs" align="center">
                      <Text size="xs" c="#5A6C7D" w={42}>{formatTime(currentTime)}</Text>
                      <Slider
                        value={currentTime}
                        max={duration}
                        onChange={setCurrentTime}
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
            </div>

            <div>
              <Text size="xl" fw={700} c="#0B4F78" mb="md">Daftar Putar</Text>
              <Grid gutter="md">
                {songs.map(song => (
                  <Grid.Col span={{ base: 12, sm: 6, lg: 4 }} key={song.id}>
                    <Card
                      radius="md"
                      p="md"
                      shadow="sm"
                      style={{
                        cursor: 'pointer',
                        border: currentSong.id === song.id ? '2px solid #0B4F78' : '2px solid transparent',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => playSong(song)}
                    >
                      <Group gap="md" align="center">
                        <Avatar src={song.cover} size={64} radius="md" />
                        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                          <Text size="sm" fw={600} c="#0B4F78" truncate>{song.title}</Text>
                          <Text size="xs" c="#5A6C7D">{song.artist}</Text>
                          <Text size="xs" c="#8A9BA8">{song.duration}</Text>
                        </Stack>
                        {currentSong.id === song.id && isPlaying && (
                          <Badge color="#0B4F78" variant="filled">Memutar</Badge>
                        )}
                      </Group>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
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
            <Avatar src={currentSong.cover} size={56} radius="md" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={600} c="#0B4F78" truncate>{currentSong.title}</Text>
              <Text size="xs" c="#5A6C7D">{currentSong.artist}</Text>
            </div>
          </Group>

          <Stack gap="xs" style={{ flex: 1 }} align="center">
            <Group gap="md">
              <ActionIcon
                variant={isShuffle ? 'filled' : 'subtle'}
                color="#0B4F78"
                onClick={() => setIsShuffle(!isShuffle)}
                radius="xl"
              >
                {isShuffle ? <IconArrowsShuffle size={18} /> : <IconX size={18} />}
              </ActionIcon>
              <ActionIcon variant="light" color="#0B4F78" size={40} radius="xl">
                <IconPlayerSkipBackFilled size={20} />
              </ActionIcon>
              <ActionIcon
                variant="filled"
                color="#0B4F78"
                size={56}
                radius="xl"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <IconPlayerPauseFilled size={26} /> : <IconPlayerPlayFilled size={26} />}
              </ActionIcon>
              <ActionIcon variant="light" color="#0B4F78" size={40} radius="xl">
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
                onChange={setCurrentTime}
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
              onChange={(val) => {
                setVolume(val);
                if (val > 0) setIsMuted(false);
              }}
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