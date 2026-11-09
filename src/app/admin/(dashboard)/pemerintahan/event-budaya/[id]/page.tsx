'use client';
import { ModalKonfirmasiHapus } from '@/app/admin/(dashboard)/_com/modalKonfirmasiHapus';
import eventBudayaState from '@/app/admin/(dashboard)/_state/desa/eventBudaya';
import { KategoriEventBadge } from '@/components/KategoriEventBadge';
import colors from '@/con/colors';
import { formatRentangTanggal } from '@/lib/agenda-desa-waktu';
import {
  Box,
  Button,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import { useShallowEffect } from '@mantine/hooks';
import { IconArrowBack, IconCalendarEvent, IconEdit, IconTrash } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useProxy } from 'valtio/utils';

export default function DetailEventBudaya() {
  const state = useProxy(eventBudayaState);
  const [modalHapus, setModalHapus] = useState(false);
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useShallowEffect(() => {
    state.findUnique.load(id);
  }, [id]);

  const handleHapus = async () => {
    await state.delete.byId(id);
    setModalHapus(false);
    router.push('/admin/pemerintahan/event-budaya');
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
      <Button
        variant="subtle"
        onClick={() => router.push('/admin/pemerintahan/event-budaya')}
        leftSection={<IconArrowBack size={20} color={colors['blue-button']} />}
        mb={15}
      >
        Kembali
      </Button>

      <Paper
        withBorder
        w={{ base: '100%', md: '70%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
      >
        <Stack gap="md">
          <Group gap="sm">
            <IconCalendarEvent size={22} color={colors['blue-button']} />
            <Text fz="xl" fw="bold" c={colors['blue-button']}>
              Detail Agenda Desa
            </Text>
          </Group>

          <Paper bg="#ECEEF8" p="md" radius="md" shadow="xs">
            <Stack gap="sm">
              <Box>
                <Text fz="sm" fw={600} c="dimmed">Nama Event</Text>
                <Text fz="md" fw={500}>{data.nama || '-'}</Text>
              </Box>

              <Box>
                <Text fz="sm" fw={600} c="dimmed">Tanggal</Text>
                <Text fz="md">
                  {data.tanggalSelesai
                    ? formatRentangTanggal(data)
                    : new Date(data.tanggal).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                </Text>
              </Box>

              <Box>
                <Text fz="sm" fw={600} c="dimmed">Kategori</Text>
                <KategoriEventBadge kategori={data.kategori} mt={4} />
              </Box>

              <Box>
                <Text fz="sm" fw={600} c="dimmed">Lokasi</Text>
                <Text fz="md">{data.lokasi || '-'}</Text>
              </Box>

              {data.deskripsi && (
                <Box>
                  <Text fz="sm" fw={600} c="dimmed">Deskripsi</Text>
                  <Text fz="md" style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                    {data.deskripsi}
                  </Text>
                </Box>
              )}

              <Group gap="sm" mt="xs">
                <Button
                  color="red"
                  variant="light"
                  radius="md"
                  leftSection={<IconTrash size={16} />}
                  loading={state.delete.loading}
                  onClick={() => setModalHapus(true)}
                >
                  Hapus
                </Button>
                <Button
                  color="blue"
                  variant="light"
                  radius="md"
                  leftSection={<IconEdit size={16} />}
                  onClick={() => router.push(`/admin/pemerintahan/event-budaya/${id}/edit`)}
                >
                  Edit
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </Paper>

      <ModalKonfirmasiHapus
        opened={modalHapus}
        onClose={() => setModalHapus(false)}
        onConfirm={handleHapus}
        text="Apakah anda yakin ingin menghapus agenda ini?"
      />
    </Box>
  );
}
