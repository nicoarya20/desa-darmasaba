'use client';

import { useProxy } from 'valtio/utils';
import { Box, Image, Paper, Skeleton, Stack, Text, Title, Group } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconCalendar, IconMapPin, IconUsers } from '@tabler/icons-react';
import { useParams } from 'next/navigation';
import colors from '@/con/colors';
import gotongRoyongState from '@/app/admin/(dashboard)/_state/lingkungan/gotong-royong';

function DetailKegiatanDesaUser() {
  const kegiatanDesaState = useProxy(gotongRoyongState.kegiatanDesa);
  const params = useParams();

  useShallowEffect(() => {
    kegiatanDesaState.findUnique.load(params?.id as string);
  }, []);

  const data = kegiatanDesaState.findUnique.data;

  if (!data) {
    return (
      <Stack py={20}>
        <Skeleton height={400} radius="md" />
        <Skeleton height={20} width="70%" />
        <Skeleton height={15} width="50%" />
        <Skeleton height={300} radius="md" />
      </Stack>
    );
  }

  return (
    <Box py={30}>
      {/* Header Gambar */}

      {/* Konten */}
      <Paper
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        maw={900}
        mx="auto"
        >
        <Stack gap="md">
        {data.image?.link && (
          <Image
            src={data.image.link}
            alt={data.judul || 'Kegiatan Desa'}
            radius="md"
            fit="cover"
            h={300}
            mb="xl"
            style={{ objectPosition: 'center', width: '100%' }}
          />
        )}
          {/* Judul */}
          <Title order={2} c={colors['blue-button']}>
            {data.judul || 'Kegiatan Desa'}
          </Title>

          {/* Meta Info */}
          <Group gap="xl" c="dimmed">
            <Group gap={6}>
              <IconCalendar size={18} />
              <Text fz="sm">
                {data.tanggal ? new Date(data.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
              </Text>
            </Group>

            {data.lokasi && (
              <Group gap={6}>
                <IconMapPin size={18} />
                <Text fz="sm">{data.lokasi}</Text>
              </Group>
            )}

            {data.partisipan && (
              <Group gap={6}>
                <IconUsers size={18} />
                <Text fz="sm">{data.partisipan}</Text>
              </Group>
            )}
          </Group>

          {/* Deskripsi Singkat */}
          {data.deskripsiSingkat && (
            <Box>
              <Text fw={600} fz="lg" mb={4}>
                Ringkasan
              </Text>
              <Text
                fz="md"
                c="dimmed"
                dangerouslySetInnerHTML={{ __html: data.deskripsiSingkat }}
              />
            </Box>
          )}

          {/* Deskripsi Lengkap */}
          {data.deskripsiLengkap && (
            <Box>
              <Text fw={600} fz="lg" mb={4}>
                Detail Kegiatan
              </Text>
              <Text
                fz="md"
                c="dimmed"
                style={{ lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: data.deskripsiLengkap }}
              />
            </Box>
          )}

          {/* Kategori */}
          {data.kategoriKegiatan?.nama && (
            <Box mt="md">
              <Text fw={600} fz="lg">
                Kategori
              </Text>
              <Text fz="md" c="dimmed">
                {data.kategoriKegiatan.nama}
              </Text>
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

export default DetailKegiatanDesaUser;
