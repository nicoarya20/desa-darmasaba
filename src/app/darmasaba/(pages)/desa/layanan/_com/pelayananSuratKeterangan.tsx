/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import stateLayananDesa from '@/app/admin/(dashboard)/_state/desa/layananDesa';
import colors from '@/con/colors';
import { BackgroundImage, Box, Button, Center, Group, SimpleGrid, Skeleton, Stack, Text, Tooltip } from '@mantine/core';
import { IconFileDescription, IconInfoCircle } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useProxy } from 'valtio/utils';

function PelayananSuratKeterangan({ search }: { search: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const state = useProxy(stateLayananDesa);

  const filteredData = useMemo(() => {
    if (!state.suratKeterangan.findMany.data) return [];
    return state.suratKeterangan.findMany.data.filter((item) => {
      const keyword = search.toLowerCase();
      return item.name?.toLowerCase().includes(keyword);
    });
  }, [state.suratKeterangan.findMany.data, search]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await state.suratKeterangan.findMany.load();
      } catch (error) {
        console.error('Gagal memuat data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <Box pb="xl">
      <Group justify="space-between" align="center" mb="md">
        <Group gap="xs">
          <IconFileDescription size={28} stroke={1.8} color={colors["blue-button"]} />
          <Text fz={{ base: "h4", md: "h2" }} fw={700}>
            Layanan Surat Keterangan
          </Text>
        </Group>
        <Tooltip label="Pilih layanan surat keterangan sesuai kebutuhan Anda" withArrow>
          <IconInfoCircle size={22} stroke={1.8} color={colors["blue-button"]} />
        </Tooltip>
      </Group>

      <SimpleGrid
        py="lg"
        cols={{ base: 1, sm: 2, md: 3 }}
        spacing="lg"
      >
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} h={250} radius="lg" />
          ))
        ) : filteredData.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="xs">
              <IconFileDescription size={40} stroke={1.5} color={colors["blue-button"]} />
              <Text c="dimmed" ta="center">
                Tidak ada layanan surat keterangan yang ditemukan
              </Text>
            </Stack>
          </Center>
        ) : (
          filteredData.map((v, k) => (
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
                <Text
                  c="white"
                  fw={600}
                  fz="lg"
                  ta="center"
                  lineClamp={2}
                >
                  {v.name}
                </Text>
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
          ))
        )}
      </SimpleGrid>
    </Box>
  );
}

export default PelayananSuratKeterangan;
