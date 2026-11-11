/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import stateGallery from '@/app/admin/(dashboard)/_state/desa/gallery';
import colors from '@/con/colors';
import {
  AspectRatio,
  Box,
  Center,
  Grid,
  Image,
  Modal,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconPhoto } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { useProxy } from 'valtio/utils';

// Rasio tampilan thumbnail galeri: semua foto dipotong (cover) ke rasio yang
// sama agar kartu seragam apa pun orientasi foto aslinya.
const FOTO_ASPECT_RATIO = 4 / 3;
// Tinggi maksimum foto di modal agar foto portrait tidak melebihi layar.
const FOTO_MODAL_MAX_HEIGHT = '70vh';

function formatTanggal(value: string) {
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Komponen kartu foto: klik kartu (termasuk deskripsi) membuka modal detail
// berisi foto utuh dan deskripsi lengkap, karena di kartu deskripsi dipotong
// (lineClamp) dan sebelumnya tidak ada handler klik sama sekali.
function FotoCard({ item }: { item: any }) {
  const [opened, setOpened] = useState(false);
  const judul = item.name || 'Tanpa Judul';
  const open = () => setOpened(true);

  return (
    <Grid.Col span={{ base: 12, xs: 6, md: 4 }}>
      <Paper
        shadow="sm"
        radius="md"
        p={0}
        role="button"
        tabIndex={0}
        aria-label={`Lihat detail foto ${judul}`}
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open();
          }
        }}
        style={{ transition: 'transform 0.2s', cursor: 'pointer', overflow: 'hidden' }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <AspectRatio ratio={FOTO_ASPECT_RATIO} bg="gray.1">
          {item.imageGalleryFoto?.link ? (
            <Image
              src={item.imageGalleryFoto.link}
              alt={item.name || 'Foto Galeri'}
              fit="cover"
              loading="lazy"
            />
          ) : (
            <Center>
              <IconPhoto size={40} color="gray" />
            </Center>
          )}
        </AspectRatio>

        <Stack p="md" gap={4}>
          <Text fw={600} lineClamp={1} fz={{ base: 'sm', md: 'md' }} lh={{ base: '1.4', md: '1.5' }}>
            {judul}
          </Text>
          {item.deskripsi && (
            <Text
              component="div"
              fz={{ base: 'xs', md: 'sm' }}
              c="dimmed"
              lineClamp={2}
              dangerouslySetInnerHTML={{ __html: item.deskripsi }}
              lh={{ base: '1.4', md: '1.5' }}
            />
          )}
          <Text
            fz={{ base: 11, md: 'xs' }}
            c="dimmed"
            lh={{ base: '1.3', md: '1.4' }}
          >
            {formatTanggal(item.createdAt)}
          </Text>
        </Stack>
      </Paper>

      {/* Modal sengaja di luar Paper: event React dari portal akan bubble ke
          onClick Paper sehingga tombol tutup malah membuka ulang modal. */}
      <Modal opened={opened} onClose={() => setOpened(false)} title={judul} size="lg" centered>
        <Stack gap="sm">
          {item.imageGalleryFoto?.link && (
            <Image
              src={item.imageGalleryFoto.link}
              alt={item.name || 'Foto Galeri'}
              fit="contain"
              radius="md"
              mah={FOTO_MODAL_MAX_HEIGHT}
            />
          )}
          {item.deskripsi && (
            <Text
              component="div"
              fz={{ base: 'sm', md: 'md' }}
              style={{ wordBreak: 'break-word' }}
              dangerouslySetInnerHTML={{ __html: item.deskripsi }}
            />
          )}
          <Text fz="xs" c="dimmed">
            {formatTanggal(item.createdAt)}
          </Text>
        </Stack>
      </Modal>
    </Grid.Col>
  );
}

// Komponen utama
export default function GaleriFotoUser() {
  return (
    <Box py="xl" px={{ base: 'md', md: 'lg' }}>
      {/* Header */}
      <Title order={2} c={colors['blue-button']} mb="lg" ta="center">
        Galeri Foto Desa Darmasaba
      </Title>

      {/* Daftar Foto */}
      <FotoList />
    </Box>
  );
}

function FotoList() {
  const FotoState = useProxy(stateGallery.foto);

  const { data, page, totalPages, loading } = FotoState.findMany;

  // Sinkronkan pencarian dengan SearchBar di layout galeri: SearchBar
  // memperbarui URL (?search=) lalu dispatch event 'searchUpdate'. Tab Foto
  // sebelumnya memakai nilai search kosong yang di-hardcode sehingga kotak
  // pencarian tidak berpengaruh — kini mendengarkan event yang sama seperti
  // tab Video agar pencarian berfungsi (termasuk di Safari).
  const loadData = useCallback((pageNum: number, searchTerm: string) => {
    stateGallery.foto.findMany.load(pageNum, 3, searchTerm.trim());
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      const params = new URLSearchParams(window.location.search);
      loadData(parseInt(params.get('page') || '1'), params.get('search') || '');
    };
    const handleSearchUpdate = (e: Event) => {
      const { search } = (e as CustomEvent).detail;
      loadData(1, search);
    };
    handleRouteChange();
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('searchUpdate', handleSearchUpdate as EventListener);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('searchUpdate', handleSearchUpdate as EventListener);
    };
  }, [loadData]);

  if (loading) {
    return (
      <Grid mt="md">
        {Array.from({ length: 3 }).map((_, i) => (
          <Grid.Col key={i} span={{ base: 12, xs: 6, md: 4 }}>
            <Skeleton height={280} radius="md" />
          </Grid.Col>
        ))}
      </Grid>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Center py="xl">
        <Stack align="center" c="dimmed">
          <IconPhoto size={48} />
          <Text fz={{ base: 'sm', md: 'md' }} lh={{ base: '1.4', md: '1.5' }}>
            Tidak ada foto ditemukan
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack mt="md" gap="xl">
      <Grid>
        {data.map((item) => (
          <FotoCard key={item.id} item={item} />
        ))}
      </Grid>

      {/* Pagination */}
      <Center>
        <Pagination
          value={page}
          onChange={(newPage) => {
            const params = new URLSearchParams(window.location.search);
            loadData(newPage, params.get('search') || '');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          total={totalPages}
          color="blue"
          radius="md"
        />
      </Center>
    </Stack>
  );
}