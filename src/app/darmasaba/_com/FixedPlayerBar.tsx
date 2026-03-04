import { useMusic } from '@/app/context/MusicContext';
import {
  ActionIcon,
  Avatar,
  Box,
  Flex,
  Group,
  Paper,
  Slider,
  Text,
  Transition
} from '@mantine/core';
import {
  IconArrowsShuffle,
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
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
  } = useMusic();

  const [showVolume, setShowVolume] = useState(false);
  const [isPlayerVisible, setIsPlayerVisible] = useState(true);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle seek
  const handleSeek = (value: number) => {
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

  // Handle close player
  const handleClosePlayer = () => {
    setIsPlayerVisible(false);
  };

  if (!currentSong || !isPlayerVisible) {
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
          zIndex: 1000,
          borderTop: '1px solid rgba(0,0,0,0.1)',
        }}
      >
        <Flex align="center" gap="md" justify="space-between">
          {/* Song Info */}
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

          {/* Controls */}
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
              title={isPlaying ? 'Pause' : 'Play'}
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
              onChange={handleSeek}
              size="sm"
              color="blue"
              label={(value) => formatTime(value)}
            />
          </Box>

          {/* Right Controls */}
          <Group gap="xs">
            <Box
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
              pos="relative"
            >
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

              <Transition
                mounted={showVolume}
                transition="scale-y"
                duration={200}
                timingFunction="ease"
              >
                {(style) => (
                  <Paper
                    style={{
                      ...style,
                      position: 'absolute',
                      bottom: '100%',
                      right: 0,
                      mb: 'xs',
                      p: 'sm',
                      zIndex: 1001,
                    }}
                    shadow="md"
                    withBorder
                  >
                    <Slider
                      value={isMuted ? 0 : volume}
                      max={100}
                      onChange={handleVolumeChange}
                      h={100}
                      color="blue"
                      size="sm"
                    />
                  </Paper>
                )}
              </Transition>
            </Box>

            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              onClick={handleClosePlayer}
              title="Close player"
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
            onChange={handleSeek}
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
