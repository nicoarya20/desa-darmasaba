/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import stateDashboardKegiatan from '@/app/admin/(dashboard)/_state/desa/kegiatanDesa';
import colors from '@/con/colors';
import { isKegiatanPembangunan } from '@/lib/kegiatan-pembangunan';
import {
  Badge,
  Box,
  Center,
  Container,
  Divider,
  Group,
  Image,
  Paper,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconCalendar, IconMapPin, IconUsers } from '@tabler/icons-react';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';
import PembangunanInfo from '../../_com/PembangunanInfo';

const formatTanggal = (val: string) =>
  val
    ? new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : '-';

function Page() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const state = useProxy(stateDashboardKegiatan.kegiatan.findUnique);

  useEffect(() => {
    if (id) state.load(id);
  }, [id]);

  if (state.loading) {
    return (
      <Box bg={colors.Bg} py={40}>
        <Container size="lg">
          <Stack gap="md">
            <Skeleton h={400} radius="lg" />
            <Skeleton h={30} w="60%" />
            <Skeleton h={20} w="40%" />
            <Skeleton h={200} />
          </Stack>
        </Container>
      </Box>
    );
  }

  const data = state.data;

  if (!data) {
    return (
      <Center h="60vh" bg={colors.Bg}>
        <Text fz="xl" c="dimmed">Data kegiatan tidak ditemukan</Text>
      </Center>
    );
  }

  return (
    <Box bg={colors.Bg} py={40}>
      <Container size="lg" px={{ base: 'md', md: 'xl' }}>
        <Paper shadow="sm" radius="lg" withBorder p={{ base: 'md', md: 'xl' }}>
          <Stack gap="lg">
            {data.image?.link && (
              <Box
                w="100%"
                h={{ base: 240, md: 420 }}
                style={{ overflow: 'hidden', borderRadius: 'var(--mantine-radius-lg)' }}
              >
                <Image
                  src={data.image.link}
                  alt={data.judul}
                  fit="cover"
                  w="100%"
                  h="100%"
                  fallbackSrc="https://placehold.co/800x400?text=Gambar+tidak+tersedia"
                  loading="lazy"
                />
              </Box>
            )}

            <Stack gap="xs">
              <Badge color="blue" variant="light" size="md" radius="md" w="fit-content">
                {data.kategoriKegiatan?.nama || 'Kegiatan Desa'}
              </Badge>

              <Title order={2} lh={1.3}>
                {data.judul}
              </Title>

              <Group gap="xl" wrap="wrap">
                <Group gap={6}>
                  <IconCalendar size={16} color="gray" />
                  <Text fz="sm" c="dimmed">{formatTanggal(data.tanggal)}</Text>
                </Group>
                <Group gap={6}>
                  <IconMapPin size={16} color="gray" />
                  <Text fz="sm" c="dimmed">{data.lokasi || '-'}</Text>
                </Group>
                <Group gap={6}>
                  <IconUsers size={16} color="gray" />
                  <Text fz="sm" c="dimmed">{data.partisipan ?? 0} partisipan</Text>
                </Group>
              </Group>
            </Stack>

            {isKegiatanPembangunan(data) && (
              <Paper withBorder radius="md" p="md" bg="gray.0">
                <PembangunanInfo item={data} showSumberDana />
              </Paper>
            )}

            <Divider />

            {data.deskripsiSingkat && (
              <Text fz={{ base: 'sm', md: 'md' }} c="dimmed" fw={500} fs="italic">
                {data.deskripsiSingkat}
              </Text>
            )}

            <Text
              fz={{ base: 'sm', md: 'md' }}
              lh={{ base: 1.7, md: 1.9 }}
              ta="justify"
              dangerouslySetInnerHTML={{ __html: data.deskripsiLengkap || '' }}
            />
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default Page;
