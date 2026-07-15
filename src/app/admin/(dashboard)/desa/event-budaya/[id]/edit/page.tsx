'use client';
import eventBudayaState from '@/app/admin/(dashboard)/_state/desa/eventBudaya';
import colors from '@/con/colors';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Paper,
  Skeleton,
  Stack,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useProxy } from 'valtio/utils';

function EditEventBudayaPage() {
  const state = useProxy(eventBudayaState, { sync: true }); // sync: cegah caret jump di controlled input
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    if (id) state.edit.load(id);
    return () => state.edit.reset();
  }, [id]);

  const handleSave = async () => {
    const ok = await state.edit.save();
    if (ok) router.push('/admin/desa/event-budaya');
  };

  if (state.edit.loading && !state.edit.form.nama) {
    return <Skeleton h={400} radius="md" />;
  }

  return (
    <Box>
      <Group mb="lg">
        <ActionIcon
          variant="light"
          size="lg"
          onClick={() => router.push('/admin/desa/event-budaya')}
        >
          <IconArrowBack size={18} />
        </ActionIcon>
        <Title order={4}>Edit Event Budaya</Title>
      </Group>

      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Stack gap="md">
          <TextInput
            label="Nama Event"
            placeholder="Contoh: Festival Budaya Desa"
            required
            value={state.edit.form.nama}
            onChange={(e) => (state.edit.form.nama = e.currentTarget.value)}
          />
          <TextInput
            label="Tanggal"
            type="date"
            required
            value={state.edit.form.tanggal}
            onChange={(e) =>
              (state.edit.form.tanggal = e.currentTarget.value)
            }
          />
          <TextInput
            label="Lokasi"
            placeholder="Contoh: Balai Desa Darmasaba"
            required
            value={state.edit.form.lokasi}
            onChange={(e) => (state.edit.form.lokasi = e.currentTarget.value)}
          />
          <Textarea
            label="Deskripsi"
            placeholder="Deskripsi singkat event (opsional)"
            rows={4}
            value={state.edit.form.deskripsi}
            onChange={(e) =>
              (state.edit.form.deskripsi = e.currentTarget.value)
            }
          />

          <Group justify="flex-end" mt="md">
            <Button
              variant="default"
              onClick={() => router.push('/admin/desa/event-budaya')}
            >
              Batal
            </Button>
            <Button
              color="blue"
              loading={state.edit.loading}
              onClick={handleSave}
            >
              Update
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default EditEventBudayaPage;
