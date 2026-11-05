'use client'
import stateProfileDesa from '@/app/admin/(dashboard)/_state/desa/profile';
import colors from '@/con/colors';
import { AspectRatio, Box, Paper, SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

const ARAH_LIST = [
  { key: 'batasUtara', label: 'Utara' },
  { key: 'batasSelatan', label: 'Selatan' },
  { key: 'batasTimur', label: 'Timur' },
  { key: 'batasBarat', label: 'Barat' },
] as const;

const EMPTY_MESSAGE = 'Data batas wilayah belum tersedia';
const ERROR_MESSAGE = 'Data batas wilayah belum dapat dimuat. Silakan coba lagi nanti.';

/** Section publik "Letak & Batas Wilayah" di halaman Profil Desa (selalu tampil, ada empty-state). */
function WilayahDesa() {
  const state = useProxy(stateProfileDesa.wilayahDesa);

  useEffect(() => {
    state.findUnique.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load sekali saat mount; state proxy stabil
  }, []);

  const { data, loading, error } = state.findUnique;
  const hasData =
    !!data &&
    (ARAH_LIST.some(({ key }) => !!data[key]) || data.luasWilayah != null || !!data.petaEmbedUrl);

  return (
    <Box>
      <Paper p="xl" radius="lg" shadow="md" withBorder style={{ background: 'linear-gradient(145deg, #ffffff, #f5f7fa)' }}>
        <Stack gap="lg">
          <Title order={1} c={colors['blue-button']} ta="center" fz={{ base: 'h2', md: 'h1' }}>
            Letak & Batas Wilayah
          </Title>

          {loading && <Skeleton h={220} radius="lg" />}

          {!loading && !hasData && (
            <Text ta="center" c="dimmed" fz={{ base: 'sm', md: 'md' }}>
              {error ? ERROR_MESSAGE : EMPTY_MESSAGE}
            </Text>
          )}

          {!loading && hasData && data && (
            <>
              <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
                {ARAH_LIST.map(({ key, label }) => (
                  <Paper key={key} p="md" radius="md" withBorder bg={colors['blue-button-1']}>
                    <Text fz="sm" fw={600} c={colors['blue-button']} tt="uppercase">
                      Sebelah {label}
                    </Text>
                    <Text fz={{ base: 'md', md: 'lg' }} fw={500} style={{ wordBreak: 'break-word' }}>
                      {data[key] || '-'}
                    </Text>
                  </Paper>
                ))}
              </SimpleGrid>

              {data.luasWilayah != null && (
                <Text ta="center" fz={{ base: 'md', md: 'lg' }}>
                  Luas wilayah:{' '}
                  <Text span fw={700} c={colors['blue-button']}>
                    {new Intl.NumberFormat('id-ID').format(data.luasWilayah)} ha
                  </Text>
                </Text>
              )}

              {data.keterangan && (
                <Text ta="justify" fz={{ base: 'sm', md: 'md' }} lh={1.7} style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>
                  {data.keterangan}
                </Text>
              )}

              {data.petaEmbedUrl && (
                <AspectRatio ratio={16 / 9} mah={450}>
                  <iframe
                    src={data.petaEmbedUrl}
                    title="Peta wilayah Desa Darmasaba"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                    style={{ border: 0, borderRadius: 12 }}
                  />
                </AspectRatio>
              )}
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

export default WilayahDesa;
