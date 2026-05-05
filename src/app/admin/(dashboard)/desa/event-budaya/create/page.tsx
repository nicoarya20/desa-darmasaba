'use client';
import eventBudayaState from '@/app/admin/(dashboard)/_state/desa/eventBudaya';
import colors from '@/con/colors';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';

function CreateEventBudayaPage() {
  const state = useProxy(eventBudayaState);
  const router = useRouter();

  const handleSubmit = async () => {
    const ok = await state.create.create();
    if (ok) router.push('/admin/desa/event-budaya');
  };

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
        <Title order={4}>Tambah Event Budaya</Title>
      </Group>

      <Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
        <Stack gap="md">
          <TextInput
            label="Nama Event"
            placeholder="Contoh: Festival Budaya Desa"
            required
            value={state.create.form.nama}
            onChange={(e) => (state.create.form.nama = e.currentTarget.value)}
          />
          <TextInput
            label="Tanggal"
            type="date"
            required
            value={state.create.form.tanggal}
            onChange={(e) => (state.create.form.tanggal = e.currentTarget.value)}
          />
          <TextInput
            label="Lokasi"
            placeholder="Contoh: Balai Desa Darmasaba"
            required
            value={state.create.form.lokasi}
            onChange={(e) => (state.create.form.lokasi = e.currentTarget.value)}
          />
          <Textarea
            label="Deskripsi"
            placeholder="Deskripsi singkat event (opsional)"
            rows={4}
            value={state.create.form.deskripsi}
            onChange={(e) =>
              (state.create.form.deskripsi = e.currentTarget.value)
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
              loading={state.create.loading}
              onClick={handleSubmit}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateEventBudayaPage;
