/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import { Box, Center, Image, Paper, SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconUser } from '@tabler/icons-react';
import { useProxy } from 'valtio/utils';

function SemuaPerbekel() {
  const state = useProxy(stateProfileDesa.mantanPerbekel);

  useShallowEffect(() => {
    state.findMany.load();
  }, []);

  const { data, loading } = state.findMany;

  if (loading || !data) {
    return (
      <Box py="xl">
        <Skeleton h={500} radius="xl" />
      </Box>
    );
  }

  if (data.length === 0) {
    return (
      <Center py="xl">
        <Stack align="center" gap="sm">
          <IconUser size={48} stroke={1.5} />
          <Title order={2} ta="center">Belum ada data Perbekel</Title>
          <Text c="dimmed" fz={{ base: 'xs', md: 'sm' }} lh={{ base: 1.4, md: 1.6 }} ta="center">
            Data mantan Perbekel akan muncul di sini ketika sudah tersedia
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Box>
      <Stack align="center" gap="lg">
        <Title
          order={1}
          ta="center"
          style={{
            background: 'linear-gradient(45deg, blue, cyan)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          fz={{ base: 28, md: 36 }}
          lh={{ base: 1.2, md: 1.3 }}
          fw={900}
        >
          Perbekel Dari Masa ke Masa
        </Title>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl" w="100%">
          {data.map((v: any, k: number) => (
            <Paper
              key={k}
              radius="xl"
              shadow="md"
              withBorder
              p="lg"
              bg="white"
              style={{ transition: "all 250ms ease" }}
              className="hover:shadow-xl hover:scale-[1.02]"
            >
              <Stack gap="md" align="center">
                <Box w="100%" h={500} style={{ overflow: "hidden", borderRadius: "1rem" }}>
                  <Image
                    src={v.image?.link}
                    alt={v.nama || "Foto Perbekel"}
                    fit="cover"
                    h="100%"
                    w="100%"
                    loading="lazy"
                  />
                </Box>

                <Stack gap={4} align="center">
                  <Title order={3} fz={{ base: 18, md: 20 }} ta="center" fw={700}>
                    {v.nama}
                  </Title>

                  <Text c="dimmed" fz={{ base: 12, md: 14 }} lh={{ base: 1.4, md: 1.6 }} ta="center">
                    {v.daerah}
                  </Text>

                  <Text c="blue" fw={600} fz={{ base: 12, md: 14 }} lh={{ base: 1.4, md: 1.6 }} ta="center">
                    {v.periode}
                  </Text>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Stack>
    </Box>
  );
}

export default SemuaPerbekel;
