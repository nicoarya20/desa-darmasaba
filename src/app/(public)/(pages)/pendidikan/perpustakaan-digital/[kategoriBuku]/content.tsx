'use client'
import perpustakaanDigitalState from '@/app/admin/(dashboard)/_state/pendidikan/perpustakaan-digital';
import colors from '@/con/colors';
import { ActionIcon, Badge, Box, Button, Center, Group, Image, Pagination, Paper, SimpleGrid, Skeleton, Stack, Text, Tooltip } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconBook2, IconRefresh } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useTransitionRouter } from 'next-view-transitions';
import { useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useProxy } from 'valtio/utils';

/**
 * lineClamp Mantine memakai `display: -webkit-box`. Di WebKit, clamp gagal
 * kalau isinya mengandung tag blok (<p>, <div>, <ul>) -- teks tampil penuh
 * dan tinggi kartu meledak, tapi hanya di Safari. Jadi deskripsi HTML
 * diratakan jadi plain text dulu sebelum di-clamp.
 *
 * Regex dipakai (bukan DOMParser) supaya tetap aman saat SSR.
 */
function toPlainText(html?: string | null) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function Content({ kategoriBuku }: { kategoriBuku: string }) {
  const state = useProxy(perpustakaanDigitalState);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const router = useTransitionRouter()

  // Convert kebab-case back to original category name format
  // This reverses the transformation done in layoutTabs: item.name.toLowerCase().replace(/\s+/g, '-')
  const convertKebabCaseToOriginal = (kebabStr: string): string => {
    // Replace hyphens with spaces
    return kebabStr.replace(/-/g, ' ');
  };

  const decodedKategoriBuku = decodeURIComponent(kategoriBuku);
  const originalKategoriName = convertKebabCaseToOriginal(decodedKategoriBuku);

  const loadData = useCallback(async (searchQuery: string = '', page: number = 1) => {
    try {
      setIsLoading(true);
      const currentKategoriFilter = decodedKategoriBuku.toLowerCase() === 'semua' ? '' : originalKategoriName;
      await state.dataPerpustakaan.findMany.load(page, 3, searchQuery, currentKategoriFilter);
      setCurrentPage(page);
      setTotalPages(state.dataPerpustakaan.findMany.totalPages);
    } finally {
      setIsLoading(false);
    }
  }, [state.dataPerpustakaan.findMany, originalKategoriName, decodedKategoriBuku]);

  useShallowEffect(() => {
    loadData(searchQuery);
  }, [searchQuery, loadData, kategoriBuku]);

  const handleRefresh = () => {
    loadData();
  };

  const handlePageChange = (newPage: number) => {
    loadData(searchQuery, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if ((isLoading && !state.dataPerpustakaan.findMany.data) || !state.dataPerpustakaan.findMany.load) {
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
          <Group>
            <Text size="sm" c="dimmed">
              Halaman {currentPage} dari {totalPages}
            </Text>
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
        </Group>

        {!state.dataPerpustakaan.findMany.data || state.dataPerpustakaan.findMany.data.length === 0 ? (
          <Center py="xl">
            <Stack gap="xs" align="center">
              <Image loading="lazy" src="/empty-books.svg" alt="Kosong" w={140} h="auto" />
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
                // Grid me-stretch motion.div ke tinggi baris (align-items:
                // stretch default). Sebagai flex-column, Paper di dalamnya bisa
                // di-grow tanpa perlu height: '100%' (persentase yang
                // di-resolve beda antara Blink dan WebKit).
                style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <Paper
                  p="lg"
                  radius="2xl"
                  shadow="md"
                  bg={colors['white-trans-1']}
                  style={{
                    flexGrow: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Stack gap="md" style={{ flexGrow: 1, flexBasis: 'auto', minHeight: 0 }}>
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
                    {/* dangerouslySetInnerHTML + truncate="end" dihapus: tag
                        blok bikin lineClamp gagal di WebKit, truncate menambah
                        nowrap yang bentrok. Deskripsi diratakan lewat
                        toPlainText dulu. */}
                    <Text
                     ta="justify"
                     fz="sm"
                     lh={1.5}
                     lineClamp={5}
                     c="dimmed"
                     style={{ wordBreak: 'break-word' }}
                    >
                      {toPlainText(v.deskripsi)}
                    </Text>
                  </Stack>
                  {/* 📗 Tombol Detail. Stack di atas sudah flexGrow:1 sehingga
                      tombol jatuh ke dasar kartu; mt hanya untuk jarak. */}
                  <Button
                    variant='light'
                    color='blue'
                    mt="md"
                    onClick={() => router.push(`/pendidikan/perpustakaan-digital/${encodeURIComponent(v.kategori?.name || 'semua')}/${v.id}`)}
                  >
                    Lihat Detail
                  </Button>
                </Paper>
              </motion.div>
            ))}
          </SimpleGrid>
        )}
      </Box>
      <Center mt="lg">
        <Pagination
          total={totalPages}
          value={currentPage}
          onChange={handlePageChange}
          color="blue"
          radius="md"
        />
      </Center>
    </Stack>
  );
}

export default Content;
