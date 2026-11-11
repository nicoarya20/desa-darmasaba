import { useMusic } from '@/app/context/MusicContext';
import { formatTime } from '@/app/context/music/format';
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Flex,
  Group,
  Paper,
  Slider,
  Text,
} from '@mantine/core';
import {
  IconArrowsShuffle,
  IconMusic,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconPlayerSkipBackFilled,
  IconPlayerSkipForwardFilled,
  IconRepeat,
  IconRepeatOff,
  IconVolume,
  IconVolumeOff,
  IconX,
} from '@tabler/icons-react';
import { useState } from 'react';

export default function FixedPlayerBar() {
  const {
    isPlaying,
    currentSong,
    currentTime,
    duration,
    volume,
    isMuted,
    isRepeat,
    isShuffle,
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

  const [isMinimized, setIsMinimized] = useState(false);

  // Handle seek drag (visual only) / commit
  const handleSeekPreview = (value: number) => {
    seekPreview(value);
  };

  const handleSeekEnd = (value: number) => {
    seek(value);
  };

  // Handle volume change
  const handleVolumeChange = (value: number) => {
    setVolume(value);
  };

  // Handle shuffle toggle
  const handleToggleShuffle = () => {
    toggleShuffle();
  };

  // Handle minimize player (show floating icon)
  const handleMinimizePlayer = () => {
    setIsMinimized(true);
  };

  // Handle restore player from floating icon
  const handleRestorePlayer = () => {
    setIsMinimized(false);
  };

  // If minimized, show floating icon instead of player bar
  if (isMinimized) {
    return (
      <>
        {/* Floating Music Icon - Shows when player is minimized */}
        <Button
          color="#0B4F78"
          variant="filled"
          size="md"
          mt="md"
          style={{
            position: 'fixed',
            top: '50%', // Menempatkan titik atas ikon di tengah layar
            left: '0px',
            transform: 'translateY(-50%)', // Menggeser ikon ke atas sebesar setengah tingginya sendiri agar benar-benar di tengah
            borderBottomRightRadius: '20px',
            borderTopRightRadius: '20px',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            zIndex: 1
          }}
          onClick={handleRestorePlayer}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(-50%)';
          }}
        >
          <IconMusic size={28} color="white" />
        </Button>

        {/* Spacer to prevent content from being hidden behind player */}
        <Box h={20} />
      </>
    );
  }

  if (!currentSong) {
    return null;
  }

  return (
    <>
      {/* Mini Player Bar - Always visible when song is playing */}
      <Paper
        pos="fixed"
        bottom={0}
        left={0}
        right={0}
        p="sm"
        shadow="lg"
        style={{
          zIndex: 1,
          borderTop: '1px solid rgba(0,0,0,0.1)',
        }}
      >
        <Flex align="center" gap="md" justify="space-between">
          {/* Song Info - Left */}
          <Group gap="sm" flex={1} style={{ minWidth: 0 }}>
            <Avatar
              src={currentSong.coverImage?.link || ''}
              alt={currentSong.judul}
              size={40}
              radius="sm"
              imageProps={{ loading: 'lazy' }}
            />
            <Box style={{ minWidth: 0 }}>
              <Text fz="sm" fw={600} truncate>
                {currentSong.judul}
              </Text>
              <Text fz="xs" c="dimmed" truncate>
                {currentSong.artis}
              </Text>
            </Box>
          </Group>

          {/* Controls + Progress - Center */}
          <Group gap="xs" flex={2} justify="center">
            {/* Control Buttons */}
            <Group gap="xs">
              <ActionIcon
                variant={isShuffle ? 'filled' : 'subtle'}
                color={isShuffle ? 'blue' : 'gray'}
                size="lg"
                onClick={handleToggleShuffle}
                title="Shuffle"
              >
                <IconArrowsShuffle size={18} />
              </ActionIcon>

              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                onClick={playPrev}
                title="Previous"
              >
                <IconPlayerSkipBackFilled size={20} />
              </ActionIcon>

              <ActionIcon
                variant="filled"
                color={isPlaying ? 'blue' : 'gray'}
                size="xl"
                radius="xl"
                onClick={togglePlayPause}
                disabled={!currentSong.audioFile?.link}
                title={
                  !currentSong.audioFile?.link
                    ? 'Audio belum tersedia'
                    : isPlaying
                      ? 'Pause'
                      : 'Play'
                }
              >
                {isPlaying ? (
                  <IconPlayerPauseFilled size={24} />
                ) : (
                  <IconPlayerPlayFilled size={24} />
                )}
              </ActionIcon>

              <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                onClick={playNext}
                title="Next"
              >
                <IconPlayerSkipForwardFilled size={20} />
              </ActionIcon>

              <ActionIcon
                variant="subtle"
                color={isRepeat ? 'blue' : 'gray'}
                size="lg"
                onClick={toggleRepeat}
                title={isRepeat ? 'Repeat On' : 'Repeat Off'}
              >
                {isRepeat ? <IconRepeat size={18} /> : <IconRepeatOff size={18} />}
              </ActionIcon>
            </Group>

            {/* Progress Bar - Desktop */}
            <Box w={200} display={{ base: 'none', md: 'block' }}>
              <Slider
                value={currentTime}
                max={duration || 100}
                onChange={handleSeekPreview}
                onChangeEnd={handleSeekEnd}
                size="sm"
                color="blue"
                label={(value) => formatTime(value)}
              />
            </Box>
          </Group>

          {/* Right Controls - Volume + Close */}
          <Group gap="xs" flex={1} justify="flex-end">
            <Group gap={6} wrap="nowrap">
              <ActionIcon
                variant="subtle"
                color={isMuted ? 'red' : 'gray'}
                size="lg"
                onClick={toggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <IconVolumeOff size={18} />
                ) : (
                  <IconVolume size={18} />
                )}
              </ActionIcon>

              {/* Slider volume inline permanen, desktop saja — mobile sudah punya
                  hardware volume dan ruang mini bar terbatas di layar sempit.
                  Menggantikan popup hover sebelumnya yang rapuh: ada celah antar
                  ikon & popup yang bikin popup nutup sebelum sempat digeser, dan
                  hover sama sekali tidak jalan di touch device. */}
              <Box w={90} display={{ base: 'none', md: 'block' }}>
                <Slider
                  value={isMuted ? 0 : volume}
                  max={100}
                  onChange={handleVolumeChange}
                  color="blue"
                  size="sm"
                />
              </Box>
            </Group>

            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              onClick={handleMinimizePlayer}
              title="Minimize player"
            >
              <IconX size={18} />
            </ActionIcon>
          </Group>
        </Flex>

        {/* Progress Bar - Mobile */}
        <Box mt="xs" display={{ base: 'block', md: 'none' }}>
          <Slider
            value={currentTime}
            max={duration || 100}
            onChange={handleSeekPreview}
            onChangeEnd={handleSeekEnd}
            size="sm"
            color="blue"
            label={(value) => formatTime(value)}
          />
        </Box>
      </Paper>

      {/* Spacer to prevent content from being hidden behind player */}
      <Box h={80} />
    </>
  );
}
