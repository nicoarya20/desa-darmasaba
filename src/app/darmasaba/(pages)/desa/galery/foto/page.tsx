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
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

// Komponen kartu foto
function FotoCard({ item }: { item: any }) {

  return (
    <Grid.Col span={{ base: 12, xs: 6, md: 4 }}>
      <Paper
        shadow="sm"
        radius="md"
        p={0}
        style={{ transition: 'transform 0.2s' }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        
      >
        {item.imageGalleryFoto?.link ? (
          <Box
            pos="relative"
            style={{
              paddingBottom: '100%',
              overflow: 'hidden',
              borderRadius: '4px 4px 0 0',
              backgroundColor: '#f9f9f9',
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
                objectFit: 'contain',
                objectPosition: 'center',
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
          <Text fw={600} lineClamp={1} fz={{ base: 'sm', md: 'md' }} lh={{ base: '1.4', md: '1.5' }}>
            {item.name || 'Tanpa Judul'}
          </Text>
          {item.deskripsi && (
            <Text
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
      <Title order={2} c={colors['blue-button']} mb="lg" ta="center">
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
    load(page, 3, search);
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