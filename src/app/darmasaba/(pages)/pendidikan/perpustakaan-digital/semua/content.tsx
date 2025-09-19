'use client'
import perpustakaanDigitalState from '@/app/admin/(dashboard)/_state/pendidikan/perpustakaan-digital';
import colors from '@/con/colors';
import { Badge, Box, Center, Group, Image, Paper, SimpleGrid, Skeleton, Spoiler, Stack, Text, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import { useProxy } from 'valtio/utils';
import { IconBook2, IconInfoCircle } from '@tabler/icons-react';

type ContentProps = {
  searchQuery: string;
};

function Content({ searchQuery }: ContentProps) {
  const state = useProxy(perpustakaanDigitalState);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(
    async (query: string = '') => {
      try {
        setIsLoading(true);
        await state.dataPerpustakaan.findMany.load(1, 100, query, '');
      } catch (error) {
        console.error('Gagal memuat data:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [state.dataPerpustakaan.findMany]
  );

  useShallowEffect(() => {
    loadData(searchQuery);
  }, [searchQuery, loadData]);

  if (
    isLoading ||
    !state.dataPerpustakaan.findMany.load ||
    !state.dataPerpustakaan.findMany.data
  ) {
    return (
      <Stack pos="relative" bg={colors.Bg} py="xl" gap="22">
        <Box px={{ base: 'md', md: 100 }} pb={50}>
          <Skeleton h={60} radius="xl" />
          <Skeleton h={200} mt="lg" radius="md" />
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
              Koleksi Semua Buku
            </Text>
          </Group>
          <Tooltip label="Temukan buku favorit Anda di sini" withArrow>
            <IconInfoCircle size={22} color={colors['blue-button']} />
          </Tooltip>
        </Group>

        {!state.dataPerpustakaan.findMany.data ||
        state.dataPerpustakaan.findMany.data.length === 0 ? (
          <Center py="xl">
            <Stack gap="xs" align="center">
              <Image loading="lazy" src="/empty-books.svg" alt="Kosong" w={140} h="auto" />
              <Text c="dimmed" fz="sm">Belum ada buku yang tersedia</Text>
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
                  bg="white"
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
                        loading="lazy"
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
