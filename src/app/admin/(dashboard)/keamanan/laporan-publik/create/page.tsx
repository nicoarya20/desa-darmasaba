'use client';
import colors from '@/con/colors';
import {
  Box,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconArrowBack } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useProxy } from 'valtio/utils';
import laporanPublikState from '../../../_state/keamanan/laporan-publik';

export type Status = 'Selesai' | 'Proses' | 'Gagal';

function CreateLaporanPublik() {
  const stateLaporan = useProxy(laporanPublikState);
  const router = useRouter();

  const resetForm = () => {
    stateLaporan.create.form = {
      judul: '',
      lokasi: '',
      tanggalWaktu: '',
      kronologi: '',
    };
  };

  const handleSubmit = async () => {
    await stateLaporan.create.create();
    resetForm();
    router.push('/admin/keamanan/laporan-publik');
  };

  return (
    <Box px={{ base: 'sm', md: 'lg' }} py="md">
      {/* Header with Back Button */}
      <Group mb="md">
        <Button variant="subtle" onClick={() => router.back()} p="xs" radius="md">
          <IconArrowBack color={colors['blue-button']} size={24} />
        </Button>
        <Title order={4} ml="sm" c="dark">
          Tambah Laporan Publik
        </Title>
      </Group>

      {/* Form Card */}
      <Paper
        w={{ base: '100%', md: '50%' }}
        bg={colors['white-1']}
        p="lg"
        radius="md"
        shadow="sm"
        style={{ border: '1px solid #e0e0e0' }}
      >
        <Stack gap="md">
          <TextInput
            defaultValue={stateLaporan.create.form.judul}
            onChange={(e) => (stateLaporan.create.form.judul = e.target.value)}
            label={<Text fw="bold" fz="sm">Judul Laporan Publik</Text>}
            placeholder="Masukkan judul laporan publik"
            required
          />

          <TextInput
            defaultValue={stateLaporan.create.form.lokasi}
            onChange={(e) => (stateLaporan.create.form.lokasi = e.target.value)}
            label={<Text fw="bold" fz="sm">Lokasi Laporan Publik</Text>}
            placeholder="Masukkan lokasi laporan publik"
            required
          />

          <DateTimePicker
            label={<Text fw="bold" fz="sm">Tanggal Laporan Publik</Text>}
            value={
              stateLaporan.create.form.tanggalWaktu
                ? new Date(stateLaporan.create.form.tanggalWaktu)
                : null
            }
            onChange={(val) => {
              stateLaporan.create.form.tanggalWaktu = val ? val.toString() : '';
            }}
          />

          <TextInput
            defaultValue={stateLaporan.create.form.kronologi}
            onChange={(e) => (stateLaporan.create.form.kronologi = e.target.value)}
            label={<Text fw="bold" fz="sm">Kronologi Laporan Publik</Text>}
            placeholder="Masukkan kronologi laporan publik"
            required
          />

          <Group justify="right">
            <Button
              onClick={handleSubmit}
              radius="md"
              size="md"
              style={{
                background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`,
                color: '#fff',
                boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)',
              }}
            >
              Simpan
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Box>
  );
}

export default CreateLaporanPublik;
