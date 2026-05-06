'use client'
import colors from '@/con/colors';
import {
  Badge,
  Box,
  Button,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconEdit, IconTrash } from '@tabler/icons-react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';
import { ModalKonfirmasiHapus } from '../../../_com/modalKonfirmasiHapus';
import cctvState from '../../../_state/keamanan/cctv';

const LeafletMap = dynamic(
  () => import('../../../_com/leafletMapCreate'),
  { ssr: false, loading: () => <Skeleton height={260} radius="md" /> }
);

function DetailCctv() {
  const [modalHapus, setModalHapus] = useState(false);
  const state = useProxy(cctvState);
  const params = useParams();
  const router = useRouter();

  useShallowEffect(() => {
    cctvState.findUnique.load(params?.id as string);
  }, []);

  const handleDelete = async () => {
    if (params?.id) {
      await cctvState.delete.remove(params.id as string);
      setModalHapus(false);
      router.push('/admin/keamanan/cctv');
    }
  };

  if (state.findUnique.loading || !state.findUnique.data) {
    return (
      <Stack py={10}>
        <Skeleton height={400} radius="md" />
      </Stack>
    );
  }

  const data = state.findUnique.data;

  return (
    <Box px={{ base: 0, md: 'xs' }} py="xs">
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">Detail CCTV</Title>
      </Group>

      <Paper
        w={{ base: '100%', md: '55%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="md">
          <Group justify="space-between">
            <Text fz="xl" fw="bold">{data.kode}</Text>
            <Badge
              color={data.status === 'Online' ? 'green' : 'red'}
              variant="light"
              size="lg"
              radius="sm"
            >
              {data.status}
            </Badge>
          </Group>

          <Box>
            <Text fz="xs" c="dimmed" tt="uppercase" fw={600} mb={2}>Nama</Text>
            <Text fz="md">{data.nama}</Text>
          </Box>

          <Box>
            <Text fz="xs" c="dimmed" tt="uppercase" fw={600} mb={2}>Lokasi</Text>
            <Text fz="md">{data.lokasi}</Text>
          </Box>

          {data.latitude != null && data.longitude != null && (
            <Box>
              <Text fz="xs" c="dimmed" tt="uppercase" fw={600} mb={6}>Lokasi di Peta</Text>
              <Box style={{ height: 260, borderRadius: 8, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                <LeafletMap
                  defaultCenter={{ lat: data.latitude, lng: data.longitude }}
                  readOnly
                />
              </Box>
            </Box>
          )}

          <Box>
            <Text fz="xs" c="dimmed" tt="uppercase" fw={600} mb={2}>Terakhir Aktif</Text>
            <Text fz="md">
              {new Date(data.lastActive).toLocaleString('id-ID', {
                weekday: 'long', day: '2-digit', month: 'long',
                year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </Text>
          </Box>

          <Box>
            <Text fz="xs" c="dimmed" tt="uppercase" fw={600} mb={2}>Dibuat</Text>
            <Text fz="sm" c="dimmed">
              {new Date(data.createdAt).toLocaleDateString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric',
              })}
            </Text>
          </Box>

          <Group gap="sm" mt="sm">
            <Button
              color="red"
              variant="light"
              radius="md"
              onClick={() => setModalHapus(true)}
              loading={state.delete.loading}
            >
              <IconTrash size={20} />
            </Button>
            <Button
              color="green"
              variant="light"
              radius="md"
              onClick={() => router.push(`/admin/keamanan/cctv/${data.id}/edit`)}
            >
              <IconEdit size={20} />
            </Button>
          </Group>
        </Stack>
      </Paper>

      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleDelete}
        loading={state.delete.loading}
        text="Apakah anda yakin ingin menghapus CCTV ini?"
      />
    </Box>
  );
}

export default DetailCctv;
