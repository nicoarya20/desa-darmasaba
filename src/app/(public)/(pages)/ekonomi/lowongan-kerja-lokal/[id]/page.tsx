'use client'

import lowonganKerjaState from '@/app/admin/(dashboard)/_state/ekonomi/lowongan-kerja';
import colors from '@/con/colors';
import { Box, Button, Center, Group, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
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

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

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
            {/* Judul Posisi - H1 */}
            <Title
              order={1}
              c={colors['blue-button']}
              style={{ lineHeight: 1.15 }}
            >
              {data.posisi}
            </Title>

            {/* Tanggal Posting - Caption */}
            <Text c="dimmed" fz={{ base: 12, md: 'sm' }} lh={1.4}>
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
                <Text
                  fz={{ base: 'sm', md: 'md' }}
                  fw={600}
                  lh={1.5}
                >
                  {data.namaPerusahaan}
                </Text>
              </Group>
              <Group gap="xs">
                <IconMapPin size={20} color={colors['blue-button']} />
                <Text
                  fz={{ base: 'sm', md: 'md' }}
                  lh={1.5}
                >
                  {data.lokasi}
                </Text>
              </Group>
              <Group gap="xs">
                <IconPhone size={20} color={colors['blue-button']} />
                <Text
                  fz={{ base: 'sm', md: 'md' }}
                  lh={1.5}
                >
                  {data.notelp}
                </Text>
              </Group>
              <Group gap="xs">
                <IconCurrencyDollar size={20} color={colors['blue-button']} />
                <Text
                  fz={{ base: 'sm', md: 'md' }}
                  lh={1.5}
                >
                  {formatRupiah(Number(data.gaji)) || '-'}
                </Text>
              </Group>
              <Group gap="xs">
                <IconBriefcase size={20} color={colors['blue-button']} />
                <Text
                  fz={{ base: 'sm', md: 'md' }}
                  lh={1.5}
                >
                  {data.tipePekerjaan}
                </Text>
              </Group>
            </Stack>

            {/* Deskripsi Pekerjaan - H2 */}
            <Box>
              <Title order={2} mb={8} style={{ lineHeight: 1.2 }}>
                Deskripsi Pekerjaan
              </Title>
              <Text
                fz={{ base: 'xs', md: 'sm' }}
                lh={1.6}
                style={{ wordBreak: 'break-word' }}
                dangerouslySetInnerHTML={{ __html: data.deskripsi || '-' }}
              />
            </Box>

            {/* Kualifikasi - H2 */}
            <Box>
              <Title order={2} mb={8} style={{ lineHeight: 1.2 }}>
                Kualifikasi
              </Title>
              <Text
                fz={{ base: 'xs', md: 'sm' }}
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
                onClick={() => window.open(`https://wa.me/${data.notelp?.replace(/[^0-9]/g, '').replace(/^0/, '62')}`, '_blank')}
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
