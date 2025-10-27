'use client'

import lowonganKerjaState from '@/app/admin/(dashboard)/_state/ekonomi/lowongan-kerja';
import colors from '@/con/colors';
import { Box, Button, Center, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconBrandWhatsapp, IconBriefcase, IconCurrencyDollar, IconMapPin, IconPhone } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

function DetailLowonganKerjaUser() {
  const state = useProxy(lowonganKerjaState);
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);

  useShallowEffect(() => {
    const loadData = async () => {
      await state.findUnique.load(params?.id as string);
      setLoading(false);
    };
    loadData();
  }, []);

  const data = state.findUnique.data;

  if (loading || !data) {
    return (
      <Center py="xl">
        <Skeleton height={500} w={{ base: '90%', md: '70%' }} radius="lg" />
      </Center>
    );
  }

  return (
    <Stack bg={colors.Bg} py="xl" px={{ base: 'md', md: 100 }} align="center">
      <Box w={{ base: '100%', md: '70%' }}>
          <Button
            variant="subtle"
            color="blue"
            leftSection={<IconArrowBack size={20} />}
            mb="md"
            onClick={() => router.back()}
          >
            Kembali
          </Button>

        <Paper
          radius="lg"
          shadow="md"
          withBorder
          p="xl"
          bg={colors['white-1']}
        >
          <Stack gap="lg">
            {/* Judul */}
            <Text fz={{ base: '1.6rem', md: '2rem' }} fw={700} c={colors['blue-button']}>
              {data.posisi}
            </Text>
            <Text c="dimmed" fz="sm">
              Diposting: {new Date(data.createdAt).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </Text>

            {/* Info Ringkas */}
            <Stack gap="sm" mt="md">
              <Group gap="xs">
                <IconBriefcase size={20} color={colors['blue-button']} />
                <Text fz="md" fw={600}>{data.namaPerusahaan}</Text>
              </Group>
              <Group gap="xs">
                <IconMapPin size={20} color={colors['blue-button']} />
                <Text fz="md">{data.lokasi}</Text>
              </Group>
              <Group gap="xs">
                <IconPhone size={20} color={colors['blue-button']} />
                <Text fz="md">{data.notelp}</Text>
              </Group>
              <Group gap="xs">
                <IconCurrencyDollar size={20} color={colors['blue-button']} />
                <Text fz="md">{data.gaji || '-'}</Text>
              </Group>
              <Group gap="xs">
                <IconBriefcase size={20} color={colors['blue-button']} />
                <Text fz="md">{data.tipePekerjaan}</Text>
              </Group>
            </Stack>

            <Box>
              <Text fw={600} fz="lg" mb={4}>
                Deskripsi Pekerjaan
              </Text>
              <Text
                fz="sm"
                lh={1.6}
                style={{ wordBreak: 'break-word' }}
                dangerouslySetInnerHTML={{ __html: data.deskripsi || '-' }}
              />
            </Box>

            <Box>
              <Text fw={600} fz="lg" mb={4}>
                Kualifikasi
              </Text>
              <Text
                fz="sm"
                lh={1.6}
                style={{ wordBreak: 'break-word' }}
                dangerouslySetInnerHTML={{ __html: data.kualifikasi || '-' }}
              />
            </Box>

            <Center>
              <Button
                radius="md"
                size="md"
                mt="md"
                bg={colors['blue-button']}
                onClick={() => window.open(`https://wa.me/${data.notelp}`, '_blank')}
                leftSection={<IconBrandWhatsapp size={20} />}
              >
                Hubungi Sekarang
              </Button>
            </Center>
          </Stack>
        </Paper>
      </Box>
    </Stack>
  );
}

export default DetailLowonganKerjaUser;
