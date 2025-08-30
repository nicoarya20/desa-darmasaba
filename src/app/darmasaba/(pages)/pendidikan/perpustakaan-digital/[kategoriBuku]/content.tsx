'use client'
import perpustakaanDigitalState from '@/app/admin/(dashboard)/_state/pendidikan/perpustakaan-digital';
import colors from '@/con/colors';
import { ActionIcon, Box, Center, Group, Image, Paper, SimpleGrid, Skeleton, Spoiler, Stack, Text, Tooltip, Badge } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconBook2, IconRefresh } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useProxy } from 'valtio/utils';

function Content({ kategoriBuku }: { kategoriBuku: string }) {
  const state = useProxy(perpustakaanDigitalState);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const decodedKategoriBuku = decodeURIComponent(kategoriBuku);
  const kategoriFilter = decodedKategoriBuku.toLowerCase() === 'semua' ? '' : decodedKategoriBuku;

  const loadData = useCallback(async (searchQuery: string = '') => {
    try {
      setIsLoading(true);
      await state.dataPerpustakaan.findMany.load(1, 100, searchQuery, kategoriFilter);
    } finally {
      setIsLoading(false);
    }
  }, [kategoriFilter, state.dataPerpustakaan.findMany]);

  useShallowEffect(() => {
    loadData(searchQuery);
  }, [searchQuery, loadData]);

  const handleRefresh = () => {
    loadData();
  };

  if (isLoading || !state.dataPerpustakaan.findMany.load || !state.dataPerpustakaan.findMany.data) {
    return (
      <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
        <Box px={{ base: 'md', md: 100 }} pb={50}>
          <Skeleton h={50} radius="xl" />
          <Skeleton h={180} mt="lg" radius="md" />
        </Box>
      </Stack>
    );
  }

  return (
    <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
      <Box px={{ base: 'md', md: 100 }} pb={20}>
        <Group justify="space-between" mb="lg">
          <Group gap="xs">
            <IconBook2 size={28} color={colors['blue-button']} />
            <Text fw={700} size="xl" c={colors['blue-button']}>
              Koleksi Buku
            </Text>
          </Group>
          <Tooltip label="Muat ulang koleksi" withArrow>
            <ActionIcon
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
              onClick={handleRefresh}
              loading={isLoading}
              radius="xl"
              size="lg"
            >
              <IconRefresh size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {!state.dataPerpustakaan.findMany.data || state.dataPerpustakaan.findMany.data.length === 0 ? (
          <Center py="xl">
            <Stack gap="xs" align="center">
              <Image src="/empty-books.svg" alt="Kosong" w={140} h="auto" />
              <Text c="dimmed" fz="sm">Belum ada buku yang tersedia dalam kategori ini</Text>
            </Stack>
          </Center>
        ) : (
          <SimpleGrid
            cols={{ base: 1, sm: 2, md: 3 }}
            spacing="lg"
            verticalSpacing="lg"
          >
            {state.dataPerpustakaan.findMany.data?.map((v, k) => (
              <motion.div
                key={k}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
                style={{ width: '100%', height: '100%' }}
              >
                <Paper
                  p="lg"
                  radius="2xl"
                  shadow="md"
                  bg={colors['white-trans-1']}
                  style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <Stack gap="md" style={{ flex: 1 }}>
                    <Center>
                      <Image
                        src={v.image?.link}
                        alt={v.judul}
                        h={180}
                        w="auto"
                        fit="contain"
                        fallbackSrc="/placeholder-book.jpg"
                        radius="md"
                      />
                    </Center>
                    <Stack gap={4} align="center">
                      <Text
                        c={colors["blue-button"]}
                        ta="center"
                        fw={700}
                        fz={{ base: "md", md: "lg" }}
                        lineClamp={2}
                      >
                        {v.judul}
                      </Text>
                      {v.kategori && (
                        <Badge color="cyan" radius="sm" variant="light" size="sm">
                          {v.kategori.name}
                        </Badge>
                      )}
                    </Stack>
                    <Spoiler
                      maxHeight={80}
                      showLabel={
                        <Text fw={600} fz="sm" c={colors['blue-button']} ta="center" mt="xs">
                          Lihat deskripsi
                        </Text>
                      }
                      hideLabel={
                        <Text fw={600} fz="sm" c={colors['blue-button']} ta="center" mt="xs">
                          Sembunyikan deskripsi
                        </Text>
                      }
                      expanded={expandedId === v.id}
                      onExpandedChange={(isExpanded) => setExpandedId(isExpanded ? v.id : null)}
                    >
                      <Text
                        ta="justify"
                        fz="sm"
                        lh={1.5}
                        c="dimmed"
                        dangerouslySetInnerHTML={{ __html: v.deskripsi }}
                      />
                    </Spoiler>
                  </Stack>
                </Paper>
              </motion.div>
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Stack>
  );
}

export default Content;
