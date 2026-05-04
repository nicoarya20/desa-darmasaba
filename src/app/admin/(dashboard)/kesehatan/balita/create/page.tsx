'use client';

import colors from '@/con/colors';
import {
  Box,
  Button,
  Checkbox,
  Group,
  Loader,
  NumberInput,
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
import balitaState from '../../../_state/kesehatan/balita/balita';

export default function BalitaCreatePage() {
  const router = useRouter();
  const state = useProxy(balitaState);
  const form = state.create.form;

  const handleSubmit = async () => {
    const ok = await state.create.submit();
    if (ok) {
      state.create.reset();
      router.push('/admin/kesehatan/balita');
    }
  };

  return (
    <Box px={{ base: 0, md: 'lg' }} py="xs">
      <Group mb="md" gap="sm">
        <Button variant="subtle" onClick={() => router.back()} radius="md">
          <IconArrowBack size={20} />
        </Button>
        <Title order={3} c="black">Tambah Balita</Title>
      </Group>

      <Paper withBorder w={{ base: '100%', md: '80%' }} p="lg" radius="md" shadow="xl" bg="white">
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <TextInput
              label="Nama Lengkap"
              required
              placeholder="Nama balita"
              value={form.nama}
              onChange={(e) => { form.nama = e.currentTarget.value; }}
              radius="md"
            />
            <TextInput
              label="NIK"
              placeholder="Nomor Induk Kependudukan"
              value={form.nik}
              onChange={(e) => { form.nik = e.currentTarget.value; }}
              radius="md"
            />
            <TextInput
              label="Tanggal Lahir"
              required
              type="date"
              value={form.tanggalLahir}
              onChange={(e) => { form.tanggalLahir = e.currentTarget.value; }}
              radius="md"
            />
            <Select
              label="Jenis Kelamin"
              required
              data={[
                { value: 'L', label: 'Laki-laki' },
                { value: 'P', label: 'Perempuan' },
              ]}
              value={form.jenisKelamin}
              onChange={(v) => { if (v) form.jenisKelamin = v as typeof form.jenisKelamin; }}
              radius="md"
            />
            <NumberInput
              label="Berat Badan (kg)"
              placeholder="0.0"
              min={0}
              decimalScale={1}
              value={form.beratBadanKg ?? ''}
              onChange={(v) => { form.beratBadanKg = v === '' ? undefined : Number(v); }}
              radius="md"
            />
            <NumberInput
              label="Tinggi Badan (cm)"
              placeholder="0.0"
              min={0}
              decimalScale={1}
              value={form.tinggiBadanCm ?? ''}
              onChange={(v) => { form.tinggiBadanCm = v === '' ? undefined : Number(v); }}
              radius="md"
            />
            <TextInput
              label="Nama Orang Tua"
              placeholder="Nama ayah/ibu"
              value={form.namaOrtu}
              onChange={(e) => { form.namaOrtu = e.currentTarget.value; }}
              radius="md"
            />
            <TextInput
              label="No. HP Orang Tua"
              placeholder="08xx-xxxx-xxxx"
              value={form.noHpOrtu}
              onChange={(e) => { form.noHpOrtu = e.currentTarget.value; }}
              radius="md"
            />
            <Select
              label="Status Stunting"
              required
              data={[
                { value: 'NORMAL', label: 'Normal' },
                { value: 'ALERT', label: 'Alert (Berisiko)' },
                { value: 'STUNTING', label: 'Stunting' },
              ]}
              value={form.statusStunting}
              onChange={(v) => { if (v) form.statusStunting = v as typeof form.statusStunting; }}
              radius="md"
            />
          </SimpleGrid>

          <TextInput
            label="Alamat"
            placeholder="Alamat lengkap"
            value={form.alamat}
            onChange={(e) => { form.alamat = e.currentTarget.value; }}
            radius="md"
          />

          <Group gap="xl">
            <Checkbox
              label="Imunisasi Lengkap"
              checked={form.imunisasiLengkap}
              onChange={(e) => { form.imunisasiLengkap = e.currentTarget.checked; }}
            />
            <Checkbox
              label="Gizi Baik"
              checked={form.giziBaik}
              onChange={(e) => { form.giziBaik = e.currentTarget.checked; }}
            />
            <Checkbox
              label="Pemeriksaan Rutin"
              checked={form.pemeriksaanRutin}
              onChange={(e) => { form.pemeriksaanRutin = e.currentTarget.checked; }}
            />
          </Group>

          <Textarea
            label="Catatan"
            placeholder="Catatan tambahan"
            value={form.catatan}
            onChange={(e) => { form.catatan = e.currentTarget.value; }}
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
