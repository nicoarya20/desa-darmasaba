"use client";

import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import colors from '@/con/colors';
import { BackgroundImage, Box, Button, Center, Group, Pagination, SimpleGrid, Skeleton, Stack, Text, Title, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconFileDescription, IconInfoCircle } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';

function PelayananSuratKeterangan({ search }: { search: string }) {
  const router = useRouter();
  const state = useProxy(stateLayananDesa);

  const {
    data,
    page,
    totalPages,
    loading,
    load
  } = state.suratKeterangan.findMany;

  useShallowEffect(() => {
    load(page, 9, search);
  }, [page, search]);

  if (loading || !data) {
    return Array.from({ length: 3 }).map((_, i) => (
      <Skeleton key={i} h={250} radius="lg" />
    ));
  }

  if (data?.length === 0) {
    return (
      <Center py="xl">
        <Stack align="center" gap="xs">
          <IconFileDescription size={40} stroke={1.5} color={colors["blue-button"]} />
          <Text c="dimmed" ta="center" fz={{ base: 'sm', md: 'md' }} lh="sm">
            Tidak ada layanan surat keterangan yang ditemukan
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Box pb="xl">
      <Group justify="space-between" align="center" mb="md">
        <Group gap="xs">
          <IconFileDescription size={28} stroke={1.8} />
          <Title order={2} c="black">
            Layanan Surat Keterangan
          </Title>
        </Group>
        <Tooltip label="Pilih layanan surat keterangan sesuai kebutuhan Anda" withArrow>
          <IconInfoCircle size={22} stroke={1.8} />
        </Tooltip>
      </Group>

      <SimpleGrid
        py="lg"
        cols={{ base: 1, sm: 2, md: 3 }}
        spacing="lg"
      >
        {data?.map((v, k) => (
          <BackgroundImage
            key={k}
            src={v.image?.link || ''}
            h={250}
            radius="lg"
            pos="relative"
            style={{
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            <Box
              pos="absolute"
              w="100%"
              h="100%"
              bg="rgba(0,0,0,0.45)"
              style={{ borderRadius: 16 }}
            />
            <Stack justify="space-between" h="100%" gap="md" p="lg" pos="relative">
              <Title
                order={3}
                c="white"
                ta="center"
                lineClamp={2}
                lh="sm"
              >
                {v.name}
              </Title>
              <Group justify="center">
                <Button
                  size="md"
                  radius="xl"
                  bg={colors["blue-button"]}
                  px="lg"
                  onClick={() => router.push(`/darmasaba/desa/layanan/${v.id}`)}
                  style={{
                    boxShadow: "0 0 12px rgba(59,130,246,0.6)",
                    transition: "all 0.2s ease",
                  }}
                >
                  Lihat Detail
                </Button>
              </Group>
            </Stack>
          </BackgroundImage>
        ))}
      </SimpleGrid>
      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            load(newPage, 10);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          total={totalPages}
          mt="md"
          mb="md"
          color="blue"
          radius="md"
        />
      </Center>
    </Box>
  );
}

export default PelayananSuratKeterangan;