'use client'
import stateDasarHukum from '@/app/admin/(dashboard)/_state/ppid/dasar_hukum/dasarHukum';
import colors from '@/con/colors';
import { Box, Paper, Skeleton, Stack, Text, Transition, Title } from '@mantine/core';
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

      {/* HEADER */}
      <Stack align="center" gap="xs" px={{ base: 'md', md: 100 }}>
        <IconBook2 size={42} stroke={1.5} color={colors["blue-button"]} />

        <Title
          order={1}
          ta="center"
          c={colors["blue-button"]}
          fz={{ base: "1.8rem", md: "2.3rem" }}
          lh={1.2}
          style={{ letterSpacing: "-0.5px" }}
        >
          Dasar Hukum
        </Title>

        <Text
          ta="center"
          fz={{ base: "sm", md: "md" }}
          lh={1.6}
          c="black"
        >
          Informasi regulasi dan kebijakan resmi yang menjadi dasar hukum
        </Text>
      </Stack>

      {/* CONTENT */}
      <Box px={{ base: "md", md: 100 }}>
        <Stack gap="lg">
          {dataArray.map((item, k) => (
            <Transition
              key={k}
              mounted
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

                    {/* JUDUL */}
                    <Title
                      order={3}
                      ta="center"
                      c="black"
                      fz={{ base: "lg", md: "xl" }}
                      lh={1.3}
                      dangerouslySetInnerHTML={{ __html: item.judul }}
                    />

                    {/* CONTENT */}
                    <Text
                      c="black"
                      ta="justify"
                      fz={{ base: "sm", md: "md" }}
                      lh={1.7}
                      style={{
                        wordBreak: "break-word",
                        whiteSpace: "normal",
                      }}
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
