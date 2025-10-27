'use client'
import stateDasarHukum from '@/app/admin/(dashboard)/_state/ppid/dasar_hukum/dasarHukum';
import colors from '@/con/colors';
import { Box, Paper, Skeleton, Stack, Text, Transition } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { useProxy } from 'valtio/utils';
import { IconBook2 } from '@tabler/icons-react';
import BackButton from '../../desa/layanan/_com/BackButto';

function Page() {
  const state = useProxy(stateDasarHukum);

  useShallowEffect(() => {
    state.findById.load("1");
  }, []);

  if (!state.findById.data) {
    return (
      <Stack p="xl" gap="md">
        <Skeleton h={70} radius="xl" />
      </Stack>
    );
  }

  const dataArray = Array.isArray(state.findById.data)
    ? state.findById.data
    : [state.findById.data];

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="xl">
      <Box px={{ base: 'md', md: 100 }}>
        <BackButton />
      </Box>
      <Stack align="center" gap="xs">
        <IconBook2 size={42} stroke={1.5} color={colors["blue-button"]} />
        <Text
          ta="center"
          fz={{ base: "2rem", md: "2.5rem" }}
          c={colors["blue-button"]}
          fw="bold"
          style={{ letterSpacing: "-0.5px" }}
        >
          Dasar Hukum
        </Text>
        <Text ta="center" fz="md" >
          Informasi regulasi dan kebijakan resmi yang menjadi dasar hukum
        </Text>
      </Stack>
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap="lg">
          {dataArray.map((item, k) => (
            <Transition
              key={k}
              mounted={true}
              transition="fade-up"
              duration={400}
              timingFunction="ease"
            >
              {(styles) => (
                <Paper
                  p="xl"
                  radius="xl"
                  shadow="md"
                  bg={colors['white-trans-1']}
                  style={{
                    ...styles,
                    backdropFilter: "blur(10px)",
                    border: `1px solid ${colors["blue-button"]}20`,
                  }}
                >
                  <Stack gap="md">
                    <Text
                      ta="center"
                      fw="bold"
                      fz={{ base: 'lg', md: 'xl' }}
                      style={{ lineHeight: 1.4 }}
                      dangerouslySetInnerHTML={{ __html: item.judul }}
                    />
                    <Text
                      fz={{ base: 'sm', md: 'md' }}
                      style={{ lineHeight: 1.7, wordBreak: "break-word", whiteSpace: "normal" }}
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                  </Stack>
                </Paper>
              )}
            </Transition>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}

export default Page;
