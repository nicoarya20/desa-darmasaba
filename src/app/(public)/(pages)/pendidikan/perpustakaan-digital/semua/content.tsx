/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import perpustakaanDigitalState from '@/app/admin/(dashboard)/_state/pendidikan/perpustakaan-digital';
import colors from '@/con/colors';
import {
  Badge,
  Box,
  Button,
  Center,
  Group,
  Image,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Tooltip
} from '@mantine/core';
import { IconBook2, IconInfoCircle } from '@tabler/icons-react';
import { Pagination } from '@mantine/core';
import { motion } from 'framer-motion';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import ModalPeminjaman from '../_lib/modalPeminjaman';
import { useTransitionRouter } from 'next-view-transitions';

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

export default function Content() {
  const state = useProxy(perpustakaanDigitalState);
  const router = useTransitionRouter()
  const [opened, setOpened] = useState(false);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: books = [], loading, totalPages } = state.dataPerpustakaan.findMany;

  const [selectedBook, setSelectedBook] = useState<{
    id: string;
    judul: string;
    deskripsi?: string;
    image?: { link?: string };
    kategori?: { name?: string };
  } | null>(null);

  // Handle data loading and search
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadData = async () => {
      if (!isMounted) return;
      
      try {
        await state.dataPerpustakaan.findMany.load(
          currentPage, 
          3, 
          searchQuery, 
          ''
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Gagal memuat data:', error);
        }
      }
    };

    const timer = setTimeout(loadData, 300);
    
    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchQuery, currentPage]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (loading || !books) {
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
        {/* 🔹 Header */}
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

        {/* 📚 Empty State */}
        {books.length === 0 ? (
          <Center py="xl">
            <Stack gap="xs" align="center">
              <Image
                loading="lazy"
                src="/empty-books.svg"
                alt="Kosong"
                w={140}
                h="auto"
              />
              <Text c="dimmed" fz="sm">
                Belum ada buku yang tersedia
              </Text>
            </Stack>
          </Center>
        ) : (
          // 📘 Daftar Buku
          <SimpleGrid
            cols={{ base: 1, sm: 2, md: 3 }}
            spacing="lg"
            verticalSpacing="lg"
            style={{ alignItems: 'stretch' }}
          >
            {books.map((v) => (
              <motion.div
                key={v.id}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
                // Grid me-stretch motion.div ke tinggi baris (align-items:
                // stretch default). Sebagai flex-column, Paper di dalamnya bisa
                // di-grow tanpa perlu height: '100%' (persentase yang
                // di-resolve beda antara Blink dan WebKit).
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                <Paper
                  p="lg"
                  radius="2xl"
                  shadow="md"
                  bg="white"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    minHeight: 440,
                  }}
                >
                  <Stack gap="md" style={{ flexGrow: 1, flexBasis: 'auto', minHeight: 0 }}>
                    {/* 🖼 Gambar Buku */}
                    <Center>
                      <Image
                        src={v.image?.link}
                        alt={v.judul}
                        h={180}
                        w="auto"
                        fit="contain"
                        radius="md"
                        fallbackSrc="/placeholder-book.jpg"
                        loading="lazy"
                      />
                    </Center>

                    {/* 📖 Judul & Kategori */}
                    <Stack gap={4} align="center" px="sm">
                      <Text
                        c={colors['blue-button']}
                        ta="center"
                        fw={700}
                        fz={{ base: 'md', md: 'lg' }}
                        lineClamp={2}
                      >
                        {v.judul}
                      </Text>
                      {v.kategori && (
                        <Badge
                          color="cyan"
                          radius="sm"
                          variant="light"
                          size="sm"
                        >
                          {v.kategori.name}
                        </Badge>
                      )}
                    </Stack>

                    {/* 📝 Deskripsi -- dangerouslySetInnerHTML + truncate="end"
                        dihapus: tag blok bikin lineClamp gagal di WebKit,
                        truncate menambah nowrap yang bentrok. Deskripsi
                        diratakan lewat toPlainText dulu. */}
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
                      grup tombol jatuh ke dasar kartu; mt hanya untuk jarak. */}
                  <Button variant='light' color='blue' mt="md" onClick={() => router.push(`/pendidikan/perpustakaan-digital/${v.kategori?.name}/${v.id}`)}>
                    Lihat Detail
                  </Button>

                  {/* 📗 Tombol Peminjaman */}
                  <Button
                    mt="md"
                    variant="outline"
                    color="blue"
                    radius="xl"
                    size="md"
                    fullWidth
                    leftSection={<IconBook2 size={20} />}
                    onClick={() => {
                      setSelectedBook({
                        id: v.id,
                        judul: v.judul,
                        deskripsi: v.deskripsi,
                        image: v.image ? { link: v.image.link } : undefined,
                        kategori: v.kategori ? { name: v.kategori.name } : undefined,
                      });
                      setOpened(true);
                    }}
                  >
                    Peminjaman
                  </Button>
                </Paper>
              </motion.div>
            ))}
          </SimpleGrid>
        )}
        
        
          <Center mt="lg">
            <Pagination
              value={currentPage}
              onChange={handlePageChange}
              total={totalPages}
              color="blue"
              radius="md"
            />
          </Center>
      </Box>

      {/* 🔸 Modal Peminjaman */}
      <ModalPeminjaman
        opened={opened}
        onClose={() => {
          setOpened(false);
          setSelectedBook(null);
        }}
        buku={selectedBook}
      />
    </Stack>
  );
}
