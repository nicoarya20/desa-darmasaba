import { useMusic } from '@/app/context/MusicContext';
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Flex,
  Group,
  Paper,
  Slider,
  Stack,
  Text,
  Transition
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
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
  } = useMusic();

  const [showVolume, setShowVolume] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

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

  // Handle volume change - called continuously while dragging
  const handleVolumeChange = (value: number) => {
    console.log('[FixedPlayerBar] Volume changing:', value);
    setVolume(value);
  };

  // Handle volume change commit - called when user releases slider
  const handleVolumeChangeEnd = (value: number) => {
    console.log('[FixedPlayerBar] Volume changed end:', value);
    // Volume already set by onChange, no need to set again
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
            top: '50%',
            left: '0px',
            transform: 'translateY(-50%)',
            borderBottomRightRadius: '20px',
            borderTopRightRadius: '20px',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            zIndex: 40// Higher z-index
          }}
          onClick={handleRestorePlayer}
        >
          <IconMusic size={24} color="white" />
        </Button>
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
        p={{ base: 'xs', sm: 'sm' }}
        shadow="xl"
        style={{
          zIndex: 40,
          borderTop: '1px solid rgba(0,0,0,0.1)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Flex align="center" gap={{ base: 'xs', sm: 'md' }} justify="space-between">
          {/* Song Info - Left */}
          <Group gap="xs" flex={{ base: 2, sm: 1 }} style={{ minWidth: 0 }} wrap="nowrap">
            <Avatar
              src={currentSong.coverImage?.link || ''}
              alt={currentSong.judul}
              size={"36"}
              radius="sm"
            />
            <Box style={{ minWidth: 0, flex: 1 }}>
              <Text fz={{ base: 'xs', sm: 'sm' }} fw={600} truncate>
                {currentSong.judul}
              </Text>
              <Text fz="10px" c="dimmed" truncate>
                {currentSong.artis}
              </Text>
            </Box>
          </Group>

          {/* Controls - Center */}
          <Group gap={"xs"} flex={{ base: 1, sm: 2 }} justify="center" wrap="nowrap">
            {/* Shuffle - Desktop Only */}
            <ActionIcon
              variant={isShuffle ? 'filled' : 'subtle'}
              color={isShuffle ? '#0B4F78' : 'gray'}
              size={"md"}
              onClick={handleToggleShuffle}
              visibleFrom="sm"
            >
              <IconArrowsShuffle size={18} />
            </ActionIcon>

            <ActionIcon
              variant="subtle"
              color="gray"
              size={"md"}
              onClick={playPrev}
            >
              <IconPlayerSkipBackFilled size={20} />
            </ActionIcon>

            <ActionIcon
              variant="filled"
              color="#0B4F78"
              size={"lg"}
              radius="xl"
              onClick={togglePlayPause}
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
              size={"md"}
              onClick={playNext}
            >
              <IconPlayerSkipForwardFilled size={20} />
            </ActionIcon>

            {/* Repeat - Desktop Only */}
            <ActionIcon
              variant={isRepeat ? 'filled' : 'subtle'}
              color={isRepeat ? '#0B4F78' : 'gray'}
              size={"md"}
              onClick={toggleRepeat}
              visibleFrom="sm"
            >
              {isRepeat ? <IconRepeat size={18} /> : <IconRepeatOff size={18} />}
            </ActionIcon>

            {/* Progress Bar - Desktop Only */}
            <Box w={150} ml="md" visibleFrom="md">
              <Slider
                value={currentTime}
                max={duration || 100}
                onChange={handleSeek}
                size="xs"
                color="#0B4F78"
                label={(value) => formatTime(value)}
              />
            </Box>
          </Group>

          {/* Right Controls - Volume + Close */}
          <Group gap={4} flex={1} justify="flex-end" wrap="nowrap">
            {/* Volume Control - Tablet/Desktop */}
            <Box
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
              pos="relative"
              visibleFrom="sm"
            >
              <ActionIcon
                variant="subtle"
                color={isMuted ? 'red' : 'gray'}
                size="lg"
                onClick={toggleMute}
              >
                {isMuted ? <IconVolumeOff size={18} /> : <IconVolume size={18} />}
              </ActionIcon>

              <Transition
                mounted={showVolume}
                transition="scale-y"
                duration={200}
              >
                {(styles) => (
                  <Paper
                    style={{
                      ...styles,
                      position: 'absolute',
                      bottom: '100%',
                      right: 0,
                      marginBottom: '10px',
                      padding: '12px',
                      zIndex: 40,
                    }}
                    shadow="md"
                    withBorder
                  >
                    <Stack gap="xs" align="center">
                      <Text size="xs" c="#5A6C7D" ta="center">{isMuted ? 0 : volume}%</Text>
                      <Box
                        style={{
                          height: '120px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Slider
                          value={isMuted ? 0 : volume}
                          max={100}
                          onChange={handleVolumeChange}
                          onChangeEnd={handleVolumeChangeEnd}
                          w={120}
                          color="#0B4F78"
                          size="sm"
                          label={(value) => `${value}%`}
                          style={{
                            transform: 'rotate(-90deg)',
                            transformOrigin: 'center',
                          }}
                        />
                      </Box>
                    </Stack>
                  </Paper>
                )}
              </Transition>
            </Box>

            <ActionIcon
              variant="subtle"
              color="gray"
              size={"md"}
              onClick={handleMinimizePlayer}
            >
              <IconX size={18} />
            </ActionIcon>
          </Group>
        </Flex>

        {/* Progress Bar - Mobile (Base) */}
        <Box px="xs" mt={4} hiddenFrom="md">
          <Slider
            value={currentTime}
            max={duration || 100}
            onChange={handleSeek}
            size="xs"
            color="#0B4F78"
            label={(value) => formatTime(value)}
          />
        </Box>
      </Paper>

      {/* Spacer to prevent content from being hidden behind player */}
      <Box h={{ base: 70, sm: 80 }} />
    </>
  );
}
