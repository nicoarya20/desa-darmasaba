/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import stateGallery from '@/app/admin/(dashboard)/_state/desa/gallery';
import colors from '@/con/colors';
import {
  Box,
  Center,
  Grid,
  Image,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconPhoto } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

// Komponen kartu foto
function FotoCard({ item }: { item: any }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/darmasaba/galeri/foto/${item.id}`);
  };

  return (
    <Grid.Col span={{ base: 12, xs: 6, md: 4 }}>
      <Paper
        shadow="sm"
        radius="md"
        p={0}
        onClick={handleClick}
        style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {item.imageGalleryFoto?.link ? (
          <Box
            pos="relative"
            style={{
              paddingBottom: '100%', // ✅ Ubah ke 1:1 (square) — atau sesuaikan
              overflow: 'hidden',
              borderRadius: '4px 4px 0 0',
              backgroundColor: '#f9f9f9', // ✅ background netral
            }}
          >
            <Image
              radius="lg"
              src={item.imageGalleryFoto.link}
              alt={item.name || 'Foto Galeri'}
              p={10}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain', // ✅ Tampilkan utuh, jangan crop
                objectPosition: 'center', // rata tengah
              }}
              loading="lazy"
            />
          </Box>
        ) : (
          <Center h={180} bg="gray.1">
            <IconPhoto size={40} color="gray" />
          </Center>
        )}

        <Stack p="md" gap={4}>
          <Text fw={600} lineClamp={1}>
            {item.name || 'Tanpa Judul'}
          </Text>
          {item.deskripsi && (
            <Text fz="sm" c="dimmed" lineClamp={2} dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
          )}
          <Text fz="xs" c="dimmed">
            {new Date(item.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </Stack>
      </Paper>
    </Grid.Col>
  );
}

// Komponen utama
export default function GaleriFotoUser() {
  const [search] = useState('');
  return (
    <Box py="xl" px={{ base: 'md', md: 'lg' }}>
      {/* Header */}
      <Title order={2} c={colors['blue-button']} mb="lg">
        Galeri Foto Desa Darmasaba
      </Title>

      {/* Daftar Foto */}
      <FotoList search={search} />
    </Box>
  );
}

function FotoList({ search }: { search: string }) {
  const FotoState = useProxy(stateGallery.foto);

  const { data, page, totalPages, loading, load } = FotoState.findMany;

  useShallowEffect(() => {
    load(page, 3, search); // ✅ 9 item per halaman
  }, [page, search]);

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
          <Text>Tidak ada foto ditemukan</Text>
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
              load(newPage, 3, search);
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