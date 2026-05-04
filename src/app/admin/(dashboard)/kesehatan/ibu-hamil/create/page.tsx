'use client';

import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import ibuHamilState from '../../../_state/kesehatan/ibu-hamil/ibuHamil';

export default function IbuHamilCreatePage() {
  const router = useRouter();
  const state = useProxy(ibuHamilState);
  const form = state.create.form;

  const handleSubmit = async () => {
    const ok = await ibuHamilState.create.submit();
    if (ok) {
      ibuHamilState.create.reset();
      router.push('/admin/kesehatan/ibu-hamil');
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md" gap="sm">
        <Button variant="subtle" onClick={() => router.back()} radius="md">
          <IconArrowBack size={20} />
        </Button>
        <Title order={3} c="black">Tambah Ibu Hamil</Title>
      </Group>

      <Paper withBorder w={{ base: '100%', md: '80%' }} p="lg" radius="md" shadow="xl" bg="white">
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <TextInput
              label="Nama Lengkap"
              required
              placeholder="Nama ibu hamil"
              value={form.nama}
              onChange={(e) => { ibuHamilState.create.form.nama = e.currentTarget.value; }}
              radius="md"
            />
            <TextInput
              label="NIK"
              placeholder="Nomor Induk Kependudukan"
              value={form.nik}
              onChange={(e) => { ibuHamilState.create.form.nik = e.currentTarget.value; }}
              radius="md"
            />
            <TextInput
              label="Usia Kehamilan (minggu)"
              type="number"
              placeholder="0"
              value={String(form.usiaKehamilan)}
              onChange={(e) => { ibuHamilState.create.form.usiaKehamilan = Number(e.currentTarget.value) || 0; }}
              radius="md"
            />
            <TextInput
              label="No. HP"
              placeholder="08xx-xxxx-xxxx"
              value={form.noHp}
              onChange={(e) => { ibuHamilState.create.form.noHp = e.currentTarget.value; }}
              radius="md"
            />
            <TextInput
              label="HPHT (Hari Pertama Haid Terakhir)"
              type="date"
              value={form.hpht}
              onChange={(e) => { ibuHamilState.create.form.hpht = e.currentTarget.value; }}
              radius="md"
            />
            <TextInput
              label="Taksiran Persalinan"
              type="date"
              value={form.taksiranLahir}
              onChange={(e) => { ibuHamilState.create.form.taksiranLahir = e.currentTarget.value; }}
              radius="md"
            />
            <Select
              label="Status"
              required
              data={[
                { value: 'AKTIF', label: 'Aktif' },
                { value: 'MELAHIRKAN', label: 'Melahirkan' },
                { value: 'KEGUGURAN', label: 'Keguguran' },
                { value: 'NONAKTIF', label: 'Nonaktif' },
              ]}
              value={form.status}
              onChange={(v) => { if (v) ibuHamilState.create.form.status = v as typeof form.status; }}
              radius="md"
            />
          </SimpleGrid>

          <TextInput
            label="Alamat"
            placeholder="Alamat lengkap"
            value={form.alamat}
            onChange={(e) => { ibuHamilState.create.form.alamat = e.currentTarget.value; }}
            radius="md"
          />

          <Textarea
            label="Catatan"
            placeholder="Catatan tambahan"
            value={form.catatan}
            onChange={(e) => { ibuHamilState.create.form.catatan = e.currentTarget.value; }}
            radius="md"
            rows={3}
          />

          <Group justify="right">
            <Button variant="outline" color="gray" radius="md" onClick={() => router.back()}>
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              radius="md"
              disabled={state.create.loading}
              style={{
                background: state.create.loading
                  ? 'linear-gradient(135deg, #ccc, #eee)'
                  : `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
              }}
            >
              {state.create.loading ? <Loader size="sm" color="white" /> : 'Simpan'}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}
